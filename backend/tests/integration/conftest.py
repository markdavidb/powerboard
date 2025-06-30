# tests/integration/conftest.py

import pytest
from common.database import Base
from sqlalchemy.orm import Session

@pytest.fixture(autouse=True)
def clear_database(db: Session):
    """
    Remove all rows from every table before each integration test,
    so each test starts with a clean slate — except 'users'
    (so our fake_current_user can continue to find 'tester').
    """
    # Drop in reverse-FK order, but skip the users table
    for table in reversed(Base.metadata.sorted_tables):
        if table.name == "users":
            continue
        db.execute(table.delete())
    db.commit()
