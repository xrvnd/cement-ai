from fastapi import APIRouter, HTTPException, Depends
from typing import Dict, Any, Optional
import logging
from app.services.gemini_service import GeminiService
from app.models.schemas import (
    GeminiRequest, GeminiResponse, KilnAnalysisRequest, 
    MillAnalysisRequest, ProcessOptimizationRequest
)

logger = logging.getLogger(__name__)
router = APIRouter()

# Dependency to get Gemini service
def get_gemini_service() -> GeminiService:
    return GeminiService()

@router.post("/generate", response_model=GeminiResponse)
async def generate_response(
    request: GeminiRequest,
    gemini_service: GeminiService = Depends(get_gemini_service)
):
    """Generate AI response using Gemini"""
    try:
        response = await gemini_service.generate_response(
            prompt=request.prompt,
            context=request.context
        )
        return response
    except Exception as e:
        logger.error(f"Gemini generation failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/analyze/kiln", response_model=GeminiResponse)
async def analyze_kiln(
    request: KilnAnalysisRequest,
    gemini_service: GeminiService = Depends(get_gemini_service)
):
    """Analyze kiln sensor data"""
    try:
        response = await gemini_service.analyze_kiln_data(request.sensor_data)
        return response
    except Exception as e:
        logger.error(f"Kiln analysis failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/analyze/mill", response_model=GeminiResponse)
async def analyze_mill(
    request: MillAnalysisRequest,
    gemini_service: GeminiService = Depends(get_gemini_service)
):
    """Analyze mill sensor data"""
    try:
        response = await gemini_service.analyze_mill_data(request.sensor_data)
        return response
    except Exception as e:
        logger.error(f"Mill analysis failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/optimize", response_model=GeminiResponse)
async def optimize_process(
    request: ProcessOptimizationRequest,
    gemini_service: GeminiService = Depends(get_gemini_service)
):
    """Optimize cement plant processes"""
    try:
        response = await gemini_service.optimize_process(
            kiln_data=request.kiln_data,
            mill_data=request.mill_data
        )
        return response
    except Exception as e:
        logger.error(f"Process optimization failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/alert/burning-zone")
async def check_burning_zone_alert(
    temperature: float,
    gemini_service: GeminiService = Depends(get_gemini_service)
):
    """Check burning zone temperature alert"""
    try:
        response = await gemini_service.check_burning_zone_alert(temperature)
        if response:
            return {"alert": True, "response": response}
        else:
            return {"alert": False, "message": "Temperature within normal range"}
    except Exception as e:
        logger.error(f"Burning zone alert check failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/health")
async def health_check():
    """Health check for Gemini service"""
    try:
        # Test Gemini service initialization
        gemini_service = GeminiService()
        return {
            "status": "healthy",
            "service": "gemini",
            "model": gemini_service.model_name
        }
    except Exception as e:
        logger.error(f"Gemini health check failed: {e}")
        raise HTTPException(status_code=503, detail="Gemini service unavailable")
