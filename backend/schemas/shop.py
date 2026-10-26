# -*- coding: utf-8 -*-
from pydantic import BaseModel
from typing import Optional


class ShopOut(BaseModel):
    id: int
    owner_id: int
    name: str
    type: str
    gstin: Optional[str]
    address: Optional[str]
    lat: Optional[float]
    lng: Optional[float]
    verified: bool
    distance_km: Optional[float] = None

    class Config:
        from_attributes = True
