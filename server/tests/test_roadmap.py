def test_create_roadmap(client, monkeypatch):
    def fake_generate_roadmap(requirements, tech_stack, best_practices, temperature):
        return "DUMMY_ROADMAP"

    monkeypatch.setattr("app.agents.roadmapLLM.generate_roadmap", fake_generate_roadmap)

    payload = {
        "requirements": "reqs",
        "tech_stack": "stack",
        "best_practices": "bp",
        "temperature": 0.1,
        "content": "unused"
    }
    r = client.post("/roadmap", json=payload)
    assert r.status_code == 200
    assert r.json() == {"roadmap": "DUMMY_ROADMAP"}
