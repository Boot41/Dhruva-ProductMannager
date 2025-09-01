import os
import sys
from pathlib import Path
import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

# Ensure 'app' package is importable regardless of pytest cwd
ROOT = Path(__file__).resolve().parents[1]
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))

# Force app to use SQLite for tests to avoid Postgres driver
os.environ.setdefault("BMS_DATABASE_URL", "sqlite:///:memory:")

from app.main import app
from app.core.db import Base
from app.core import db as core_db
from app import models  # Ensure models are registered with Base
from app.models.project import Project
from app.models.milestone import Milestone
from app.models.feature import Feature
from app.models.taskassignment import TaskAssignment
from app.models.tech_stack import TechStack
from app.models.userproject import UserProject


@pytest.fixture(scope="session")
def test_engine(tmp_path_factory):
    # Use a file-based SQLite DB for persistence across connections
    db_path = tmp_path_factory.mktemp("data") / "test.db"
    engine = create_engine(f"sqlite:///{db_path}", connect_args={"check_same_thread": False})
    # Create only tables compatible with SQLite (skip models using PostgreSQL JSONB like User, ProjectUML)
    Base.metadata.create_all(bind=engine, tables=[
        Project.__table__,
        Milestone.__table__,
        Feature.__table__,
        TaskAssignment.__table__,
        TechStack.__table__,
        UserProject.__table__,
    ])
    yield engine
    Base.metadata.drop_all(bind=engine)


@pytest.fixture()
def db_session(test_engine):
    TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=test_engine)
    session = TestingSessionLocal()
    try:
        yield session
    finally:
        session.close()


@pytest.fixture()
def client(db_session):
    # Override get_db to use the test session
    def override_get_db():
        try:
            yield db_session
        finally:
            pass

    app.dependency_overrides[core_db.get_db] = override_get_db

    with TestClient(app) as c:
        yield c

    app.dependency_overrides.clear()


@pytest.fixture()
def test_user():
    # Lightweight user object with required attributes
    class _User:
        def __init__(self):
            self.id = 1
            self.name = "Test User"
            self.username = "testuser"
            self.email = "test@example.com"
            self.role = "user"
    return _User()
