from fastapi import APIRouter, HTTPException, Depends, BackgroundTasks
from typing import Dict, Any, List
import logging
from app.services.dashboard_service import DashboardService
from app.models.schemas import DashboardData, FocusArea

logger = logging.getLogger(__name__)
router = APIRouter()

def get_dashboard_service() -> DashboardService:
    """Get dashboard service instance"""
    return DashboardService()

@router.get("/", response_model=DashboardData)
async def get_dashboard(
    dashboard_service: DashboardService = Depends(get_dashboard_service)
):
    """Get comprehensive dashboard data"""
    try:
        dashboard_data = await dashboard_service.get_dashboard_data()
        return dashboard_data
    except Exception as e:
        logger.error(f"Dashboard data retrieval failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/focus-areas", response_model=List[FocusArea])
async def get_focus_areas(
    dashboard_service: DashboardService = Depends(get_dashboard_service)
):
    """Get key focus areas for cement operations"""
    try:
        dashboard_data = await dashboard_service.get_dashboard_data()
        return dashboard_data.focus_areas
    except Exception as e:
        logger.error(f"Focus areas retrieval failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/plant-overview")
async def get_plant_overview(
    dashboard_service: DashboardService = Depends(get_dashboard_service)
):
    """Get plant overview information"""
    try:
        dashboard_data = await dashboard_service.get_dashboard_data()
        return dashboard_data.plant_overview
    except Exception as e:
        logger.error(f"Plant overview retrieval failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/alerts")
async def get_real_time_alerts(
    dashboard_service: DashboardService = Depends(get_dashboard_service)
):
    """Get real-time alerts"""
    try:
        dashboard_data = await dashboard_service.get_dashboard_data()
        return {"alerts": dashboard_data.real_time_alerts}
    except Exception as e:
        logger.error(f"Alerts retrieval failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/performance-summary")
async def get_performance_summary(
    dashboard_service: DashboardService = Depends(get_dashboard_service)
):
    """Get performance summary"""
    try:
        dashboard_data = await dashboard_service.get_dashboard_data()
        return dashboard_data.performance_summary
    except Exception as e:
        logger.error(f"Performance summary retrieval failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/generate-data")
async def generate_excel_data(
    background_tasks: BackgroundTasks,
    dashboard_service: DashboardService = Depends(get_dashboard_service)
):
    """Generate Excel data files for cement operations"""
    try:
        background_tasks.add_task(dashboard_service.generate_excel_data_files)
        return {
            "message": "Excel data generation started",
            "status": "processing",
            "files": [
                "raw_grinding_operations.xlsx",
                "clinkerization_data.xlsx", 
                "quality_control_data.xlsx",
                "alternate_fuel_tsr_data.xlsx",
                "energy_efficiency_data.xlsx",
                "maintenance_reliability_data.xlsx"
            ]
        }
    except Exception as e:
        logger.error(f"Excel data generation failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/metrics/power-consumption")
async def get_power_consumption_metrics(
    dashboard_service: DashboardService = Depends(get_dashboard_service)
):
    """Get specific power consumption metrics"""
    try:
        dashboard_data = await dashboard_service.get_dashboard_data()
        
        # Extract power consumption related metrics
        power_focus_area = next(
            (fa for fa in dashboard_data.focus_areas 
             if fa.name == "Reduce Specific Power Consumption"), 
            None
        )
        
        if power_focus_area:
            return {
                "focus_area": power_focus_area.name,
                "metrics": power_focus_area.metrics,
                "recommendations": power_focus_area.recommendations,
                "priority_score": power_focus_area.priority_score
            }
        else:
            raise HTTPException(status_code=404, detail="Power consumption metrics not found")
            
    except Exception as e:
        logger.error(f"Power consumption metrics retrieval failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/metrics/fuel-efficiency")
async def get_fuel_efficiency_metrics(
    dashboard_service: DashboardService = Depends(get_dashboard_service)
):
    """Get fuel efficiency metrics"""
    try:
        dashboard_data = await dashboard_service.get_dashboard_data()
        
        # Extract fuel efficiency related metrics
        fuel_focus_area = next(
            (fa for fa in dashboard_data.focus_areas 
             if fa.name == "Improve Fuel Efficiency"), 
            None
        )
        
        if fuel_focus_area:
            return {
                "focus_area": fuel_focus_area.name,
                "metrics": fuel_focus_area.metrics,
                "recommendations": fuel_focus_area.recommendations,
                "priority_score": fuel_focus_area.priority_score
            }
        else:
            raise HTTPException(status_code=404, detail="Fuel efficiency metrics not found")
            
    except Exception as e:
        logger.error(f"Fuel efficiency metrics retrieval failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/metrics/quality-control")
async def get_quality_control_metrics(
    dashboard_service: DashboardService = Depends(get_dashboard_service)
):
    """Get quality control metrics"""
    try:
        dashboard_data = await dashboard_service.get_dashboard_data()
        
        # Extract quality control related metrics
        quality_focus_area = next(
            (fa for fa in dashboard_data.focus_areas 
             if fa.name == "Ensure Consistent Quality"), 
            None
        )
        
        if quality_focus_area:
            return {
                "focus_area": quality_focus_area.name,
                "metrics": quality_focus_area.metrics,
                "recommendations": quality_focus_area.recommendations,
                "priority_score": quality_focus_area.priority_score
            }
        else:
            raise HTTPException(status_code=404, detail="Quality control metrics not found")
            
    except Exception as e:
        logger.error(f"Quality control metrics retrieval failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/metrics/alternate-fuels")
async def get_alternate_fuels_metrics(
    dashboard_service: DashboardService = Depends(get_dashboard_service)
):
    """Get alternate fuels and TSR metrics"""
    try:
        dashboard_data = await dashboard_service.get_dashboard_data()
        
        # Extract alternate fuels related metrics
        alt_fuel_focus_area = next(
            (fa for fa in dashboard_data.focus_areas 
             if fa.name == "Maximize Alternate Fuels"), 
            None
        )
        
        if alt_fuel_focus_area:
            return {
                "focus_area": alt_fuel_focus_area.name,
                "metrics": alt_fuel_focus_area.metrics,
                "recommendations": alt_fuel_focus_area.recommendations,
                "priority_score": alt_fuel_focus_area.priority_score
            }
        else:
            raise HTTPException(status_code=404, detail="Alternate fuels metrics not found")
            
    except Exception as e:
        logger.error(f"Alternate fuels metrics retrieval failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/health")
async def health_check():
    """Health check for dashboard service"""
    try:
        dashboard_service = DashboardService()
        return {
            "status": "healthy",
            "service": "dashboard",
            "features": [
                "Focus Areas Management",
                "Real-time Metrics",
                "Performance Analytics",
                "Excel Data Generation"
            ]
        }
    except Exception as e:
        logger.error(f"Dashboard health check failed: {e}")
        raise HTTPException(status_code=503, detail="Dashboard service unavailable")
