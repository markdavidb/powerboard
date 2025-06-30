import pytest
from tests.factories import make_project, make_task, make_big_task

BASE = "/api/analytics/projects"

@pytest.mark.usefixtures("db")
def test_project_summary_not_found(analytics_client):
    # asking for a non-existent project should 404
    r = analytics_client.get(f"{BASE}/999/summary")
    assert r.status_code == 404

@pytest.mark.usefixtures("db")
def test_project_summary_counts(analytics_client, db):
    # seed one project
    p = make_project(db, owner_id=1)

    # two tasks, mark one done
    t1 = make_task(db, project_id=p.id, big_task_id=None, reporter_id=1)
    t2 = make_task(db, project_id=p.id, big_task_id=None, reporter_id=1)
    t1.status = "Done"

    # two big-tasks, mark one done
    bt1 = make_big_task(db, project_id=p.id, status="Done")
    bt2 = make_big_task(db, project_id=p.id, status="To Do")

    db.commit()

    # fetch summary
    r = analytics_client.get(f"{BASE}/{p.id}/summary")
    assert r.status_code == 200
    got = r.json()

    # basic metadata
    assert got["project_id"]    == p.id
    assert got["project_title"] == p.title

    # tasks
    assert got["total_tasks"]   == 2
    assert got["done_tasks"]    == 1
    # overdue_tasks defaults to 0 (we never set due_date < now)
    assert got["overdue_tasks"] == 0

    # big-tasks
    assert got["total_big_tasks"] == 2
    assert got["done_big_tasks"]  == 1

    # progress_pct = done_tasks/total_tasks * 100 = 1/2*100 = 50.0
    assert got["progress_percentage"] == 50.0
