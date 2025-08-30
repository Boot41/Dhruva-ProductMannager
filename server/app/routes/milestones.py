from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from typing import List

from app.agents.milestonesLLM import generate_milestones
from app.schema import MilestonePlanCreate, MilestoneCreate, MilestoneRead
from app.core.db import get_db
from app.models.milestone import Milestone

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

# New endpoint to create a milestone in the database
@router.post("/milestones/db", response_model=MilestoneRead)
def create_milestone_db(milestone: MilestoneCreate, db: Session = Depends(get_db)):
    db_milestone = Milestone(
        project_id=milestone.project_id,
        name=milestone.name,
        done=milestone.done,
        progress=milestone.progress
    )
    db.add(db_milestone)
    db.commit()
    db.refresh(db_milestone)
    return db_milestone

# New endpoint to get milestones by project_id
@router.get("/milestones/project/{project_id}", response_model=List[MilestoneRead])
def get_milestones_by_project(project_id: int, db: Session = Depends(get_db)):
    milestones = db.query(Milestone).filter(Milestone.project_id == project_id).all()
    return milestones