from functools import lru_cache
from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import Field


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    api_key: str | None = Field(default=None, alias="API_KEY")


@lru_cache
def get_settings() -> Settings:
    return Settings()  # loaded from environment and .env


def load_env() -> None:
    """Explicitly load environment variables from a .env file.

    While pydantic-settings already supports env_file, some runtimes
    prefer calling load_dotenv early to populate os.environ. This helper
    does that in a safe, no-op manner if .env is absent.
    """
    try:
        from dotenv import load_dotenv

        load_dotenv(dotenv_path=".env")
    except Exception:
        # Don't hard-fail if python-dotenv isn't available or other minor issues occur
        pass

class Settings(BaseSettings):
    app_name: str = "Product Mannager Server"
    environment: str = Field(default="development")

    # Optional generic API key (compat with existing envs)
    api_key: str | None = Field(default=None, alias="API_KEY")

    # Database
    database_url: str = Field(
        default="postgresql+psycopg2://postgres:postgres@localhost:5432/productmannager"
    )

    # Security / Auth
    jwt_secret_key: str = Field(default="CHANGE_ME_SUPER_SECRET")
    jwt_algorithm: str = Field(default="HS256")
    access_token_expire_minutes: int = Field(default=60 * 24)  # 24 hours
    # IMPORTANT: defaults above are convenient for local dev only. Override via env vars in prod.
    # The secret key MUST be set securely (e.g., BMS_JWT_SECRET_KEY) and never left as default.

    # Pydantic v2 settings config
    model_config = SettingsConfigDict(
        env_prefix="BMS_",           # All env vars are expected to be prefixed, e.g. BMS_DATABASE_URL
        env_file=".env",              # Loads from server/.env for local development
        case_sensitive=False,
        extra="ignore",               # Ignore unexpected env vars (e.g., API_KEY without alias)
    )


settings = Settings()