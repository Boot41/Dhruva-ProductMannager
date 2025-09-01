from app.core import security

def test_chat_agent_query(client, test_user, monkeypatch):
    # Override auth to return our test user
    from app.main import app
    app.dependency_overrides[security.get_current_user] = lambda: test_user

    # Mock the LLM call
    def fake_chat_with_agent(query, user_id):
        return {"output": f"echo:{query}", "tool_action": None}

    monkeypatch.setattr("app.agents.chatAgentLLM.chat_with_agent", fake_chat_with_agent)

    resp = client.post("/chat/agent_query", json={"query": "hello"})
    assert resp.status_code == 200
    data = resp.json()
    assert data["response"] == "echo:hello"
    assert "tool_action" in data

    # cleanup
    app.dependency_overrides.pop(security.get_current_user, None)
