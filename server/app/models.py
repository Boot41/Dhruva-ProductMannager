from __future__ import annotations

from sqlalchemy import Column, Integer, String, Text, DateTime, Float, func, ForeignKey
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import relationship
from app.core.db import Base


class Roadmap(Base):
    __tablename__ = "roadmaps"

    id = Column(Integer, primary_key=True, index=True)
    requirements = Column(Text, nullable=False)
    tech_stack = Column(String(255), nullable=False)
    best_practices = Column(Text, nullable=True)
    temperature = Column(Float, nullable=False, default=0.2)
    content = Column(Text, nullable=False)  # generated roadmap markdown/text
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)


class MilestonePlan(Base):
    __tablename__ = "milestone_plans"

    id = Column(Integer, primary_key=True, index=True)
    requirements = Column(Text, nullable=False)
    tech_stack = Column(String(255), nullable=True)
    temperature = Column(Float, nullable=False, default=0.2)
    content = Column(Text, nullable=False)  # generated milestones markdown/text
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    username = Column(String(50), nullable=False, unique=True)
    hashed_password = Column(Text, nullable=False)
    email = Column(String(100), nullable=False, unique=True)
    role = Column(String(50), nullable=True, default="user")
    company = Column(String(100), nullable=True)
    skills = Column(JSONB, nullable=True)
    level = Column(Integer, nullable=True, default=1)

    # Relationship to projects
    projects = relationship(
        "Project",
        back_populates="owner",
        foreign_keys="Project.owner_id",
    )


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


class ProjectUML(Base):
    __tablename__ = "project_uml"

    id = Column(Integer, primary_key=True, index=True)
    project_id = Column(Integer, ForeignKey("projects.id", ondelete="CASCADE"), nullable=True)
    type = Column(String(20), nullable=False)
    uml_schema = Column(JSONB, nullable=False)

    # Relationship to project
    project = relationship("Project", back_populates="umls")


class TaskAssignment(Base):
    __tablename__ = "task_assignments"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    project_id = Column(Integer, ForeignKey("projects.id", ondelete="CASCADE"), nullable=False)
    description = Column(Text, nullable=True)
    type = Column(Text, nullable=True)
    status = Column(String(20), nullable=True)  # validated in API layer
    assigned_by = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    eta = Column(DateTime(timezone=False), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    # Optional relationships for convenience
    assignee = relationship("User", foreign_keys=[user_id])
    assigner = relationship("User", foreign_keys=[assigned_by])
    project = relationship("Project")
