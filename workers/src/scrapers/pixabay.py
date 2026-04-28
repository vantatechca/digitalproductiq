"""Pixabay — CC0 photos and vectors that can be repackaged."""
from __future__ import annotations

from .base import BaseScraper, ScrapedItem


class PixabayScraper(BaseScraper):
    name = "pixabay_cc0"
    schedule_cron = "0 0 * * *"
    rate_limit_seconds = 1.5

    async def scrape(self) -> list[ScrapedItem]:
        # Phase 2: real Pixabay API client
        return [ScrapedItem(
            platform="pixabay",
            signal_type="cc0_snapshot",
            title="Pixabay CC0 catalog",
            external_url="https://pixabay.com",
            raw_payload={"_stub": True, "license": "CC0"},
        )]
