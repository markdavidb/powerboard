# tests/unit/test_suggest_subtasks.py

import pytest
from fastapi import HTTPException

from services.ai_service.routers.suggestions import suggest_subtasks, SuggestRequest
from services.ai_service.routers import suggestions

# ───────────────────────────────────────────────────────────────────────────────
# Helpers for faking the OpenAI client response
# ───────────────────────────────────────────────────────────────────────────────
class DummyChoice:
    def __init__(self, content: str):
        # OpenAI’s shape: choice.message.content
        self.message = type("M", (), {"content": content})

class DummyResponse:
    def __init__(self, raw_content: str):
        self.choices = [DummyChoice(raw_content)]

class FakeClient:
    def __init__(self, raw_content: str):
        self._raw = raw_content
        # set up client.chat.completions.create to use this instance’s _raw
        class Completions:
            def __init__(inner, outer):
                inner._outer = outer
            def create(inner, model, messages, temperature, max_tokens):
                return DummyResponse(inner._outer._raw)

        class Chat:
            def __init__(inner, outer):
                inner.completions = Completions(outer)

        self.chat = Chat(self)

# ───────────────────────────────────────────────────────────────────────────────
# Tests
# ───────────────────────────────────────────────────────────────────────────────
def test_parses_list_json_and_strips_fences(monkeypatch):
    raw = '```json\n["eat breakfast","write tests"]\n```'
    monkeypatch.setattr(suggestions, "client", FakeClient(raw))
    req = SuggestRequest(description="Plan my morning", n=2)
    resp = suggest_subtasks(req)
    assert resp.suggestions == ["eat breakfast", "write tests"]

def test_parses_object_with_subtasks_key(monkeypatch):
    raw = '```{"subtasks": ["a","b","c"]}```'
    monkeypatch.setattr(suggestions, "client", FakeClient(raw))
    req = SuggestRequest(description="Epic work", n=3)
    resp = suggest_subtasks(req)
    assert resp.suggestions == ["a", "b", "c"]

def test_raises_on_invalid_json(monkeypatch):
    raw = "not a json at all"
    monkeypatch.setattr(suggestions, "client", FakeClient(raw))
    req = SuggestRequest(description="Whatever", n=1)
    with pytest.raises(HTTPException) as exc:
        suggest_subtasks(req)
    assert exc.value.status_code == 502
