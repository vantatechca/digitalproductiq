"""Product Hunt — daily/weekly top, category-specific."""
from __future__ import annotations

from .base import BaseScraper, ScrapedItem


class ProductHuntScraper(BaseScraper):
    name = "product_hunt_daily"
    schedule_cron = "0 */12 * * *"
    rate_limit_seconds = 1.5

    async def scrape(self) -> list[ScrapedItem]:
        # Phase 2: use Product Hunt GraphQL API
        try:
            res = await self.fetch("https://www.producthunt.com")
            return [ScrapedItem(
                platform="product_hunt",
                signal_type="daily_snapshot",
                title="Product Hunt daily",
                external_url="https://www.producthunt.com",
                raw_payload={"html_size": len(res.text)},
            )]
        except Exception:  # noqa: BLE001
            return []
