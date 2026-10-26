# -*- coding: utf-8 -*-
from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from database import get_db
from models.booking import Booking
from models.payment import Payment
from models.user import User
from schemas.payment import CreateOrderRequest, CreateOrderResponse, VerifyPaymentRequest, PaymentOut, SavingsSummary
from services.auth_service import get_current_user
from services.razorpay_service import create_order, verify_signature
from services.pricing import calculate_split
from config import settings

router = APIRouter()


@router.post("/create-order", response_model=CreateOrderResponse)
def create_payment_order(
    body: CreateOrderRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    booking = db.query(Booking).filter(Booking.id == body.booking_id).first()
    if not booking:
        raise HTTPException(404, "Booking not found")
    if booking.customer_id != current_user.id and current_user.role != "admin":
        raise HTTPException(403, "Not your booking")

    order = create_order(booking.total, booking.id)
    return {
        "razorpay_order_id": order["razorpay_order_id"],
        "amount": booking.total,
        "currency": "INR",
        "key_id": settings.RAZORPAY_KEY_ID,
        "booking_id": booking.id,
    }


@router.post("/verify", response_model=PaymentOut)
def verify_payment(
    body: VerifyPaymentRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    booking = db.query(Booking).filter(Booking.id == body.booking_id).first()
    if not booking:
        raise HTTPException(404, "Booking not found")

    if not verify_signature(body.razorpay_order_id, body.razorpay_payment_id, body.razorpay_signature):
        raise HTTPException(400, "Payment signature verification failed")

    split = calculate_split(
        booking.service_charge,
        booking.parts_total,
        booking.fee,
        booking.market_price_estimate,
    )

    payment = Payment(
        booking_id=booking.id,
        amount=booking.total,
        status="paid",
        razorpay_order_id=body.razorpay_order_id,
        razorpay_payment_id=body.razorpay_payment_id,
        worker_amount=split["worker_amount"],
        supplier_amount=split["supplier_amount"],
        platform_amount=split["platform_amount"],
    )
    db.add(payment)
    booking.status = "paid"
    booking.savings = split["savings"]
    db.commit()
    db.refresh(payment)
    return payment


@router.get("/savings/{booking_id}", response_model=SavingsSummary)
def savings_summary(
    booking_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    booking = db.query(Booking).filter(Booking.id == booking_id).first()
    if not booking:
        raise HTTPException(404, "Booking not found")
    split = calculate_split(
        booking.service_charge,
        booking.parts_total,
        booking.fee,
        booking.market_price_estimate,
    )
    return {
        "booking_id": booking.id,
        "service_charge": booking.service_charge,
        "parts_total": booking.parts_total,
        "fee": booking.fee,
        "total": booking.total,
        **split,
    }
