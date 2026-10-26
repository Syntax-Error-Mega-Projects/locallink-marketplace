# -*- coding: utf-8 -*-
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from database import get_db
from models.part import Part, SupplierPrice
from models.shop import Shop
from models.user import User
from schemas.part import SupplierPriceOut, SupplierPriceUpdate
from services.auth_service import require_roles

router = APIRouter()


@router.get("/prices")
def get_my_prices(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles("supplier", "admin")),
):
    shop = db.query(Shop).filter(Shop.owner_id == current_user.id).first()
    if not shop:
        return []
    prices = db.query(SupplierPrice).filter(SupplierPrice.supplier_shop_id == shop.id).all()
    result = []
    for sp in prices:
        result.append({
            "id": sp.id,
            "supplier_shop_id": sp.supplier_shop_id,
            "part_id": sp.part_id,
            "part_name": sp.part.name if sp.part else "",
            "part_category": sp.part.category if sp.part else "",
            "price": sp.price,
            "stock": sp.stock,
        })
    return result


@router.put("/prices/{price_id}")
def update_price(
    price_id: int,
    body: SupplierPriceUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles("supplier", "admin")),
):
    sp = db.query(SupplierPrice).filter(SupplierPrice.id == price_id).first()
    if not sp:
        raise HTTPException(404, "Price record not found")
    shop = db.query(Shop).filter(Shop.owner_id == current_user.id).first()
    if not shop or sp.supplier_shop_id != shop.id:
        raise HTTPException(403, "Not your shop")
    if body.price is not None:
        sp.price = body.price
    if body.stock is not None:
        sp.stock = body.stock
    db.commit()
    db.refresh(sp)
    return {"id": sp.id, "price": sp.price, "stock": sp.stock}
