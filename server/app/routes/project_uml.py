from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional

from app.core.db import get_db
from app import schema as schemas
from app.models.projectuml import ProjectUML

router = APIRouter(prefix="/project-uml", tags=["project_uml"]) 


@router.post("/add", response_model=schemas.ProjectUMLRead, status_code=status.HTTP_201_CREATED)
def create_project_uml(payload: schemas.ProjectUMLCreate, db: Session = Depends(get_db)):
    try:
        db_item = ProjectUML(
            project_id=payload.project_id,
            type=payload.type,
            uml_schema=payload.uml_schema,
        )
        db.add(db_item)
        db.commit()
        db.refresh(db_item)
        return db_item
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to create UML: {str(e)}")


@router.get("/{uml_id}", response_model=schemas.ProjectUMLRead)
def get_project_uml(uml_id: int, db: Session = Depends(get_db)):
    item = db.query(ProjectUML).filter(ProjectUML.id == uml_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="UML not found")
    return item


@router.get("/project/{project_id}", response_model=List[schemas.ProjectUMLRead])
def list_project_umls(project_id: int, db: Session = Depends(get_db)):
    items = db.query(ProjectUML).filter(ProjectUML.project_id == project_id).all()
    return items


@router.put("/{uml_id}", response_model=schemas.ProjectUMLRead)
def update_project_uml(uml_id: int, payload: schemas.ProjectUMLCreate, db: Session = Depends(get_db)):
    try:
        item = db.query(ProjectUML).filter(ProjectUML.id == uml_id).first()
        if not item:
            raise HTTPException(status_code=404, detail="UML not found")
        item.project_id = payload.project_id
        item.type = payload.type
        item.uml_schema = payload.uml_schema
        db.commit()
        db.refresh(item)
        return item
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to update UML: {str(e)}")


@router.delete("/{uml_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_project_uml(uml_id: int, db: Session = Depends(get_db)):
    try:
        item = db.query(ProjectUML).filter(ProjectUML.id == uml_id).first()
        if not item:
            raise HTTPException(status_code=404, detail="UML not found")
        db.delete(item)
        db.commit()
        return None
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to delete UML: {str(e)}")
