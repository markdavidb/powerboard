import pytest
from tests.factories import make_project, make_big_task
from common.models.user import User

# FastAPI prefixes:  main.include_router(..., prefix="/api/projects/big_task_members")
# plus APIRouter(prefix="/big_task_members")
# → /api/projects/big_task_members/big_task_members
BASE = "/api/projects/big_task_members/big_task_members"

@pytest.mark.usefixtures("db")
def test_add_list_and_remove_big_task_member(client, db):
    # 1) seed a project and an epic
    proj = make_project(db, owner_id=1)
    epic = make_big_task(db, project_id=proj.id)

    # 2) create another user in the DB
    other = User(id=3, auth0_id="auth0|three", username="bob", email="b@x")
    db.add(other)
    db.commit()

    # 3) ADD as big-task member
    resp = client.post(BASE, json={
        "big_task_id": epic.id,
        "username":    "bob",
        "role":        "viewer",
    })
    assert resp.status_code == 200
    data = resp.json()
    assert data["username"]    == "bob"
    assert data["role"]        == "viewer"
    assert data["big_task_id"] == epic.id

    # 4) LIST members of that epic
    resp = client.get(f"{BASE}/{epic.id}/members")
    assert resp.status_code == 200
    usernames = [m["username"] for m in resp.json()]
    assert "bob" in usernames

    # 5) REMOVE the member
    resp = client.delete(f"{BASE}/{epic.id}/members/bob")
    assert resp.status_code == 200
    assert resp.json()["detail"] == "Member removed"
