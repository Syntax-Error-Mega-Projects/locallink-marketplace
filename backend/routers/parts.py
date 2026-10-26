# -*- coding: utf-8 -*-
import math
from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
from database import get_db
from models.part import Part, SupplierPrice
from models.shop import Shop
from models.booking import Booking
from schemas.part import PartSearchResult, SupplierPriceOut
from services.auth_service import get_current_user
from models.user import User

router = APIRouter()


def haversine(lat1, lon1, lat2, lon2) -> float:
    R = 6371.0
    phi1, phi2 = math.radians(lat1), math.radians(lat2)
    dphi = math.radians(lat2 - lat1)
    dlam = math.radians(lon2 - lon1)
    a = math.sin(dphi / 2) ** 2 + math.cos(phi1) * math.cos(phi2) * math.sin(dlam / 2) ** 2
    return 2 * R * math.asin(math.sqrt(a))


@router.get("/search", response_model=List[PartSearchResult])
def search_parts(
    q: Optional[str] = Query(None),
    lat: float = Query(18.5204),
    lng: float = Query(73.8567),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    query = db.query(SupplierPrice).join(Part).join(Shop)
    if q:
        query = query.filter(Part.name.ilike(f"%{q}%"))
    prices = query.filter(SupplierPrice.stock > 0).all()

    results = []
    for sp in prices:
        shop = sp.supplier_shop
        dist = haversine(lat, lng, shop.lat or lat, shop.lng or lng)
        results.append({
            "supplier_price_id": sp.id,
            "part_id": sp.part_id,
            "part_name": sp.part.name,
            "part_category": sp.part.category,
            "shop_id": shop.id,
            "shop_name": shop.name,
            "shop_address": shop.address or "",
            "lat": shop.lat or lat,
            "lng": shop.lng or lng,
            "distance_km": round(dist, 2),
            "price": sp.price,
            "stock": sp.stock,
            "is_cheapest": False,
        })

    # Flag cheapest per part
    cheapest_per_part: dict[int, int] = {}
    for r in results:
        pid = r["part_id"]
        if pid not in cheapest_per_part or r["price"] < results[cheapest_per_part[pid]]["price"]:
            cheapest_per_part[pid] = results.index(r)

    for idx in cheapest_per_part.values():
        results[idx]["is_cheapest"] = True

    results.sort(key=lambda x: x["distance_km"])
    return results
