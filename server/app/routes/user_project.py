from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from app.core.db import get_db
from app.models import UserProject, User, Project
from app.schema import UserProjectCreate, UserProjectRead, UserProjectUpdate
from app.routes.user import get_current_user

router = APIRouter(prefix="/user-projects", tags=["user-projects"])


@router.post("/", response_model=UserProjectRead, status_code=status.HTTP_201_CREATED)
def create_user_project(
    payload: UserProjectCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    # Optional: Add authorization check if only admin or project owner can create
    # For now, any authenticated user can create an association.

    # Check if user and project exist
    user = db.query(User).filter(User.id == payload.user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    project = db.query(Project).filter(Project.id == payload.project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    # Check if association already exists
    existing_association = db.query(UserProject).filter(
        UserProject.user_id == payload.user_id,
        UserProject.project_id == payload.project_id
    ).first()
    if existing_association:
        raise HTTPException(status_code=409, detail="User already associated with this project")

    try:
        db_user_project = UserProject(
            user_id=payload.user_id,
            project_id=payload.project_id,
            role=payload.role,
        )
        db.add(db_user_project)
        db.commit()
        db.refresh(db_user_project)
        return db_user_project
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to create user-project association: {str(e)}")



@router.get("/user/{user_id}", response_model=List[UserProjectRead])
def get_user_projects_by_user(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    # Optional: Add authorization check if only the user themselves or admin can view
    # if current_user.id != user_id and current_user.role != "admin":
    #     raise HTTPException(status_code=403, detail="Not authorized to view these associations")

    user_projects = db.query(UserProject).filter(UserProject.user_id == user_id).all()
    return user_projects


@router.get("/project/{project_id}", response_model=List[UserProjectRead])
def get_user_projects_by_project(
    project_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    # Optional: Add authorization check if only project owner or admin can view
    # project = db.query(Project).filter(Project.id == project_id).first()
    # if not project or (project.owner_id != current_user.id and current_user.role != "admin"):
    #     raise HTTPException(status_code=403, detail="Not authorized to view these associations")

    user_projects = db.query(UserProject).filter(UserProject.project_id == project_id).all()
    return user_projects


@router.delete("/{user_project_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_user_project(
    user_project_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    user_project = db.query(UserProject).filter(UserProject.id == user_project_id).first()
    if not user_project:
        raise HTTPException(status_code=404, detail="User-project association not found")

    # Optional: Add authorization check if only project owner, admin, or associated user can delete
    # For now, any authenticated user can delete if they know the ID.

    try:
        db.delete(user_project)
        db.commit()
        return None
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to delete user-project association: {str(e)}")
