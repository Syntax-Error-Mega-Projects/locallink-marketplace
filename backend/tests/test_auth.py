# -*- coding: utf-8 -*-
import pytest


def test_register_customer(client):
    r = client.post("/api/auth/register", json={
        "name": "Alice", "phone": "9876543210",
        "email": "alice@test.com", "password": "abc12345", "role": "customer"
    })
    assert r.status_code == 200
    data = r.json()
    assert "token" in data
    assert data["user"]["role"] == "customer"
    assert data["user"]["verified"] is True


def test_register_duplicate_email(client):
    payload = {"name": "Bob", "phone": "1234567890", "email": "bob@test.com", "password": "abc123", "role": "customer"}
    client.post("/api/auth/register", json=payload)
    r = client.post("/api/auth/register", json=payload)
    assert r.status_code == 400


def test_login_success(client):
    client.post("/api/auth/register", json={
        "name": "Carol", "phone": "9999999999",
        "email": "carol@test.com", "password": "mypassword", "role": "customer"
    })
    r = client.post("/api/auth/login", json={"email": "carol@test.com", "password": "mypassword"})
    assert r.status_code == 200
    assert "token" in r.json()


def test_login_wrong_password(client):
    client.post("/api/auth/register", json={
        "name": "Dave", "phone": "8888888888",
        "email": "dave@test.com", "password": "correct", "role": "customer"
    })
    r = client.post("/api/auth/login", json={"email": "dave@test.com", "password": "wrong"})
    assert r.status_code == 401


def test_login_unknown_email(client):
    r = client.post("/api/auth/login", json={"email": "nobody@test.com", "password": "xyz"})
    assert r.status_code == 401


def test_me(client, customer_token):
    r = client.get("/api/auth/me", headers={"Authorization": f"Bearer {customer_token}"})
    assert r.status_code == 200
    assert r.json()["role"] == "customer"


def test_me_no_token(client):
    r = client.get("/api/auth/me")
    assert r.status_code == 403
