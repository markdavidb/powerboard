# tests/unit/test_tasks_helpers.py
from services.project_service.routers.tasks import _effective_assignee_id
from common.models.user import User

def test_effective_assignee_id_defaults_to_caller():
    class Dummy: id = 42
    current_user = Dummy()
    assert _effective_assignee_id(type("obj", (), {"assignee_id": None}), current_user) == 42

def test_effective_assignee_id_uses_supplied():
    class Dummy: id = 42
    current_user = Dummy()
    assert _effective_assignee_id(type("obj", (), {"assignee_id": 99}), current_user) == 99
