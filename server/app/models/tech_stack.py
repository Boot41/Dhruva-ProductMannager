from sqlalchemy import Column, Integer, String, ForeignKey
from sqlalchemy.orm import relationship
from app.core.db import Base

class TechStack(Base):
    __tablename__ = "tech_stack"

    id = Column(Integer, primary_key=True, index=True)
    project_id = Column(Integer, ForeignKey("projects.id", ondelete="CASCADE"), nullable=False)
    tech = Column(String(255), nullable=False)
    level = Column(Integer, nullable=False)

    project = relationship("Project")
