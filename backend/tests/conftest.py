# tests/conftest.py
import os
import sys
import pytest

from fastapi import Depends
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, Session
from sqlalchemy.pool import StaticPool

# ──────────────────────────────────────────────────────────────────────────────
# 1) Make “backend” importable so `import common…` and `import services…` work
# ──────────────────────────────────────────────────────────────────────────────
ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), os.pardir))
sys.path.insert(0, ROOT)

# ──────────────────────────────────────────────────────────────────────────────
# 2) Pull in the shared DB & auth‐deps
# ──────────────────────────────────────────────────────────────────────────────
from common.database import Base, get_db
from common.security.dependencies import get_current_user
from common.models.user import User

# ──────────────────────────────────────────────────────────────────────────────
# 3) Import your FastAPI apps
# ──────────────────────────────────────────────────────────────────────────────
from services.project_service.main   import app as project_app
from services.analytics_service.main import app as analytics_app
from services.user_service.main      import app as user_app
from services.ai_service.main        import app as ai_app, auth0_scheme

# ──────────────────────────────────────────────────────────────────────────────
# 4) Set up a single in-memory SQLite for everything
# ──────────────────────────────────────────────────────────────────────────────
ENGINE = create_engine(
    "sqlite:///:memory:",
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
TestingSessionLocal = sessionmaker(bind=ENGINE, autoflush=False, autocommit=False)

@pytest.fixture(scope="session", autouse=True)
def init_db():
    # import all models so Base.metadata.create_all() sees them
    import common.models.project
    import common.models.project_member
    import common.models.task
    import common.models.big_task
    import common.models.task_comment

    Base.metadata.create_all(ENGINE)
    yield
    Base.metadata.drop_all(ENGINE)

# ──────────────────────────────────────────────────────────────────────────────
# 5) Override get_db for all three data services
# ──────────────────────────────────────────────────────────────────────────────
def override_get_db():
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()

# ──────────────────────────────────────────────────────────────────────────────
# 6) Fake-auth that uses the *same* session as get_db
# ──────────────────────────────────────────────────────────────────────────────
def fake_current_user(
    db: Session = Depends(get_db)      # ← FASTAPI will inject our override_get_db
) -> User:
    user = db.query(User).filter_by(username="tester").first()
    if not user:
        user = User(
            auth0_id="auth0|test",
            username="tester",
            email="tester@example.com",
        )
        db.add(user)
        db.commit()
        db.refresh(user)
    return user

# ──────────────────────────────────────────────────────────────────────────────
# 7) Apply overrides to the three stateful services
# ──────────────────────────────────────────────────────────────────────────────
for _app in (project_app, analytics_app, user_app):
    _app.dependency_overrides[get_db] = override_get_db
    _app.dependency_overrides[get_current_user] = fake_current_user

# ──────────────────────────────────────────────────────────────────────────────
# 8) Disable Auth0Bearer on AI service entirely
# ──────────────────────────────────────────────────────────────────────────────
ai_app.dependency_overrides[auth0_scheme] = lambda: None
ai_app.dependency_overrides[auth0_scheme.__call__] = lambda *args, **kwargs: None
# strip any Security dependencies off its routes
for route in ai_app.routes:
    if hasattr(route, "dependencies"):
        route.dependencies = []

# ──────────────────────────────────────────────────────────────────────────────
# 9) TestClient fixtures
# ──────────────────────────────────────────────────────────────────────────────
@pytest.fixture
def client():
    return TestClient(project_app)

@pytest.fixture
def analytics_client():
    return TestClient(analytics_app)

@pytest.fixture
def user_client():
    return TestClient(user_app)

@pytest.fixture
def ai_client():
    return TestClient(ai_app)

@pytest.fixture
def db():
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()
