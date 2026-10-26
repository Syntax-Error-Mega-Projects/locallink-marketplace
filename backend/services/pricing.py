# -*- coding: utf-8 -*-
from config import settings


def calculate_split(
    service_charge: int,
    parts_total: int,
    convenience_fee: int,
    market_price_estimate: int,
) -> dict:
    """Calculate worker/supplier/platform split per Section 7."""
    total = service_charge + parts_total + convenience_fee
    worker_amount = int(service_charge * (1 - settings.WORKER_COMMISSION_RATE))
    supplier_amount = int(parts_total * (1 - settings.SUPPLIER_COMMISSION_RATE))
    platform_amount = total - worker_amount - supplier_amount

    savings = max(market_price_estimate - total, 0)
    savings_pct = int((savings / market_price_estimate) * 100) if market_price_estimate > 0 else 0

    return {
        "total": total,
        "worker_amount": worker_amount,
        "supplier_amount": supplier_amount,
        "platform_amount": platform_amount,
        "market_price_estimate": market_price_estimate,
        "savings": savings,
        "savings_pct": savings_pct,
    }


def get_labour_discount(workers_count: int) -> float:
    """Return discount percentage for a given crew size."""
    from config import LABOUR_SLAB_MAP
    # Find the highest matching slab
    matching = [k for k in sorted(LABOUR_SLAB_MAP.keys()) if k <= workers_count]
    if not matching:
        return 0.0
    return LABOUR_SLAB_MAP[matching[-1]]
