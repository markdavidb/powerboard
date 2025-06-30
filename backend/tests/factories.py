# /tests/factories.py

from datetime import datetime
from common.models.project import Project
from common.enums import TaskStatus, Priority
from common.models.big_task import BigTask as BigTaskModel
from common.models.task     import Task    as TaskModel

def make_project(db, owner_id: int, **kwargs):
    """
    Quickly spin up a Project row in the test DB.
    """
    defaults = {
        "title":       "Test Project",
        "description": "a test project",
        "status":      "IN_PROGRESS",
        # SQLAlchemy DateTime will accept a datetime here
        "due_date":    datetime(2099, 12, 31),
        "owner_id":    owner_id,
    }
    defaults.update(kwargs)
    proj = Project(**defaults)
    db.add(proj)
    db.commit()
    db.refresh(proj)
    return proj


def make_big_task(db, project_id, **kwargs):
    """
    Create & return a BigTask tied to `project_id`, owned by the fake-current-user (id=1).
    """
    params = {
        "title":       "Test BigTask",
        "description": "created in test",
        "status":      TaskStatus.TODO,
        "priority":    Priority.MEDIUM,
        "due_date":    datetime(2099, 12, 31),
        "project_id":  project_id,
    }
    params.update(kwargs)
    bt = BigTaskModel(**params)
    db.add(bt)
    db.commit()
    db.refresh(bt)
    return bt

def make_task(db, project_id, big_task_id, **kwargs):
    """
    Create & return a Task tied to `big_task_id` (and same project), so we can test
    the “cannot delete big-task if tasks exist” guard.
    """
    params = {
        "title":       "Test Task",
        "description": "created in test",
        "status":      TaskStatus.TODO,
        "due_date":    datetime(2099, 12, 31),
        "project_id":  project_id,
        "big_task_id": big_task_id,
    }
    params.update(kwargs)
    t = TaskModel(**params)
    db.add(t)
    db.commit()
    db.refresh(t)
    return t

