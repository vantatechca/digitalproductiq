"""BaseScraper — retry, rate-limit, circuit breaker, UA + proxy rotation.

Subclasses must implement async def scrape() -> list[ScrapedItem].
Each scraper owns: name, schedule_cron (for Beat), and persists to idea_signals
via the pipeline.
"""
from __future__ import annotations

import asyncio
import random
from dataclasses import dataclass, field
from datetime import datetime, timezone
from typing import Any

import httpx
import structlog
from tenacity import retry, stop_after_attempt, wait_exponential

from ..config import settings

log = structlog.get_logger()


@dataclass
class ScrapedItem:
    """Single signal scraped from a source — converted to idea_signals row downstream."""

    platform: str
    signal_type: str
    title: str | None = None
    content: str | None = None
    external_url: str | None = None
    external_id: str | None = None
    author: str | None = None
    engagement_score: int | None = None
    sentiment: float | None = None
    relevance_score: int | None = None
    raw_payload: dict[str, Any] = field(default_factory=dict)
    collected_at: datetime = field(default_factory=lambda: datetime.now(timezone.utc))


class CircuitBreaker:
    """Open after N consecutive failures; skip until reset_after_seconds passes."""

    def __init__(self, failure_threshold: int = 5, reset_after_seconds: int = 3600):
        self.failure_threshold = failure_threshold
        self.reset_after_seconds = reset_after_seconds
        self.consecutive_failures = 0
        self.opened_at: datetime | None = None

    @property
    def is_open(self) -> bool:
        if self.opened_at is None:
            return False
        elapsed = (datetime.now(timezone.utc) - self.opened_at).total_seconds()
        if elapsed > self.reset_after_seconds:
            self.consecutive_failures = 0
            self.opened_at = None
            return False
        return True

    def record_success(self) -> None:
        self.consecutive_failures = 0
        self.opened_at = None

    def record_failure(self) -> None:
        self.consecutive_failures += 1
        if self.consecutive_failures >= self.failure_threshold:
            self.opened_at = datetime.now(timezone.utc)


class BaseScraper:
    """Inherit and override scrape().

    Provides:
    - http (httpx.AsyncClient) with proxy and UA rotation
    - retry + exponential backoff on transient failures
    - circuit breaker that opens on persistent failure
    - rate limiter via asyncio.sleep between requests
    """

    name: str = "base"
    schedule_cron: str = "0 */6 * * *"
    rate_limit_seconds: float = 1.0

    def __init__(self) -> None:
        self.breaker = CircuitBreaker()
        self.user_agents = [ua.strip() for ua in settings.user_agents.split("|") if ua.strip()]
        self.proxies = [p.strip() for p in settings.proxy_pool.split(",") if p.strip()]

    def _pick_ua(self) -> str:
        return random.choice(self.user_agents) if self.user_agents else "Mozilla/5.0"

    def _pick_proxy(self) -> str | None:
        return random.choice(self.proxies) if self.proxies else None

    def _make_client(self) -> httpx.AsyncClient:
        return httpx.AsyncClient(
            timeout=settings.request_timeout_seconds,
            headers={"User-Agent": self._pick_ua()},
            proxy=self._pick_proxy(),
            follow_redirects=True,
            limits=httpx.Limits(max_connections=10, max_keepalive_connections=5),
        )

    @retry(
        stop=stop_after_attempt(settings.max_retries),
        wait=wait_exponential(multiplier=1, min=2, max=20),
        reraise=True,
    )
    async def fetch(self, url: str, **kwargs: Any) -> httpx.Response:
        async with self._make_client() as client:
            res = await client.get(url, **kwargs)
            res.raise_for_status()
            await asyncio.sleep(self.rate_limit_seconds)
            return res

    async def scrape(self) -> list[ScrapedItem]:
        raise NotImplementedError("Subclasses must implement scrape()")

    async def run(self) -> dict[str, Any]:
        """Run wrapper — handles circuit breaker, error logging, returns run summary."""
        if self.breaker.is_open:
            log.warning("circuit_breaker_open", scraper=self.name)
            return {"status": "blocked", "items": 0}

        started = datetime.now(timezone.utc)
        try:
            items = await self.scrape()
            self.breaker.record_success()
            duration = (datetime.now(timezone.utc) - started).total_seconds()
            log.info("scrape_success", scraper=self.name, items=len(items), duration_s=duration)
            return {
                "status": "success",
                "items": len(items),
                "duration_s": duration,
                "scraped": items,
            }
        except Exception as exc:  # noqa: BLE001
            self.breaker.record_failure()
            log.error("scrape_error", scraper=self.name, error=str(exc))
            return {"status": "error", "error": str(exc), "items": 0}
