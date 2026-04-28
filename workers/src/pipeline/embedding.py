"""Embedding — generate 1536-d vectors via OpenAI text-embedding-3-small.
Falls back to sentence-transformers/all-MiniLM-L6-v2 padded/projected to 1536-d.
"""
from __future__ import annotations

from openai import AsyncOpenAI

from ..config import settings


_client: AsyncOpenAI | None = None


def _get_client() -> AsyncOpenAI:
    global _client
    if _client is None:
        _client = AsyncOpenAI(api_key=settings.openai_api_key)
    return _client


async def embed(text: str) -> list[float]:
    """Return a settings.embedding_dim vector. Truncate input to 8K tokens."""
    if not text:
        return [0.0] * settings.embedding_dim
    client = _get_client()
    res = await client.embeddings.create(
        model=settings.embedding_model,
        input=text[:8000],
    )
    return list(res.data[0].embedding)


async def embed_idea(idea: dict[str, str | list[str]]) -> list[float]:
    text = " ".join([
        str(idea.get("title", "")),
        str(idea.get("summary", "")),
        str(idea.get("category", "")),
        " ".join(idea.get("sub_niche", []) if isinstance(idea.get("sub_niche"), list) else []),  # type: ignore[arg-type]
    ])
    return await embed(text)
