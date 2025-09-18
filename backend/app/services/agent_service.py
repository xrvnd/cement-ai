import asyncio
import logging
from typing import Dict, List, Optional, Any
from datetime import datetime, timedelta
import json
import uuid
from concurrent.futures import ThreadPoolExecutor
import google.generativeai as genai
from langchain.agents import AgentExecutor, create_react_agent
from langchain.tools import Tool
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain.memory import ConversationBufferMemory
from langchain.schema import BaseMessage
from app.core.config import settings
from app.models.schemas import AgentTask, AgentResponse, AIRecommendation

logger = logging.getLogger(__name__)

class CementPlantAgent:
    """Specialized AI agent for cement plant operations"""
    
    def __init__(self, agent_type: str, specialization: str):
        self.agent_type = agent_type
        self.specialization = specialization
        self.llm = None
        self.tools = []
        self.memory = ConversationBufferMemory(memory_key="chat_history")
        self.executor = None
        self._initialize_agent()
    
    def _initialize_agent(self):
        """Initialize the agent with LLM and tools"""
        try:
            # Initialize LLM
            self.llm = ChatGoogleGenerativeAI(
                model=settings.AGENT_MODEL,
                google_api_key=settings.GEMINI_API_KEY,
                temperature=0.3
            )
            
            # Create specialized tools based on agent type
            self.tools = self._create_tools()
            
            # Create agent executor
            self.executor = AgentExecutor.from_agent_and_tools(
                agent=create_react_agent(self.llm, self.tools, self._get_agent_prompt()),
                tools=self.tools,
                memory=self.memory,
                verbose=True,
                max_iterations=5
            )
            
            logger.info(f"Agent {self.agent_type} initialized successfully")
            
        except Exception as e:
            logger.error(f"Failed to initialize agent {self.agent_type}: {e}")
            raise
    
    def _create_tools(self) -> List[Tool]:
        """Create specialized tools for the agent"""
        base_tools = [
            Tool(
                name="calculate_efficiency",
                description="Calculate operational efficiency metrics",
                func=self._calculate_efficiency
            ),
            Tool(
                name="analyze_trends",
                description="Analyze operational trends and patterns",
                func=self._analyze_trends
            ),
            Tool(
                name="generate_recommendations",
                description="Generate actionable recommendations",
                func=self._generate_recommendations
            )
        ]
        
        # Add specialized tools based on agent type
        if self.agent_type == "kiln_optimizer":
            base_tools.extend([
                Tool(
                    name="optimize_temperature_profile",
                    description="Optimize kiln temperature profile",
                    func=self._optimize_temperature_profile
                ),
                Tool(
                    name="calculate_fuel_efficiency",
                    description="Calculate and optimize fuel efficiency",
                    func=self._calculate_fuel_efficiency
                )
            ])
        
        elif self.agent_type == "mill_optimizer":
            base_tools.extend([
                Tool(
                    name="optimize_grinding_parameters",
                    description="Optimize grinding parameters for efficiency",
                    func=self._optimize_grinding_parameters
                ),
                Tool(
                    name="calculate_specific_power",
                    description="Calculate specific power consumption",
                    func=self._calculate_specific_power
                )
            ])
        
        elif self.agent_type == "quality_controller":
            base_tools.extend([
                Tool(
                    name="analyze_quality_parameters",
                    description="Analyze cement quality parameters",
                    func=self._analyze_quality_parameters
                ),
                Tool(
                    name="predict_strength_development",
                    description="Predict cement strength development",
                    func=self._predict_strength_development
                )
            ])
        
        return base_tools
    
    def _get_agent_prompt(self) -> str:
        """Get specialized prompt for the agent"""
        base_prompt = f"""
        You are a specialized AI agent for cement plant operations at {settings.PLANT_NAME}.
        Agent Type: {self.agent_type}
        Specialization: {self.specialization}
        
        Your role is to analyze data, identify optimization opportunities, and provide actionable recommendations.
        Always consider safety, quality, efficiency, and environmental compliance in your recommendations.
        
        Use the available tools to perform calculations and analysis.
        Provide specific, measurable recommendations with clear implementation steps.
        """
        
        if self.agent_type == "kiln_optimizer":
            base_prompt += """
            Focus on:
            - Thermal efficiency optimization
            - Fuel consumption reduction
            - Temperature profile optimization
            - Clinker quality improvement
            - NOx emission control
            """
        
        elif self.agent_type == "mill_optimizer":
            base_prompt += """
            Focus on:
            - Specific power consumption reduction (kWh/ton)
            - Grinding efficiency optimization
            - Particle size distribution control
            - Separator performance
            - Feed rate optimization
            """
        
        elif self.agent_type == "quality_controller":
            base_prompt += """
            Focus on:
            - Cement quality consistency
            - Blaine fineness control
            - Compressive strength optimization
            - Free lime monitoring
            - Product specification compliance
            """
        
        return base_prompt
    
    async def execute_task(self, task: AgentTask) -> AgentResponse:
        """Execute an agent task"""
        start_time = datetime.now()
        
        try:
            # Prepare task context
            context = {
                "task_id": task.task_id,
                "task_type": task.task_type,
                "parameters": task.parameters,
                "timestamp": start_time.isoformat()
            }
            
            # Execute task using agent
            result = await asyncio.to_thread(
                self.executor.run,
                input=task.description,
                context=json.dumps(context)
            )
            
            # Parse result and generate recommendations
            recommendations = self._parse_agent_result(result)
            
            execution_time = (datetime.now() - start_time).total_seconds()
            
            return AgentResponse(
                task_id=task.task_id,
                status="completed",
                result={"output": result, "context": context},
                execution_time=execution_time,
                recommendations=recommendations
            )
            
        except Exception as e:
            execution_time = (datetime.now() - start_time).total_seconds()
            logger.error(f"Agent task execution failed: {e}")
            
            return AgentResponse(
                task_id=task.task_id,
                status="failed",
                error_message=str(e),
                execution_time=execution_time
            )
    
    def _parse_agent_result(self, result: str) -> List[AIRecommendation]:
        """Parse agent result to extract recommendations"""
        recommendations = []
        
        # Simple parsing logic - can be enhanced
        lines = result.split('\n')
        for line in lines:
            if any(keyword in line.lower() for keyword in ['recommend', 'suggest', 'optimize', 'improve']):
                recommendations.append(AIRecommendation(
                    title=line[:100] + "..." if len(line) > 100 else line,
                    description=line,
                    priority="medium",
                    category=self.specialization,
                    action_required=True
                ))
        
        return recommendations
    
    # Tool implementations
    def _calculate_efficiency(self, data: str) -> str:
        """Calculate operational efficiency"""
        try:
            params = json.loads(data)
            # Implement efficiency calculation logic
            efficiency = 85.5  # Placeholder
            return f"Current operational efficiency: {efficiency}%"
        except:
            return "Unable to calculate efficiency with provided data"
    
    def _analyze_trends(self, data: str) -> str:
        """Analyze operational trends"""
        return "Trend analysis: Stable operation with minor fluctuations in temperature profile"
    
    def _generate_recommendations(self, data: str) -> str:
        """Generate actionable recommendations"""
        return "Recommendations: 1) Optimize fuel flow rate 2) Adjust temperature setpoints 3) Schedule maintenance"
    
    def _optimize_temperature_profile(self, data: str) -> str:
        """Optimize kiln temperature profile"""
        return "Temperature optimization: Reduce preheater temp by 50°C, increase burning zone by 25°C"
    
    def _calculate_fuel_efficiency(self, data: str) -> str:
        """Calculate fuel efficiency"""
        return "Fuel efficiency: 3.2 GJ/ton clinker (Target: 3.0 GJ/ton)"
    
    def _optimize_grinding_parameters(self, data: str) -> str:
        """Optimize grinding parameters"""
        return "Grinding optimization: Increase feed rate to 14 t/h, adjust separator speed to 85 rpm"
    
    def _calculate_specific_power(self, data: str) -> str:
        """Calculate specific power consumption"""
        return "Specific power: 32 kWh/ton (Target: 30 kWh/ton)"
    
    def _analyze_quality_parameters(self, data: str) -> str:
        """Analyze quality parameters"""
        return "Quality analysis: Blaine 350 m²/kg, Strength 42.5 MPa, Free lime 1.2%"
    
    def _predict_strength_development(self, data: str) -> str:
        """Predict strength development"""
        return "Strength prediction: 28-day strength estimated at 45 MPa"


class AgentService:
    """Service for managing AI agents"""
    
    def __init__(self):
        self.agents: Dict[str, CementPlantAgent] = {}
        self.active_tasks: Dict[str, AgentTask] = {}
        self.task_history: List[AgentTask] = []
        self.executor = ThreadPoolExecutor(max_workers=4)
    
    async def initialize(self):
        """Initialize all agents"""
        try:
            # Create specialized agents
            agent_configs = [
                ("kiln_optimizer", "thermal_management"),
                ("mill_optimizer", "grinding_operations"),
                ("quality_controller", "quality_assurance"),
                ("fuel_optimizer", "alternate_fuels"),
                ("maintenance_planner", "predictive_maintenance")
            ]
            
            for agent_type, specialization in agent_configs:
                self.agents[agent_type] = CementPlantAgent(agent_type, specialization)
            
            logger.info(f"Initialized {len(self.agents)} specialized agents")
            
        except Exception as e:
            logger.error(f"Agent service initialization failed: {e}")
            raise
    
    async def create_task(self, task_type: str, description: str, 
                         parameters: Dict[str, Any], priority: int = 3) -> str:
        """Create a new agent task"""
        task_id = str(uuid.uuid4())
        
        task = AgentTask(
            task_id=task_id,
            task_type=task_type,
            description=description,
            priority=priority,
            parameters=parameters,
            status="pending",
            created_at=datetime.now()
        )
        
        self.active_tasks[task_id] = task
        logger.info(f"Created task {task_id}: {task_type}")
        
        return task_id
    
    async def execute_task(self, task_id: str) -> AgentResponse:
        """Execute a specific task"""
        if task_id not in self.active_tasks:
            raise ValueError(f"Task {task_id} not found")
        
        task = self.active_tasks[task_id]
        task.status = "running"
        
        # Determine appropriate agent
        agent = self._select_agent(task.task_type)
        if not agent:
            raise ValueError(f"No suitable agent found for task type: {task.task_type}")
        
        # Execute task
        response = await agent.execute_task(task)
        
        # Update task status
        task.status = response.status
        task.completed_at = datetime.now()
        
        # Move to history
        self.task_history.append(task)
        del self.active_tasks[task_id]
        
        return response
    
    def _select_agent(self, task_type: str) -> Optional[CementPlantAgent]:
        """Select appropriate agent for task type"""
        agent_mapping = {
            "kiln_analysis": "kiln_optimizer",
            "mill_analysis": "mill_optimizer",
            "quality_analysis": "quality_controller",
            "fuel_optimization": "fuel_optimizer",
            "maintenance_planning": "maintenance_planner",
            "temperature_optimization": "kiln_optimizer",
            "grinding_optimization": "mill_optimizer",
            "blaine_control": "quality_controller",
            "strength_prediction": "quality_controller",
            "tsr_optimization": "fuel_optimizer"
        }
        
        agent_key = agent_mapping.get(task_type)
        return self.agents.get(agent_key) if agent_key else None
    
    async def get_task_status(self, task_id: str) -> Dict[str, Any]:
        """Get task status"""
        if task_id in self.active_tasks:
            task = self.active_tasks[task_id]
            return {
                "task_id": task_id,
                "status": task.status,
                "created_at": task.created_at,
                "description": task.description
            }
        
        # Check history
        for task in self.task_history:
            if task.task_id == task_id:
                return {
                    "task_id": task_id,
                    "status": task.status,
                    "created_at": task.created_at,
                    "completed_at": task.completed_at,
                    "description": task.description
                }
        
        raise ValueError(f"Task {task_id} not found")
    
    async def list_active_tasks(self) -> List[Dict[str, Any]]:
        """List all active tasks"""
        return [
            {
                "task_id": task.task_id,
                "task_type": task.task_type,
                "status": task.status,
                "priority": task.priority,
                "created_at": task.created_at
            }
            for task in self.active_tasks.values()
        ]
    
    async def optimize_kiln_operation(self, sensor_data: Dict[str, Any]) -> AgentResponse:
        """Optimize kiln operation using specialized agent"""
        task_id = await self.create_task(
            task_type="kiln_analysis",
            description="Analyze kiln sensor data and optimize operation",
            parameters={"sensor_data": sensor_data},
            priority=2
        )
        
        return await self.execute_task(task_id)
    
    async def optimize_mill_operation(self, sensor_data: Dict[str, Any]) -> AgentResponse:
        """Optimize mill operation using specialized agent"""
        task_id = await self.create_task(
            task_type="mill_analysis",
            description="Analyze mill sensor data and optimize grinding process",
            parameters={"sensor_data": sensor_data},
            priority=2
        )
        
        return await self.execute_task(task_id)
    
    async def control_quality_parameters(self, quality_data: Dict[str, Any]) -> AgentResponse:
        """Control quality parameters using specialized agent"""
        task_id = await self.create_task(
            task_type="quality_analysis",
            description="Analyze quality parameters and provide control recommendations",
            parameters={"quality_data": quality_data},
            priority=1
        )
        
        return await self.execute_task(task_id)
    
    async def optimize_alternate_fuels(self, fuel_data: Dict[str, Any]) -> AgentResponse:
        """Optimize alternate fuel usage"""
        task_id = await self.create_task(
            task_type="fuel_optimization",
            description="Optimize alternate fuel mix and TSR",
            parameters={"fuel_data": fuel_data},
            priority=2
        )
        
        return await self.execute_task(task_id)
