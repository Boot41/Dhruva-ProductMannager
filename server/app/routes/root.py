import os
from functools import lru_cache
from fastapi import APIRouter

from app.core.config import Settings, get_settings

router = APIRouter()

@lru_cache
def _settings() -> Settings:
    return get_settings()

@router.get("/")
def root():
    s = _settings()

    def _mask(val: str | None) -> str | None:
        if not val:
            return None
        if len(val) <= 8:
            return "****"
        return f"****{val[-4:]}"

    return {
        "message": "ProductManager",
        "has_api_key": bool(s.api_key),
        "has_openai_key": os.getenv("API_KEY"),
    }
