"""Creative Market — popular this week, by category."""
from __future__ import annotations

from .base import BaseScraper, ScrapedItem


CATEGORIES = ["graphics", "templates", "themes", "fonts", "photos"]


class CreativeMarketScraper(BaseScraper):
    name = "creative_market_popular"
    schedule_cron = "0 */12 * * *"
    rate_limit_seconds = 2.5

    async def scrape(self) -> list[ScrapedItem]:
        items: list[ScrapedItem] = []
        for cat in CATEGORIES:
            url = f"https://creativemarket.com/{cat}/popular-this-week"
            try:
                res = await self.fetch(url)
                items.append(ScrapedItem(
                    platform="creative_market",
                    signal_type="popular_snapshot",
                    title=f"Creative Market popular — {cat}",
                    external_url=url,
                    raw_payload={"category": cat, "html_size": len(res.text)},
                ))
            except Exception:  # noqa: BLE001
                continue
        return items
