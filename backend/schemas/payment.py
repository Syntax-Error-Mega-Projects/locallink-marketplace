# -*- coding: utf-8 -*-
from pydantic import BaseModel
from typing import Optional


class CreateOrderRequest(BaseModel):
    booking_id: int


class CreateOrderResponse(BaseModel):
    razorpay_order_id: str
    amount: int          # in Rs (not paise)
    currency: str
    key_id: str
    booking_id: int


class VerifyPaymentRequest(BaseModel):
    booking_id: int
    razorpay_order_id: str
    razorpay_payment_id: str
    razorpay_signature: str


class PaymentOut(BaseModel):
    id: int
    booking_id: int
    amount: int
    status: str
    worker_amount: int
    supplier_amount: int
    platform_amount: int

    class Config:
        from_attributes = True


class SavingsSummary(BaseModel):
    booking_id: int
    service_charge: int
    parts_total: int
    fee: int
    total: int
    market_price_estimate: int
    savings: int
    savings_pct: int
    worker_amount: int
    supplier_amount: int
    platform_amount: int
