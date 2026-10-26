# -*- coding: utf-8 -*-
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List
from database import get_db
from models.service import ServiceCategory, WorkerProfile
from models.user import User
from schemas.booking import CategoryOut, WorkerProfileOut

router = APIRouter()


@router.get("", response_model=List[CategoryOut])
def list_categories(db: Session = Depends(get_db)):
    return db.query(ServiceCategory).order_by(ServiceCategory.group, ServiceCategory.id).all()


@router.get("/{category_id}/providers")
def list_providers(category_id: int, db: Session = Depends(get_db)):
    profiles = (
        db.query(WorkerProfile)
        .filter(WorkerProfile.category_id == category_id)
        .all()
    )
    result = []
    for p in profiles:
        user = db.query(User).filter(User.id == p.user_id).first()
        result.append({
            "id": p.id,
            "user_id": p.user_id,
            "name": user.name if user else "",
            "phone": user.phone if user else "",
            "verified": user.verified if user else False,
            "category_id": p.category_id,
            "base_rate": p.base_rate,
            "rating": p.rating,
            "available_today": p.available_today,
            "experience_years": p.experience_years,
            "bio": p.bio,
        })
    return result
