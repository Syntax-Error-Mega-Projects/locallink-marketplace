# -*- coding: utf-8 -*-
from pydantic import BaseModel
from datetime import datetime
from typing import Optional


class UserRegister(BaseModel):
    name: str
    phone: str
    email: str
    password: str
    role: str = "customer"   # customer | worker | supplier | admin


class UserLogin(BaseModel):
    email: str
    password: str


class UserOut(BaseModel):
    id: int
    name: str
    phone: str
    email: str
    role: str
    verified: bool
    created_at: datetime

    class Config:
        from_attributes = True


class TokenResponse(BaseModel):
    token: str
    user: UserOut
