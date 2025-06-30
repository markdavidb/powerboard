import pytest
from tests.factories import make_project, make_task, make_big_task

BASE = "/api/analytics/dashboard"

@pytest.mark.usefixtures("db")
def test_summary_empty(analytics_client):
    # with no projects, everything should be zero
    r = analytics_client.get(f"{BASE}/summary")
    assert r.status_code == 200
    assert r.json() == {
        "total_projects": 0,
        "total_tasks": 0,
        "total_big_tasks": 0,
        "done_projects": 0,
        "done_tasks": 0,
        "done_big_tasks": 0,
        "progress_percentage": 0,
    }

@pytest.mark.usefixtures("db")
def test_summary_counts(analytics_client, db):
    # seed one project, two tasks, one epic, mark one done in each category
    p = make_project(db, owner_id=1)
    # big-tasks
    bt1 = make_big_task(db, project_id=p.id, status="Done")
    bt2 = make_big_task(db, project_id=p.id, status="To Do")
    # tasks
    t1 = make_task(db, project_id=p.id, big_task_id=None, reporter_id=1)
    t2 = make_task(db, project_id=p.id, big_task_id=None, reporter_id=1)
    # mark one task done
    t1.status = "Done"
    db.commit()

    r = analytics_client.get(f"{BASE}/summary")
    assert r.status_code == 200
    got = r.json()

    # we expect 1 project, 2 tasks, 2 epics
    assert got["total_projects"] == 1
    assert got["total_tasks"]    == 2
    assert got["total_big_tasks"]== 2

    # done counts
    assert got["done_projects"] == 0   # our factory never marks project Done
    assert got["done_tasks"]    == 1   # t1
    assert got["done_big_tasks"]== 1   # bt1

    # progress = (0+1+1)/(1+2+2) *100 = 2/5*100 = 40.0
    assert got["progress_percentage"] == 40.0
