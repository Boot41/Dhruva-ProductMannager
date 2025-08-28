from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from app.core.db import get_db
from app.routes.user import get_current_user
from app.models import TaskAssignment, User
from app import schema as schemas


router = APIRouter(prefix="/task-assignments", tags=["tasks"])


ALLOWED_STATUS = {"todo", "in-progress", "blocked", "done"}


@router.post("/", response_model=schemas.TaskAssignmentRead, status_code=status.HTTP_201_CREATED)
def create_task_assignment(
    payload: schemas.TaskAssignmentCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    try:
        if payload.status and payload.status not in ALLOWED_STATUS:
            raise HTTPException(status_code=400, detail="Invalid status value")

        task = TaskAssignment(
            user_id=payload.user_id,
            project_id=payload.project_id,
            description=payload.description,
            type=payload.type,
            status=payload.status,
            assigned_by=current_user.id,
            eta=payload.eta,
        )
        db.add(task)
        db.commit()
        db.refresh(task)
        return task
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to create task assignment: {str(e)}")


@router.patch("/{task_id}", response_model=schemas.TaskAssignmentRead)
def update_task_assignment(
    task_id: int,
    payload: schemas.TaskAssignmentUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    task = db.query(TaskAssignment).filter(TaskAssignment.id == task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task assignment not found")

    # Optional: Add authorization check if only assigned user or admin can update
    # if task.user_id != current_user.id:
    #     raise HTTPException(status_code=403, detail="Not authorized to update this task")

    update_data = payload.model_dump(exclude_unset=True)

    if "status" in update_data and update_data["status"] not in ALLOWED_STATUS:
        raise HTTPException(status_code=400, detail="Invalid status value")

    for key, value in update_data.items():
        setattr(task, key, value)

    db.add(task)
    db.commit()
    db.refresh(task)
    return task


@router.get("/my", response_model=List[schemas.TaskAssignmentRead])
def list_my_task_assignments(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    try:
        items = db.query(TaskAssignment).filter(TaskAssignment.user_id == current_user.id).order_by(TaskAssignment.created_at.desc()).all()
        return items
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch task assignments: {str(e)}")
