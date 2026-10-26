# -*- coding: utf-8 -*-
from sqlalchemy import Column, Integer, String, Float, Boolean, ForeignKey
from sqlalchemy.orm import relationship
from database import Base


class Shop(Base):
    __tablename__ = "shops"

    id = Column(Integer, primary_key=True, index=True)
    owner_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    name = Column(String, nullable=False)
    type = Column(String, nullable=False)          # shop | supplier
    gstin = Column(String)
    address = Column(String)
    lat = Column(Float)
    lng = Column(Float)
    verified = Column(Boolean, default=True)

    owner = relationship("User", back_populates="shops")
    supplier_prices = relationship("SupplierPrice", back_populates="supplier_shop")
    worker_profiles = relationship("WorkerProfile", back_populates="shop")
