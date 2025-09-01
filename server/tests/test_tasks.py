def test_create_tasks(client, monkeypatch):
    def fake_generate_tasks(milestones, tech_stack, temperature):
        return "DUMMY_TASKS"

    monkeypatch.setattr("app.agents.tasksLLM.generate_tasks", fake_generate_tasks)

    payload = {
        "milestones": "MS",
        "tech_stack": "TS",
        "temperature": 0.2,
        "content": "unused"
    }
    r = client.post("/tasks", json=payload)
    assert r.status_code == 200
    assert r.json() == {"tasks": "DUMMY_TASKS"}
