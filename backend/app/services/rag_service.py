import os
import logging
from typing import List, Dict, Any, Optional
import asyncio
from datetime import datetime
import uuid
import chromadb
from chromadb.config import Settings
from sentence_transformers import SentenceTransformer
import pandas as pd
import numpy as np
from pathlib import Path
import json
import google.generativeai as genai
from app.core.config import settings
from app.models.schemas import PlantGPTRequest, PlantGPTResponse, ChatMessage

logger = logging.getLogger(__name__)

class RAGService:
    """Retrieval-Augmented Generation service for PlantGPT"""
    
    def __init__(self):
        self.chroma_client = None
        self.collection = None
        self.embedding_model = None
        self.gemini_model = None
        self.knowledge_base_path = "data/knowledge_base"
        self.conversations: Dict[str, List[ChatMessage]] = {}
        self._initialize_services()
    
    def _initialize_services(self):
        """Initialize RAG services"""
        try:
            # Initialize ChromaDB
            self.chroma_client = chromadb.Client(Settings(
                chroma_db_impl="duckdb+parquet",
                persist_directory="./chroma_db"
            ))
            
            # Get or create collection
            self.collection = self.chroma_client.get_or_create_collection(
                name="cement_plant_knowledge",
                metadata={"description": "Cement plant operations knowledge base"}
            )
            
            # Initialize embedding model
            self.embedding_model = SentenceTransformer('all-MiniLM-L6-v2')
            
            # Initialize Gemini
            genai.configure(api_key=settings.GEMINI_API_KEY)
            self.gemini_model = genai.GenerativeModel(settings.AGENT_MODEL)
            
            logger.info("RAG service initialized successfully")
            
        except Exception as e:
            logger.error(f"RAG service initialization failed: {e}")
            raise
    
    async def initialize_knowledge_base(self):
        """Initialize knowledge base with cement plant data"""
        try:
            # Create knowledge base directory if it doesn't exist
            os.makedirs(self.knowledge_base_path, exist_ok=True)
            
            # Load cement plant knowledge
            await self._load_cement_plant_knowledge()
            
            # Index existing documents
            await self._index_documents()
            
            logger.info("Knowledge base initialized successfully")
            
        except Exception as e:
            logger.error(f"Knowledge base initialization failed: {e}")
            raise
    
    async def _load_cement_plant_knowledge(self):
        """Load cement plant operational knowledge"""
        knowledge_items = [
            {
                "id": "kiln_operations_basics",
                "title": "Rotary Kiln Operations Fundamentals",
                "content": """
                Rotary kiln is the heart of cement production. Key operational parameters:
                
                Temperature Zones:
                - Preheater: 1200-1300°C (optimal for raw material preparation)
                - Calciner: 1800-1900°C (calcination of limestone)
                - Kiln Inlet: 1100-1150°C (material entry point)
                - Burning Zone: 1400-1500°C (clinker formation)
                - Cooler: 150-200°C (clinker cooling)
                
                Critical Control Parameters:
                - Fuel flow rate and composition
                - Air flow and oxygen levels
                - Material feed rate
                - Kiln rotation speed (0.5-4.5 rpm)
                - Draft pressure (-5 to -15 mmWG)
                
                Quality Indicators:
                - Free lime content (<2%)
                - Clinker mineralogy (C3S, C2S, C3A, C4AF)
                - Burnability index
                - Coating stability
                """,
                "category": "kiln_operations",
                "tags": ["kiln", "temperature", "clinker", "operations"]
            },
            {
                "id": "cement_grinding_optimization",
                "title": "Cement Grinding Process Optimization",
                "content": """
                Cement grinding optimization focuses on energy efficiency and quality:
                
                Key Performance Indicators:
                - Specific power consumption: Target <30 kWh/ton
                - Blaine fineness: 300-400 m²/kg
                - Particle size distribution: d50 = 10-15 μm
                - Grinding efficiency: >80%
                
                Optimization Strategies:
                - Grinding media optimization (ball size distribution)
                - Separator efficiency improvement
                - Feed rate optimization (12-15 t/h optimal)
                - Mill ventilation control
                - Grinding aid usage
                
                Quality Control:
                - Residue on 45μm sieve: <10%
                - Residue on 90μm sieve: <2%
                - Compressive strength development
                - Setting time control
                
                Soft Sensors Implementation:
                - Real-time Blaine prediction
                - Residue monitoring
                - Strength prediction models
                """,
                "category": "grinding_operations",
                "tags": ["grinding", "mill", "blaine", "efficiency", "quality"]
            },
            {
                "id": "alternate_fuels_tsr",
                "title": "Alternate Fuels and Thermal Substitution Rate",
                "content": """
                Alternate fuel utilization for sustainable cement production:
                
                Fuel Types and Characteristics:
                - RDF (Refuse Derived Fuel): 15-20 MJ/kg, low ash content
                - Biomass: 12-18 MJ/kg, carbon neutral
                - Plastic waste: 35-45 MJ/kg, high calorific value
                - Tire chips: 30-35 MJ/kg, good burnability
                
                TSR Optimization:
                - Current industry average: 15-25%
                - Target TSR: 30-40%
                - Maximum safe TSR: 60% (with proper controls)
                
                Safety Considerations:
                - Chlorine content monitoring (<0.1%)
                - Heavy metals control
                - Combustion air requirements
                - Emission control (NOx, SOx, CO)
                
                Implementation Strategy:
                - Gradual TSR increase (5% increments)
                - Fuel quality consistency
                - Preheater tower modifications
                - Alternative fuel feeding systems
                """,
                "category": "alternate_fuels",
                "tags": ["alternate_fuels", "TSR", "RDF", "biomass", "sustainability"]
            },
            {
                "id": "quality_control_systems",
                "title": "Cement Quality Control and Adaptive Systems",
                "content": """
                Advanced quality control for consistent cement production:
                
                Key Quality Parameters:
                - Blaine fineness: Real-time monitoring and control
                - Free lime: Target <1.5% for quality clinker
                - Compressive strength: 28-day target 42.5-52.5 MPa
                - Setting time: Initial 45-375 min, Final <600 min
                
                Adaptive Control Systems:
                - Blaine adaptive control: PID controllers with feedforward
                - Free lime control: Raw mix adjustment algorithms
                - Strength prediction: Machine learning models
                
                Variability Reduction Strategies:
                - Statistical process control (SPC)
                - Raw material homogenization
                - Consistent fuel quality
                - Temperature profile optimization
                
                Soft Sensor Implementation:
                - Online Blaine measurement using mill parameters
                - Residue prediction from particle size distribution
                - Strength development models
                - Quality prediction algorithms
                """,
                "category": "quality_control",
                "tags": ["quality", "blaine", "strength", "control_systems", "adaptive"]
            },
            {
                "id": "energy_efficiency_optimization",
                "title": "Energy Efficiency and Power Consumption Optimization",
                "content": """
                Comprehensive energy optimization strategies:
                
                Specific Power Consumption Targets:
                - Raw grinding: 15-20 kWh/ton
                - Cement grinding: 28-35 kWh/ton
                - Kiln system: 50-65 kWh/ton clinker
                - Total plant: 90-110 kWh/ton cement
                
                Optimization Areas:
                - Mill optimization: Grinding media, separator efficiency
                - Kiln thermal efficiency: Heat recovery, insulation
                - Fan power optimization: Variable frequency drives
                - Compressed air systems: Leak detection, pressure optimization
                
                Heat Recovery Systems:
                - Preheater exit gas utilization
                - Clinker cooler waste heat recovery
                - Mill ventilation air heating
                - Power generation from waste heat
                
                Monitoring and Control:
                - Real-time energy monitoring
                - Power factor optimization
                - Load management systems
                - Energy benchmarking
                """,
                "category": "energy_efficiency",
                "tags": ["energy", "power_consumption", "efficiency", "optimization"]
            },
            {
                "id": "predictive_maintenance",
                "title": "Predictive Maintenance and Equipment Reliability",
                "content": """
                Predictive maintenance strategies for cement plant equipment:
                
                Critical Equipment Monitoring:
                - Kiln: Refractory condition, shell temperature, vibration
                - Mills: Liner wear, bearing temperature, power consumption
                - Fans: Vibration analysis, bearing condition
                - Conveyors: Belt condition, motor performance
                
                Condition Monitoring Techniques:
                - Vibration analysis: Bearing defects, misalignment
                - Thermal imaging: Hot spots, electrical connections
                - Oil analysis: Contamination, wear particles
                - Motor current signature analysis
                
                Maintenance Planning:
                - Remaining useful life prediction
                - Optimal maintenance scheduling
                - Spare parts optimization
                - Maintenance cost optimization
                
                Digital Twin Integration:
                - Real-time equipment modeling
                - Performance degradation tracking
                - Failure mode prediction
                - Maintenance decision support
                """,
                "category": "maintenance",
                "tags": ["maintenance", "predictive", "reliability", "monitoring"]
            }
        ]
        
        # Save knowledge items to files
        for item in knowledge_items:
            file_path = os.path.join(self.knowledge_base_path, f"{item['id']}.json")
            with open(file_path, 'w') as f:
                json.dump(item, f, indent=2)
    
    async def _index_documents(self):
        """Index documents in the vector database"""
        try:
            # Load all knowledge documents
            documents = []
            metadatas = []
            ids = []
            
            for file_path in Path(self.knowledge_base_path).glob("*.json"):
                with open(file_path, 'r') as f:
                    doc = json.load(f)
                    
                    documents.append(doc['content'])
                    metadatas.append({
                        'title': doc['title'],
                        'category': doc['category'],
                        'tags': ','.join(doc['tags']),
                        'source': str(file_path)
                    })
                    ids.append(doc['id'])
            
            if documents:
                # Generate embeddings
                embeddings = self.embedding_model.encode(documents)
                
                # Add to ChromaDB
                self.collection.add(
                    documents=documents,
                    embeddings=embeddings.tolist(),
                    metadatas=metadatas,
                    ids=ids
                )
                
                logger.info(f"Indexed {len(documents)} documents")
            
        except Exception as e:
            logger.error(f"Document indexing failed: {e}")
            raise
    
    async def query_knowledge_base(self, query: str, n_results: int = 5) -> List[Dict[str, Any]]:
        """Query the knowledge base for relevant information"""
        try:
            # Generate query embedding
            query_embedding = self.embedding_model.encode([query])
            
            # Search in ChromaDB
            results = self.collection.query(
                query_embeddings=query_embedding.tolist(),
                n_results=n_results,
                include=['documents', 'metadatas', 'distances']
            )
            
            # Format results
            formatted_results = []
            for i in range(len(results['documents'][0])):
                formatted_results.append({
                    'content': results['documents'][0][i],
                    'metadata': results['metadatas'][0][i],
                    'similarity': 1 - results['distances'][0][i]  # Convert distance to similarity
                })
            
            return formatted_results
            
        except Exception as e:
            logger.error(f"Knowledge base query failed: {e}")
            return []
    
    async def chat_with_plantgpt(self, request: PlantGPTRequest) -> PlantGPTResponse:
        """Process chat request with RAG"""
        try:
            # Get or create conversation
            conversation_id = request.conversation_id or str(uuid.uuid4())
            
            if conversation_id not in self.conversations:
                self.conversations[conversation_id] = []
            
            # Add user message to conversation
            user_message = ChatMessage(
                role="user",
                content=request.message,
                timestamp=datetime.now()
            )
            self.conversations[conversation_id].append(user_message)
            
            # Retrieve relevant knowledge if RAG is enabled
            relevant_docs = []
            if request.use_rag:
                relevant_docs = await self.query_knowledge_base(request.message)
            
            # Generate response using Gemini with RAG context
            response_text = await self._generate_rag_response(
                request.message,
                relevant_docs,
                self.conversations[conversation_id][-5:],  # Last 5 messages for context
                request.context
            )
            
            # Add assistant message to conversation
            assistant_message = ChatMessage(
                role="assistant",
                content=response_text,
                timestamp=datetime.now(),
                metadata={"sources": [doc['metadata']['title'] for doc in relevant_docs[:3]]}
            )
            self.conversations[conversation_id].append(assistant_message)
            
            # Generate suggestions
            suggestions = await self._generate_suggestions(request.message, relevant_docs)
            
            return PlantGPTResponse(
                response=response_text,
                conversation_id=conversation_id,
                sources=[doc['metadata']['title'] for doc in relevant_docs[:3]],
                confidence=0.9,
                suggestions=suggestions
            )
            
        except Exception as e:
            logger.error(f"PlantGPT chat failed: {e}")
            raise
    
    async def _generate_rag_response(self, query: str, relevant_docs: List[Dict], 
                                   conversation_history: List[ChatMessage],
                                   context: Optional[Dict] = None) -> str:
        """Generate response using RAG"""
        try:
            # Build context from relevant documents
            rag_context = "\n\n".join([
                f"Source: {doc['metadata']['title']}\nContent: {doc['content'][:500]}..."
                for doc in relevant_docs[:3]
            ])
            
            # Build conversation context
            conversation_context = "\n".join([
                f"{msg.role}: {msg.content}"
                for msg in conversation_history[-3:]  # Last 3 messages
            ])
            
            # Create enhanced prompt
            prompt = f"""
            You are PlantGPT, an expert AI assistant for cement plant operations at {settings.PLANT_NAME}.
            You have access to comprehensive knowledge about cement manufacturing processes, optimization strategies, and best practices.
            
            RELEVANT KNOWLEDGE:
            {rag_context}
            
            CONVERSATION HISTORY:
            {conversation_context}
            
            CURRENT QUERY: {query}
            
            ADDITIONAL CONTEXT: {json.dumps(context) if context else 'None'}
            
            Instructions:
            1. Provide accurate, actionable advice based on the relevant knowledge
            2. Reference specific technical parameters and industry standards
            3. Consider safety, quality, efficiency, and environmental aspects
            4. Provide specific numerical recommendations where applicable
            5. Suggest follow-up actions or monitoring requirements
            6. Keep responses concise but comprehensive
            
            Response:
            """
            
            # Generate response using Gemini
            response = await asyncio.to_thread(
                self.gemini_model.generate_content,
                prompt
            )
            
            return response.text
            
        except Exception as e:
            logger.error(f"RAG response generation failed: {e}")
            return "I apologize, but I'm experiencing technical difficulties. Please try again."
    
    async def _generate_suggestions(self, query: str, relevant_docs: List[Dict]) -> List[str]:
        """Generate follow-up suggestions"""
        suggestions = [
            "How can I optimize energy consumption?",
            "What are the best practices for quality control?",
            "How to improve alternate fuel utilization?",
            "What maintenance activities should I prioritize?",
            "How to reduce specific power consumption?"
        ]
        
        # Customize suggestions based on query content
        if "kiln" in query.lower():
            suggestions = [
                "How to optimize kiln temperature profile?",
                "What are the signs of refractory wear?",
                "How to improve fuel efficiency in the kiln?",
                "What causes kiln ring formation?",
                "How to control NOx emissions?"
            ]
        elif "mill" in query.lower() or "grinding" in query.lower():
            suggestions = [
                "How to reduce grinding power consumption?",
                "What affects Blaine fineness control?",
                "How to optimize separator efficiency?",
                "What causes mill vibration issues?",
                "How to improve cement strength?"
            ]
        elif "quality" in query.lower():
            suggestions = [
                "How to control free lime content?",
                "What affects cement setting time?",
                "How to improve compressive strength?",
                "What causes quality variations?",
                "How to implement soft sensors?"
            ]
        
        return suggestions[:3]  # Return top 3 suggestions
    
    async def add_document(self, title: str, content: str, category: str, tags: List[str]) -> str:
        """Add a new document to the knowledge base"""
        try:
            doc_id = str(uuid.uuid4())
            
            # Create document
            document = {
                "id": doc_id,
                "title": title,
                "content": content,
                "category": category,
                "tags": tags,
                "created_at": datetime.now().isoformat()
            }
            
            # Save to file
            file_path = os.path.join(self.knowledge_base_path, f"{doc_id}.json")
            with open(file_path, 'w') as f:
                json.dump(document, f, indent=2)
            
            # Add to vector database
            embedding = self.embedding_model.encode([content])
            
            self.collection.add(
                documents=[content],
                embeddings=embedding.tolist(),
                metadatas=[{
                    'title': title,
                    'category': category,
                    'tags': ','.join(tags),
                    'source': file_path
                }],
                ids=[doc_id]
            )
            
            logger.info(f"Added document: {title}")
            return doc_id
            
        except Exception as e:
            logger.error(f"Document addition failed: {e}")
            raise
    
    async def get_conversation_history(self, conversation_id: str) -> List[ChatMessage]:
        """Get conversation history"""
        return self.conversations.get(conversation_id, [])
    
    async def clear_conversation(self, conversation_id: str):
        """Clear conversation history"""
        if conversation_id in self.conversations:
            del self.conversations[conversation_id]
