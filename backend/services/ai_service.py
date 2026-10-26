# -*- coding: utf-8 -*-
import os
import google.generativeai as genai
from typing import Optional, Dict, Any
from config import settings

class AIService:
    def __init__(self):
        api_key = os.getenv("GEMINI_API_KEY") or settings.GEMINI_API_KEY
        if api_key and "AQ." in api_key: # Basic check for Gemini key format
            genai.configure(api_key=api_key)
            self.model = genai.GenerativeModel('gemini-1.5-flash')
            self.enabled = True
        else:
            self.enabled = False

    async def suggest_service(self, query: str) -> Dict[str, Any]:
        """
        Takes a user query and returns a suggested service category and a reason.
        """
        if not self.enabled:
            return {
                "suggested": "AC Repair & Service", # Default fallback
                "reason": "AI assistant is not configured, showing popular service.",
                "confidence": 0
            }

        prompt = f"""
        You are a helpful assistant for 'LocalLink', a local services marketplace in India.
        The available service categories are:
        - AC Repair & Service
        - RO / Water Purifier Repair
        - Electrician
        - Plumber
        - Carpenter
        - Painter
        - Fridge / Washing Machine / TV Repair
        - Pest Control
        - Deep Cleaning
        - Maid
        - Cook
        - Driver
        - Massage / Spa at Home
        - Babysitter
        - Elder Care
        - Construction Labour
        - Lawyer
        - CA / Chartered Accountant
        - Tax Filer
        - Notary
        - Architect
        - Civil Engineer
        - Interior Designer
        - Property Surveyor
        - CCTV / Security Installer
        - Solar Consultant
        - IT Support
        - Tutor
        - Physiotherapist
        - Photographer
        - Documentation Agent

        User Query: "{query}"

        Return ONLY a JSON object with:
        "category": (exact name from the list above),
        "reason": (briefly why this fits),
        "confidence": (0 to 1)

        If no category fits, return the closest match or 'General Inquiry'.
        """

        try:
            response = self.model.generate_content(prompt)
            # Basic parsing of JSON from text response
            import json
            text = response.text.strip()
            if "```json" in text:
                text = text.split("```json")[1].split("```")[0].strip()
            elif "{" in text:
                text = text[text.find("{"):text.rfind("}")+1]

            data = json.loads(text)
            return {
                "suggested": data.get("category"),
                "reason": data.get("reason"),
                "confidence": data.get("confidence", 0.5)
            }
        except Exception as e:
            print(f"AI Service Error: {e}")
            return {
                "suggested": "General Inquiry",
                "reason": "Could not determine service automatically.",
                "confidence": 0
            }

ai_service = AIService()
