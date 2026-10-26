# -*- coding: utf-8 -*-
from sqlalchemy import Column, Integer, String, Float, Boolean, ForeignKey
from sqlalchemy.orm import relationship
from database import Base


class ServiceCategory(Base):
    __tablename__ = "service_categories"

    id = Column(Integer, primary_key=True, index=True)
    group = Column(String, nullable=False)          # home_repair | household_personal | construction_labour | professional_services
    name = Column(String, nullable=False)
    fee_type = Column(String, nullable=False)       # fixed | hourly | monthly | per_day | per_consultation
    shop_visit_allowed = Column(Boolean, default=False)
    active = Column(Boolean, default=True)
    coming_soon = Column(Boolean, default=False)
    base_service_charge = Column(Integer, default=500)
    market_rate_estimate = Column(Integer, default=1000)
    icon = Column(String, default="??")
    description = Column(String, default="")

    workers = relationship("WorkerProfile", back_populates="category")
    bookings = relationship("Booking", back_populates="category")


class WorkerProfile(Base):
    __tablename__ = "worker_profiles"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    category_id = Column(Integer, ForeignKey("service_categories.id"), nullable=False)
    shop_id = Column(Integer, ForeignKey("shops.id"), nullable=True)
    base_rate = Column(Integer, default=500)
    rating = Column(Float, default=4.5)
    available_today = Column(Boolean, default=True)
    experience_years = Column(Integer, default=3)
    bio = Column(String, default="")

    user = relationship("User", back_populates="worker_profiles")
    category = relationship("ServiceCategory", back_populates="workers")
    shop = relationship("Shop", back_populates="worker_profiles")
