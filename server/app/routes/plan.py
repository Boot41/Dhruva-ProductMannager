from fastapi import APIRouter, HTTPException

from app.schema import RoadmapCreate
from app.agents.roadmapLLM import generate_roadmap
from app.agents.milestonesLLM import generate_milestones
from app.agents.tasksLLM import generate_tasks

router = APIRouter()

@router.post("/plan")
def roadmap_to_milestones_and_tasks(payload: RoadmapCreate):
    """
    Temporary API: generate a roadmap, then feed its output to milestones generator,
    then produce day-to-day tasks from the milestones. Returns all three.
    """
    try:
        # 1) Generate roadmap text
        roadmap_text = generate_roadmap(
            requirements=payload.requirements,
            tech_stack=payload.tech_stack,
            best_practices=payload.best_practices,
            temperature=payload.temperature or 0.2,
        )

        # 2) Use the roadmap as input 'requirements' for milestones generation
        milestones_text = generate_milestones(
            requirements=roadmap_text,
            tech_stack=payload.tech_stack,
            temperature=payload.temperature or 0.2,
        )

        # 3) Use the milestones as input for tasks generation
        tasks_text = generate_tasks(
            milestones=milestones_text,
            tech_stack=payload.tech_stack,
            temperature=payload.temperature or 0.2,
        )

        return {
            "roadmap": roadmap_text,
            "milestones": milestones_text,
            "tasks": tasks_text,
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
