# -*- coding: utf-8 -*-
from pydantic import BaseModel
from typing import Optional, List


class PartSearchResult(BaseModel):
    supplier_price_id: int
    part_id: int
    part_name: str
    part_category: str
    shop_id: int
    shop_name: str
    shop_address: str
    lat: float
    lng: float
    distance_km: float
    price: int
    stock: int
    is_cheapest: bool


class SupplierPriceOut(BaseModel):
    id: int
    supplier_shop_id: int
    part_id: int
    part_name: str
    price: int
    stock: int

    class Config:
        from_attributes = True


class SupplierPriceUpdate(BaseModel):
    price: Optional[int] = None
    stock: Optional[int] = None
