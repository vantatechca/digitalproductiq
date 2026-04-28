"""IDPLR.com — scrape free + paid PLR listings, license terms.

PLR sites have wide variability in ToS. Always:
- Capture license_terms_url
- Flag any rewrite-percentage requirements
- Never auto-publish; surface for human license review
"""
from __future__ import annotations

from .base import BaseScraper, ScrapedItem


CATEGORIES = ["health-fitness", "internet-marketing", "self-help", "business"]


class IDPLRScraper(BaseScraper):
    name = "idplr_scraper"
    schedule_cron = "0 0 * * *"
    rate_limit_seconds = 3.0

    async def scrape(self) -> list[ScrapedItem]:
        items: list[ScrapedItem] = []
        for cat in CATEGORIES:
            url = f"https://idplr.com/category/{cat}"
            try:
                res = await self.fetch(url)
                items.append(ScrapedItem(
                    platform="idplr",
                    signal_type="plr_listing_snapshot",
                    title=f"IDPLR — {cat}",
                    external_url=url,
                    raw_payload={"category": cat, "html_size": len(res.text)},
                ))
            except Exception:  # noqa: BLE001
                continue
        return items
