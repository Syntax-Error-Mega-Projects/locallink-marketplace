# -*- coding: utf-8 -*-
from pydantic import BaseModel
from typing import List, Optional


class LabourEstimateRequest(BaseModel):
    work_type: str
    workers_count: int
    days: int
    start_date: str             # YYYY-MM-DD
    team_lead: Optional[str] = None


class SlabEntry(BaseModel):
    workers: int
    discount_pct: float


class LabourEstimateResponse(BaseModel):
    work_type: str
    workers_count: int
    days: int
    start_date: str
    team_lead: Optional[str]
    base_rate_per_worker_per_day: int
    subtotal: int
    discount_pct: float
    discount_amount: int
    total: int
    slab_table: List[SlabEntry]


class LabourBookRequest(BaseModel):
    work_type: str
    workers_count: int
    days: int
    start_date: str
    team_lead: Optional[str] = None
    address: Optional[str] = None
    notes: Optional[str] = None
