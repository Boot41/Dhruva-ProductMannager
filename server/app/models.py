from __future__ import annotations

from sqlalchemy import Column, Integer, String, Text, DateTime, Float, func
from sqlalchemy.orm import declarative_base

# SQLAlchemy Declarative Base for ORM mappings
Base = declarative_base()


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
