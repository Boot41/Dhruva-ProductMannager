from __future__ import annotations

from sqlalchemy import Column, Integer, String, Text
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import relationship
from app.core.db import Base


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
