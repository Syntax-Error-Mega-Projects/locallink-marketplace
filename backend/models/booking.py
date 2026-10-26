# -*- coding: utf-8 -*-
from sqlalchemy import Column, Integer, String, Float, Boolean, ForeignKey, DateTime, Text
from sqlalchemy.orm import relationship
from datetime import datetime, timezone
from database import Base


class Booking(Base):
    __tablename__ = "bookings"

    id = Column(Integer, primary_key=True, index=True)
    customer_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    worker_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    category_id = Column(Integer, ForeignKey("service_categories.id"), nullable=False)
    mode = Column(String, default="home")          # home | shop | package
    status = Column(String, default="requested")   # requested | accepted | on_the_way | in_progress | completed | paid
    scheduled_at = Column(DateTime, nullable=True)
    address = Column(String)
    service_charge = Column(Integer, default=0)
    parts_total = Column(Integer, default=0)
    fee = Column(Integer, default=50)
    total = Column(Integer, default=0)
    market_price_estimate = Column(Integer, default=0)
    savings = Column(Integer, default=0)
    notes = Column(Text)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    customer = relationship("User", foreign_keys=[customer_id], back_populates="bookings_as_customer")
    worker = relationship("User", foreign_keys=[worker_id], back_populates="bookings_as_worker")
    category = relationship("ServiceCategory", back_populates="bookings")
    labour_package = relationship("LabourPackage", back_populates="booking", uselist=False)
    booking_parts = relationship("BookingPart", back_populates="booking")
    payment = relationship("Payment", back_populates="booking", uselist=False)
    reviews = relationship("Review", back_populates="booking")


class LabourPackage(Base):
    __tablename__ = "labour_packages"

    id = Column(Integer, primary_key=True, index=True)
    booking_id = Column(Integer, ForeignKey("bookings.id"), nullable=False)
    work_type = Column(String, nullable=False)
    workers_count = Column(Integer, nullable=False)
    days = Column(Integer, nullable=False)
    start_date = Column(String, nullable=False)    # ISO date string YYYY-MM-DD
    team_lead = Column(String)
    discount_pct = Column(Float, default=0.0)

    booking = relationship("Booking", back_populates="labour_package")


class BookingPart(Base):
    __tablename__ = "booking_parts"

    id = Column(Integer, primary_key=True, index=True)
    booking_id = Column(Integer, ForeignKey("bookings.id"), nullable=False)
    part_id = Column(Integer, ForeignKey("parts.id"), nullable=False)
    supplier_shop_id = Column(Integer, ForeignKey("shops.id"), nullable=False)
    qty = Column(Integer, default=1)
    unit_price = Column(Integer, nullable=False)

    booking = relationship("Booking", back_populates="booking_parts")
    part = relationship("Part", back_populates="booking_parts")
    supplier_shop = relationship("Shop")
