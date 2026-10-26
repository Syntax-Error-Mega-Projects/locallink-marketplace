# -*- coding: utf-8 -*-
from sqlalchemy import Column, Integer, String, Boolean, DateTime
from sqlalchemy.orm import relationship
from datetime import datetime, timezone
from database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    phone = Column(String, nullable=False)
    email = Column(String, unique=True, nullable=False, index=True)
    password_hash = Column(String, nullable=False)
    role = Column(String, nullable=False)          # customer | worker | supplier | admin
    verified = Column(Boolean, default=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    bookings_as_customer = relationship(
        "Booking", foreign_keys="Booking.customer_id", back_populates="customer"
    )
    bookings_as_worker = relationship(
        "Booking", foreign_keys="Booking.worker_id", back_populates="worker"
    )
    worker_profiles = relationship("WorkerProfile", back_populates="user")
    shops = relationship("Shop", back_populates="owner")
