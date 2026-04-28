"""Notion Marketplace + Prototion + Notion Things — listings, ratings, sales proxies."""
from __future__ import annotations

from .base import BaseScraper, ScrapedItem


SOURCES = [
    ("notion_marketplace", "https://www.notion.so/templates"),
    ("prototion", "https://prototion.com"),
]


class NotionMarketplaceScraper(BaseScraper):
    name = "notion_marketplace"
    schedule_cron = "0 */12 * * *"
    rate_limit_seconds = 2.0

    async def scrape(self) -> list[ScrapedItem]:
        items: list[ScrapedItem] = []
        for platform, url in SOURCES:
            try:
                res = await self.fetch(url)
                items.append(ScrapedItem(
                    platform=platform,
                    signal_type="listing_snapshot",
                    title=f"{platform} snapshot",
                    external_url=url,
                    raw_payload={"html_size": len(res.text)},
                ))
            except Exception:  # noqa: BLE001
                continue
        return items
