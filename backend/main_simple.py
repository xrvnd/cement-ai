from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Create FastAPI app
app = FastAPI(
    title="Cement Plant Digital Twin API",
    description="Backend API for Cement Plant Digital Twin with AI Agent Integration",
    version="2.0.0"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://localhost:3001",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:3001"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "message": "Cement Plant Digital Twin Backend API",
        "version": "2.0.0",
        "status": "running",
        "features": [
            "Gemini AI Integration",
            "PlantGPT RAG System",
            "Cement Operations Dashboard",
            "Agentic AI Workflows"
        ]
    }

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "timestamp": "2025-09-12T00:00:00Z",
        "services": {
            "api": "connected",
            "environment": os.getenv("ENVIRONMENT", "development")
        }
    }

# Basic Gemini endpoint
@app.post("/api/v1/gemini/generate")
async def generate_response(request: dict):
    """Generate AI response using Gemini"""
    try:
        # For now, return a mock response
        return {
            "text": f"Mock AI response for: {request.get('prompt', 'No prompt provided')}",
            "confidence": 0.95,
            "recommendations": [],
            "analysis_type": request.get("analysis_type", "general"),
            "timestamp": "2025-09-12T00:00:00Z"
        }
    except Exception as e:
        return {"error": str(e)}

# Basic PlantGPT endpoint
@app.post("/api/v1/plantgpt/chat")
async def chat_with_plantgpt(request: dict):
    """Chat with PlantGPT using RAG"""
    try:
        message = request.get("message", "")
        plant = request.get("plant", "karnataka")
        
        # Plant-specific responses
        plant_responses = {
            "karnataka": {
                "response": f"PlantGPT Response for Karnataka Plant: I understand you're asking about '{message}'. Based on current data from our Karnataka facility, here's what I can tell you about our operations.",
                "suggestions": [
                    "How can I optimize raw mill efficiency?",
                    "What affects grinding media performance?",
                    "How to improve power consumption?",
                    "Show me Karnataka plant performance"
                ]
            },
            "rajasthan": {
                "response": f"PlantGPT Response for Rajasthan Plant: I understand you're asking about '{message}'. Based on current data from our Rajasthan facility, here's what I can tell you about our operations.",
                "suggestions": [
                    "How can I reduce specific power consumption?",
                    "What affects mill throughput?",
                    "How to improve energy efficiency?",
                    "Show me Rajasthan plant performance"
                ]
            }
        }
        
        plant_data = plant_responses.get(plant, plant_responses["karnataka"])
        
        return {
            "response": plant_data["response"],
            "conversation_id": f"test-conversation-{plant}-123",
            "sources": [f"{plant.title()} Plant Knowledge Base"],
            "confidence": 0.9,
            "suggestions": plant_data["suggestions"]
        }
    except Exception as e:
        return {"error": str(e)}

# Basic Dashboard endpoint
@app.get("/api/v1/dashboard/")
async def get_dashboard(plant: str = "karnataka"):
    """Get dashboard data for specific plant"""
    try:
        # Plant-specific data
        plant_data = {
            "karnataka": {
                "plant_overview": {
                    "plant_name": "JK Cement Plant",
                    "location": "Karnataka, India",
                    "capacity": {"clinker": "4000 ton/day", "cement": "4800 ton/day"},
                    "current_production": {"clinker": 3850, "cement": 4620, "utilization": 96.3},
                    "key_metrics": {
                        "energy_efficiency": 87.5,
                        "quality_index": 94.2,
                        "environmental_compliance": 98.8,
                        "safety_score": 95.1
                    }
                },
                "focus_areas": [
                    {
                        "name": "Optimize Raw Mill Efficiency",
                        "description": "Improve grinding efficiency and reduce power consumption",
                        "metrics": [
                            {
                                "name": "Raw Mill Power",
                                "current_value": 16.8,
                                "target_value": 15.5,
                                "unit": "kWh/ton",
                                "status": "good",
                                "trend": "decreasing",
                                "last_updated": "2025-09-12T00:00:00Z"
                            }
                        ],
                        "recommendations": [
                            {
                                "title": "Optimize Grinding Media Distribution",
                                "description": "Implement optimal ball size distribution for better grinding efficiency",
                                "priority": "high",
                                "category": "energy_efficiency",
                                "action_required": True,
                                "estimated_impact": "5-8% power reduction"
                            }
                        ],
                        "priority_score": 8.5
                    }
                ],
                "real_time_alerts": [
                    {
                        "id": "alert_001",
                        "type": "warning",
                        "title": "Raw Mill Power Consumption High",
                        "description": "Power consumption exceeds target by 8%",
                        "severity": "medium",
                        "timestamp": "2025-09-12T00:00:00Z",
                        "location": "Raw Mill #1",
                        "action_required": True
                    }
                ],
                "performance_summary": {
                    "overall_score": 89.2,
                    "categories": {
                        "energy_efficiency": {"score": 87.5, "trend": "improving"},
                        "quality_performance": {"score": 94.2, "trend": "stable"}
                    }
                },
                "last_updated": "2025-09-12T00:00:00Z"
            },
            "rajasthan": {
                "plant_overview": {
                    "plant_name": "JK Cement Plant",
                    "location": "Rajasthan, India",
                    "capacity": {"clinker": "3500 ton/day", "cement": "4200 ton/day"},
                    "current_production": {"clinker": 3420, "cement": 4050, "utilization": 96.4},
                    "key_metrics": {
                        "energy_efficiency": 85.2,
                        "quality_index": 92.8,
                        "environmental_compliance": 98.5,
                        "safety_score": 94.2
                    }
                },
                "focus_areas": [
                    {
                        "name": "Reduce Specific Power Consumption",
                        "description": "Optimize energy consumption across operations",
                        "metrics": [
                            {
                                "name": "Raw Mill Power",
                                "current_value": 18.5,
                                "target_value": 16.0,
                                "unit": "kWh/ton",
                                "status": "fair",
                                "trend": "decreasing",
                                "last_updated": "2025-09-12T00:00:00Z"
                            }
                        ],
                        "recommendations": [
                            {
                                "title": "Optimize Grinding Media",
                                "description": "Implement optimal ball size distribution",
                                "priority": "high",
                                "category": "energy_efficiency",
                                "action_required": True
                            }
                        ],
                        "priority_score": 9.2
                    }
                ],
                "real_time_alerts": [
                    {
                        "id": "alert_001",
                        "type": "warning",
                        "title": "Mill Power Consumption High",
                        "description": "Power consumption exceeds target",
                        "severity": "medium",
                        "timestamp": "2025-09-12T00:00:00Z",
                        "location": "Cement Mill #2",
                        "action_required": True
                    }
                ],
                "performance_summary": {
                    "overall_score": 87.5,
                    "categories": {
                        "energy_efficiency": {"score": 82.0, "trend": "improving"},
                        "quality_performance": {"score": 91.5, "trend": "stable"}
                    }
                },
                "last_updated": "2025-09-12T00:00:00Z"
            }
        }
        
        return plant_data.get(plant, plant_data["karnataka"])
    except Exception as e:
        return {"error": str(e)}

if __name__ == "__main__":
    uvicorn.run(
        "main_simple:app",
        host="0.0.0.0",
        port=int(os.getenv("PORT", 8000)),
        reload=True
    )
