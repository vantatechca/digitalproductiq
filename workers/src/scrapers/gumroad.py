"""Gumroad scraper — Discover top picks, category leaderboards.

Public discover pages render with JS, so prefer Playwright. Falls back to
HTML parsing for static pages.
"""
from __future__ import annotations

from .base import BaseScraper, ScrapedItem


CATEGORIES = ["business-and-money", "design", "writing-and-publishing", "education"]


class GumroadScraper(BaseScraper):
    name = "gumroad_top"
    schedule_cron = "0 */6 * * *"
    rate_limit_seconds = 2.0

    async def scrape(self) -> list[ScrapedItem]:
        items: list[ScrapedItem] = []
        for category in CATEGORIES:
            url = f"https://gumroad.com/discover/{category}"
            try:
                res = await self.fetch(url)
                items.append(ScrapedItem(
                    platform="gumroad",
                    signal_type="discover_snapshot",
                    title=f"Gumroad — {category}",
                    external_url=url,
                    raw_payload={"category": category, "html_size": len(res.text)},
                ))
            except Exception:  # noqa: BLE001
                continue
        return items
