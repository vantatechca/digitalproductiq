"""Enrichment — pull additional context for an extracted idea.

Sources:
- Google Trends slope (pytrends)
- Competitor count via marketplace search APIs / scrapers
- Median price across top 10 listings
- Search volume estimate
- Related ideas from embedding ANN
"""
from __future__ import annotations

from typing import Any


async def enrich_idea(idea: dict[str, Any]) -> dict[str, Any]:
    """Return a dict with enrichment fields to merge into the idea row."""
    # Phase 2 wires real services. For now, stub with computed defaults.
    return {
        "search_volume_monthly": idea.get("search_volume_monthly") or 0,
        "trend_direction": idea.get("trend_direction") or "stable",
        "trend_velocity_pct": idea.get("trend_velocity_pct") or 0.0,
        "competitor_count": idea.get("competitor_count") or 0,
        "median_price_usd": idea.get("median_price_usd") or 0.0,
        "price_floor_usd": idea.get("price_floor_usd") or 0.0,
        "price_ceiling_usd": idea.get("price_ceiling_usd") or 0.0,
        "estimated_monthly_revenue_low_usd": idea.get("estimated_monthly_revenue_low_usd") or 0,
        "estimated_monthly_revenue_high_usd": idea.get("estimated_monthly_revenue_high_usd") or 0,
        "market_size_estimate_usd": idea.get("market_size_estimate_usd") or 0,
    }
