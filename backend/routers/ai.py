# -*- coding: utf-8 -*-
from fastapi import APIRouter, Depends, HTTPException
from services.ai_service import ai_service
from pydantic import BaseModel

router = APIRouter()

class AIQuery(BaseModel):
    query: str

@router.post("/suggest")
async def suggest_service(data: AIQuery):
    if not ai_service.enabled:
        raise HTTPException(status_code=503, detail="AI Service not configured.")
    return await ai_service.suggest_service(data.query)
