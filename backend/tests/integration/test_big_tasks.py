# tests/integration/test_big_tasks.py

from tests.factories import make_project, make_big_task, make_task
from common.enums import TaskStatus, Priority

# matches app.include_router(big_tasks.router, prefix="/api/projects/big_tasks", ...)
BASE = "/api/projects/big_tasks/big_tasks"

def test_create_and_list_big_tasks(client, db):
    proj = make_project(db, owner_id=1)

    payload = {
        "title":      "API Epic",
        "description":"desc",
        "status":     TaskStatus.TODO.value,
        "priority":   Priority.HIGH.value,
        "due_date":   "2099-12-31T00:00:00",
        "project_id": proj.id,
    }

    # CREATE
    resp = client.post(f"{BASE}/", json=payload)
    assert resp.status_code == 201
    data = resp.json()
    assert data["title"] == payload["title"]
    assert data["project_id"] == proj.id

    # LIST for that project
    resp = client.get(f"{BASE}/?project_id={proj.id}")
    assert resp.status_code == 200
    ids = [bt["id"] for bt in resp.json()]
    assert data["id"] in ids

def test_get_update_delete_big_task(client, db):
    proj = make_project(db, owner_id=1)
    bt = make_big_task(db, project_id=proj.id)

    # GET
    r = client.get(f"{BASE}/{bt.id}")
    assert r.status_code == 200
    assert r.json()["id"] == bt.id

    # UPDATE
    update_payload = {
        "title":      "Updated Epic",
        "description":"updated",
        "status":     TaskStatus.DONE.value,
        "priority":   Priority.LOW.value,
        "due_date":   "2100-01-01T00:00:00",
        "project_id": proj.id,
    }
    r = client.put(f"{BASE}/{bt.id}", json=update_payload)
    assert r.status_code == 200
    upd = r.json()
    assert upd["title"]  == "Updated Epic"
    assert upd["status"] == TaskStatus.DONE.value

    # DELETE (no child tasks)
    r = client.delete(f"{BASE}/{bt.id}")
    assert r.status_code == 200
    assert r.json()["detail"] == "BigTask deleted successfully"

def test_cannot_delete_if_tasks_exist(client, db):
    proj = make_project(db, owner_id=1)
    bt = make_big_task(db, project_id=proj.id)

    # create one task under this big task (must pass reporter_id)
    make_task(db,
              project_id=proj.id,
              big_task_id=bt.id,
              reporter_id=1)

    # now deletion should be blocked
    r = client.delete(f"{BASE}/{bt.id}")
    assert r.status_code == 400
    assert "still contains" in r.json()["detail"]
