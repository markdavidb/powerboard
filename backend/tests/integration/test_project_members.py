import pytest
from tests.factories import make_project
from common.models.user import User

# matches app.include_router(project_members.router, prefix="/api/projects/members", ...)
BASE = "/api/projects/members"

@pytest.mark.usefixtures("db")
def test_add_list_and_remove_project_member(client, db):
    # 1) seed a project owned by user 1
    proj = make_project(db, owner_id=1)

    # 2) create another user in the DB
    other = User(id=2, auth0_id="auth0|two", username="alice", email="a@x")
    db.add(other)
    db.commit()

    # 3) ADD as project member
    resp = client.post(f"{BASE}/", json={
        "project_id": proj.id,
        "username":   "alice",
        "role":       "editor"
    })
    assert resp.status_code == 200
    data = resp.json()
    assert data["username"] == "alice"
    assert data["role"]     == "editor"
    assert data["project_id"] == proj.id

    # 4) LIST all members of that project
    resp = client.get(f"{BASE}/{proj.id}/members")
    assert resp.status_code == 200
    usernames = [m["username"] for m in resp.json()]
    assert "alice" in usernames

    # 5) REMOVE the member
    resp = client.delete(f"{BASE}/{proj.id}/members/alice")
    assert resp.status_code == 200
    assert resp.json()["detail"] == "Member removed"
