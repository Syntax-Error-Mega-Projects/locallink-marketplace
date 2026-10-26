# -*- coding: utf-8 -*-
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from models.booking import Booking, LabourPackage
from models.service import ServiceCategory
from models.user import User
from schemas.labour import LabourEstimateRequest, LabourEstimateResponse, LabourBookRequest
from services.auth_service import get_current_user
from services.pricing import get_labour_discount
from config import settings, SLAB_TABLE

router = APIRouter()


def _estimate(req: LabourEstimateRequest) -> dict:
    discount_pct = get_labour_discount(req.workers_count)
    base_rate = settings.LABOUR_BASE_RATE
    subtotal = base_rate * req.workers_count * req.days
    discount_amount = int(subtotal * discount_pct / 100)
    total = subtotal - discount_amount
    return {
        "work_type": req.work_type,
        "workers_count": req.workers_count,
        "days": req.days,
        "start_date": req.start_date,
        "team_lead": req.team_lead,
        "base_rate_per_worker_per_day": base_rate,
        "subtotal": subtotal,
        "discount_pct": discount_pct,
        "discount_amount": discount_amount,
        "total": total,
        "slab_table": SLAB_TABLE,
    }


@router.post("/estimate", response_model=LabourEstimateResponse)
def estimate(req: LabourEstimateRequest, current_user: User = Depends(get_current_user)):
    if req.workers_count not in [1, 2, 5, 10, 20]:
        raise HTTPException(400, "workers_count must be one of 1, 2, 5, 10, 20")
    return _estimate(req)


@router.post("/book")
def book_labour(req: LabourBookRequest, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    if current_user.role != "customer":
        raise HTTPException(403, "Only customers can book")
    if req.workers_count not in [1, 2, 5, 10, 20]:
        raise HTTPException(400, "workers_count must be one of 1, 2, 5, 10, 20")

    est_req = LabourEstimateRequest(**req.model_dump())
    est = _estimate(est_req)

    # Find labour category
    cat = db.query(ServiceCategory).filter(ServiceCategory.group == "construction_labour").first()
    if not cat:
        raise HTTPException(500, "Labour category not found in DB")

    booking = Booking(
        customer_id=current_user.id,
        category_id=cat.id,
        mode="package",
        address=req.address,
        notes=req.notes,
        service_charge=est["total"],
        parts_total=0,
        fee=settings.PLATFORM_CONVENIENCE_FEE,
        total=est["total"] + settings.PLATFORM_CONVENIENCE_FEE,
        market_price_estimate=int(est["subtotal"] * 1.2),
        savings=int(est["subtotal"] * 0.2),
        status="requested",
    )
    db.add(booking)
    db.flush()

    lp = LabourPackage(
        booking_id=booking.id,
        work_type=req.work_type,
        workers_count=req.workers_count,
        days=req.days,
        start_date=req.start_date,
        team_lead=req.team_lead,
        discount_pct=est["discount_pct"],
    )
    db.add(lp)
    db.commit()
    db.refresh(booking)
    return {
        "booking_id": booking.id,
        "total": booking.total,
        "discount_pct": est["discount_pct"],
        "status": booking.status,
    }
