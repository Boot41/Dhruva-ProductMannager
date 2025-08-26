from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

from app.agents.roadmapLLM import generate_roadmap
from app.schema import RoadmapCreate

router = APIRouter()


@router.post("/roadmap")
def create_roadmap(payload: RoadmapCreate):
    try:
        # Build schema object for the LLM call context
        roadmap_input = RoadmapCreate(
            requirements=payload.requirements,
            tech_stack=payload.tech_stack,
            best_practices=payload.best_practices,
            temperature=payload.temperature or 0.2,
            content="",  # will be set after generation
        )

        roadmap_text = generate_roadmap(
            requirements=roadmap_input.requirements,
            tech_stack=roadmap_input.tech_stack,
            best_practices=roadmap_input.best_practices,
            temperature=roadmap_input.temperature,
        )
        roadmap_input.content = roadmap_text

        return {"roadmap": roadmap_input.content}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
