# -*- coding: utf-8 -*-
"""Mock verification service  always returns verified=True after a simulated check.
No real Aadhaar / GSTIN / Bar Council APIs are called.
"""
import time


def mock_verify_worker(user_id: int, aadhaar: str = "", phone: str = "") -> dict:
    time.sleep(0.05)   # simulate tiny network delay
    return {
        "verified": True,
        "checks": ["aadhaar_match", "phone_otp", "police_check"],
        "message": "Worker verified (mocked)"
    }


def mock_verify_shop(shop_id: int, gstin: str = "") -> dict:
    time.sleep(0.05)
    return {
        "verified": True,
        "checks": ["gstin_lookup", "gps_match", "bank_name_match"],
        "message": "Shop verified (mocked)"
    }


def mock_verify_professional(user_id: int, council_id: str = "") -> dict:
    time.sleep(0.05)
    return {
        "verified": True,
        "checks": ["council_id_lookup", "bar_council"],
        "message": "Professional verified (mocked)"
    }
