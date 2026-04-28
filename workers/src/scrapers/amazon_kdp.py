"""Amazon KDP — best sellers in low-content books (planners, journals)."""
from __future__ import annotations

from .base import BaseScraper, ScrapedItem


CATEGORIES = ["calendars", "journals", "planners", "notebooks"]


class AmazonKDPScraper(BaseScraper):
    name = "amazon_kdp_bestsellers"
    schedule_cron = "0 */12 * * *"
    rate_limit_seconds = 3.0

    async def scrape(self) -> list[ScrapedItem]:
        # Amazon is hostile to scraping — Phase 2 wires Amazon Product Advertising API
        return [ScrapedItem(
            platform="amazon_kdp",
            signal_type="bestseller_snapshot",
            title="Amazon KDP — low-content best sellers (stub)",
            external_url="https://kdp.amazon.com",
            raw_payload={"_stub": True, "_categories": CATEGORIES},
        )]
