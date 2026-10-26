# -*- coding: utf-8 -*-
from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from typing import List, Optional
from database import get_db
from models.booking import Booking, BookingPart
from models.service import ServiceCategory, WorkerProfile
from models.user import User
from schemas.booking import BookingCreate, StatusUpdate, BookingPartAdd, BookingOut
from services.auth_service import get_current_user
from services.pricing import calculate_split
from config import settings

router = APIRouter()

VALID_TRANSITIONS = {
    "requested": ["accepted"],
    "accepted": ["on_the_way"],
    "on_the_way": ["in_progress"],
    "in_progress": ["completed"],
    "completed": ["paid"],
}


@router.post("", response_model=BookingOut)
def create_booking(body: BookingCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    if current_user.role != "customer":
        raise HTTPException(403, "Only customers can create bookings")
    cat = db.query(ServiceCategory).filter(ServiceCategory.id == body.category_id).first()
    if not cat:
        raise HTTPException(404, "Category not found")

    sc = body.service_charge if body.service_charge is not None else cat.base_service_charge
    if body.mode == "shop":
        sc = int(sc * 0.9)   # 10% shop-visit discount

    total = sc + settings.PLATFORM_CONVENIENCE_FEE
    split = calculate_split(sc, 0, settings.PLATFORM_CONVENIENCE_FEE, cat.market_rate_estimate)

    booking = Booking(
        customer_id=current_user.id,
        category_id=body.category_id,
        mode=body.mode,
        scheduled_at=body.scheduled_at,
        address=body.address,
        notes=body.notes,
        service_charge=sc,
        parts_total=0,
        fee=settings.PLATFORM_CONVENIENCE_FEE,
        total=total,
        market_price_estimate=cat.market_rate_estimate,
        savings=split["savings"],
        status="requested",
    )
    db.add(booking)
    db.commit()
    db.refresh(booking)
    return booking


@router.get("", response_model=List[BookingOut])
def list_bookings(
    available: Optional[bool] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if current_user.role == "admin":
        return db.query(Booking).all()

    if current_user.role == "worker":
        if available:
            # Show all requested bookings for this worker's categories
            profile_cat_ids = [p.category_id for p in db.query(WorkerProfile).filter(WorkerProfile.user_id == current_user.id).all()]
            return db.query(Booking).filter(
                Booking.category_id.in_(profile_cat_ids),
                Booking.status == "requested",
                Booking.worker_id == None,
            ).all()
        return db.query(Booking).filter(Booking.worker_id == current_user.id).all()

    return db.query(Booking).filter(Booking.customer_id == current_user.id).all()


@router.get("/{booking_id}", response_model=BookingOut)
def get_booking(booking_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    booking = db.query(Booking).filter(Booking.id == booking_id).first()
    if not booking:
        raise HTTPException(404, "Booking not found")
    return booking


@router.post("/{booking_id}/accept", response_model=BookingOut)
def accept_booking(booking_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    if current_user.role != "worker":
        raise HTTPException(403, "Only workers can accept bookings")
    booking = db.query(Booking).filter(Booking.id == booking_id).first()
    if not booking:
        raise HTTPException(404, "Booking not found")
    if booking.status != "requested":
        raise HTTPException(400, "Booking is not in requested status")
    booking.worker_id = current_user.id
    booking.status = "accepted"
    db.commit()
    db.refresh(booking)
    return booking


@router.post("/{booking_id}/status", response_model=BookingOut)
def update_status(booking_id: int, body: StatusUpdate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    booking = db.query(Booking).filter(Booking.id == booking_id).first()
    if not booking:
        raise HTTPException(404, "Booking not found")
    allowed = VALID_TRANSITIONS.get(booking.status, [])
    if body.status not in allowed:
        raise HTTPException(400, f"Cannot transition from {booking.status} to {body.status}")
    booking.status = body.status
    db.commit()
    db.refresh(booking)
    return booking


@router.post("/{booking_id}/parts", response_model=BookingOut)
def add_parts(booking_id: int, parts: List[BookingPartAdd], db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    booking = db.query(Booking).filter(Booking.id == booking_id).first()
    if not booking:
        raise HTTPException(404, "Booking not found")

    parts_total = 0
    for p in parts:
        bp = BookingPart(
            booking_id=booking_id,
            part_id=p.part_id,
            supplier_shop_id=p.supplier_shop_id,
            qty=p.qty,
            unit_price=p.unit_price,
        )
        db.add(bp)
        parts_total += p.qty * p.unit_price

    booking.parts_total += parts_total
    booking.total = booking.service_charge + booking.parts_total + booking.fee
    split = calculate_split(booking.service_charge, booking.parts_total, booking.fee, booking.market_price_estimate)
    booking.savings = split["savings"]
    db.commit()
    db.refresh(booking)
    return booking
