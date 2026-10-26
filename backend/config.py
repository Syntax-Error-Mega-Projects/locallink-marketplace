# -*- coding: utf-8 -*-
from pydantic_settings import BaseSettings
from typing import Optional


class Settings(BaseSettings):
    DATABASE_URL: str = "sqlite:///./locallink.db"
    SECRET_KEY: str = "dev-secret-change-in-production-32ch"
    JWT_ALGORITHM: str = "HS256"
    JWT_EXPIRE_DAYS: int = 7
    WORKER_COMMISSION_RATE: float = 0.10
    SUPPLIER_COMMISSION_RATE: float = 0.03
    PLATFORM_CONVENIENCE_FEE: int = 50
    RAZORPAY_KEY_ID: str = "rzp_test_placeholder"
    RAZORPAY_KEY_SECRET: str = "placeholder_secret"
    CORS_ORIGINS: str = "http://localhost:5173"

    # Labour discount slabs (workers: discount_pct)
    LABOUR_BASE_RATE: int = 800  # Rs per worker per day
    LABOUR_SLABS: str = "1:0,2:3,5:5,10:10,20:15"

    class Config:
        env_file = ".env"
        extra = "ignore"


settings = Settings()

LABOUR_SLAB_MAP: dict[int, float] = {}
for slab in settings.LABOUR_SLABS.split(","):
    workers, pct = slab.split(":")
    LABOUR_SLAB_MAP[int(workers)] = float(pct)

SLAB_TABLE = sorted(
    [{"workers": int(k), "discount_pct": float(v)} for k, v in (s.split(":") for s in settings.LABOUR_SLABS.split(","))],
    key=lambda x: x["workers"]
)
