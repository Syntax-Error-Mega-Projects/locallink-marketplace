# -*- coding: utf-8 -*-
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from config import settings
from database import engine, Base

# Import all models so they are registered with Base before create_all
import models  # noqa: F401

from routers import auth, categories, bookings, labour, parts, shops, payments, supplier, admin, ai

Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="LocalLink API",
    description="Verified local-services marketplace  customers, workers, suppliers",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[o.strip() for o in settings.CORS_ORIGINS.split(",")],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router,       prefix="/api/auth",       tags=["auth"])
app.include_router(categories.router, prefix="/api/categories", tags=["categories"])
app.include_router(bookings.router,   prefix="/api/bookings",   tags=["bookings"])
app.include_router(labour.router,     prefix="/api/labour",     tags=["labour"])
app.include_router(parts.router,      prefix="/api/parts",      tags=["parts"])
app.include_router(shops.router,      prefix="/api/shops",      tags=["shops"])
app.include_router(payments.router,   prefix="/api/payments",   tags=["payments"])
app.include_router(supplier.router,   prefix="/api/supplier",   tags=["supplier"])
app.include_router(admin.router,      prefix="/api/admin",      tags=["admin"])
app.include_router(ai.router,         prefix="/api/ai",         tags=["ai"])


@app.get("/", tags=["health"])
def root():
    return {"status": "ok", "service": "LocalLink API", "docs": "/docs"}
