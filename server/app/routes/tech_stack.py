from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from app import schema as schemas
from app.core.db import get_db
from app.models.tech_stack import TechStack
from app.routes.user import get_current_user

router = APIRouter(prefix="/tech_stack", tags=["tech_stack"])

@router.post("/", response_model=schemas.TechStackRead, status_code=status.HTTP_201_CREATED)
def create_tech_stack(
    tech_stack: schemas.TechStackCreate,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    db_tech_stack = TechStack(**tech_stack.model_dump())
    db.add(db_tech_stack)
    db.commit()
    db.refresh(db_tech_stack)
    return db_tech_stack

@router.get("/project/{project_id}", response_model=List[schemas.TechStackRead])
def get_tech_stack_for_project(
    project_id: int,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    tech_stack_items = db.query(TechStack).filter(TechStack.project_id == project_id).all()
    return tech_stack_items

@router.get("/{tech_stack_id}", response_model=schemas.TechStackRead)
def get_tech_stack(
    tech_stack_id: int,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    tech_stack = db.query(TechStack).filter(TechStack.id == tech_stack_id).first()
    if not tech_stack:
        raise HTTPException(status_code=404, detail="Tech Stack item not found")
    return tech_stack

@router.put("/{tech_stack_id}", response_model=schemas.TechStackRead)
def update_tech_stack(
    tech_stack_id: int,
    tech_stack: schemas.TechStackUpdate,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    db_tech_stack = db.query(TechStack).filter(TechStack.id == tech_stack_id).first()
    if not db_tech_stack:
        raise HTTPException(status_code=404, detail="Tech Stack item not found")
    for key, value in tech_stack.model_dump(exclude_unset=True).items():
        setattr(db_tech_stack, key, value)
    db.commit()
    db.refresh(db_tech_stack)
    return db_tech_stack

@router.delete("/{tech_stack_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_tech_stack(
    tech_stack_id: int,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    db_tech_stack = db.query(TechStack).filter(TechStack.id == tech_stack_id).first()
    if not db_tech_stack:
        raise HTTPException(status_code=404, detail="Tech Stack item not found")
    db.delete(db_tech_stack)
    db.commit()
    return
