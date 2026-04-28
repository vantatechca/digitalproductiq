"""Pinterest — trending pins, search query trends."""
from __future__ import annotations

from .base import BaseScraper, ScrapedItem


class PinterestScraper(BaseScraper):
    name = "pinterest_trends"
    schedule_cron = "0 */12 * * *"
    rate_limit_seconds = 2.0

    async def scrape(self) -> list[ScrapedItem]:
        # Phase 1: trends.pinterest.com data; Phase 2: scrape pins via Playwright
        return [ScrapedItem(
            platform="pinterest",
            signal_type="trends_snapshot",
            title="Pinterest trends snapshot",
            external_url="https://trends.pinterest.com",
            raw_payload={"_stub": True},
        )]
