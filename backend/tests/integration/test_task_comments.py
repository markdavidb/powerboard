import pytest
from tests.factories import make_project, make_task
from common.models.user import User
from common.models.task_comment import TaskComment as TaskCommentModel

BASE = "/api/projects/task_comments"


# ─────────────────────────────────────────────────────────────────────────────
# CREATE / LIST
# ─────────────────────────────────────────────────────────────────────────────
@pytest.mark.usefixtures("db")
def test_create_and_list_comments(client, db):
    proj = make_project(db, owner_id=1)
    task = make_task(
        db, project_id=proj.id, big_task_id=None, reporter_id=1, assignee_id=1
    )

    # create
    r = client.post(f"{BASE}/", json={"task_id": task.id, "content": "Hello"})
    assert r.status_code == 200
    c = r.json()
    assert c["content"] == "Hello"
    assert c["user_id"] == 1
    assert c["username"] == "tester"

    # list
    r = client.get(f"{BASE}/task/{task.id}")
    assert r.status_code == 200
    assert len(r.json()) == 1


# ─────────────────────────────────────────────────────────────────────────────
# ORDERING (desc)
# ─────────────────────────────────────────────────────────────────────────────
@pytest.mark.usefixtures("db")
def test_comments_are_sorted_desc(client, db):
    proj = make_project(db, owner_id=1)
    task = make_task(
        db, project_id=proj.id, big_task_id=None, reporter_id=1, assignee_id=1
    )

    r1 = client.post(f"{BASE}/", json={"task_id": task.id, "content": "First"})
    r2 = client.post(f"{BASE}/", json={"task_id": task.id, "content": "Second"})
    id1, id2 = r1.json()["id"], r2.json()["id"]

    r = client.get(f"{BASE}/task/{task.id}")
    ids = [c["id"] for c in r.json()]
    assert ids == [id2, id1]  # newest first


# ─────────────────────────────────────────────────────────────────────────────
# UPDATE (owner / not-owner)
# ─────────────────────────────────────────────────────────────────────────────
@pytest.mark.usefixtures("db")
def test_update_comment(client, db):
    proj = make_project(db, owner_id=1)
    task = make_task(
        db, project_id=proj.id, big_task_id=None, reporter_id=1, assignee_id=1
    )
    cid = client.post(f"{BASE}/", json={"task_id": task.id, "content": "Orig"}).json()[
        "id"
    ]

    r = client.put(f"{BASE}/{cid}", json={"content": "Upd"})
    assert r.status_code == 200
    assert r.json()["content"] == "Upd"


@pytest.mark.usefixtures("db")
def test_update_comment_not_owner_forbidden(client, db):
    proj = make_project(db, owner_id=1)
    task = make_task(
        db, project_id=proj.id, big_task_id=None, reporter_id=2, assignee_id=2
    )

    # make or fetch second user
    other = db.query(User).filter_by(username="alice").first()
    if not other:
        other = User(auth0_id="auth0|two", username="alice", email="a@x")
        db.add(other)
        db.commit()
        db.refresh(other)

    comment = TaskCommentModel(task_id=task.id, user_id=other.id, content="By Alice")
    db.add(comment)
    db.commit()
    db.refresh(comment)

    r = client.put(f"{BASE}/{comment.id}", json={"content": "No"})
    assert r.status_code == 403


# ─────────────────────────────────────────────────────────────────────────────
# DELETE (owner / not-owner)
# ─────────────────────────────────────────────────────────────────────────────
@pytest.mark.usefixtures("db")
def test_delete_comment(client, db):
    proj = make_project(db, owner_id=1)
    task = make_task(
        db, project_id=proj.id, big_task_id=None, reporter_id=1, assignee_id=1
    )
    cid = client.post(f"{BASE}/", json={"task_id": task.id, "content": "X"}).json()[
        "id"
    ]

    r = client.delete(f"{BASE}/{cid}")
    assert r.status_code == 200


@pytest.mark.usefixtures("db")
def test_delete_comment_not_owner_forbidden(client, db):
    proj = make_project(db, owner_id=1)
    task = make_task(
        db, project_id=proj.id, big_task_id=None, reporter_id=2, assignee_id=2
    )

    other = db.query(User).filter_by(username="alice").first()
    if not other:
        other = User(auth0_id="auth0|two", username="alice", email="a@x")
        db.add(other)
        db.commit()
        db.refresh(other)

    comment = TaskCommentModel(task_id=task.id, user_id=other.id, content="C")
    db.add(comment)
    db.commit()
    db.refresh(comment)

    r = client.delete(f"{BASE}/{comment.id}")
    assert r.status_code == 403


# ─────────────────────────────────────────────────────────────────────────────
# 404 edge-cases
# ─────────────────────────────────────────────────────────────────────────────
@pytest.mark.usefixtures("db")
def test_404_cases(client, db):
    r = client.post(f"{BASE}/", json={"task_id": 999, "content": "No"})
    assert r.status_code == 404

    r = client.get(f"{BASE}/task/999")
    assert r.status_code == 404

    r = client.put(f"{BASE}/999", json={"content": "No"})
    assert r.status_code == 404

    r = client.delete(f"{BASE}/999")
    assert r.status_code == 404
