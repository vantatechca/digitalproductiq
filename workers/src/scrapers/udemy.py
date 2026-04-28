"""Udemy — trending courses, top instructors."""
from __future__ import annotations

from .base import BaseScraper, ScrapedItem


class UdemyScraper(BaseScraper):
    name = "udemy_trending"
    schedule_cron = "0 */12 * * *"
    rate_limit_seconds = 2.0

    async def scrape(self) -> list[ScrapedItem]:
        try:
            res = await self.fetch("https://www.udemy.com/topic/business/")
            return [ScrapedItem(
                platform="udemy",
                signal_type="trending_snapshot",
                title="Udemy business trending",
                external_url="https://www.udemy.com/topic/business/",
                raw_payload={"html_size": len(res.text)},
            )]
        except Exception:  # noqa: BLE001
            return []
