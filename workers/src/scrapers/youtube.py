"""YouTube — Data API v3. Search high-view tutorials → infer in-demand topics."""
from __future__ import annotations

from .base import BaseScraper, ScrapedItem


SEARCHES = [
    "how to make digital products",
    "etsy digital downloads tutorial",
    "gumroad creator tutorial",
    "notion templates 2026",
    "ai prompt pack creator",
]


class YouTubeScraper(BaseScraper):
    name = "youtube_data_api"
    schedule_cron = "0 */4 * * *"
    rate_limit_seconds = 1.0

    async def scrape(self) -> list[ScrapedItem]:
        # Phase 2: real Google Data API v3 client
        items = [ScrapedItem(
            platform="youtube",
            signal_type="search_snapshot",
            title=f"YouTube search — {q}",
            external_url=f"https://www.youtube.com/results?search_query={q.replace(' ', '+')}",
            raw_payload={"_stub": True, "query": q},
        ) for q in SEARCHES]
        return items
