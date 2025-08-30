from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from app import schema as schemas
from app.core.db import get_db
from app.models.milestone import Milestone
from app.routes.user import get_current_user

router = APIRouter(prefix="/milestones", tags=["milestones"])

@router.post("/", response_model=schemas.MilestonePlanRead, status_code=status.HTTP_201_CREATED)
def create_milestone(
    milestone: schemas.MilestonePlanCreate,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    db_milestone = Milestone(**milestone.model_dump())
    db.add(db_milestone)
    db.commit()
    db.refresh(db_milestone)
    return db_milestone

@router.get("/project/{project_id}", response_model=List[schemas.MilestonePlanRead])
def get_milestones_for_project(
    project_id: int,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    milestones = db.query(Milestone).filter(Milestone.project_id == project_id).all()
    return milestones

@router.get("/{milestone_id}", response_model=schemas.MilestonePlanRead)
def get_milestone(
    milestone_id: int,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    milestone = db.query(Milestone).filter(Milestone.id == milestone_id).first()
    if not milestone:
        raise HTTPException(status_code=404, detail="Milestone not found")
    return milestone

@router.put("/{milestone_id}", response_model=schemas.MilestonePlanRead)
def update_milestone(
    milestone_id: int,
    milestone: schemas.MilestonePlanUpdate,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    db_milestone = db.query(Milestone).filter(Milestone.id == milestone_id).first()
    if not db_milestone:
        raise HTTPException(status_code=404, detail="Milestone not found")
    for key, value in milestone.model_dump(exclude_unset=True).items():
        setattr(db_milestone, key, value)
    db.commit()
    db.refresh(db_milestone)
    return db_milestone

@router.delete("/{milestone_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_milestone(
    milestone_id: int,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    db_milestone = db.query(Milestone).filter(Milestone.id == milestone_id).first()
    if not db_milestone:
        raise HTTPException(status_code=404, detail="Milestone not found")
    db.delete(db_milestone)
    db.commit()
    return
