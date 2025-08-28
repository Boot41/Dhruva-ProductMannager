from __future__ import annotations

from typing import Optional, Dict, Any, List, Literal
from datetime import datetime
from pydantic import BaseModel, Field, ConfigDict
from pydantic.networks import EmailStr

class UserBase(BaseModel):
    email: EmailStr
    name: str
    username: str
    role: Optional[str] = None
    company: Optional[str] = None
    skills: Optional[List[Dict[str, Any]]] = None


class UserCreate(UserBase):
    password: str = Field(min_length=8)


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserOut(UserBase):
    id: int
    model_config = ConfigDict(from_attributes=True)


class Token(BaseModel):
    access_token: str


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


# Request payload for generating and storing a UML system design
class SystemDesignRequest(BaseModel):
    features: str = Field(..., description="Product features list or description")
    expected_users: str = Field(..., description="User types, scale, and usage patterns")
    geography: str = Field(..., description="User locations, data residency, latency needs")
    tech_stack: Optional[str] = Field(None, description="Selected tech stack (optional)")
    constraints: Optional[str] = Field(None, description="Constraints/notes (optional)")
    temperature: float = Field(0.2, ge=0.0, le=1.0)
    project_id: Optional[int] = Field(None, description="Optional project id to associate the UML with")


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


# ---------- Project Schemas ----------
class ProjectCreate(BaseModel):
    name: str = Field(..., description="Project name")
    description: Optional[str] = Field(None, description="Project description")
    status: str = Field(default="development", description="Project status")
    lead: Optional[str] = None

class ProjectRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    description: Optional[str] = None
    owner_id: Optional[int] = None
    status: str
    created_at: datetime


# ---------- Project UML Schemas ----------
class ProjectUMLCreate(BaseModel):
    project_id: Optional[int] = Field(None, description="Related project id")
    type: str = Field(..., max_length=20, description="UML type, e.g., class, sequence")
    uml_schema: Dict[str, Any] = Field(..., description="UML JSON schema payload")


class ProjectUMLRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    project_id: Optional[int] = None
    type: str
    uml_schema: Dict[str, Any]

class ProjectUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    status: Optional[str] = None

class Node(BaseModel):
    h: int
    w: int
    x: int
    y: int
    id: str
    name: str
    type: Literal["database", "service", "load_balancer", "queue", "cache"]
    description: str


class Relationship(BaseModel):
    to: str
    source: str  # previously named "from_" ("from" is reserved in Python)
    type: str


class UmlSchema(BaseModel):
    nodes: List[Node]
    relationships: List[Relationship]


class UmlDesign(BaseModel):
    id: int
    project_id: Optional[int] = None
    type: str
    uml_schema: UmlSchema

# Ensure forward references (if any) are resolved
UmlDesign.model_rebuild()


# ---------- Task Assignment Schemas ----------
class TaskAssignmentCreate(BaseModel):
    user_id: int
    project_id: int
    description: Optional[str] = None
    type: Optional[str] = None
    status: Optional[str] = None  # validated server-side to allowed values
    eta: Optional[datetime] = None


class TaskAssignmentRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    user_id: int
    project_id: int
    description: Optional[str] = None
    type: Optional[str] = None
    status: Optional[str] = None
    assigned_by: Optional[int] = None
    eta: Optional[datetime] = None
    created_at: datetime