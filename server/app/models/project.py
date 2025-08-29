from __future__ import annotations

from sqlalchemy import Column, Integer, String, Text, DateTime, func, ForeignKey
from sqlalchemy.orm import relationship
from app.core.db import Base


class Project(Base):
    __tablename__ = "projects"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(Text, nullable=False)
    description = Column(Text, nullable=True)
    owner_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    status = Column(String(50), nullable=False, default="development")
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    lead = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    # Relationship to user
    owner = relationship(
        "User",
        back_populates="projects",
        foreign_keys=[owner_id],
    )
    # Relationship to UMLs
    umls = relationship("ProjectUML", back_populates="project", cascade="all, delete-orphan")

    # Relationship to user_projects
    user_projects = relationship("UserProject", backref="project_obj", cascade="all, delete-orphan")
