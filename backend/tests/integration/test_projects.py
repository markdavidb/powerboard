import pytest
from common.enums import ProjectStatus
from tests.factories import make_project

BASE = "/api/projects"

def test_create_and_list_projects(client):
    # CREATE
    resp = client.post(f"{BASE}/", json={
        "title":       "My API Project",
        "description": "created in test",
        "status":      ProjectStatus.IN_PROGRESS.value,
        "due_date":    "2099-12-31"
    })
    assert resp.status_code == 200
    data = resp.json()
    assert data["title"] == "My API Project"
    proj_id = data["id"]

    # LIST
    resp = client.get(f"{BASE}/")
    assert resp.status_code == 200
    all_ids = [p["id"] for p in resp.json()]
    assert proj_id in all_ids

@pytest.mark.usefixtures("db")
def test_get_update_delete_project(client, db):
    # seed one
    proj = make_project(db, owner_id=1)

    # GET
    r = client.get(f"{BASE}/{proj.id}")
    assert r.status_code == 200
    assert r.json()["id"] == proj.id

    # UPDATE (full PUT payload expected)
    update_payload = {
        "title":       "🚀 Updated",
        "description": proj.description,
        "status":      proj.status.value if hasattr(proj.status, "value") else proj.status,
        "due_date":    proj.due_date.strftime("%Y-%m-%d")
    }
    r2 = client.put(f"{BASE}/{proj.id}", json=update_payload)
    assert r2.status_code == 200
    assert r2.json()["title"] == "🚀 Updated"

    # DELETE
    r3 = client.delete(f"{BASE}/{proj.id}")
    assert r3.status_code == 200

    # now 404
    r4 = client.get(f"{BASE}/{proj.id}")
    assert r4.status_code == 404
