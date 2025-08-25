from functools import lru_cache
from fastapi import FastAPI

from app.core.config import Settings, get_settings


app = FastAPI(title="ProductManager API", version="0.1.0")


@lru_cache
def _settings() -> Settings:
    return get_settings()


@app.get("/healthz")
def healthz():
    return {"status": "ok"}


@app.get("/")
def root():
    s = _settings()
    return {"message": f"API key: {s.api_key}"}


@app.get("/config")
def read_config():
    s = _settings()
    return {
        "has_api_key": bool(s.api_key),
    }
