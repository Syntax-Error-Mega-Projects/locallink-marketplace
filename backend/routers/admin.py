# -*- coding: utf-8 -*-
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List
from database import get_db
from models.user import User
from schemas.admin import VerificationRecord
from services.auth_service import require_roles

router = APIRouter()


@router.get("/verifications", response_model=List[VerificationRecord])
def get_verifications(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles("admin")),
):
    return db.query(User).order_by(User.created_at.desc()).all()
