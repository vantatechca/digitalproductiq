"""Indie Hackers — milestones, public revenue, new product launches."""
from __future__ import annotations

from .base import BaseScraper, ScrapedItem


class IndieHackersScraper(BaseScraper):
    name = "indie_hackers_milestones"
    schedule_cron = "0 */12 * * *"
    rate_limit_seconds = 1.5

    async def scrape(self) -> list[ScrapedItem]:
        try:
            res = await self.fetch("https://www.indiehackers.com/milestones")
            return [ScrapedItem(
                platform="indie_hackers",
                signal_type="milestones_snapshot",
                title="Indie Hackers milestones",
                external_url="https://www.indiehackers.com/milestones",
                raw_payload={"html_size": len(res.text)},
            )]
        except Exception:  # noqa: BLE001
            return []
