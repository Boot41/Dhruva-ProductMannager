from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session, joinedload
from typing import List, Optional
from datetime import datetime

from app import schema as schemas
from app.core.db import get_db
from app.models.feature import Feature
from app.models.taskassignment import TaskAssignment
from app.models.user import User
from app.routes.user import get_current_user

router = APIRouter(prefix="/features", tags=["features"])

@router.post("/", response_model=schemas.FeatureRead, status_code=status.HTTP_201_CREATED)
def create_feature(
    feature: schemas.FeatureCreate,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    db_feature = Feature(**feature.model_dump())
    db.add(db_feature)
    db.commit()
    db.refresh(db_feature)
    return db_feature

@router.get("/project/{project_id}", response_model=List[schemas.FeatureRead])
def get_features_for_project(
    project_id: int,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    features = db.query(Feature).filter(Feature.project_id == project_id).all()
    return features

@router.get("/milestone/{milestone_id}", response_model=List[schemas.FeatureRead])
def get_features_for_milestone(
    milestone_id: int,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    features_with_assignments = (
        db.query(Feature)
        .filter(Feature.milestone_id == milestone_id)
        .options(joinedload(Feature.task_assignments).joinedload(TaskAssignment.assignee))
        .all()
    )

    result_features = []
    for feature in features_with_assignments:
        assigned_to_data: Optional[schemas.AssignedUser] = None
        eta_data: Optional[datetime] = None

        if feature.task_assignments:
            # Assuming a feature can have multiple task assignments,
            # we'll take the first one for assigned_to and eta for simplicity.
            # If more complex logic is needed (e.g., latest assignment, primary assignment),
            # that would require further clarification.
            task_assignment = feature.task_assignments[0]
            if task_assignment.assignee:
                assigned_to_data = schemas.AssignedUser(
                    id=task_assignment.assignee.id,
                    name=task_assignment.assignee.name
                )
            eta_data = task_assignment.eta

        result_features.append(
            schemas.FeatureRead(
                id=feature.id,
                project_id=feature.project_id,
                name=feature.name,
                status=feature.status,
                milestone_id=feature.milestone_id,
                assigned_to=assigned_to_data,
                eta=eta_data
            )
        )
    return result_features

@router.get("/{feature_id}", response_model=schemas.FeatureRead)
def get_feature(
    feature_id: int,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    feature = db.query(Feature).filter(Feature.id == feature_id).first()
    if not feature:
        raise HTTPException(status_code=404, detail="Feature not found")
    return feature

@router.put("/{feature_id}", response_model=schemas.FeatureRead)
def update_feature(
    feature_id: int,
    feature: schemas.FeatureUpdate,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    db_feature = db.query(Feature).filter(Feature.id == feature_id).first()
    if not db_feature:
        raise HTTPException(status_code=404, detail="Feature not found")
    for key, value in feature.model_dump(exclude_unset=True).items():
        setattr(db_feature, key, value)
    db.commit()
    db.refresh(db_feature)
    return db_feature

@router.delete("/{feature_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_feature(
    feature_id: int,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    db_feature = db.query(Feature).filter(Feature.id == feature_id).first()
    if not db_feature:
        raise HTTPException(status_code=404, detail="Feature not found")
    db.delete(db_feature)
    db.commit()
    return