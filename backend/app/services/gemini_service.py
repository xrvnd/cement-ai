import google.generativeai as genai
from typing import Dict, List, Optional, Any
import logging
from datetime import datetime
import json
import asyncio
from app.core.config import settings
from app.models.schemas import GeminiResponse, AIRecommendation, KilnSensorData, MillSensorData

logger = logging.getLogger(__name__)

class GeminiService:
    """Service for interacting with Google Gemini API"""
    
    def __init__(self):
        self.api_key = settings.GEMINI_API_KEY
        self.model_name = settings.AGENT_MODEL
        self.model = None
        self._initialize_client()
    
    def _initialize_client(self):
        """Initialize Gemini client"""
        try:
            genai.configure(api_key=self.api_key)
            self.model = genai.GenerativeModel(self.model_name)
            logger.info("Gemini client initialized successfully")
        except Exception as e:
            logger.error(f"Failed to initialize Gemini client: {e}")
            raise
    
    async def generate_response(self, prompt: str, context: Optional[Dict] = None) -> GeminiResponse:
        """Generate response from Gemini API"""
        try:
            # Enhance prompt with context if provided
            enhanced_prompt = self._enhance_prompt(prompt, context)
            
            # Generate response
            response = await asyncio.to_thread(
                self.model.generate_content,
                enhanced_prompt
            )
            
            # Parse and structure response
            structured_response = self._parse_response(response.text)
            
            return GeminiResponse(
                text=response.text,
                confidence=0.95,  # Default confidence
                recommendations=structured_response.get("recommendations", []),
                analysis_type=context.get("analysis_type", "general") if context else "general",
                timestamp=datetime.now()
            )
            
        except Exception as e:
            logger.error(f"Gemini API error: {e}")
            raise
    
    def _enhance_prompt(self, prompt: str, context: Optional[Dict] = None) -> str:
        """Enhance prompt with context and cement plant expertise"""
        base_context = f"""
        You are an expert cement plant process engineer with 20+ years of experience working with {settings.PLANT_NAME}.
        You specialize in:
        - Rotary kiln operations and optimization
        - Raw material and cement grinding processes
        - Quality control and assurance
        - Energy efficiency and alternate fuel utilization
        - Predictive maintenance and process control
        - Environmental compliance and safety protocols
        
        Current plant context: {settings.PLANT_NAME}, {settings.PLANT_LOCATION}
        Analysis timestamp: {datetime.now().isoformat()}
        """
        
        if context:
            base_context += f"\nAdditional context: {json.dumps(context, indent=2)}"
        
        return f"{base_context}\n\nQuery: {prompt}\n\nProvide a comprehensive, actionable response with specific recommendations."
    
    def _parse_response(self, response_text: str) -> Dict[str, Any]:
        """Parse AI response to extract recommendations"""
        recommendations = []
        
        # Simple parsing logic - can be enhanced with NLP
        lines = response_text.split('\n')
        current_recommendation = None
        
        for line in lines:
            line = line.strip()
            if any(keyword in line.lower() for keyword in ['recommend', 'suggest', 'action', 'improve']):
                if current_recommendation:
                    recommendations.append(current_recommendation)
                
                # Determine priority based on keywords
                priority = "medium"
                if any(word in line.lower() for word in ['critical', 'urgent', 'immediate']):
                    priority = "high"
                elif any(word in line.lower() for word in ['minor', 'optional', 'future']):
                    priority = "low"
                
                # Determine category
                category = "general"
                if any(word in line.lower() for word in ['temperature', 'thermal', 'heat']):
                    category = "thermal_management"
                elif any(word in line.lower() for word in ['quality', 'cement', 'strength']):
                    category = "quality_control"
                elif any(word in line.lower() for word in ['energy', 'power', 'fuel']):
                    category = "energy_efficiency"
                elif any(word in line.lower() for word in ['maintenance', 'repair', 'equipment']):
                    category = "maintenance"
                
                current_recommendation = AIRecommendation(
                    title=line[:100] + "..." if len(line) > 100 else line,
                    description=line,
                    priority=priority,
                    category=category,
                    action_required=priority == "high"
                )
        
        if current_recommendation:
            recommendations.append(current_recommendation)
        
        return {"recommendations": recommendations}
    
    async def analyze_kiln_data(self, sensor_data: KilnSensorData) -> GeminiResponse:
        """Analyze kiln sensor data"""
        prompt = self._create_kiln_analysis_prompt(sensor_data)
        context = {
            "analysis_type": "kiln_analysis",
            "sensor_data": sensor_data.dict()
        }
        return await self.generate_response(prompt, context)
    
    async def analyze_mill_data(self, sensor_data: MillSensorData) -> GeminiResponse:
        """Analyze mill sensor data"""
        prompt = self._create_mill_analysis_prompt(sensor_data)
        context = {
            "analysis_type": "mill_analysis", 
            "sensor_data": sensor_data.dict()
        }
        return await self.generate_response(prompt, context)
    
    def _create_kiln_analysis_prompt(self, sensor_data: KilnSensorData) -> str:
        """Create detailed kiln analysis prompt"""
        current_time = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        
        # Extract sensor values safely
        preheater_temp = sensor_data.temp1.value if sensor_data.temp1 else 0
        calciner_temp = sensor_data.temp2.value if sensor_data.temp2 else 0
        kiln_inlet_temp = sensor_data.temp3.value if sensor_data.temp3 else 0
        burning_zone_temp = sensor_data.burning.value if sensor_data.burning else 0
        cooler_temp = sensor_data.cooler.value if sensor_data.cooler else 0
        vibration = sensor_data.vibration.value if sensor_data.vibration else 0
        motor_load = sensor_data.load.value if sensor_data.load else 0
        nox_emission = sensor_data.emission.value if sensor_data.emission else 0
        
        return f"""
        CEMENT KILN OPERATION ANALYSIS - {settings.PLANT_NAME}
        Timestamp: {current_time}
        
        CURRENT SENSOR READINGS:
        - Preheater Temperature: {preheater_temp}°C (Optimal: 1200-1300°C)
        - Calciner Temperature: {calciner_temp}°C (Optimal: 1800-1900°C)
        - Kiln Inlet Temperature: {kiln_inlet_temp}°C (Optimal: 1100-1150°C)
        - Burning Zone Temperature: {burning_zone_temp}°C (Optimal: 1400-1500°C)
        - Cooler Temperature: {cooler_temp}°C (Optimal: 150-200°C)
        - Kiln Vibration: {vibration} mm/s (Alert: >3.0 mm/s)
        - Motor Load: {motor_load}% (Optimal: 80-90%)
        - NOx Emissions: {nox_emission} mg/Nm³ (Limit: <500 mg/Nm³)
        
        ANALYSIS REQUIREMENTS:
        1. Operational Status Assessment (Excellent/Good/Fair/Poor/Critical)
        2. Temperature Profile Analysis and Optimization
        3. Energy Efficiency Evaluation
        4. Environmental Compliance Check
        5. Predictive Maintenance Insights
        6. Quality Impact Assessment
        7. Safety Risk Evaluation
        8. Immediate Action Items (next 24 hours)
        9. Short-term Optimizations (1-7 days)
        10. Long-term Strategic Improvements (1-3 months)
        
        Provide specific, actionable recommendations with numerical targets where applicable.
        Focus on cement plant best practices and JK Cement operational standards.
        """
    
    def _create_mill_analysis_prompt(self, sensor_data: MillSensorData) -> str:
        """Create detailed mill analysis prompt"""
        current_time = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        
        # Extract sensor values safely
        feed_rate = sensor_data.mill_feed.value if sensor_data.mill_feed else 0
        pressure = sensor_data.mill_pressure.value if sensor_data.mill_pressure else 0
        particle_size = sensor_data.mill_particle.value if sensor_data.mill_particle else 0
        efficiency = sensor_data.mill_eff.value if sensor_data.mill_eff else 0
        
        return f"""
        CEMENT MILL OPERATION ANALYSIS - {settings.PLANT_NAME}
        Timestamp: {current_time}
        
        CURRENT SENSOR READINGS:
        - Feed Rate: {feed_rate} t/h (Optimal: 12-15 t/h)
        - Mill Pressure: {pressure} bar (Optimal: 2.0-2.5 bar)
        - Particle Size Distribution: {particle_size} µm (Target: 10-15 µm)
        - Grinding Efficiency: {efficiency}% (Target: >80%)
        
        ANALYSIS REQUIREMENTS:
        1. Mill Performance Assessment (Excellent/Good/Fair/Poor/Critical)
        2. Grinding Quality Analysis (Blaine, Residue, Strength)
        3. Energy Consumption Optimization (kWh/ton reduction)
        4. Throughput Optimization Potential
        5. Separator Performance Evaluation
        6. Grinding Media Efficiency
        7. Product Quality Consistency
        8. Predictive Maintenance Recommendations
        9. Soft Sensor Implementation for Blaine and Residue
        10. Process Control Improvements
        
        Focus on:
        - Specific power consumption reduction strategies
        - Cement grinding process optimization
        - Quality parameter control (Blaine fineness, residue)
        - Feed adjustment recommendations
        - Equipment reliability improvements
        
        Provide actionable recommendations with measurable targets.
        """
    
    async def check_burning_zone_alert(self, temperature: float) -> Optional[GeminiResponse]:
        """Check for burning zone temperature alerts"""
        if temperature > 1600:
            prompt = f"""
            CRITICAL ALERT: Cement kiln burning zone temperature exceeded safe limits!
            
            Current Temperature: {temperature}°C
            Safe Operating Range: 1400-1500°C
            Critical Threshold: 1600°C
            
            IMMEDIATE ACTIONS REQUIRED:
            1. Safety assessment and risk mitigation
            2. Process parameter adjustments
            3. Quality impact evaluation
            4. Equipment protection measures
            5. Root cause analysis
            6. Preventive measures implementation
            
            Provide immediate, actionable safety and operational recommendations.
            """
            
            context = {
                "analysis_type": "critical_alert",
                "alert_type": "burning_zone_temperature",
                "temperature": temperature
            }
            
            return await self.generate_response(prompt, context)
        
        return None
    
    async def optimize_process(self, kiln_data: Optional[KilnSensorData] = None, 
                            mill_data: Optional[MillSensorData] = None) -> GeminiResponse:
        """Comprehensive process optimization"""
        prompt = "COMPREHENSIVE CEMENT PLANT PROCESS OPTIMIZATION ANALYSIS\n\n"
        
        if kiln_data:
            prompt += f"KILN DATA:\n{self._format_kiln_data(kiln_data)}\n\n"
        
        if mill_data:
            prompt += f"MILL DATA:\n{self._format_mill_data(mill_data)}\n\n"
        
        prompt += """
        OPTIMIZATION OBJECTIVES:
        1. Reduce specific power consumption (kWh/ton)
        2. Improve fuel efficiency and maximize TSR
        3. Ensure consistent cement quality
        4. Increase overall productivity
        5. Enhance operational stability
        6. Maximize alternate fuel utilization
        
        FOCUS AREAS:
        - Raw Material and Grinding optimization
        - Clinkerization process control
        - Product quality management
        - Alternate fuel and TSR optimization
        - Strategic cross-process optimization
        
        Provide integrated optimization recommendations across all plant operations.
        """
        
        context = {
            "analysis_type": "process_optimization",
            "kiln_data": kiln_data.dict() if kiln_data else None,
            "mill_data": mill_data.dict() if mill_data else None
        }
        
        return await self.generate_response(prompt, context)
    
    def _format_kiln_data(self, data: KilnSensorData) -> str:
        """Format kiln data for prompt"""
        return f"""
        - Preheater: {data.temp1.value if data.temp1 else 'N/A'}°C
        - Calciner: {data.temp2.value if data.temp2 else 'N/A'}°C
        - Kiln Inlet: {data.temp3.value if data.temp3 else 'N/A'}°C
        - Burning Zone: {data.burning.value if data.burning else 'N/A'}°C
        - Cooler: {data.cooler.value if data.cooler else 'N/A'}°C
        - Vibration: {data.vibration.value if data.vibration else 'N/A'} mm/s
        - Motor Load: {data.load.value if data.load else 'N/A'}%
        - NOx Emissions: {data.emission.value if data.emission else 'N/A'} mg/Nm³
        """
    
    def _format_mill_data(self, data: MillSensorData) -> str:
        """Format mill data for prompt"""
        return f"""
        - Feed Rate: {data.mill_feed.value if data.mill_feed else 'N/A'} t/h
        - Pressure: {data.mill_pressure.value if data.mill_pressure else 'N/A'} bar
        - Particle Size: {data.mill_particle.value if data.mill_particle else 'N/A'} µm
        - Efficiency: {data.mill_eff.value if data.mill_eff else 'N/A'}%
        """
