from fastapi import APIRouter, HTTPException, Depends, Request
from typing import Dict, Any, List
import logging
from app.services.agent_service import AgentService
from app.models.schemas import AgentTask, AgentResponse

logger = logging.getLogger(__name__)
router = APIRouter()

def get_agent_service(request: Request) -> AgentService:
    """Get agent service from app state"""
    return request.app.state.agent_service

@router.post("/tasks", response_model=str)
async def create_agent_task(
    task_type: str,
    description: str,
    parameters: Dict[str, Any],
    priority: int = 3,
    agent_service: AgentService = Depends(get_agent_service)
):
    """Create a new agent task"""
    try:
        task_id = await agent_service.create_task(
            task_type=task_type,
            description=description,
            parameters=parameters,
            priority=priority
        )
        return task_id
    except Exception as e:
        logger.error(f"Task creation failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/tasks/{task_id}/execute", response_model=AgentResponse)
async def execute_agent_task(
    task_id: str,
    agent_service: AgentService = Depends(get_agent_service)
):
    """Execute a specific agent task"""
    try:
        response = await agent_service.execute_task(task_id)
        return response
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        logger.error(f"Task execution failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/tasks/{task_id}/status")
async def get_task_status(
    task_id: str,
    agent_service: AgentService = Depends(get_agent_service)
):
    """Get task status"""
    try:
        status = await agent_service.get_task_status(task_id)
        return status
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        logger.error(f"Failed to get task status: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/tasks/active")
async def list_active_tasks(
    agent_service: AgentService = Depends(get_agent_service)
):
    """List all active tasks"""
    try:
        tasks = await agent_service.list_active_tasks()
        return {"active_tasks": tasks}
    except Exception as e:
        logger.error(f"Failed to list active tasks: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/kiln/optimize", response_model=AgentResponse)
async def optimize_kiln_operation(
    sensor_data: Dict[str, Any],
    agent_service: AgentService = Depends(get_agent_service)
):
    """Optimize kiln operation using AI agent"""
    try:
        response = await agent_service.optimize_kiln_operation(sensor_data)
        return response
    except Exception as e:
        logger.error(f"Kiln optimization failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/mill/optimize", response_model=AgentResponse)
async def optimize_mill_operation(
    sensor_data: Dict[str, Any],
    agent_service: AgentService = Depends(get_agent_service)
):
    """Optimize mill operation using AI agent"""
    try:
        response = await agent_service.optimize_mill_operation(sensor_data)
        return response
    except Exception as e:
        logger.error(f"Mill optimization failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/quality/control", response_model=AgentResponse)
async def control_quality_parameters(
    quality_data: Dict[str, Any],
    agent_service: AgentService = Depends(get_agent_service)
):
    """Control quality parameters using AI agent"""
    try:
        response = await agent_service.control_quality_parameters(quality_data)
        return response
    except Exception as e:
        logger.error(f"Quality control failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/fuels/optimize", response_model=AgentResponse)
async def optimize_alternate_fuels(
    fuel_data: Dict[str, Any],
    agent_service: AgentService = Depends(get_agent_service)
):
    """Optimize alternate fuel usage"""
    try:
        response = await agent_service.optimize_alternate_fuels(fuel_data)
        return response
    except Exception as e:
        logger.error(f"Fuel optimization failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/agents/status")
async def get_agents_status(
    agent_service: AgentService = Depends(get_agent_service)
):
    """Get status of all agents"""
    try:
        return {
            "agents": list(agent_service.agents.keys()),
            "active_tasks": len(agent_service.active_tasks),
            "completed_tasks": len(agent_service.task_history)
        }
    except Exception as e:
        logger.error(f"Failed to get agents status: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/health")
async def health_check(
    agent_service: AgentService = Depends(get_agent_service)
):
    """Health check for agent service"""
    try:
        return {
            "status": "healthy",
            "service": "agents",
            "available_agents": list(agent_service.agents.keys()),
            "features": ["Agentic AI", "Task Management", "Process Optimization"]
        }
    except Exception as e:
        logger.error(f"Agent service health check failed: {e}")
        raise HTTPException(status_code=503, detail="Agent service unavailable")
