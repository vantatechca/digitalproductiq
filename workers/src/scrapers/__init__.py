"""Scrapers — one file per source, all extending BaseScraper."""
from .base import BaseScraper, ScrapedItem  # re-export

__all__ = ["BaseScraper", "ScrapedItem"]
