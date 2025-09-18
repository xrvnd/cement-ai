#!/usr/bin/env python3
"""
Simplified Cement Plant Digital Twin Backend
Compatible with Python 3.13 - No external AI dependencies
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from contextlib import asynccontextmanager
import json
import random
import time
from datetime import datetime, timedelta
from typing import Dict, List, Any, Optional
import asyncio
import os

# Lifespan event handler
@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    print("🏭 Cement Plant Digital Twin Backend Started")
    print("📊 Sensor data generation active")
    print("🌐 API available at http://localhost:8000")
    print("📖 Documentation at http://localhost:8000/docs")
    yield
    # Shutdown
    print("🛑 Backend shutting down...")

# Initialize FastAPI app with lifespan
app = FastAPI(
    title="Cement Plant Digital Twin API",
    description="Simplified backend for cement plant monitoring and control",
    version="2.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify exact origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# In-memory data storage (replace with database in production)
sensor_data_store = {}
simulation_data_store = []
mill_data_store = []
alerts_store = []

# Sensor configuration
SENSORS = {
    "temp1": {"name": "Preheater Temperature", "unit": "°C", "min": 1200, "max": 1300, "optimal": 1245},
    "temp2": {"name": "Calciner Temperature", "unit": "°C", "min": 1300, "max": 1400, "optimal": 1350},
    "temp3": {"name": "Kiln Inlet Temperature", "unit": "°C", "min": 1000, "max": 1200, "optimal": 1120},
    "burning": {"name": "Burning Zone Temperature", "unit": "°C", "min": 1400, "max": 1500, "optimal": 1450},
    "cooler": {"name": "Cooler Temperature", "unit": "°C", "min": 150, "max": 250, "optimal": 180},
    "load": {"name": "Motor Load", "unit": "%", "min": 70, "max": 100, "optimal": 87},
    "vibration": {"name": "Kiln Vibration", "unit": "mm/s", "min": 1.5, "max": 4.0, "optimal": 2.3},
    "emission": {"name": "NOx Emissions", "unit": "mg/Nm³", "min": 200, "max": 300, "optimal": 245},
    "particle-emission": {"name": "Particulate Emissions", "unit": "mg/Nm³", "min": 30, "max": 60, "optimal": 45},
    "mill-feed": {"name": "Mill Feed Rate", "unit": "t/h", "min": 10, "max": 15, "optimal": 12.4},
    "mill-pressure": {"name": "Mill Pressure", "unit": "bar", "min": 1.5, "max": 2.5, "optimal": 2.1},
    "mill-particle": {"name": "Particle Size", "unit": "µm", "min": 8, "max": 16, "optimal": 12},
    "mill-eff": {"name": "Mill Efficiency", "unit": "%", "min": 70, "max": 90, "optimal": 78},
    "stack-flow": {"name": "Stack Gas Flow", "unit": "Nm³/h", "min": 1000, "max": 1500, "optimal": 1250},
}

def generate_sensor_value(sensor_id: str, base_value: Optional[float] = None) -> Dict[str, Any]:
    """Generate realistic sensor data with trends"""
    config = SENSORS[sensor_id]
    
    if base_value is None:
        base_value = config["optimal"]
    
    # Add some realistic variation
    variation = (config["max"] - config["min"]) * 0.05  # 5% variation
    value = base_value + random.uniform(-variation, variation)
    
    # Ensure within bounds
    value = max(config["min"], min(config["max"], value))
    
    # Determine trend
    if value > config["optimal"] * 1.1:
        trend = "up"
    elif value < config["optimal"] * 0.9:
        trend = "down"
    else:
        trend = "stable"
    
    return {
        "value": round(value, 2),
        "unit": config["unit"],
        "trend": trend,
        "timestamp": datetime.now().isoformat(),
        "status": "normal" if abs(value - config["optimal"]) < variation else "warning"
    }

def generate_all_sensor_data() -> Dict[str, Any]:
    """Generate data for all sensors"""
    return {sensor_id: generate_sensor_value(sensor_id) for sensor_id in SENSORS.keys()}

# Initialize sensor data
sensor_data_store = generate_all_sensor_data()

@app.get("/")
async def root():
    """Root endpoint with API information"""
    return {
        "message": "Cement Plant Digital Twin API",
        "version": "2.0.0",
        "status": "operational",
        "timestamp": datetime.now().isoformat(),
        "endpoints": {
            "health": "/health",
            "sensors": "/api/sensors",
            "simulation": "/api/simulation",
            "mill": "/api/mill",
            "alerts": "/api/alerts",
            "docs": "/docs"
        }
    }

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "timestamp": datetime.now().isoformat(),
        "uptime": "operational",
        "services": {
            "api": "running",
            "sensors": "active",
            "data_generation": "active"
        }
    }

@app.get("/api/sensors")
async def get_sensor_data():
    """Get current sensor data"""
    global sensor_data_store
    
    # Update sensor data with some variation
    for sensor_id in SENSORS.keys():
        current_value = sensor_data_store[sensor_id]["value"]
        sensor_data_store[sensor_id] = generate_sensor_value(sensor_id, current_value)
    
    return {
        "status": "success",
        "timestamp": datetime.now().isoformat(),
        "data": sensor_data_store
    }

@app.get("/api/sensors/{sensor_id}")
async def get_specific_sensor(sensor_id: str):
    """Get data for a specific sensor"""
    if sensor_id not in SENSORS:
        raise HTTPException(status_code=404, detail=f"Sensor {sensor_id} not found")
    
    return {
        "status": "success",
        "sensor_id": sensor_id,
        "data": sensor_data_store[sensor_id]
    }

@app.get("/api/simulation")
async def get_simulation_data():
    """Get kiln simulation data"""
    # Generate realistic kiln simulation data
    simulation_point = {
        "timestamp": datetime.now().isoformat(),
        "kiln_speed": round(random.uniform(2.8, 3.2), 2),
        "feed_rate": round(random.uniform(180, 220), 1),
        "fuel_rate": round(random.uniform(15, 25), 2),
        "oxygen_level": round(random.uniform(2.5, 4.0), 2),
        "pressure_drop": round(random.uniform(15, 25), 1),
        "clinker_temperature": round(random.uniform(1200, 1300), 1),
        "production_rate": round(random.uniform(4800, 5200), 0),
        "energy_consumption": round(random.uniform(3200, 3800), 0),
        "efficiency": round(random.uniform(85, 95), 1)
    }
    
    simulation_data_store.append(simulation_point)
    
    # Keep only last 100 points
    if len(simulation_data_store) > 100:
        simulation_data_store.pop(0)
    
    return {
        "status": "success",
        "timestamp": datetime.now().isoformat(),
        "data": simulation_data_store[-20:],  # Return last 20 points
        "latest": simulation_point
    }

@app.get("/api/mill")
async def get_mill_data():
    """Get mill operation data"""
    # Generate realistic mill data
    mill_point = {
        "timestamp": datetime.now().isoformat(),
        "mill_1_load": round(random.uniform(85, 95), 1),
        "mill_2_load": round(random.uniform(80, 90), 1),
        "separator_efficiency": round(random.uniform(75, 85), 1),
        "fineness": round(random.uniform(3200, 3800), 0),
        "moisture_content": round(random.uniform(0.5, 1.2), 2),
        "power_consumption": round(random.uniform(2800, 3200), 0),
        "production_rate": round(random.uniform(95, 105), 1),
        "bag_filter_pressure": round(random.uniform(1200, 1400), 0)
    }
    
    mill_data_store.append(mill_point)
    
    # Keep only last 100 points
    if len(mill_data_store) > 100:
        mill_data_store.pop(0)
    
    return {
        "status": "success",
        "timestamp": datetime.now().isoformat(),
        "data": mill_data_store[-20:],  # Return last 20 points
        "latest": mill_point
    }

@app.get("/api/alerts")
async def get_alerts():
    """Get system alerts and warnings"""
    # Generate some sample alerts based on sensor data
    alerts = []
    
    for sensor_id, data in sensor_data_store.items():
        config = SENSORS[sensor_id]
        value = data["value"]
        
        if value > config["optimal"] * 1.15:
            alerts.append({
                "id": f"alert_{sensor_id}_{int(time.time())}",
                "type": "warning",
                "sensor": sensor_id,
                "message": f"{config['name']} is above optimal range: {value} {config['unit']}",
                "timestamp": datetime.now().isoformat(),
                "severity": "medium"
            })
        elif value < config["optimal"] * 0.85:
            alerts.append({
                "id": f"alert_{sensor_id}_{int(time.time())}",
                "type": "warning", 
                "sensor": sensor_id,
                "message": f"{config['name']} is below optimal range: {value} {config['unit']}",
                "timestamp": datetime.now().isoformat(),
                "severity": "medium"
            })
    
    return {
        "status": "success",
        "timestamp": datetime.now().isoformat(),
        "alerts": alerts,
        "count": len(alerts)
    }

@app.post("/api/sensors/{sensor_id}/calibrate")
async def calibrate_sensor(sensor_id: str, target_value: float):
    """Calibrate a sensor to a target value"""
    if sensor_id not in SENSORS:
        raise HTTPException(status_code=404, detail=f"Sensor {sensor_id} not found")
    
    config = SENSORS[sensor_id]
    if target_value < config["min"] or target_value > config["max"]:
        raise HTTPException(
            status_code=400, 
            detail=f"Target value must be between {config['min']} and {config['max']}"
        )
    
    # Update sensor with calibrated value
    sensor_data_store[sensor_id] = generate_sensor_value(sensor_id, target_value)
    
    return {
        "status": "success",
        "message": f"Sensor {sensor_id} calibrated to {target_value} {config['unit']}",
        "data": sensor_data_store[sensor_id]
    }

@app.get("/api/dashboard/summary")
async def get_dashboard_summary():
    """Get dashboard summary data"""
    # Calculate overall plant efficiency
    efficiency_sensors = ["mill-eff", "load"]
    avg_efficiency = sum(sensor_data_store[s]["value"] for s in efficiency_sensors) / len(efficiency_sensors)
    
    # Count alerts
    alerts = await get_alerts()
    alert_count = alerts["count"]
    
    # Production estimate
    production_rate = sensor_data_store["mill-feed"]["value"] * 24  # tons per day
    
    return {
        "status": "success",
        "timestamp": datetime.now().isoformat(),
        "summary": {
            "overall_efficiency": round(avg_efficiency, 1),
            "production_rate_daily": round(production_rate, 0),
            "active_alerts": alert_count,
            "system_status": "operational" if alert_count < 3 else "warning",
            "uptime": "99.2%",
            "energy_consumption": round(random.uniform(3200, 3800), 0),
            "co2_emissions": round(random.uniform(850, 950), 0)
        }
    }

# Add missing Gemini endpoint for frontend compatibility
@app.post("/api/v1/gemini/generate")
async def generate_gemini_response(request_data: dict):
    """Generate AI response using mock Gemini for frontend compatibility"""
    try:
        prompt = request_data.get("prompt", "")
        context = request_data.get("context", {})
        
        if not prompt:
            return {
                "text": "Please provide a prompt for analysis.",
                "confidence": 0.0,
                "recommendations": [],
                "analysis_type": "general",
                "timestamp": datetime.now().isoformat()
            }
        
        # Mock AI response based on prompt content
        if "kiln" in prompt.lower():
            response_text = f"Kiln Analysis: Based on current sensor data, the kiln is operating within normal parameters. Temperature profile shows optimal burning zone conditions. Recommend monitoring fuel efficiency and maintaining current operating parameters."
        elif "mill" in prompt.lower():
            response_text = f"Mill Analysis: Mill performance is stable with {sensor_data_store.get('mill-eff', {}).get('value', 78)}% efficiency. Grinding quality is consistent. Consider optimizing feed rate for better energy efficiency."
        elif "optimization" in prompt.lower():
            response_text = f"Optimization Analysis: Current plant efficiency is {sensor_data_store.get('load', {}).get('value', 87)}%. Focus areas include energy consumption reduction and quality consistency improvement."
        else:
            response_text = f"General Analysis: Plant operations are stable. Current efficiency metrics show good performance. Continue monitoring key parameters for optimal operation."
        
        return {
            "text": response_text,
            "confidence": 0.85,
            "recommendations": [
                "Monitor temperature profiles",
                "Optimize energy consumption",
                "Maintain quality standards"
            ],
            "analysis_type": context.get("analysis_type", "general"),
            "timestamp": datetime.now().isoformat()
        }
        
    except Exception as e:
        return {
            "text": f"Analysis error: {str(e)}",
            "confidence": 0.0,
            "recommendations": [],
            "analysis_type": "error",
            "timestamp": datetime.now().isoformat()
        }

# Background task to update sensor data periodically
# (Startup messages now handled by lifespan event handler)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main_simple_fixed:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    )
