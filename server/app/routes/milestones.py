from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

from app.agents.milestonesLLM import generate_milestones
from app.schema import MilestonePlanCreate

router = APIRouter()


@router.post("/milestones")
def create_milestones(payload: MilestonePlanCreate):
    try:
        # Build schema object for the LLM call context
        milestone_input = MilestonePlanCreate(
            requirements=payload.requirements,
            tech_stack=payload.tech_stack,
            temperature=payload.temperature or 0.2,
            content="",  # will be set after generation
        )

        milestones_text = generate_milestones(
            requirements=milestone_input.requirements,
            tech_stack=milestone_input.tech_stack,
            temperature=milestone_input.temperature,
        )
        milestone_input.content = milestones_text

        return {"milestones": milestone_input.content}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
