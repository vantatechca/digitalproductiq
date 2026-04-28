"""Relevance — Tier-1 LLM scores 0-100. Cutoff at settings.relevance_cutoff (default 40)."""
from __future__ import annotations

from ..ai.router import route_llm
from ..config import settings
from ..scrapers.base import ScrapedItem


PROMPT = """You are a relevance classifier for a digital product opportunity engine.
Score the following item from 0 to 100 based on its relevance to identifying:
- New digital product opportunities (Notion templates, GPTs, courses, printables, AI agents, etc.)
- Active demand signals (people asking for products, complaining about gaps, sharing wins)
- Competitive intelligence (top sellers, new launches, breakouts)

Return ONLY a single integer 0-100. Higher = more relevant.

Item:
Platform: {platform}
Type: {signal_type}
Title: {title}
Content: {content}
"""


async def score_relevance(item: ScrapedItem) -> int:
    response = await route_llm(
        tier=1,
        prompt=PROMPT.format(
            platform=item.platform,
            signal_type=item.signal_type,
            title=item.title or "",
            content=(item.content or "")[:1500],
        ),
        max_tokens=10,
    )
    try:
        return int(response.strip())
    except ValueError:
        return 0


def passes_relevance(score: int) -> bool:
    return score >= settings.relevance_cutoff
