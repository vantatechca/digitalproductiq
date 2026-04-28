"""Extraction — Tier-1 LLM extracts a structured idea from a relevant signal."""
from __future__ import annotations

import json
from typing import Any

from ..ai.router import route_llm
from ..scrapers.base import ScrapedItem


PROMPT = """You are an idea extractor. From the signal below, propose ONE concrete digital product idea.

Return JSON with this exact shape (no preamble, no commentary):
{{
  "title": "...",
  "summary": "...",
  "category": "one of: productivity_systems, design_assets, business_templates, education_courses, ebooks_guides, printables, software_tools, browser_extensions, mobile_apps, membership_communities, coaching_consulting, newsletters_paid, ai_prompts_gpts, web_themes_uikits, video_content_courses, audio_assets, photography_stock, fitness_wellness_digital, crafts_patterns, gaming_assets, children_education, finance_money, real_estate_landlord, careers_resumes, social_media_creator, wedding_event_planning",
  "product_format": "specific format (e.g. notion_template, gpt, prompt_pack, pdf_planner_printable, etc.)",
  "target_audience": ["audience_1", "audience_2"],
  "build_path": "one of: build_from_scratch, license_plr_mrr, white_label, arbitrage_flip, curate_collection, collab_creator",
  "sub_niche": ["niche_1", "niche_2"]
}}

Signal:
{signal}
"""


async def extract_idea(item: ScrapedItem) -> dict[str, Any]:
    signal_text = json.dumps({
        "platform": item.platform,
        "type": item.signal_type,
        "title": item.title,
        "content": (item.content or "")[:2000],
    })
    response = await route_llm(
        tier=1,
        prompt=PROMPT.format(signal=signal_text),
        max_tokens=400,
    )
    try:
        return json.loads(response.strip())
    except json.JSONDecodeError:
        return {}
