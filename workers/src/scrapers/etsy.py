"""Etsy scraper — top sellers per category, trending searches, new digital_downloads listings.

Uses requests with rate limiting; falls back to Playwright when Etsy serves anti-bot.
Etsy public listings are scrapable but volatile — respect ToS, only collect public,
non-PII data, and store as aggregated trend signals.
"""
from __future__ import annotations

from .base import BaseScraper, ScrapedItem


CATEGORIES = [
    "digital-prints",
    "printable-art",
    "digital-planners",
    "svg-files",
    "wedding-printables",
    "stickers",
]


class EtsyScraper(BaseScraper):
    name = "etsy_top_sellers"
    schedule_cron = "0 */6 * * *"
    rate_limit_seconds = 2.5

    async def scrape(self) -> list[ScrapedItem]:
        items: list[ScrapedItem] = []
        for category in CATEGORIES:
            url = f"https://www.etsy.com/c/{category}?ref=catnav-{category}"
            try:
                res = await self.fetch(url)
                # Phase 1 stub — extract listing titles, prices, sales-proxy from HTML
                # Phase 2: switch to Playwright with stealth profile when blocked
                items.append(ScrapedItem(
                    platform="etsy",
                    signal_type="category_snapshot",
                    title=f"Etsy snapshot — {category}",
                    external_url=url,
                    raw_payload={"category": category, "html_size": len(res.text)},
                ))
            except Exception:  # noqa: BLE001
                continue
        return items
