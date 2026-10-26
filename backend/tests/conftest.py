# -*- coding: utf-8 -*-
import sys, os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from database import Base, get_db

TEST_DB_URL = "sqlite:///./test_locallink.db"
test_engine = create_engine(TEST_DB_URL, connect_args={"check_same_thread": False})
TestingSession = sessionmaker(autocommit=False, autoflush=False, bind=test_engine)


def override_get_db():
    db = TestingSession()
    try:
        yield db
    finally:
        db.close()


@pytest.fixture(autouse=True, scope="function")
def setup_db():
    import models  # noqa register all
    Base.metadata.drop_all(bind=test_engine)
    Base.metadata.create_all(bind=test_engine)
    yield
    Base.metadata.drop_all(bind=test_engine)


@pytest.fixture
def client(setup_db):
    from main import app
    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as c:
        yield c
    app.dependency_overrides.clear()


def _register(client, role="customer", email=None):
    email = email or f"{role}@test.com"
    r = client.post("/api/auth/register", json={
        "name": "Test User", "phone": "9876543210",
        "email": email, "password": "pass1234", "role": role
    })
    assert r.status_code == 200
    return r.json()["token"]


@pytest.fixture
def customer_token(client):
    return _register(client, "customer")


@pytest.fixture
def worker_token(client):
    return _register(client, "worker", "worker@test.com")


@pytest.fixture
def supplier_token(client):
    return _register(client, "supplier", "supplier@test.com")


@pytest.fixture
def admin_token(client):
    return _register(client, "admin", "admin@test.com")
