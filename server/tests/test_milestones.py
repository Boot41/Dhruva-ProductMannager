from app.models.project import Project

def test_generate_milestones(client, monkeypatch):
    def fake_generate_milestones(requirements, tech_stack, temperature):
        return "DUMMY_MILESTONES"

    monkeypatch.setattr("app.agents.milestonesLLM.generate_milestones", fake_generate_milestones)

    payload = {
        "requirements": "reqs",
        "tech_stack": "stack",
        "temperature": 0.3,
        "content": "unused"
    }
    r = client.post("/milestones", json=payload)
    assert r.status_code == 200
    assert r.json() == {"milestones": "DUMMY_MILESTONES"}


def test_milestones_db_crud(client, db_session):
    # Create a project first
    p = Project(name="P1", description="desc", owner_id=None)
    db_session.add(p)
    db_session.commit()
    db_session.refresh(p)

    # Create milestone
    payload = {"project_id": p.id, "name": "M1", "done": False, "progress": 10}
    r = client.post("/milestones/db", json=payload)
    assert r.status_code == 200
    m = r.json()
    assert m["project_id"] == p.id
    assert m["name"] == "M1"

    # List by project
    r2 = client.get(f"/milestones/project/{p.id}")
    assert r2.status_code == 200
    arr = r2.json()
    assert isinstance(arr, list) and len(arr) == 1
