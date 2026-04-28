"""TikTok hashtag volume tracker."""
from __future__ import annotations

from .base import BaseScraper, ScrapedItem


HASHTAGS = [
    "digitalproduct", "etsyseller", "sidehustle", "passiveincome",
    "notiontemplates", "canvacreates", "aiagent", "chatgpttips", "nospendyear",
]


class TikTokScraper(BaseScraper):
    name = "tiktok_hashtags"
    schedule_cron = "0 */12 * * *"
    rate_limit_seconds = 3.0

    async def scrape(self) -> list[ScrapedItem]:
        # Phase 1: stub. Phase 2: TikTok Research API or Playwright with anti-bot
        return [ScrapedItem(
            platform="tiktok",
            signal_type="hashtag_volume",
            title=f"#{tag}",
            external_url=f"https://www.tiktok.com/tag/{tag}",
            raw_payload={"_stub": True, "hashtag": tag},
        ) for tag in HASHTAGS]
