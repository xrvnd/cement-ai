from pydantic import BaseModel, Field
from typing import Dict, List, Optional, Any, Union
from datetime import datetime
from enum import Enum

# Sensor Data Models
class SensorReading(BaseModel):
    """Individual sensor reading"""
    value: float
    unit: str
    timestamp: datetime
    status: str = "normal"

class KilnSensorData(BaseModel):
    """Kiln sensor data structure"""
    temp1: Optional[SensorReading] = None  # Preheater
    temp2: Optional[SensorReading] = None  # Calciner
    temp3: Optional[SensorReading] = None  # Kiln Inlet
    burning: Optional[SensorReading] = None  # Burning Zone
    cooler: Optional[SensorReading] = None  # Cooler
    vibration: Optional[SensorReading] = None
    load: Optional[SensorReading] = None  # Motor Load
    emission: Optional[SensorReading] = None  # NOx Emissions

class MillSensorData(BaseModel):
    """Mill sensor data structure"""
    mill_feed: Optional[SensorReading] = Field(None, alias="mill-feed")
    mill_pressure: Optional[SensorReading] = Field(None, alias="mill-pressure")
    mill_particle: Optional[SensorReading] = Field(None, alias="mill-particle")
    mill_eff: Optional[SensorReading] = Field(None, alias="mill-eff")

# AI Response Models
class AIRecommendation(BaseModel):
    """AI recommendation structure"""
    title: str
    description: str
    priority: str = Field(..., regex="^(high|medium|low)$")
    category: str
    action_required: bool = False
    estimated_impact: Optional[str] = None

class GeminiResponse(BaseModel):
    """Gemini API response structure"""
    text: str
    confidence: float = Field(..., ge=0.0, le=1.0)
    recommendations: List[AIRecommendation] = []
    analysis_type: str
    timestamp: datetime

# Request Models
class GeminiRequest(BaseModel):
    """Request to Gemini API"""
    prompt: str
    context: Optional[Dict[str, Any]] = None
    analysis_type: str = "general"

class KilnAnalysisRequest(BaseModel):
    """Kiln analysis request"""
    sensor_data: KilnSensorData
    analysis_depth: str = Field("comprehensive", regex="^(basic|comprehensive|detailed)$")

class MillAnalysisRequest(BaseModel):
    """Mill analysis request"""
    sensor_data: MillSensorData
    analysis_depth: str = Field("comprehensive", regex="^(basic|comprehensive|detailed)$")

class ProcessOptimizationRequest(BaseModel):
    """Process optimization request"""
    kiln_data: Optional[KilnSensorData] = None
    mill_data: Optional[MillSensorData] = None
    optimization_goals: List[str] = []
    constraints: Optional[Dict[str, Any]] = None

# PlantGPT Models
class ChatMessage(BaseModel):
    """Chat message structure"""
    role: str = Field(..., regex="^(user|assistant|system)$")
    content: str
    timestamp: datetime
    metadata: Optional[Dict[str, Any]] = None

class PlantGPTRequest(BaseModel):
    """PlantGPT chat request"""
    message: str
    conversation_id: Optional[str] = None
    context: Optional[Dict[str, Any]] = None
    use_rag: bool = True

class PlantGPTResponse(BaseModel):
    """PlantGPT response"""
    response: str
    conversation_id: str
    sources: List[str] = []
    confidence: float
    suggestions: List[str] = []

# Dashboard Models
class OperationalMetric(BaseModel):
    """Operational metric for dashboard"""
    name: str
    current_value: float
    target_value: float
    unit: str
    status: str = Field(..., regex="^(excellent|good|fair|poor|critical)$")
    trend: str = Field(..., regex="^(increasing|decreasing|stable)$")
    last_updated: datetime

class FocusArea(BaseModel):
    """Key focus area for cement operations"""
    name: str
    description: str
    metrics: List[OperationalMetric]
    recommendations: List[AIRecommendation]
    priority_score: float = Field(..., ge=0.0, le=10.0)

class DashboardData(BaseModel):
    """Complete dashboard data"""
    plant_overview: Dict[str, Any]
    focus_areas: List[FocusArea]
    real_time_alerts: List[Dict[str, Any]]
    performance_summary: Dict[str, Any]
    last_updated: datetime

# Agent Models
class AgentTask(BaseModel):
    """Agent task definition"""
    task_id: str
    task_type: str
    description: str
    priority: int = Field(..., ge=1, le=5)
    parameters: Dict[str, Any]
    status: str = Field("pending", regex="^(pending|running|completed|failed)$")
    created_at: datetime
    completed_at: Optional[datetime] = None

class AgentResponse(BaseModel):
    """Agent execution response"""
    task_id: str
    status: str
    result: Optional[Dict[str, Any]] = None
    error_message: Optional[str] = None
    execution_time: Optional[float] = None
    recommendations: List[AIRecommendation] = []

# Cement Plant Specific Models
class QualityParameter(BaseModel):
    """Cement quality parameter"""
    parameter_name: str
    current_value: float
    target_range: Dict[str, float]  # {"min": x, "max": y}
    unit: str
    compliance_status: bool
    last_tested: datetime

class AlternateFuel(BaseModel):
    """Alternate fuel data"""
    fuel_type: str
    percentage_mix: float
    calorific_value: float
    availability: str
    cost_per_unit: float
    environmental_impact: str

class TSRData(BaseModel):
    """Thermal Substitution Rate data"""
    current_tsr: float
    target_tsr: float
    fuel_mix: List[AlternateFuel]
    optimization_potential: float
    safety_constraints: List[str]
