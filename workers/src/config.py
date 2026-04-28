"""Settings — env-driven via pydantic-settings."""
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",
    )

    # Database
    supabase_url: str = ""
    supabase_service_key: str = ""
    database_url: str = ""

    # Redis / Celery
    redis_url: str = "redis://localhost:6379/0"
    celery_broker_url: str = "redis://localhost:6379/1"
    celery_result_backend: str = "redis://localhost:6379/2"

    # AI keys
    anthropic_api_key: str = ""
    openai_api_key: str = ""
    openrouter_api_key: str = ""

    # Tier model defaults
    tier1_model: str = "deepseek/deepseek-v3"
    tier2_model: str = "claude-haiku-4-5-20251001"
    tier3_model: str = "claude-sonnet-4-6"
    embedding_model: str = "text-embedding-3-small"
    embedding_dim: int = 1536

    # Cost cap (per day USD)
    daily_budget_usd: float = 5.00

    # Scraper defaults
    user_agents: str = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36"
    proxy_pool: str = ""
    request_timeout_seconds: int = 30
    max_retries: int = 3

    # External API creds
    reddit_client_id: str = ""
    reddit_client_secret: str = ""
    reddit_user_agent: str = "DigitalProductIQ/0.1 by user"
    youtube_api_key: str = ""

    # Compliance toggles
    respect_strict_tos: bool = True

    # Service tuning
    dedup_threshold: float = 0.85
    relevance_cutoff: int = 40
    auto_approve_threshold: int = 75
    auto_archive_threshold: int = 35


settings = Settings()
