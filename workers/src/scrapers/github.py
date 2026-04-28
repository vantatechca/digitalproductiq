"""GitHub — MIT/Apache/CC0 repos that could be packaged as no-code tools, scripts, templates."""
from __future__ import annotations

from .base import BaseScraper, ScrapedItem


SEARCHES = [
    "topic:notion-template+stars:>200",
    "topic:tailwind-template+stars:>500",
    "topic:awesome-list+stars:>2000",
    "topic:saas-starter+stars:>500",
]


class GitHubScraper(BaseScraper):
    name = "github_awesome_lists"
    schedule_cron = "0 0 * * *"
    rate_limit_seconds = 1.0

    async def scrape(self) -> list[ScrapedItem]:
        items: list[ScrapedItem] = []
        for q in SEARCHES:
            try:
                url = f"https://api.github.com/search/repositories?q={q}&sort=stars&per_page=10"
                res = await self.fetch(url)
                data = res.json() if res.headers.get("content-type", "").startswith("application/json") else {}
                items.append(ScrapedItem(
                    platform="github",
                    signal_type="repo_snapshot",
                    title=f"GitHub search — {q}",
                    external_url=url,
                    raw_payload={"query": q, "results_count": data.get("total_count", 0)},
                ))
            except Exception:  # noqa: BLE001
                continue
        return items
