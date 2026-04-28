"""Scoring — Tier-2 LLM scores 5 dimensions, computes composite using user weights."""
from __future__ import annotations

import json
from typing import Any

from ..ai.router import route_llm


PROMPT = """Score this digital-product idea on 5 dimensions, 0-100 each.

Idea:
{idea_json}

Score it on:
- trend (velocity, breakout status, search-volume growth, mention growth)
- demand (engagement, save/follow ratio, search volume, comments-with-buying-intent)
- competition (INVERSE — fewer competitors + bigger price floor = HIGHER score; saturated = LOWER)
- feasibility (INVERSE of build effort; matches user skills/time/budget)
- revenue (price × volume × margin; recurring beats one-time at equal volume)

Return ONLY a JSON object:
{{"trend": 0-100, "demand": 0-100, "competition": 0-100, "feasibility": 0-100, "revenue": 0-100, "confidence": 0.0-1.0, "rationale": "1-2 sentences"}}
"""


DEFAULT_WEIGHTS = {"trend": 0.20, "demand": 0.25, "competition": 0.20, "feasibility": 0.15, "revenue": 0.20}


async def score_idea(idea: dict[str, Any], weights: dict[str, float] | None = None) -> dict[str, Any]:
    response = await route_llm(
        tier=2,
        prompt=PROMPT.format(idea_json=json.dumps(idea, default=str)[:3000]),
        max_tokens=400,
    )
    try:
        scores = json.loads(response.strip())
    except json.JSONDecodeError:
        scores = {"trend": 50, "demand": 50, "competition": 50, "feasibility": 50, "revenue": 50, "confidence": 0.4, "rationale": "fallback"}

    w = weights or DEFAULT_WEIGHTS
    composite = (
        scores.get("trend", 0) * w["trend"]
        + scores.get("demand", 0) * w["demand"]
        + scores.get("competition", 0) * w["competition"]
        + scores.get("feasibility", 0) * w["feasibility"]
        + scores.get("revenue", 0) * w["revenue"]
    )
    scores["composite_score"] = round(composite, 2)
    return scores
