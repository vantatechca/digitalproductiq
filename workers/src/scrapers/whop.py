"""Whop scraper — top apps and communities.

Whop's marketplace pages need Playwright (they're JS-heavy SPAs).
"""
from __future__ import annotations

from .base import BaseScraper, ScrapedItem


class WhopScraper(BaseScraper):
    name = "whop_top_apps"
    schedule_cron = "0 */12 * * *"
    rate_limit_seconds = 3.0

    async def scrape(self) -> list[ScrapedItem]:
        # Phase 1: stub — Phase 2 wires Playwright with stealth
        return [ScrapedItem(
            platform="whop",
            signal_type="discover_snapshot",
            title="Whop Discover snapshot",
            external_url="https://whop.com/discover",
            raw_payload={"_stub": True, "_note": "Wire Playwright in phase 2"},
        )]
