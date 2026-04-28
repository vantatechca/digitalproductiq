"""Reddit pulse — top + new posts across opportunity-rich subreddits.

Uses PRAW (Python Reddit API Wrapper). Phase 2 wires real PRAW calls.
"""
from __future__ import annotations

from .base import BaseScraper, ScrapedItem


SUBREDDITS = [
    "sidehustle", "Entrepreneur", "passive_income", "EtsySellers", "notion",
    "excel", "ChatGPTPromptGenius", "IndieDev", "SaaS", "Designjobs",
    "personalfinance", "socialmedia", "marketing", "copywriting", "freelance",
]


class RedditScraper(BaseScraper):
    name = "reddit_pulse"
    schedule_cron = "0 */2 * * *"
    rate_limit_seconds = 1.0

    async def scrape(self) -> list[ScrapedItem]:
        # Phase 2: actual PRAW client wired here
        items: list[ScrapedItem] = []
        for sub in SUBREDDITS:
            items.append(ScrapedItem(
                platform="reddit",
                signal_type="subreddit_pulse",
                title=f"r/{sub} — top + new (stub)",
                external_url=f"https://reddit.com/r/{sub}",
                raw_payload={"_stub": True, "subreddit": sub},
            ))
        return items
