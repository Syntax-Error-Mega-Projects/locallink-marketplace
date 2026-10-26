# -*- coding: utf-8 -*-
import pytest
from services.pricing import calculate_split, get_labour_discount


def test_ac_repair_split_example():
    """Exact numbers from Section 7 of PROJECT.md."""
    result = calculate_split(
        service_charge=550,
        parts_total=400,
        convenience_fee=50,
        market_price_estimate=1500,
    )
    assert result["total"] == 1000
    assert result["worker_amount"] == 495        # 550 * 0.90
    assert result["supplier_amount"] == 388      # 400 * 0.97
    assert result["platform_amount"] == 117      # 1000 - 495 - 388
    assert result["savings"] == 500
    assert result["savings_pct"] == 33


def test_savings_pct_zero_market_estimate():
    result = calculate_split(500, 0, 50, 0)
    assert result["savings_pct"] == 0


def test_no_parts_split():
    result = calculate_split(400, 0, 50, 800)
    assert result["total"] == 450
    assert result["supplier_amount"] == 0
    assert result["savings"] == 350


@pytest.mark.parametrize("workers,expected", [(1, 0.0), (2, 3.0), (5, 5.0), (10, 10.0), (20, 15.0)])
def test_labour_discount_slabs(workers, expected):
    assert get_labour_discount(workers) == expected
