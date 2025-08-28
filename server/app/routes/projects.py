from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from typing import List, Optional
from fastapi import Path

from app import schema as schemas
from app.core.db import get_db
from app.models import Project, User
from app.routes.user import get_current_user
from app.useage.auth_service import get_current_user_from_token, InvalidTokenError, UserNotFoundError

router = APIRouter(prefix="/projects", tags=["projects"])


# OAuth2 scheme that doesn't auto-redirect to login
oauth2_scheme_optional = OAuth2PasswordBearer(tokenUrl="/auth/login", auto_error=False)

def get_current_user_optional(token: Optional[str] = Depends(oauth2_scheme_optional), db: Session = Depends(get_db)) -> Optional[User]:
    """Get current user if authenticated, otherwise return None"""
    if not token:
        return None
    try:
        return get_current_user_from_token(token, db)
    except (InvalidTokenError, UserNotFoundError):
        return None


@router.post("/add", response_model=schemas.ProjectRead, status_code=status.HTTP_201_CREATED)
def create_project(
    project_data: schemas.ProjectCreate,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user_optional)
):
    """Create a new project"""
    try:
        # Use current user ID if authenticated, otherwise default to user ID 1
        owner_id = current_user.id if current_user else 1
        
        # Create new project
        db_project = Project(
            name=project_data.name,
            description=project_data.description,
            status=project_data.status,
            owner_id=owner_id
        )
        
        db.add(db_project)
        db.commit()
        db.refresh(db_project)
        
        return db_project
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create project: {str(e)}"
        )


@router.get("/get", response_model=List[schemas.ProjectRead])
def get_projects(
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user_optional)
):
    """Get all projects for the current user"""
    try:
        # Use current user ID if authenticated, otherwise default to user ID 1
        owner_id = current_user.id if current_user else 1
        
        # Get projects owned by the user
        projects = db.query(Project).filter(Project.owner_id == owner_id).all()
        return projects
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch projects: {str(e)}"
        )


@router.get("/{project_id}", response_model=schemas.ProjectRead)
def get_project(
    project_id: int,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user_optional)
):
    """Get a specific project by ID"""
    try:
        # Use current user ID if authenticated, otherwise default to user ID 1
        owner_id = current_user.id if current_user else 1
        
        project = db.query(Project).filter(
            Project.id == project_id,
            Project.owner_id == owner_id
        ).first()
        
        if not project:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Project not found"
            )
        
        return project
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch projeACct: {str(e)}"   
        )

@router.put("/{project_id}", response_model=schemas.ProjectRead)
def update_project(
    project_id: int = Path(..., description="The ID of the project to update"),
    project_data: schemas.ProjectUpdate = None,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user_optional)
):
    """Update an existing project"""
    try:
        # Use current user ID if authenticated, otherwise default to user ID 1
        owner_id = current_user.id if current_user else 1

        # Find the project
        project = db.query(Project).filter(
            Project.id == project_id,
            Project.owner_id == owner_id
        ).first()

        if not project:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Project not found"
            )

        # Update allowed fields
        if project_data.name is not None:
            project.name = project_data.name
        if project_data.description is not None:
            project.description = project_data.description
        if project_data.status is not None:
            project.status = project_data.status

        db.commit()
        db.refresh(project)
        return project

    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to update project: {str(e)}"
        )

@router.delete("/{project_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_project(
    project_id: int,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user_optional)
):
    """Delete a project by ID"""
    try:
        # Use current user ID if authenticated, otherwise default to user ID 1
        owner_id = current_user.id if current_user else 1

        project = db.query(Project).filter(
            Project.id == project_id,
            Project.owner_id == owner_id
        ).first()

        if not project:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Project not found"
            )

        db.delete(project)
        db.commit()
        return  # 204 has no body

    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to delete project: {str(e)}"
        )


@router.get("/all/public", response_model=List[schemas.ProjectRead])
def get_all_projects(db: Session = Depends(get_db)):
    """Get all projects (admin/public endpoint)"""
    try:
        projects = db.query(Project).all()
        return projects
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch all projects: {str(e)}"
        )
