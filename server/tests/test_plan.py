def test_plan_chain(client, monkeypatch):
    calls = {"roadmap": 0, "milestones": 0, "tasks": 0}

    def fake_generate_roadmap(requirements, tech_stack, best_practices, temperature):
        calls["roadmap"] += 1
        return "ROADMAP"

    def fake_generate_milestones(requirements, tech_stack, temperature):
        calls["milestones"] += 1
        assert requirements == "ROADMAP"
        return "MILESTONES"

    def fake_generate_tasks(milestones, tech_stack, temperature):
        calls["tasks"] += 1
        assert milestones == "MILESTONES"
        return "TASKS"

    monkeypatch.setattr("app.agents.roadmapLLM.generate_roadmap", fake_generate_roadmap)
    monkeypatch.setattr("app.agents.milestonesLLM.generate_milestones", fake_generate_milestones)
    monkeypatch.setattr("app.agents.tasksLLM.generate_tasks", fake_generate_tasks)

    payload = {
        "requirements": "REQS",
        "tech_stack": "TS",
        "best_practices": "BP",
        "temperature": 0.2,
        "content": "unused"
    }
    r = client.post("/plan", json=payload)
    assert r.status_code == 200
    data = r.json()
    assert data == {"roadmap": "ROADMAP", "milestones": "MILESTONES", "tasks": "TASKS"}
    assert calls == {"roadmap": 1, "milestones": 1, "tasks": 1}
