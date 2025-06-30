import pytest
from tests.factories import make_project, make_task, make_big_task

BASE = "/api/analytics/export"

@pytest.mark.usefixtures("db")
def test_export_dashboard_csv_empty(analytics_client):
    r = analytics_client.get(f"{BASE}?export_type=dashboard&file_format=csv")
    assert r.status_code == 200
    text = r.content.decode()
    # first line is the CSV header
    header = text.splitlines()[0].split(',')
    assert "total_projects" in header
    assert "total_tasks" in header

@pytest.mark.usefixtures("db")
def test_export_dashboard_json(analytics_client, db):
    # seed two projects so the aggregate row shows up
    p = make_project(db, owner_id=1)
    make_task(db, project_id=p.id, big_task_id=None, reporter_id=1)

    r = analytics_client.get(f"{BASE}?export_type=dashboard&file_format=json")
    assert r.status_code == 200
    data = r.json()
    # JSON is always a list, even for the single aggregate
    assert isinstance(data, list) and len(data) == 1
    row = data[0]
    assert row["total_projects"] == 1
    assert row["total_tasks"]    == 1

@pytest.mark.usefixtures("db")
def test_export_dashboard_by_project_json(analytics_client, db):
    # two separate projects
    p1 = make_project(db, owner_id=1)
    p2 = make_project(db, owner_id=1)

    r = analytics_client.get(f"{BASE}?export_type=dashboard&by_project=true&file_format=json")
    assert r.status_code == 200
    data = r.json()
    # should produce one row per project
    ids = {row["project_id"] for row in data}
    assert ids == {p1.id, p2.id}

@pytest.mark.usefixtures("db")
def test_export_summary_csv(analytics_client, db):
    p = make_project(db, owner_id=1)
    r = analytics_client.get(f"{BASE}?export_type=summary&project_id={p.id}&file_format=csv")
    assert r.status_code == 200
    text = r.content.decode()
    header = text.splitlines()[0].split(',')
    # must include the project_id column
    assert "project_id" in header
    assert "project_title" in header

@pytest.mark.usefixtures("db")
def test_export_summary_missing_param(analytics_client):
    # omit project_id ⇒ 400
    r = analytics_client.get(f"{BASE}?export_type=summary&file_format=json")
    assert r.status_code == 400
    assert "project_id is required" in r.json()["detail"]
