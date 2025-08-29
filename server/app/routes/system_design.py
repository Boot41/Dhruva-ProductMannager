from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.agents.systemDesignLLM import generate_system_design
from app.schema import SystemDesignRequest, ProjectUMLRead
from app.core.db import get_db
from app.models.projectuml import ProjectUML

router = APIRouter(tags=["system_design"])


@router.post("/system-design", response_model=ProjectUMLRead, status_code=status.HTTP_201_CREATED)
def create_system_design(payload: SystemDesignRequest, db: Session = Depends(get_db)):
    try:
        # Generate UML design via LLM, validated by Pydantic
        uml_design = generate_system_design(
            features=payload.features,
            expected_users=payload.expected_users,
            geography=payload.geography,
            tech_stack=payload.tech_stack,
            constraints=payload.constraints,
            project_id=payload.project_id,
            temperature=payload.temperature,
        )

        # Persist to ProjectUML
        db_item = ProjectUML(
            project_id=payload.project_id,
            type=uml_design.type,
            uml_schema=uml_design.uml_schema.model_dump() if hasattr(uml_design.uml_schema, "model_dump") else uml_design.uml_schema,
        )
        db.add(db_item)
        db.commit()
        db.refresh(db_item)
        return db_item
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))
