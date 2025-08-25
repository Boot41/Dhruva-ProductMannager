from functools import lru_cache
from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import Field


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    api_key: str | None = Field(default=None, alias="API_KEY")


@lru_cache
def get_settings() -> Settings:
    return Settings()  # loaded from environment and .env
