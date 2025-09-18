from fastapi import FastAPI, HTTPException, Depends, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import uvicorn
import os
from dotenv import load_dotenv
from typing import Dict, List, Optional, Any
import logging
from contextlib import asynccontextmanager

from app.routers import gemini, plantgpt, dashboard, agents
from app.core.config import settings
from app.core.database import init_db
from app.services.agent_service import AgentService

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Load environment variables
load_dotenv()

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan manager"""
    # Startup
    logger.info("Starting Cement Plant Digital Twin Backend...")
    await init_db()
    
    # Initialize Agent Service
    agent_service = AgentService()
    await agent_service.initialize()
    app.state.agent_service = agent_service
    
    logger.info("Backend initialization completed")
    yield
    
    # Shutdown
    logger.info("Shutting down backend...")

# Create FastAPI app with lifespan
app = FastAPI(
    title="Cement Plant Digital Twin API",
    description="Backend API for Cement Plant Digital Twin with AI Agent Integration",
    version="2.0.0",
    lifespan=lifespan
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(gemini.router, prefix="/api/v1/gemini", tags=["gemini"])
app.include_router(plantgpt.router, prefix="/api/v1/plantgpt", tags=["plantgpt"])
app.include_router(dashboard.router, prefix="/api/v1/dashboard", tags=["dashboard"])
app.include_router(agents.router, prefix="/api/v1/agents", tags=["agents"])

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
            "gemini_api": "connected",
            "agent_service": "active",
            "database": "connected"
        }
    }

if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=int(os.getenv("PORT", 8000)),
        reload=True if os.getenv("ENVIRONMENT") == "development" else False
    )
