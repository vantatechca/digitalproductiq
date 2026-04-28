"""Hacker News — Show HN posts, especially digital tools/templates/courses."""
from __future__ import annotations

from .base import BaseScraper, ScrapedItem


class HackerNewsScraper(BaseScraper):
    name = "hacker_news_show"
    schedule_cron = "0 */6 * * *"
    rate_limit_seconds = 1.0

    async def scrape(self) -> list[ScrapedItem]:
        try:
            res = await self.fetch("https://hn.algolia.com/api/v1/search?tags=show_hn&hitsPerPage=30")
            return [ScrapedItem(
                platform="hacker_news",
                signal_type="show_hn_snapshot",
                title="Show HN — last 30",
                external_url="https://news.ycombinator.com/show",
                raw_payload=res.json() if res.headers.get("content-type", "").startswith("application/json") else {},
            )]
        except Exception:  # noqa: BLE001
            return []
