from types import SimpleNamespace
from app.core.db import get_db
from app.main import app


def test_system_design_creates_item_without_real_db(client, monkeypatch):
    # Mock LLM generator to return a simple object with type and uml_schema
    def fake_generate_system_design(**kwargs):
        return SimpleNamespace(
            type="class",
            uml_schema={"nodes": [], "relationships": []},
        )

    monkeypatch.setattr("app.agents.systemDesignLLM.generate_system_design", fake_generate_system_design)

    # Override DB with a fake session that returns a simple object on refresh
    class FakeSession:
        def add(self, obj):
            self.obj = obj
        def commit(self):
            pass
        def refresh(self, obj):
            # Simulate DB assigned id
            setattr(obj, "id", 1)
        def close(self):
            pass

    def override_db():
        yield FakeSession()

    app.dependency_overrides[get_db] = override_db

    payload = {
        "features": "F",
        "expected_users": "users",
        "geography": "geo",
        "tech_stack": "TS",
        "constraints": "C",
        "temperature": 0.2,
        "project_id": 123
    }

    r = client.post("/system-design", json=payload)
    assert r.status_code == 201
    data = r.json()
    assert data["id"] == 1
    assert data["project_id"] == 123
    assert data["type"] == "class"
    assert data["uml_schema"] == {"nodes": [], "relationships": []}

    # cleanup
    app.dependency_overrides.pop(get_db, None)
