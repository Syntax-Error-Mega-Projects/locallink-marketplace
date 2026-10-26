# -*- coding: utf-8 -*-
import pytest
from models.service import ServiceCategory
from database import get_db
from sqlalchemy.orm import Session


def _seed_category(client, worker_token):
    """Create a test category and return its id."""
    from tests.conftest import TestingSession
    db = TestingSession()
    cat = ServiceCategory(
        group="home_repair", name="Test Service", fee_type="fixed",
        shop_visit_allowed=True, active=True, coming_soon=False,
        base_service_charge=500, market_rate_estimate=1000,
        icon="??", description="test"
    )
    db.add(cat)
    db.commit()
    cat_id = cat.id
    db.close()
    return cat_id


def test_create_booking(client, customer_token, worker_token):
    cat_id = _seed_category(client, worker_token)
    r = client.post("/api/bookings", json={
        "category_id": cat_id, "mode": "home", "address": "123 Test St"
    }, headers={"Authorization": f"Bearer {customer_token}"})
    assert r.status_code == 200
    data = r.json()
    assert data["status"] == "requested"
    assert data["mode"] == "home"
    assert data["service_charge"] == 500


def test_worker_cannot_create_booking(client, worker_token):
    r = client.post("/api/bookings", json={
        "category_id": 1, "mode": "home"
    }, headers={"Authorization": f"Bearer {worker_token}"})
    assert r.status_code == 403


def test_accept_booking(client, customer_token, worker_token):
    cat_id = _seed_category(client, worker_token)
    # Create booking as customer
    br = client.post("/api/bookings", json={"category_id": cat_id, "mode": "home"},
                     headers={"Authorization": f"Bearer {customer_token}"})
    booking_id = br.json()["id"]

    # Accept as worker
    ar = client.post(f"/api/bookings/{booking_id}/accept",
                     headers={"Authorization": f"Bearer {worker_token}"})
    assert ar.status_code == 200
    assert ar.json()["status"] == "accepted"


def test_status_transition(client, customer_token, worker_token):
    cat_id = _seed_category(client, worker_token)
    br = client.post("/api/bookings", json={"category_id": cat_id, "mode": "home"},
                     headers={"Authorization": f"Bearer {customer_token}"})
    booking_id = br.json()["id"]
    client.post(f"/api/bookings/{booking_id}/accept",
                headers={"Authorization": f"Bearer {worker_token}"})

    for new_status in ["on_the_way", "in_progress", "completed"]:
        r = client.post(f"/api/bookings/{booking_id}/status",
                        json={"status": new_status},
                        headers={"Authorization": f"Bearer {worker_token}"})
        assert r.status_code == 200
        assert r.json()["status"] == new_status


def test_invalid_status_transition(client, customer_token, worker_token):
    cat_id = _seed_category(client, worker_token)
    br = client.post("/api/bookings", json={"category_id": cat_id, "mode": "home"},
                     headers={"Authorization": f"Bearer {customer_token}"})
    booking_id = br.json()["id"]
    r = client.post(f"/api/bookings/{booking_id}/status",
                    json={"status": "completed"},
                    headers={"Authorization": f"Bearer {worker_token}"})
    assert r.status_code == 400
