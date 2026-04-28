"""Celery app + Beat schedule for all scrapers and aggregations."""
from __future__ import annotations

import asyncio

from celery import Celery
from celery.schedules import crontab

from ..config import settings
from ..scrapers.amazon_kdp import AmazonKDPScraper
from ..scrapers.creative_market import CreativeMarketScraper
from ..scrapers.etsy import EtsyScraper
from ..scrapers.github import GitHubScraper
from ..scrapers.google_trends import GoogleTrendsScraper
from ..scrapers.gumroad import GumroadScraper
from ..scrapers.gutenberg import GutenbergScraper
from ..scrapers.hacker_news import HackerNewsScraper
from ..scrapers.idplr import IDPLRScraper
from ..scrapers.indie_hackers import IndieHackersScraper
from ..scrapers.notion_marketplace import NotionMarketplaceScraper
from ..scrapers.pinterest import PinterestScraper
from ..scrapers.pixabay import PixabayScraper
from ..scrapers.plr_database import PLRDatabaseScraper
from ..scrapers.product_hunt import ProductHuntScraper
from ..scrapers.reddit import RedditScraper
from ..scrapers.themeforest import ThemeForestScraper
from ..scrapers.tiktok import TikTokScraper
from ..scrapers.udemy import UdemyScraper
from ..scrapers.whop import WhopScraper
from ..scrapers.youtube import YouTubeScraper


celery = Celery(
    "digitalproductiq",
    broker=settings.celery_broker_url,
    backend=settings.celery_result_backend,
)
celery.conf.update(
    task_serializer="json",
    accept_content=["json"],
    result_serializer="json",
    timezone="UTC",
    enable_utc=True,
    task_acks_late=True,
    worker_prefetch_multiplier=2,
)


SCRAPER_REGISTRY: dict[str, type] = {
    "etsy_top_sellers": EtsyScraper,
    "gumroad_top": GumroadScraper,
    "whop_top_apps": WhopScraper,
    "creative_market_popular": CreativeMarketScraper,
    "themeforest_bestsellers": ThemeForestScraper,
    "notion_marketplace": NotionMarketplaceScraper,
    "amazon_kdp_bestsellers": AmazonKDPScraper,
    "udemy_trending": UdemyScraper,
    "product_hunt_daily": ProductHuntScraper,
    "indie_hackers_milestones": IndieHackersScraper,
    "reddit_pulse": RedditScraper,
    "youtube_data_api": YouTubeScraper,
    "google_trends": GoogleTrendsScraper,
    "pinterest_trends": PinterestScraper,
    "tiktok_hashtags": TikTokScraper,
    "hacker_news_show": HackerNewsScraper,
    "idplr_scraper": IDPLRScraper,
    "plr_database": PLRDatabaseScraper,
    "pixabay_cc0": PixabayScraper,
    "gutenberg_pull": GutenbergScraper,
    "github_awesome_lists": GitHubScraper,
}


@celery.task(name="run_scraper")
def run_scraper(scraper_name: str) -> dict:
    """Run a single scraper by name."""
    cls = SCRAPER_REGISTRY.get(scraper_name)
    if cls is None:
        return {"status": "error", "error": f"Unknown scraper: {scraper_name}"}
    scraper = cls()
    return asyncio.run(scraper.run())


@celery.task(name="aggregate_daily_trends")
def aggregate_daily_trends() -> dict:
    """End-of-day rollup — compute trend snapshots, breakout detections, digest payload."""
    return {"status": "ok", "summary": "trends aggregated (stub)"}


@celery.task(name="generate_digest")
def generate_digest(user_id: str, frequency: str = "daily") -> dict:
    """Generate digest email payload for a user."""
    return {"status": "ok", "user_id": user_id, "frequency": frequency}


def _parse_cron(cron_str: str):
    """Parse a 5-field cron string into a celery crontab. Falls back to every 6h."""
    try:
        m, h, dom, mo, dow = cron_str.split()
        return crontab(minute=m, hour=h, day_of_month=dom, month_of_year=mo, day_of_week=dow)
    except Exception:  # noqa: BLE001
        return crontab(hour="*/6")


celery.conf.beat_schedule = {
    f"scrape_{name}": {
        "task": "run_scraper",
        "schedule": _parse_cron(cls.schedule_cron),
        "args": (name,),
    }
    for name, cls in SCRAPER_REGISTRY.items()
} | {
    "aggregate_daily_trends": {
        "task": "aggregate_daily_trends",
        "schedule": crontab(hour=3, minute=0),
    },
}
