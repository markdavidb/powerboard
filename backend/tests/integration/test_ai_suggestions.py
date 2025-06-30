# tests/integration/test_ai_suggestions.py
import pytest
from fastapi.testclient import TestClient
from openai import OpenAIError

import services.ai_service.routers.suggestions as sug_mod

BASE = "/api/ai"

@pytest.mark.usefixtures("db")
def test_suggest_subtasks_success(monkeypatch, ai_client: TestClient):
    # 1) stub out OpenAI to return a clean JSON list
    class FakeMessage:
        def __init__(self, content): self.content = content
    class FakeChoice:
        def __init__(self, msg): self.message = msg
    class FakeCompletion:
        def __init__(self, choices): self.choices = choices

    def fake_create(model, messages, temperature, max_tokens):
        raw = '["Design login UI", "Implement backend auth", "Write tests"]'
        return FakeCompletion([FakeChoice(FakeMessage(raw))])

    monkeypatch.setattr(
        sug_mod.client.chat.completions,
        "create",
        fake_create
    )

    payload = {"description": "Implement a new authentication flow", "n": 3}
    headers = {"Authorization": "Bearer faketoken"}
    r = ai_client.post(f"{BASE}/suggest_subtasks", json=payload, headers=headers)
    assert r.status_code == 200
    data = r.json()
    assert data["suggestions"] == [
        "Design login UI",
        "Implement backend auth",
        "Write tests",
    ]

@pytest.mark.usefixtures("db")
def test_suggest_subtasks_openai_error(monkeypatch, ai_client: TestClient):
    # simulate an OpenAIError
    monkeypatch.setattr(
        sug_mod.client.chat.completions,
        "create",
        lambda *args, **kwargs: (_ for _ in ()).throw(OpenAIError("something went wrong"))
    )

    payload = {"description": "Anything valid", "n": 2}
    headers = {"Authorization": "Bearer faketoken"}
    r = ai_client.post(f"{BASE}/suggest_subtasks", json=payload, headers=headers)
    assert r.status_code == 502
    assert "OpenAI error" in r.json()["detail"]

@pytest.mark.usefixtures("db")
def test_suggest_subtasks_invalid_json(monkeypatch, ai_client: TestClient):
    # return non-JSON content
    class FakeMessage:
        def __init__(self, content): self.content = content
    class FakeChoice:
        def __init__(self, msg): self.message = msg
    class FakeCompletion:
        def __init__(self, choices): self.choices = choices

    def fake_create(*args, **kwargs):
        return FakeCompletion([FakeChoice(FakeMessage("not a json"))])

    monkeypatch.setattr(
        sug_mod.client.chat.completions,
        "create",
        fake_create
    )

    payload = {"description": "Valid desc", "n": 1}
    headers = {"Authorization": "Bearer faketoken"}
    r = ai_client.post(f"{BASE}/suggest_subtasks", json=payload, headers=headers)
    assert r.status_code == 502
    assert r.json()["detail"] == "Invalid JSON from model"
