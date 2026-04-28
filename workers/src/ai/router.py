"""3-tier AI router with daily budget cap and automatic downgrade.

Tier 1 (DeepSeek/Qwen via OpenRouter): bulk extraction, classification, simple scoring.
Tier 2 (Claude Haiku 4.5):  structured scoring, dedup checks, JSON validation.
Tier 3 (Claude Sonnet 4.6): brain chat, deep dives, golden-rule generation.

When daily budget hits 80%, downgrade non-chat to Tier 1.
When 100%, queue or reject (raise BudgetExceeded).
"""
from __future__ import annotations

from datetime import date, datetime, timezone
from typing import Literal

import httpx
from anthropic import AsyncAnthropic

from ..config import settings


class BudgetExceeded(Exception):
    pass


_anthropic: AsyncAnthropic | None = None


def _get_anthropic() -> AsyncAnthropic:
    global _anthropic
    if _anthropic is None:
        _anthropic = AsyncAnthropic(api_key=settings.anthropic_api_key)
    return _anthropic


# Daily cost tracker (in-memory; replace with Redis/Postgres in prod)
_cost_tracker: dict[date, float] = {}


def _today_cost() -> float:
    today = datetime.now(timezone.utc).date()
    return _cost_tracker.get(today, 0.0)


def _record_cost(usd: float) -> None:
    today = datetime.now(timezone.utc).date()
    _cost_tracker[today] = _cost_tracker.get(today, 0.0) + usd


def _budget_remaining() -> float:
    return max(0.0, settings.daily_budget_usd - _today_cost())


def _budget_pct_used() -> float:
    if settings.daily_budget_usd <= 0:
        return 0.0
    return _today_cost() / settings.daily_budget_usd


# Approximate per-token cost. Update as pricing changes.
TIER_COST_PER_1K = {1: 0.0002, 2: 0.005, 3: 0.03}


async def route_llm(
    tier: Literal[1, 2, 3],
    prompt: str,
    max_tokens: int = 1024,
    is_chat: bool = False,
) -> str:
    """Send a prompt to the appropriate tier model. Returns the text response.

    Auto-downgrades non-chat tier-2/3 calls to tier-1 when budget is >80% used.
    Raises BudgetExceeded if 100%.
    """
    if _budget_pct_used() >= 1.0:
        raise BudgetExceeded(f"Daily budget ${settings.daily_budget_usd} exhausted")

    if not is_chat and _budget_pct_used() >= 0.8 and tier != 1:
        tier = 1

    estimated_cost = (max_tokens / 1000) * TIER_COST_PER_1K[tier]

    if tier == 3:
        text = await _call_anthropic(settings.tier3_model, prompt, max_tokens)
    elif tier == 2:
        text = await _call_anthropic(settings.tier2_model, prompt, max_tokens)
    else:
        text = await _call_openrouter(settings.tier1_model, prompt, max_tokens)

    _record_cost(estimated_cost)
    return text


async def _call_anthropic(model: str, prompt: str, max_tokens: int) -> str:
    client = _get_anthropic()
    res = await client.messages.create(
        model=model,
        max_tokens=max_tokens,
        messages=[{"role": "user", "content": prompt}],
    )
    parts: list[str] = []
    for block in res.content:
        if hasattr(block, "text"):
            parts.append(block.text)  # type: ignore[attr-defined]
    return "".join(parts)


async def _call_openrouter(model: str, prompt: str, max_tokens: int) -> str:
    if not settings.openrouter_api_key:
        return ""
    async with httpx.AsyncClient(timeout=60.0) as client:
        res = await client.post(
            "https://openrouter.ai/api/v1/chat/completions",
            headers={"Authorization": f"Bearer {settings.openrouter_api_key}"},
            json={
                "model": model,
                "messages": [{"role": "user", "content": prompt}],
                "max_tokens": max_tokens,
            },
        )
        res.raise_for_status()
        data = res.json()
        return data["choices"][0]["message"]["content"]


async def stream_chat(prompt: str, model: str | None = None):
    """Stream Tier-3 chat tokens. Used by FastAPI SSE endpoint."""
    client = _get_anthropic()
    async with client.messages.stream(
        model=model or settings.tier3_model,
        max_tokens=2048,
        messages=[{"role": "user", "content": prompt}],
    ) as stream:
        async for text in stream.text_stream:
            yield text


def daily_cost_report() -> dict[str, float]:
    return {
        "date": str(datetime.now(timezone.utc).date()),
        "spent_usd": round(_today_cost(), 4),
        "budget_usd": settings.daily_budget_usd,
        "remaining_usd": round(_budget_remaining(), 4),
        "pct_used": round(_budget_pct_used() * 100, 1),
    }
