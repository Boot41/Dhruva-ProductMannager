from __future__ import annotations

from sqlalchemy import Column, Integer, String, Text, DateTime, Float, func
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
