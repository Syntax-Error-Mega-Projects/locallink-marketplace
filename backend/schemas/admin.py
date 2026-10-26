# -*- coding: utf-8 -*-
from pydantic import BaseModel
from datetime import datetime
from typing import Optional


class VerificationRecord(BaseModel):
    user_id: int
    name: str
    email: str
    role: str
    phone: str
    verified: bool
    created_at: datetime

    class Config:
        from_attributes = True
