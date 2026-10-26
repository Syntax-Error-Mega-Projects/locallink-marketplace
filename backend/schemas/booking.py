# -*- coding: utf-8 -*-
from pydantic import BaseModel
from datetime import datetime
from typing import Optional, List


class BookingCreate(BaseModel):
    category_id: int
    mode: str = "home"          # home | shop | package
    scheduled_at: Optional[datetime] = None
    address: Optional[str] = None
    notes: Optional[str] = None
    service_charge: Optional[int] = None


class StatusUpdate(BaseModel):
    status: str


class BookingPartAdd(BaseModel):
    part_id: int
    supplier_shop_id: int
    qty: int = 1
    unit_price: int


class WorkerProfileOut(BaseModel):
    id: int
    user_id: int
    category_id: int
    base_rate: int
    rating: float
    available_today: bool
    experience_years: int
    bio: str

    class Config:
        from_attributes = True


class CategoryOut(BaseModel):
    id: int
    group: str
    name: str
    fee_type: str
    shop_visit_allowed: bool
    active: bool
    coming_soon: bool
    base_service_charge: int
    market_rate_estimate: int
    icon: str
    description: str

    class Config:
        from_attributes = True


class BookingOut(BaseModel):
    id: int
    customer_id: int
    worker_id: Optional[int]
    category_id: int
    mode: str
    status: str
    scheduled_at: Optional[datetime]
    address: Optional[str]
    service_charge: int
    parts_total: int
    fee: int
    total: int
    market_price_estimate: int
    savings: int
    notes: Optional[str]
    created_at: datetime

    class Config:
        from_attributes = True
