from fastapi import APIRouter, HTTPException

from app.agents.tasksLLM import generate_tasks
from app.schema import TaskPlanCreate

router = APIRouter()


@router.post("/tasks")
def create_tasks(payload: TaskPlanCreate):
    try:
        # Build schema object for the LLM call context
        task_input = TaskPlanCreate(
            milestones=payload.milestones,
            tech_stack=payload.tech_stack,
            temperature=payload.temperature or 0.2,
            content="",  # will be set after generation
        )

        tasks_text = generate_tasks(
            milestones=task_input.milestones,
            tech_stack=task_input.tech_stack,
            temperature=task_input.temperature,
        )
        task_input.content = tasks_text

        return {"tasks": task_input.content}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
