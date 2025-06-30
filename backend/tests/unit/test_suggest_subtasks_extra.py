import pytest
from fastapi import HTTPException

from services.ai_service.routers.suggestions import SuggestRequest, suggest_subtasks
from services.ai_service.routers import suggestions

# ---------------------------------------------------------------------------
# The same FakeClient helper you already use
# ---------------------------------------------------------------------------
class _Choice:
    def __init__(self, txt): self.message = type("M", (), {"content": txt})
class _Resp:
    def __init__(self, txt): self.choices = [_Choice(txt)]
class FakeClient:
    def __init__(self, raw):
        self._raw = raw
        class Completions:
            def __init__(inner, outer): inner._outer = outer
            def create(inner, *a, **k): return _Resp(inner._outer._raw)
        class Chat:
            def __init__(inner, outer): inner.completions = Completions(outer)
        self.chat = Chat(self)

# ---------------------------------------------------------------------------
# New edge/corner-case tests
# ---------------------------------------------------------------------------
def test_trims_to_requested_count(monkeypatch):
    raw = '["one","two","three"]'
    monkeypatch.setattr(suggestions, "client", FakeClient(raw))
    req = SuggestRequest(description="Whatever", n=2)
    resp = suggest_subtasks(req)
    assert resp.suggestions == ["one", "two"]  # only first n items kept

def test_rejects_non_string_elements(monkeypatch):
    raw = '["ok", 123, true]'
    monkeypatch.setattr(suggestions, "client", FakeClient(raw))
    req = SuggestRequest(description="Bad types", n=3)
    with pytest.raises(HTTPException) as exc:
        suggest_subtasks(req)
    assert exc.value.status_code == 502
    assert "strings" in exc.value.detail.lower()

def test_rejects_unexpected_json_shape(monkeypatch):
    raw = '{"foo": ["bar"]}'
    monkeypatch.setattr(suggestions, "client", FakeClient(raw))
    req = SuggestRequest(description="Wrong shape", n=1)
    with pytest.raises(HTTPException) as exc:
        suggest_subtasks(req)
    assert exc.value.status_code == 502
    assert "expected a json list" in exc.value.detail.lower()
