from __future__ import annotations

from typing import Optional
from datetime import datetime
from pydantic import BaseModel, Field, ConfigDict


# ---------- Roadmap Schemas ----------
class RoadmapCreate(BaseModel):
    requirements: str = Field(..., description="Product requirements text")
    tech_stack: str = Field(..., description="Selected tech stack description")
    best_practices: Optional[str] = Field(None, description="Optional best practices/context")
    temperature: float = Field(0.2, ge=0.0, le=1.0)
    content: str = Field(..., description="Generated roadmap content (markdown/text)")


class RoadmapRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    requirements: str
    tech_stack: str
    best_practices: Optional[str] = None
    temperature: float
    content: str
    created_at: datetime


# ---------- Milestone Plan Schemas ----------
class MilestonePlanCreate(BaseModel):
    requirements: str = Field(..., description="Product requirements text")
    tech_stack: Optional[str] = Field(None, description="Selected tech stack (optional)")
    temperature: float = Field(0.2, ge=0.0, le=1.0)
    content: str = Field(..., description="Generated milestones content (markdown/text)")


class MilestonePlanRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    requirements: str
    tech_stack: Optional[str] = None
    temperature: float
    content: str
    created_at: datetime


# ---------- Task Plan Schemas ----------
class TaskPlanCreate(BaseModel):
    milestones: str = Field(..., description="Milestones content to break into tasks (markdown/text)")
    tech_stack: Optional[str] = Field(None, description="Selected tech stack (optional)")
    temperature: float = Field(0.2, ge=0.0, le=1.0)
    content: str = Field(..., description="Generated day-to-day task plan (markdown/text)")


class TaskPlanRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    milestones: str
    tech_stack: Optional[str] = None
    temperature: float
    content: str
    created_at: datetime


# ---------- System Design Schemas ----------
class SystemDesignCreate(BaseModel):
    features: str = Field(..., description="Product features list or description")
    expected_users: str = Field(..., description="User types, scale, and usage patterns")
    geography: str = Field(..., description="User locations, data residency, latency needs")
    tech_stack: Optional[str] = Field(None, description="Selected tech stack (optional)")
    constraints: Optional[str] = Field(None, description="Constraints/notes (optional)")
    temperature: float = Field(0.2, ge=0.0, le=1.0)
    content: str = Field(..., description="Generated system design (markdown/text)")


class SystemDesignRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    features: str
    expected_users: str
    geography: str
    tech_stack: Optional[str] = None
    constraints: Optional[str] = None
    temperature: float
    content: str
    created_at: datetime
