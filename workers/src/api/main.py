"""FastAPI app — health, ad-hoc scraper triggers, status, history.

Run: uvicorn src.api.main:app --reload --port 8000
"""
from __future__ import annotations

from datetime import datetime, timezone
from typing import Any

from fastapi import FastAPI, HTTPException

from ..ai.router import daily_cost_report
from ..tasks.celery_app import SCRAPER_REGISTRY, celery, run_scraper

app = FastAPI(
    title="DigitalProductIQ Workers",
    version="0.1.0",
    description="Always-on intelligence: scrapers + pipeline + brain",
)


@app.get("/health")
async def health() -> dict[str, Any]:
    return {
        "status": "ok",
        "service": "workers",
        "time": datetime.now(timezone.utc).isoformat(),
        "ai_budget": daily_cost_report(),
    }


@app.get("/scrapers")
async def list_scrapers() -> dict[str, Any]:
    return {
        "data": [
            {
                "name": name,
                "schedule_cron": cls.schedule_cron,
                "rate_limit_seconds": cls.rate_limit_seconds,
            }
            for name, cls in SCRAPER_REGISTRY.items()
        ],
    }


@app.post("/scrape/{name}")
async def trigger_scrape(name: str) -> dict[str, Any]:
    if name not in SCRAPER_REGISTRY:
        raise HTTPException(status_code=404, detail=f"Unknown scraper: {name}")
    task = run_scraper.delay(name)
    return {"task_id": task.id, "scraper": name, "queued_at": datetime.now(timezone.utc).isoformat()}


@app.get("/status")
async def status() -> dict[str, Any]:
    inspect = celery.control.inspect()
    return {
        "active": inspect.active() if inspect else {},
        "scheduled": inspect.scheduled() if inspect else {},
        "registered": inspect.registered() if inspect else {},
    }


@app.get("/history")
async def history(limit: int = 25) -> dict[str, Any]:
    # Phase 2: query scraper_runs from Supabase
    return {"data": [], "limit": limit, "_note": "Wire Supabase query in phase 2"}
