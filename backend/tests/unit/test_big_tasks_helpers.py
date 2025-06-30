"""
Unit-tests for the pure-logic helper in big_tasks.py
No DB or FastAPI instance required.
"""
import pytest
from fastapi import HTTPException
from services.project_service.routers.big_tasks import _assert_can_delete

def test_assert_can_delete_raises_when_tasks_exist():
    with pytest.raises(HTTPException) as exc:
        _assert_can_delete(4)
    assert exc.value.status_code == 400
    assert "4 task(s)" in exc.value.detail

def test_assert_can_delete_allows_when_zero():
    # should NOT raise
    _assert_can_delete(0)
