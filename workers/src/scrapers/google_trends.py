"""Google Trends — pytrends for keyword velocity, breakout detection (>200% MoM)."""
from __future__ import annotations

from .base import BaseScraper, ScrapedItem


SEED_KEYWORDS = [
    "notion template", "ai prompts", "etsy printables", "no spend year tracker",
    "claude project", "n8n workflow", "ai resume", "stoicism printable",
    "linkedin carousel template", "saas runway calculator",
]


class GoogleTrendsScraper(BaseScraper):
    name = "google_trends"
    schedule_cron = "0 */4 * * *"
    rate_limit_seconds = 5.0  # Google Trends rate-limits aggressively

    async def scrape(self) -> list[ScrapedItem]:
        # Phase 2: real pytrends.TrendReq() client
        return [ScrapedItem(
            platform="google_trends",
            signal_type="velocity_snapshot",
            title=f"Trends velocity — {kw}",
            external_url=None,
            raw_payload={"_stub": True, "keyword": kw},
        ) for kw in SEED_KEYWORDS]
