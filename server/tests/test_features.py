from app.models.project import Project
from app.models.tech_stack import TechStack
from app.models.feature import Feature
from app.models.milestone import Milestone
from app.agents.backEndLLM import DependencyAnalysisOutput


def test_analyze_feature_dependencies(client, db_session, monkeypatch):
    # Seed minimal data
    p = Project(name="Proj", description="desc", owner_id=None)
    db_session.add(p)
    db_session.commit()
    db_session.refresh(p)

    db_session.add_all([
        TechStack(project_id=p.id, tech="FastAPI", level=3),
        TechStack(project_id=p.id, tech="Postgres", level=2),
    ])
    db_session.add_all([
        Feature(project_id=p.id, name="Login", status="done", milestone_id=None),
        Feature(project_id=p.id, name="Dashboard", status="todo", milestone_id=None),
    ])
    m = Milestone(project_id=p.id, name="M1", done=False, progress=0)
    db_session.add(m)
    db_session.commit()

    # Mock LLM call
    def fake_get_feature_dependencies(project_name, features, milestones, tech_stack, new_feature):
        return DependencyAnalysisOutput(new_feature=new_feature, depends_on=[1], reasoning="depends")

    monkeypatch.setattr("app.agents.backEndLLM.get_feature_dependencies", fake_get_feature_dependencies)

    payload = {"project_id": p.id, "new_feature": "Reports"}
    r = client.post("/features/analyze-dependencies", json=payload)
    assert r.status_code == 200
    data = r.json()
    assert data["new_feature"] == "Reports"
    assert data["depends_on"] == [1]
    assert "reasoning" in data
