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
