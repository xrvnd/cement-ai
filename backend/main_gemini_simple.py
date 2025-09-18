#!/usr/bin/env python3
"""
Simplified Cement Plant Digital Twin Backend with Gemini AI Integration
Compatible with Python 3.13 - Includes Kiln and Mill Analysis
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import json
import random
import time
from datetime import datetime, timedelta
from typing import Dict, List, Any, Optional
import asyncio
import os
from dotenv import load_dotenv

# Import Gemini AI
import google.generativeai as genai

# Load environment variables
load_dotenv()

# Initialize FastAPI app
app = FastAPI(
    title="Cement Plant Digital Twin API with AI Analysis",
    description="Backend for cement plant monitoring with Gemini AI analysis",
    version="2.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify exact origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize Gemini AI
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
if GEMINI_API_KEY:
    genai.configure(api_key=GEMINI_API_KEY)
    model = genai.GenerativeModel('gemini-2.0-flash')
else:
    model = None
    print("Warning: GEMINI_API_KEY not found. AI analysis will be disabled.")

# In-memory data storage
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

async def analyze_with_gemini(prompt: str) -> str:
    """Analyze data using Gemini AI"""
    if not model:
        return "AI analysis unavailable - Gemini API key not configured"
    
    try:
        response = model.generate_content(prompt)
        return response.text
    except Exception as e:
        return f"AI analysis error: {str(e)}"

def create_kiln_analysis_prompt(sensor_data: Dict[str, Any]) -> str:
    """Create detailed kiln analysis prompt"""
    current_time = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    
    # Extract sensor values
    preheater_temp = sensor_data.get("temp1", {}).get("value", 0)
    calciner_temp = sensor_data.get("temp2", {}).get("value", 0)
    kiln_inlet_temp = sensor_data.get("temp3", {}).get("value", 0)
    burning_zone_temp = sensor_data.get("burning", {}).get("value", 0)
    cooler_temp = sensor_data.get("cooler", {}).get("value", 0)
    vibration = sensor_data.get("vibration", {}).get("value", 0)
    motor_load = sensor_data.get("load", {}).get("value", 0)
    nox_emission = sensor_data.get("emission", {}).get("value", 0)
    
    return f"""
    You are an expert cement plant process engineer analyzing kiln operations for JK Cement Plant.
    
    CEMENT KILN OPERATION ANALYSIS
    Timestamp: {current_time}
    
    CURRENT SENSOR READINGS:
    - Preheater Temperature: {preheater_temp}°C (Optimal: 1200-1300°C)
    - Calciner Temperature: {calciner_temp}°C (Optimal: 1300-1400°C)
    - Kiln Inlet Temperature: {kiln_inlet_temp}°C (Optimal: 1000-1200°C)
    - Burning Zone Temperature: {burning_zone_temp}°C (Optimal: 1400-1500°C)
    - Cooler Temperature: {cooler_temp}°C (Optimal: 150-250°C)
    - Kiln Vibration: {vibration} mm/s (Alert: >3.0 mm/s)
    - Motor Load: {motor_load}% (Optimal: 70-100%)
    - NOx Emissions: {nox_emission} mg/Nm³ (Limit: <500 mg/Nm³)
    
    Please provide a comprehensive analysis including:
    1. Overall operational status assessment
    2. Temperature profile analysis and recommendations
    3. Energy efficiency evaluation
    4. Environmental compliance check
    5. Safety considerations
    6. Immediate action items (if any)
    7. Short-term optimization recommendations
    
    Focus on specific, actionable recommendations with numerical targets where applicable.
    """

def create_mill_analysis_prompt(sensor_data: Dict[str, Any]) -> str:
    """Create detailed mill analysis prompt"""
    current_time = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    
    # Extract sensor values
    feed_rate = sensor_data.get("mill-feed", {}).get("value", 0)
    pressure = sensor_data.get("mill-pressure", {}).get("value", 0)
    particle_size = sensor_data.get("mill-particle", {}).get("value", 0)
    efficiency = sensor_data.get("mill-eff", {}).get("value", 0)
    
    return f"""
    You are an expert cement plant process engineer analyzing mill operations for JK Cement Plant.
    
    CEMENT MILL OPERATION ANALYSIS
    Timestamp: {current_time}
    
    CURRENT SENSOR READINGS:
    - Feed Rate: {feed_rate} t/h (Optimal: 10-15 t/h)
    - Mill Pressure: {pressure} bar (Optimal: 1.5-2.5 bar)
    - Particle Size Distribution: {particle_size} µm (Target: 8-16 µm)
    - Grinding Efficiency: {efficiency}% (Target: >70%)
    
    Please provide a comprehensive analysis including:
    1. Mill performance assessment
    2. Grinding quality analysis (fineness, particle distribution)
    3. Energy consumption optimization potential
    4. Throughput optimization recommendations
    5. Product quality consistency evaluation
    6. Predictive maintenance insights
    7. Process control improvements
    
    Focus on:
    - Specific power consumption reduction strategies
    - Cement grinding process optimization
    - Quality parameter control recommendations
    - Equipment reliability improvements
    
    Provide actionable recommendations with measurable targets.
    """

# Initialize sensor data
sensor_data_store = generate_all_sensor_data()

@app.get("/")
async def root():
    """Root endpoint with API information"""
    return {
        "message": "Cement Plant Digital Twin API with AI Analysis",
        "version": "2.0.0",
        "status": "operational",
        "ai_enabled": model is not None,
        "timestamp": datetime.now().isoformat(),
        "endpoints": {
            "health": "/health",
            "sensors": "/api/sensors",
            "simulation": "/api/simulation",
            "mill": "/api/mill",
            "alerts": "/api/alerts",
            "kiln_analysis": "/api/analyze/kiln",
            "mill_analysis": "/api/analyze/mill",
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
            "gemini_ai": "connected" if model else "disabled",
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

@app.post("/api/analyze/kiln")
async def analyze_kiln():
    """Analyze kiln sensor data using Gemini AI"""
    try:
        # Get current sensor data
        current_sensors = await get_sensor_data()
        sensor_data = current_sensors["data"]
        
        # Create analysis prompt
        prompt = create_kiln_analysis_prompt(sensor_data)
        
        # Get AI analysis
        analysis = await analyze_with_gemini(prompt)
        
        return {
            "text": analysis,
            "confidence": 0.95,
            "recommendations": [],
            "analysis_type": "kiln_analysis",
            "timestamp": datetime.now().isoformat(),
            "sensor_data": {
                "preheater_temp": sensor_data["temp1"]["value"],
                "calciner_temp": sensor_data["temp2"]["value"],
                "kiln_inlet_temp": sensor_data["temp3"]["value"],
                "burning_zone_temp": sensor_data["burning"]["value"],
                "cooler_temp": sensor_data["cooler"]["value"],
                "vibration": sensor_data["vibration"]["value"],
                "motor_load": sensor_data["load"]["value"],
                "nox_emissions": sensor_data["emission"]["value"]
            }
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Kiln analysis failed: {str(e)}")

@app.post("/api/analyze/mill")
async def analyze_mill():
    """Analyze mill sensor data using Gemini AI"""
    try:
        # Get current sensor data
        current_sensors = await get_sensor_data()
        sensor_data = current_sensors["data"]
        
        # Create analysis prompt
        prompt = create_mill_analysis_prompt(sensor_data)
        
        # Get AI analysis
        analysis = await analyze_with_gemini(prompt)
        
        return {
            "text": analysis,
            "confidence": 0.95,
            "recommendations": [],
            "analysis_type": "mill_analysis",
            "timestamp": datetime.now().isoformat(),
            "sensor_data": {
                "feed_rate": sensor_data["mill-feed"]["value"],
                "pressure": sensor_data["mill-pressure"]["value"],
                "particle_size": sensor_data["mill-particle"]["value"],
                "efficiency": sensor_data["mill-eff"]["value"]
            }
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Mill analysis failed: {str(e)}")

@app.post("/api/v1/gemini/generate")
async def generate_gemini_response(request_data: dict):
    """Generate AI response using Gemini for general queries"""
    try:
        prompt = request_data.get("prompt", "")
        context = request_data.get("context", {})
        
        if not prompt:
            raise HTTPException(status_code=400, detail="Prompt is required")
        
        # Enhance prompt with context
        enhanced_prompt = f"""
        You are an expert cement plant process engineer with 20+ years of experience working with JK Cement Plant.
        You specialize in:
        - Rotary kiln operations and optimization
        - Raw material and cement grinding processes
        - Quality control and assurance
        - Energy efficiency and alternate fuel utilization
        - Predictive maintenance and process control
        - Environmental compliance and safety protocols
        
        Current plant context: JK Cement Plant, India
        Analysis timestamp: {datetime.now().isoformat()}
        
        Context: {json.dumps(context, indent=2)}
        
        Query: {prompt}
        
        Provide a comprehensive, actionable response with specific recommendations.
        """
        
        # Get AI analysis
        analysis = await analyze_with_gemini(enhanced_prompt)
        
        return {
            "text": analysis,
            "confidence": 0.95,
            "recommendations": [],
            "analysis_type": context.get("analysis_type", "general"),
            "timestamp": datetime.now().isoformat()
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Gemini generation failed: {str(e)}")

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

# Background task to update sensor data periodically
@app.on_event("startup")
async def startup_event():
    """Initialize background tasks"""
    print("🏭 Cement Plant Digital Twin Backend Started")
    print("🤖 Gemini AI Analysis:", "Enabled" if model else "Disabled")
    print("📊 Sensor data generation active")
    print("🌐 API available at http://localhost:8000")
    print("📖 Documentation at http://localhost:8000/docs")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main_gemini_simple:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    )
