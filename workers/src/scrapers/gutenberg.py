"""Project Gutenberg — public domain books for repackaging into curated bundles."""
from __future__ import annotations

from .base import BaseScraper, ScrapedItem


class GutenbergScraper(BaseScraper):
    name = "gutenberg_pull"
    schedule_cron = "0 0 * * *"
    rate_limit_seconds = 2.0

    async def scrape(self) -> list[ScrapedItem]:
        try:
            res = await self.fetch("https://www.gutenberg.org/browse/scores/top")
            return [ScrapedItem(
                platform="gutenberg",
                signal_type="public_domain_snapshot",
                title="Project Gutenberg — top books",
                external_url="https://www.gutenberg.org/browse/scores/top",
                raw_payload={"html_size": len(res.text)},
            )]
        except Exception:  # noqa: BLE001
            return []
