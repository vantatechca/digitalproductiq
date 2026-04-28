"""Cross-check — Tier-3 LLM checks new idea against historical decisions and golden rules.

Returns one of: 'proceed' | 'modify_score' | 'skip_with_reason'
"""
from __future__ import annotations

import json
from typing import Any

from ..ai.router import route_llm


PROMPT = """You are the brain's gatekeeper. Cross-check this idea against the user's recent decisions and golden rules.

Idea: {idea_json}

Active golden rules (active=True only):
{rules_json}

Recent feedback patterns:
{patterns_json}

Decide:
1. "proceed" — score and surface as-is
2. "modify_score" — apply a multiplier to composite_score (return "score_multiplier": 0.0-1.5)
3. "skip_with_reason" — auto-archive (return "skip_reason": "...")

Return JSON: {{"decision": "...", "rationale": "...", "score_multiplier": 1.0, "skip_reason": null}}
"""


async def cross_check(
    idea: dict[str, Any],
    rules: list[dict[str, Any]],
    patterns: list[dict[str, Any]],
) -> dict[str, Any]:
    response = await route_llm(
        tier=3,
        prompt=PROMPT.format(
            idea_json=json.dumps(idea, default=str)[:2000],
            rules_json=json.dumps(rules[:20], default=str)[:1500],
            patterns_json=json.dumps(patterns[:10], default=str)[:1000],
        ),
        max_tokens=300,
    )
    try:
        return json.loads(response.strip())
    except json.JSONDecodeError:
        return {"decision": "proceed", "rationale": "fallback", "score_multiplier": 1.0, "skip_reason": None}
