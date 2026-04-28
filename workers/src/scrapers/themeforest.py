"""ThemeForest / Envato Market — best sellers + new + trending.

Envato has affiliate/data feeds. Phase 2 wires those for higher fidelity.
"""
from __future__ import annotations

from .base import BaseScraper, ScrapedItem


class ThemeForestScraper(BaseScraper):
    name = "themeforest_bestsellers"
    schedule_cron = "0 0 * * *"
    rate_limit_seconds = 2.0

    async def scrape(self) -> list[ScrapedItem]:
        try:
            res = await self.fetch("https://themeforest.net/popular_items/by_category?category=wordpress")
            return [ScrapedItem(
                platform="themeforest",
                signal_type="bestseller_snapshot",
                title="ThemeForest WordPress popular",
                external_url=res.url and str(res.url) or None,
                raw_payload={"html_size": len(res.text)},
            )]
        except Exception:  # noqa: BLE001
            return []
