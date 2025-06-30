# tests/integration/test_user_profile.py

import pytest
from fastapi.testclient import TestClient

# reach into the users router module for monkey-patching
import services.user_service.routers.users as users_router

BASE = "/api/users"

@pytest.mark.usefixtures("db")
def test_get_my_profile(user_client: TestClient):
    """GET /api/users/me should return the fake 'tester' user"""
    r = user_client.get(f"{BASE}/me")
    assert r.status_code == 200
    data = r.json()
    assert data["username"] == "tester"
    assert data["email"] == "tester@example.com"

@pytest.mark.usefixtures("db")
def test_update_my_profile(user_client: TestClient):
    """PUT /api/users/users/me should update the allowed fields"""
    payload = {
        "email":        "new@example.com",
        "display_name": "The Tester",
        "avatar_url":   "http://example.com/avatar.png",
        "bio":          "Loves testing",
    }
    r = user_client.put(f"{BASE}/users/me", json=payload)
    assert r.status_code == 200
    data = r.json()
    # email must now be updated
    assert data["email"]        == "new@example.com"
    assert data["display_name"] == "The Tester"
    assert data["avatar_url"]   == "http://example.com/avatar.png"
    assert data["bio"]          == "Loves testing"

@pytest.mark.usefixtures("db")
def test_create_password_change_ticket_success(monkeypatch, user_client: TestClient):
    """On success, POST /api/users/users/password-change-ticket returns the ticket URL"""
    # 1) fake out the M2M token call
    monkeypatch.setattr(users_router, "_get_mgmt_token", lambda: "fake-token")

    # 2) fake Auth0 ticket endpoint
    def fake_post(url, json=None, headers=None, timeout=None):
        class FakeResp:
            status_code = 201
            def json(self):
                return {"ticket": "https://reset?ticket=abc123"}
        return FakeResp()
    monkeypatch.setattr(users_router.requests, "post", fake_post)

    r = user_client.post(f"{BASE}/users/password-change-ticket")
    assert r.status_code == 200
    assert r.json() == {"ticket": "https://reset?ticket=abc123"}

@pytest.mark.usefixtures("db")
def test_create_password_change_ticket_failure(monkeypatch, user_client: TestClient):
    """If Auth0 returns non-201, we should get a 502 Bad Gateway"""
    monkeypatch.setattr(users_router, "_get_mgmt_token", lambda: "fake-token")

    # simulate Auth0 tickets endpoint outage
    def bad_post(url, json=None, headers=None, timeout=None):
        class ErrResp:
            status_code = 502
            text = "failure"
        return ErrResp()
    monkeypatch.setattr(users_router.requests, "post", bad_post)

    r = user_client.post(f"{BASE}/users/password-change-ticket")
    assert r.status_code == 502
    assert "Auth0 ticket error" in r.json()["detail"]
