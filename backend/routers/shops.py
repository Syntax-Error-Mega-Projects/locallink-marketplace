# -*- coding: utf-8 -*-
import math
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from database import get_db
from models.shop import Shop
from schemas.shop import ShopOut
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


@router.get("/nearby")
def nearby_shops(
    lat: float = Query(18.5204),
    lng: float = Query(73.8567),
    type: Optional[str] = Query(None),
    db: Session = Depends(get_db),
):
    query = db.query(Shop)
    if type:
        query = query.filter(Shop.type == type)
    shops = query.all()
    result = []
    for s in shops:
        dist = haversine(lat, lng, s.lat or lat, s.lng or lng)
        result.append({
            "id": s.id,
            "owner_id": s.owner_id,
            "name": s.name,
            "type": s.type,
            "gstin": s.gstin,
            "address": s.address,
            "lat": s.lat,
            "lng": s.lng,
            "verified": s.verified,
            "distance_km": round(dist, 2),
        })
    result.sort(key=lambda x: x["distance_km"])
    return result
