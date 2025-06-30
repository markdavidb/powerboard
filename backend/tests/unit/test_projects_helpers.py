"""
Pure-logic unit tests for _assert_is_owner() and _assert_no_big_tasks()
"""
import pytest
from fastapi import HTTPException
from services.project_service.routers.projects import _assert_is_owner, _assert_no_big_tasks

# ───────── _assert_is_owner ─────────────────────────────────────────────
def test_is_owner_allows_owner():
    # should NOT raise
    _assert_is_owner(owner_id=5, user_id=5, action="update")

def test_is_owner_raises_for_non_owner():
    with pytest.raises(HTTPException) as exc:
        _assert_is_owner(owner_id=1, user_id=2, action="delete")
    assert exc.value.status_code == 403
    assert "Not authorized to delete" in exc.value.detail

# ───────── _assert_no_big_tasks ────────────────────────────────────────
def test_no_big_tasks_passes_when_zero():
    _assert_no_big_tasks(0)  # should NOT raise

def test_no_big_tasks_raises_when_positive():
    with pytest.raises(HTTPException) as exc:
        _assert_no_big_tasks(3)
    assert exc.value.status_code == 400
    assert "delete or move all big tasks" in exc.value.detail.lower()
