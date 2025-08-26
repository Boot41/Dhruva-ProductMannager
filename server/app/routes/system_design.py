from fastapi import APIRouter, HTTPException

from app.agents.systemDesignLLM import generate_system_design
from app.schema import SystemDesignCreate

router = APIRouter()


@router.post("/system-design")
def create_system_design(payload: SystemDesignCreate):
    try:
        # Prepare input model (align with existing pattern of setting content after generation)
        sd_input = SystemDesignCreate(
            features=payload.features,
            expected_users=payload.expected_users,
            geography=payload.geography,
            tech_stack=payload.tech_stack,
            constraints=payload.constraints,
            temperature=payload.temperature or 0.2,
            content="",  # filled after generation
        )

        design_text = generate_system_design(
            features=sd_input.features,
            expected_users=sd_input.expected_users,
            geography=sd_input.geography,
            tech_stack=sd_input.tech_stack,
            constraints=sd_input.constraints,
            temperature=sd_input.temperature,
        )
        sd_input.content = design_text

        return {"system_design": sd_input.content}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
