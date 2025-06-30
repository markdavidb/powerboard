from datetime import datetime
import pytest
from tests.factories      import make_project, make_big_task, make_task
from common.enums         import TaskStatus, IssueType, Priority

BASE = "/api/projects/tasks"

@pytest.mark.usefixtures("db")
def test_create_and_list_tasks_default_assignee(client, db):
    # seed a project
    proj = make_project(db, owner_id=1)

    payload = {
        "title":       "API Task",
        "description": "desc",
        "status":      TaskStatus.TODO.value,
        "issue_type":  IssueType.TASK.value,
        "priority":    Priority.HIGH.value,
        "due_date":    "2099-12-31T00:00:00",
        "project_id":  proj.id,
        # omit assignee_id ⇒ should default to current_user (id=1)
    }

    # CREATE ⇒ 201
    resp = client.post(f"{BASE}/", json=payload)
    assert resp.status_code == 201
    data = resp.json()
    assert data["title"]       == payload["title"]
    # project_id now lives under the nested `project` object
    assert data["project"] and data["project"]["id"] == proj.id
    assert data["assignee_id"] == 1
    assert data["reporter_id"] == 1

    task_id = data["id"]

    # LIST all for project
    resp = client.get(f"{BASE}/?project_id={proj.id}")
    assert resp.status_code == 200
    ids = [t["id"] for t in resp.json()]
    assert task_id in ids


@pytest.mark.usefixtures("db")
def test_get_update_delete_task(client, db):
    proj = make_project(db, owner_id=1)
    bt   = make_big_task(db, project_id=proj.id)

    # make one task under that epic
    t = make_task(
        db,
        project_id=proj.id,
        big_task_id=bt.id,
        reporter_id=1,
        assignee_id=1
    )

    # GET
    r = client.get(f"{BASE}/{t.id}")
    assert r.status_code == 200
    assert r.json()["id"] == t.id

    # UPDATE
    update_payload = {
        "title":       "Updated Task",
        "description": "updated",
        "status":      TaskStatus.DONE.value,
        "issue_type":  IssueType.BUG.value,
        "priority":    Priority.LOW.value,
        "due_date":    "2100-01-02T00:00:00",
        "project_id":  proj.id,
        "big_task_id": bt.id,
        "assignee_id": 1,
    }
    r = client.put(f"{BASE}/{t.id}", json=update_payload)
    assert r.status_code == 200
    upd = r.json()
    assert upd["title"]      == "Updated Task"
    assert upd["status"]     == TaskStatus.DONE.value
    assert upd["issue_type"] == IssueType.BUG.value

    # DELETE
    r = client.delete(f"{BASE}/{t.id}")
    assert r.status_code == 200
    assert r.json()["detail"] == "Task deleted successfully"


@pytest.mark.usefixtures("db")
def test_cannot_assign_to_non_member(client, db):
    # project owned by 1
    proj = make_project(db, owner_id=1)

    # try to create task assigning to user_id=2 who is not in project
    payload = {
        "title":       "Bad Task",
        "description": "desc",
        "status":      TaskStatus.TODO.value,
        "issue_type":  IssueType.TASK.value,
        "priority":    Priority.MEDIUM.value,
        "due_date":    "2099-12-31T00:00:00",
        "project_id":  proj.id,
        "assignee_id": 2,
    }
    r = client.post(f"{BASE}/", json=payload)
    assert r.status_code == 400
    assert "Assignee is not a member" in r.json()["detail"]


@pytest.mark.usefixtures("db")
def test_epic_membership_required(client, db):
    # make the project owned by user 2 so current_user.id == 1 is neither owner nor member
    proj = make_project(db, owner_id=2)
    bt   = make_big_task(db, project_id=proj.id)
    # current_user (1) is not a member of that epic ⇒ should 403 on create
    payload = {
        "title":       "Epic Task",
        "description": "desc",
        "status":      TaskStatus.TODO.value,
        "issue_type":  IssueType.TASK.value,
        "priority":    Priority.MEDIUM.value,
        "due_date":    "2099-12-31T00:00:00",
        "project_id":  proj.id,
        "big_task_id": bt.id,
    }
    r = client.post(f"{BASE}/", json=payload)
    assert r.status_code == 403
    assert "Not a member of this big task" in r.json()["detail"]
