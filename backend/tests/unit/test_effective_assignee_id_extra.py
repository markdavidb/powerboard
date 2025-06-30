# tests/unit/test_effective_assignee_id_extra.py
"""
Extra edge-case coverage for _effective_assignee_id()
"""
from services.project_service.routers.tasks import _effective_assignee_id

class DummyUser:
    id = 777  # arbitrary current-user id

def test_effective_assignee_id_zero_defaults_to_caller():
    """
    A false-y 0 should be treated like “not provided” → defaults to caller.
    """
    current_user = DummyUser()
    task_in = type("T", (), {"assignee_id": 0})
    assert _effective_assignee_id(task_in, current_user) == current_user.id

def test_effective_assignee_id_negative_kept_verbatim():
    """
    Any non-zero int (even negative) is truthy, so it’s returned unchanged.
    """
    current_user = DummyUser()
    task_in = type("T", (), {"assignee_id": -5})
    assert _effective_assignee_id(task_in, current_user) == -5
