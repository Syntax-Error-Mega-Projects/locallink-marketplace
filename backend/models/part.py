# -*- coding: utf-8 -*-
from sqlalchemy import Column, Integer, String, ForeignKey
from sqlalchemy.orm import relationship
from database import Base


class Part(Base):
    __tablename__ = "parts"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    category = Column(String, nullable=False)     # ac_parts | electrical | plumbing | ro_parts | hardware | building

    supplier_prices = relationship("SupplierPrice", back_populates="part")
    booking_parts = relationship("BookingPart", back_populates="part")


class SupplierPrice(Base):
    __tablename__ = "supplier_prices"

    id = Column(Integer, primary_key=True, index=True)
    supplier_shop_id = Column(Integer, ForeignKey("shops.id"), nullable=False)
    part_id = Column(Integer, ForeignKey("parts.id"), nullable=False)
    price = Column(Integer, nullable=False)
    stock = Column(Integer, default=50)

    supplier_shop = relationship("Shop", back_populates="supplier_prices")
    part = relationship("Part", back_populates="supplier_prices")
