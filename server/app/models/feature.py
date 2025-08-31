from sqlalchemy import Column, Integer, String, ForeignKey
from sqlalchemy.orm import relationship
from app.core.db import Base

class Feature(Base):
    __tablename__ = "features"

    id = Column(Integer, primary_key=True, index=True)
    project_id = Column(Integer, ForeignKey("projects.id", ondelete="CASCADE"), nullable=False)
    milestone_id = Column(Integer, ForeignKey("milestones.id", ondelete="SET NULL"), nullable=True)
    name = Column(String(255), nullable=False)
    status = Column(String(50), nullable=False, default="todo")

    project = relationship("Project")
    milestone = relationship("Milestone")
    task_assignments = relationship("TaskAssignment", back_populates="feature")
