"""Dedup — pgvector cosine similarity > settings.dedup_threshold (0.85) = same idea.

On match: append signals to existing idea, update last_signal_at, increment signals_count,
trigger re-scoring.
"""
from __future__ import annotations

from typing import Any

from ..config import settings


async def find_similar(supabase_client: Any, embedding: list[float]) -> dict[str, Any] | None:
    """Query ideas table by cosine distance < (1 - threshold). Return closest match or None."""
    threshold = 1 - settings.dedup_threshold  # cosine distance, lower = more similar
    # Phase 2: real Supabase RPC call to a stored function with pgvector ORDER BY embedding <=> $1
    # Stub here — returns None
    _ = (supabase_client, embedding, threshold)
    return None


async def merge_signal_into_idea(supabase_client: Any, idea_id: str, signal_id: str) -> None:
    """Bump signals_count, update last_signal_at, mark for re-scoring."""
    _ = (supabase_client, idea_id, signal_id)
    # Phase 2: real Supabase update
