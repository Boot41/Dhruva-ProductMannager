from __future__ import annotations

from sqlalchemy import Column, Integer, String, ForeignKey
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import relationship
from app.core.db import Base


class ProjectUML(Base):
    __tablename__ = "project_uml"

    id = Column(Integer, primary_key=True, index=True)
    project_id = Column(Integer, ForeignKey("projects.id", ondelete="CASCADE"), nullable=True)
    type = Column(String(20), nullable=False)
    uml_schema = Column(JSONB, nullable=False)

    # Relationship to project
    project = relationship("Project", back_populates="umls")
