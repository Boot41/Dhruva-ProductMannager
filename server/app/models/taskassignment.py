from __future__ import annotations

from sqlalchemy import Column, Integer, Text, DateTime, func, ForeignKey, String
from sqlalchemy.orm import relationship
from app.core.db import Base


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
