"""PLR Database — alternative PLR source."""
from __future__ import annotations

from .base import BaseScraper, ScrapedItem


class PLRDatabaseScraper(BaseScraper):
    name = "plr_database"
    schedule_cron = "0 0 * * *"
    rate_limit_seconds = 3.0

    async def scrape(self) -> list[ScrapedItem]:
        try:
            res = await self.fetch("https://www.plrdatabase.com/all-plr")
            return [ScrapedItem(
                platform="plr_database",
                signal_type="plr_listing_snapshot",
                title="PLR Database — all PLR",
                external_url="https://www.plrdatabase.com/all-plr",
                raw_payload={"html_size": len(res.text)},
            )]
        except Exception:  # noqa: BLE001
            return []
