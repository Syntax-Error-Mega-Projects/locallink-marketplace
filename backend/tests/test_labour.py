# -*- coding: utf-8 -*-
import pytest


@pytest.mark.parametrize("workers,expected_discount", [
    (1,  0.0),
    (2,  3.0),
    (5,  5.0),
    (10, 10.0),
    (20, 15.0),
])
def test_labour_estimate_discount(client, customer_token, workers, expected_discount):
    r = client.post("/api/labour/estimate", json={
        "work_type": "mason", "workers_count": workers,
        "days": 5, "start_date": "2025-03-01"
    }, headers={"Authorization": f"Bearer {customer_token}"})
    assert r.status_code == 200
    data = r.json()
    assert data["discount_pct"] == expected_discount
    assert data["workers_count"] == workers


def test_labour_estimate_total(client, customer_token):
    r = client.post("/api/labour/estimate", json={
        "work_type": "mason", "workers_count": 10, "days": 5, "start_date": "2025-03-01"
    }, headers={"Authorization": f"Bearer {customer_token}"})
    data = r.json()
    base = 800 * 10 * 5           # 40000
    discount = base * 0.10        # 4000
    expected_total = base - discount   # 36000
    assert data["subtotal"] == base
    assert data["discount_amount"] == int(discount)
    assert data["total"] == expected_total


def test_labour_invalid_crew_size(client, customer_token):
    r = client.post("/api/labour/estimate", json={
        "work_type": "mason", "workers_count": 7, "days": 3, "start_date": "2025-03-01"
    }, headers={"Authorization": f"Bearer {customer_token}"})
    assert r.status_code == 400


def test_labour_slab_table_in_response(client, customer_token):
    r = client.post("/api/labour/estimate", json={
        "work_type": "helper", "workers_count": 5, "days": 2, "start_date": "2025-03-01"
    }, headers={"Authorization": f"Bearer {customer_token}"})
    data = r.json()
    assert "slab_table" in data
    assert len(data["slab_table"]) == 5
