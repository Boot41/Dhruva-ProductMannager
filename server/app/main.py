from functools import lru_cache
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field
import os

from app.agents.roadmap import generate_roadmap
from app.core.config import Settings, get_settings, load_env


# Ensure environment variables from .env are loaded at startup
load_env()

app = FastAPI(title="ProductManager", version="0.1.0")


@lru_cache
def _settings() -> Settings:
    return get_settings()


@app.get("/healthz")
def healthz():
    return {"status": "ok"}


@app.get("/")
def root():
    # Trigger settings load (reads from environment and .env via pydantic-settings)
    s = _settings()

    def _mask(val: str | None) -> str | None:
        if not val:
            return None
        if len(val) <= 8:
            return "****"
        return f"****{val[-4:]}"

    # Do not expose raw secrets. Provide safe indicators instead.
    return {
        "message": "ProductManager",
        "has_api_key": bool(s.api_key),
        "has_openai_key": os.getenv("API_KEY")
    }

class RoadmapRequest(BaseModel):
    requirements: str = Field(..., description="Product requirements text")
    tech_stack: str = Field(..., description="Selected tech stack description")
    best_practices: str | None = Field(
        default=None, description="Optional org/project conventions to consider"
    )
    temperature: float | None = Field(default=0.2, ge=0.0, le=1.0)


@app.post("/roadmap")
def create_roadmap(payload: RoadmapRequest):
    try:
        roadmap_text = generate_roadmap(
            requirements=payload.requirements,
            tech_stack=payload.tech_stack,
            best_practices=payload.best_practices,
            temperature=payload.temperature or 0.2,
        )
        return {"roadmap": roadmap_text}
    except Exception as e:
        # Surface a clean error for the client
        raise HTTPException(status_code=500, detail=str(e))
