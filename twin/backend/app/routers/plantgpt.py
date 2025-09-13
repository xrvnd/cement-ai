from fastapi import APIRouter, HTTPException, Depends, BackgroundTasks
from typing import Dict, Any, List
import logging
from app.services.rag_service import RAGService
from app.models.schemas import PlantGPTRequest, PlantGPTResponse, ChatMessage

logger = logging.getLogger(__name__)
router = APIRouter()

# Global RAG service instance
rag_service = None

async def get_rag_service() -> RAGService:
    """Get RAG service instance"""
    global rag_service
    if rag_service is None:
        rag_service = RAGService()
        await rag_service.initialize_knowledge_base()
    return rag_service

@router.post("/chat", response_model=PlantGPTResponse)
async def chat_with_plantgpt(
    request: PlantGPTRequest,
    rag_service: RAGService = Depends(get_rag_service)
):
    """Chat with PlantGPT using RAG"""
    try:
        response = await rag_service.chat_with_plantgpt(request)
        return response
    except Exception as e:
        logger.error(f"PlantGPT chat failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/conversations/{conversation_id}/history", response_model=List[ChatMessage])
async def get_conversation_history(
    conversation_id: str,
    rag_service: RAGService = Depends(get_rag_service)
):
    """Get conversation history"""
    try:
        history = await rag_service.get_conversation_history(conversation_id)
        return history
    except Exception as e:
        logger.error(f"Failed to get conversation history: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/conversations/{conversation_id}")
async def clear_conversation(
    conversation_id: str,
    rag_service: RAGService = Depends(get_rag_service)
):
    """Clear conversation history"""
    try:
        await rag_service.clear_conversation(conversation_id)
        return {"message": "Conversation cleared successfully"}
    except Exception as e:
        logger.error(f"Failed to clear conversation: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/knowledge/search")
async def search_knowledge_base(
    query: str,
    n_results: int = 5,
    rag_service: RAGService = Depends(get_rag_service)
):
    """Search the knowledge base"""
    try:
        results = await rag_service.query_knowledge_base(query, n_results)
        return {"results": results}
    except Exception as e:
        logger.error(f"Knowledge base search failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/knowledge/add")
async def add_knowledge_document(
    title: str,
    content: str,
    category: str,
    tags: List[str],
    rag_service: RAGService = Depends(get_rag_service)
):
    """Add a new document to the knowledge base"""
    try:
        doc_id = await rag_service.add_document(title, content, category, tags)
        return {"document_id": doc_id, "message": "Document added successfully"}
    except Exception as e:
        logger.error(f"Failed to add document: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/health")
async def health_check():
    """Health check for PlantGPT service"""
    try:
        # Test RAG service
        global rag_service
        if rag_service is None:
            rag_service = RAGService()
            await rag_service.initialize_knowledge_base()
        
        return {
            "status": "healthy",
            "service": "plantgpt",
            "features": ["RAG", "Knowledge Base", "Conversation Management"]
        }
    except Exception as e:
        logger.error(f"PlantGPT health check failed: {e}")
        raise HTTPException(status_code=503, detail="PlantGPT service unavailable")

@router.get("/capabilities")
async def get_capabilities():
    """Get PlantGPT capabilities"""
    return {
        "capabilities": [
            "Cement plant operations guidance",
            "Process optimization recommendations",
            "Quality control assistance",
            "Energy efficiency advice",
            "Maintenance planning support",
            "Safety and compliance guidance",
            "Alternate fuel optimization",
            "Troubleshooting assistance"
        ],
        "knowledge_areas": [
            "Kiln operations",
            "Grinding processes",
            "Quality control",
            "Energy management",
            "Predictive maintenance",
            "Alternate fuels",
            "Environmental compliance",
            "Process optimization"
        ]
    }
