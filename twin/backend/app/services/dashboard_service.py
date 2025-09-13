import pandas as pd
import numpy as np
from datetime import datetime, timedelta
from typing import Dict, List, Any, Optional
import logging
import os
from pathlib import Path
from app.core.config import settings
from app.models.schemas import (
    DashboardData, FocusArea, OperationalMetric, 
    AIRecommendation, QualityParameter, AlternateFuel, TSRData
)

logger = logging.getLogger(__name__)

class DashboardService:
    """Service for generating dashboard data and managing cement plant metrics"""
    
    def __init__(self):
        self.data_path = Path("data")
        self.data_path.mkdir(exist_ok=True)
        
    async def get_dashboard_data(self) -> DashboardData:
        """Get comprehensive dashboard data"""
        try:
            # Generate focus areas with metrics
            focus_areas = await self._generate_focus_areas()
            
            # Generate plant overview
            plant_overview = await self._generate_plant_overview()
            
            # Generate real-time alerts
            alerts = await self._generate_real_time_alerts()
            
            # Generate performance summary
            performance_summary = await self._generate_performance_summary()
            
            return DashboardData(
                plant_overview=plant_overview,
                focus_areas=focus_areas,
                real_time_alerts=alerts,
                performance_summary=performance_summary,
                last_updated=datetime.now()
            )
            
        except Exception as e:
            logger.error(f"Dashboard data generation failed: {e}")
            raise
    
    async def _generate_focus_areas(self) -> List[FocusArea]:
        """Generate key focus areas for cement operations"""
        focus_areas = []
        
        # 1. Reduce Specific Power Consumption
        power_metrics = [
            OperationalMetric(
                name="Raw Mill Power Consumption",
                current_value=18.5,
                target_value=16.0,
                unit="kWh/ton",
                status="fair",
                trend="decreasing",
                last_updated=datetime.now()
            ),
            OperationalMetric(
                name="Cement Mill Power Consumption",
                current_value=32.0,
                target_value=30.0,
                unit="kWh/ton",
                status="fair",
                trend="stable",
                last_updated=datetime.now()
            ),
            OperationalMetric(
                name="Kiln System Power",
                current_value=58.0,
                target_value=55.0,
                unit="kWh/ton clinker",
                status="good",
                trend="decreasing",
                last_updated=datetime.now()
            )
        ]
        
        power_recommendations = [
            AIRecommendation(
                title="Optimize Grinding Media Distribution",
                description="Implement optimal ball size distribution in cement mill to reduce specific power consumption by 2-3 kWh/ton",
                priority="high",
                category="energy_efficiency",
                action_required=True,
                estimated_impact="2-3 kWh/ton reduction"
            ),
            AIRecommendation(
                title="Deploy Soft Sensors for Mill Control",
                description="Implement soft sensors for real-time Blaine and residue monitoring to optimize mill operation",
                priority="medium",
                category="process_control",
                action_required=True,
                estimated_impact="1.5-2 kWh/ton reduction"
            )
        ]
        
        focus_areas.append(FocusArea(
            name="Reduce Specific Power Consumption",
            description="Optimize energy consumption across raw and cement grinding operations",
            metrics=power_metrics,
            recommendations=power_recommendations,
            priority_score=9.2
        ))
        
        # 2. Improve Fuel Efficiency
        fuel_metrics = [
            OperationalMetric(
                name="Specific Heat Consumption",
                current_value=3.2,
                target_value=3.0,
                unit="GJ/ton clinker",
                status="fair",
                trend="stable",
                last_updated=datetime.now()
            ),
            OperationalMetric(
                name="Thermal Substitution Rate",
                current_value=22.0,
                target_value=35.0,
                unit="%",
                status="poor",
                trend="increasing",
                last_updated=datetime.now()
            ),
            OperationalMetric(
                name="Kiln Thermal Efficiency",
                current_value=68.5,
                target_value=72.0,
                unit="%",
                status="fair",
                trend="stable",
                last_updated=datetime.now()
            )
        ]
        
        fuel_recommendations = [
            AIRecommendation(
                title="Maximize Alternate Fuel Usage",
                description="Increase RDF and biomass utilization to achieve 35% TSR while maintaining clinker quality",
                priority="high",
                category="alternate_fuels",
                action_required=True,
                estimated_impact="0.2 GJ/ton reduction"
            ),
            AIRecommendation(
                title="Optimize Fuel Mix Strategy",
                description="Implement dynamic fuel mix optimization based on availability and cost",
                priority="medium",
                category="fuel_management",
                action_required=True,
                estimated_impact="5-8% cost reduction"
            )
        ]
        
        focus_areas.append(FocusArea(
            name="Improve Fuel Efficiency",
            description="Optimize fuel consumption and maximize alternate fuel utilization",
            metrics=fuel_metrics,
            recommendations=fuel_recommendations,
            priority_score=8.8
        ))
        
        # 3. Ensure Consistent Quality
        quality_metrics = [
            OperationalMetric(
                name="Blaine Fineness Variability",
                current_value=15.0,
                target_value=8.0,
                unit="m²/kg std dev",
                status="poor",
                trend="stable",
                last_updated=datetime.now()
            ),
            OperationalMetric(
                name="28-day Strength Consistency",
                current_value=3.2,
                target_value=2.0,
                unit="MPa std dev",
                status="fair",
                trend="decreasing",
                last_updated=datetime.now()
            ),
            OperationalMetric(
                name="Free Lime Content",
                current_value=1.8,
                target_value=1.2,
                unit="%",
                status="fair",
                trend="stable",
                last_updated=datetime.now()
            )
        ]
        
        quality_recommendations = [
            AIRecommendation(
                title="Implement Adaptive Blaine Control",
                description="Deploy AI-driven adaptive control system for consistent Blaine fineness",
                priority="high",
                category="quality_control",
                action_required=True,
                estimated_impact="50% variability reduction"
            ),
            AIRecommendation(
                title="Enhance Raw Mix Homogenization",
                description="Optimize raw material blending to reduce free lime variability",
                priority="medium",
                category="raw_materials",
                action_required=True,
                estimated_impact="0.3% free lime reduction"
            )
        ]
        
        focus_areas.append(FocusArea(
            name="Ensure Consistent Quality",
            description="Maintain consistent cement quality parameters and reduce variability",
            metrics=quality_metrics,
            recommendations=quality_recommendations,
            priority_score=9.5
        ))
        
        # 4. Increase Productivity
        productivity_metrics = [
            OperationalMetric(
                name="Kiln Production Rate",
                current_value=145.0,
                target_value=155.0,
                unit="ton/hour",
                status="good",
                trend="increasing",
                last_updated=datetime.now()
            ),
            OperationalMetric(
                name="Mill Throughput",
                current_value=13.2,
                target_value=15.0,
                unit="ton/hour",
                status="fair",
                trend="stable",
                last_updated=datetime.now()
            ),
            OperationalMetric(
                name="Overall Equipment Effectiveness",
                current_value=78.5,
                target_value=85.0,
                unit="%",
                status="fair",
                trend="increasing",
                last_updated=datetime.now()
            )
        ]
        
        productivity_recommendations = [
            AIRecommendation(
                title="Optimize Feed Rate Control",
                description="Implement dynamic feed rate optimization based on mill conditions",
                priority="medium",
                category="process_optimization",
                action_required=True,
                estimated_impact="1.5 ton/hour increase"
            ),
            AIRecommendation(
                title="Reduce Unplanned Downtime",
                description="Enhance predictive maintenance to minimize equipment failures",
                priority="high",
                category="maintenance",
                action_required=True,
                estimated_impact="5% OEE improvement"
            )
        ]
        
        focus_areas.append(FocusArea(
            name="Increase Productivity",
            description="Maximize production throughput and equipment effectiveness",
            metrics=productivity_metrics,
            recommendations=productivity_recommendations,
            priority_score=8.5
        ))
        
        # 5. Enhance Operational Stability
        stability_metrics = [
            OperationalMetric(
                name="Process Variability Index",
                current_value=0.15,
                target_value=0.10,
                unit="coefficient",
                status="fair",
                trend="decreasing",
                last_updated=datetime.now()
            ),
            OperationalMetric(
                name="Equipment Availability",
                current_value=92.5,
                target_value=95.0,
                unit="%",
                status="good",
                trend="stable",
                last_updated=datetime.now()
            ),
            OperationalMetric(
                name="Control Loop Performance",
                current_value=85.0,
                target_value=90.0,
                unit="%",
                status="good",
                trend="increasing",
                last_updated=datetime.now()
            )
        ]
        
        stability_recommendations = [
            AIRecommendation(
                title="Implement Advanced Process Control",
                description="Deploy model predictive control for kiln and mill operations",
                priority="medium",
                category="process_control",
                action_required=True,
                estimated_impact="30% variability reduction"
            ),
            AIRecommendation(
                title="Enhance Sensor Network",
                description="Install additional sensors for better process monitoring",
                priority="low",
                category="instrumentation",
                action_required=False,
                estimated_impact="Improved monitoring"
            )
        ]
        
        focus_areas.append(FocusArea(
            name="Enhance Operational Stability",
            description="Improve process stability and reduce operational variability",
            metrics=stability_metrics,
            recommendations=stability_recommendations,
            priority_score=7.8
        ))
        
        # 6. Maximize Alternate Fuels
        alt_fuel_metrics = [
            OperationalMetric(
                name="RDF Utilization",
                current_value=12.0,
                target_value=20.0,
                unit="%",
                status="poor",
                trend="increasing",
                last_updated=datetime.now()
            ),
            OperationalMetric(
                name="Biomass Utilization",
                current_value=8.0,
                target_value=12.0,
                unit="%",
                status="fair",
                trend="stable",
                last_updated=datetime.now()
            ),
            OperationalMetric(
                name="Plastic Waste Utilization",
                current_value=2.0,
                target_value=3.0,
                unit="%",
                status="fair",
                trend="increasing",
                last_updated=datetime.now()
            )
        ]
        
        alt_fuel_recommendations = [
            AIRecommendation(
                title="Optimize RDF Quality Control",
                description="Implement stringent RDF quality control to enable higher utilization rates",
                priority="high",
                category="alternate_fuels",
                action_required=True,
                estimated_impact="8% TSR increase"
            ),
            AIRecommendation(
                title="Develop Plastic Waste Processing",
                description="Enhance plastic waste preprocessing for safe utilization",
                priority="medium",
                category="waste_management",
                action_required=True,
                estimated_impact="1% TSR increase"
            )
        ]
        
        focus_areas.append(FocusArea(
            name="Maximize Alternate Fuels",
            description="Optimize alternate fuel utilization for sustainability and cost reduction",
            metrics=alt_fuel_metrics,
            recommendations=alt_fuel_recommendations,
            priority_score=8.2
        ))
        
        return focus_areas
    
    async def _generate_plant_overview(self) -> Dict[str, Any]:
        """Generate plant overview data"""
        return {
            "plant_name": settings.PLANT_NAME,
            "location": settings.PLANT_LOCATION,
            "capacity": {
                "clinker": "3500 ton/day",
                "cement": "4200 ton/day"
            },
            "current_production": {
                "clinker": 3420,
                "cement": 4050,
                "utilization": 96.4
            },
            "key_metrics": {
                "energy_efficiency": 85.2,
                "quality_index": 92.8,
                "environmental_compliance": 98.5,
                "safety_score": 94.2
            },
            "status": "operational",
            "last_maintenance": "2025-09-01",
            "next_maintenance": "2025-10-15"
        }
    
    async def _generate_real_time_alerts(self) -> List[Dict[str, Any]]:
        """Generate real-time alerts"""
        return [
            {
                "id": "alert_001",
                "type": "warning",
                "title": "Mill Power Consumption High",
                "description": "Cement mill power consumption exceeds target by 2 kWh/ton",
                "severity": "medium",
                "timestamp": datetime.now() - timedelta(minutes=15),
                "location": "Cement Mill #2",
                "action_required": True
            },
            {
                "id": "alert_002",
                "type": "info",
                "title": "TSR Optimization Opportunity",
                "description": "Current conditions favorable for increasing alternate fuel usage",
                "severity": "low",
                "timestamp": datetime.now() - timedelta(minutes=30),
                "location": "Kiln System",
                "action_required": False
            },
            {
                "id": "alert_003",
                "type": "warning",
                "title": "Blaine Fineness Variability",
                "description": "Blaine fineness showing increased variability in last 2 hours",
                "severity": "medium",
                "timestamp": datetime.now() - timedelta(minutes=45),
                "location": "Quality Lab",
                "action_required": True
            }
        ]
    
    async def _generate_performance_summary(self) -> Dict[str, Any]:
        """Generate performance summary"""
        return {
            "overall_score": 87.5,
            "categories": {
                "energy_efficiency": {
                    "score": 82.0,
                    "trend": "improving",
                    "key_metric": "Total specific power: 108 kWh/ton"
                },
                "quality_performance": {
                    "score": 91.5,
                    "trend": "stable",
                    "key_metric": "Quality index: 92.8/100"
                },
                "productivity": {
                    "score": 88.2,
                    "trend": "improving",
                    "key_metric": "OEE: 78.5%"
                },
                "sustainability": {
                    "score": 75.8,
                    "trend": "improving",
                    "key_metric": "TSR: 22%"
                }
            },
            "monthly_trends": {
                "production": [3200, 3350, 3420, 3380, 3450],
                "energy": [110, 108, 107, 109, 108],
                "quality": [91.2, 92.1, 92.8, 92.5, 92.8]
            }
        }
    
    async def generate_excel_data_files(self):
        """Generate comprehensive Excel data files for cement operations"""
        try:
            # Generate Raw Material and Grinding Data
            await self._generate_raw_grinding_data()
            
            # Generate Clinkerization Data
            await self._generate_clinkerization_data()
            
            # Generate Quality Control Data
            await self._generate_quality_control_data()
            
            # Generate Alternate Fuel and TSR Data
            await self._generate_alternate_fuel_data()
            
            # Generate Energy Efficiency Data
            await self._generate_energy_efficiency_data()
            
            # Generate Maintenance and Reliability Data
            await self._generate_maintenance_data()
            
            logger.info("Excel data files generated successfully")
            
        except Exception as e:
            logger.error(f"Excel data generation failed: {e}")
            raise
    
    async def _generate_raw_grinding_data(self):
        """Generate raw material and grinding operations data"""
        # Raw Material Data
        dates = pd.date_range(start='2025-01-01', end='2025-09-12', freq='H')
        
        raw_data = {
            'timestamp': dates,
            'limestone_feed_rate': np.random.normal(120, 5, len(dates)),
            'clay_feed_rate': np.random.normal(25, 2, len(dates)),
            'iron_ore_feed_rate': np.random.normal(8, 1, len(dates)),
            'gypsum_feed_rate': np.random.normal(5, 0.5, len(dates)),
            'raw_mill_power': np.random.normal(18.5, 1.2, len(dates)),
            'raw_mill_throughput': np.random.normal(145, 8, len(dates)),
            'raw_mix_fineness': np.random.normal(12, 1.5, len(dates)),
            'raw_mix_moisture': np.random.normal(0.8, 0.2, len(dates)),
            'separator_efficiency': np.random.normal(85, 3, len(dates)),
            'mill_vibration': np.random.normal(2.1, 0.3, len(dates))
        }
        
        raw_df = pd.DataFrame(raw_data)
        
        # Cement Grinding Data
        cement_data = {
            'timestamp': dates,
            'clinker_feed_rate': np.random.normal(135, 6, len(dates)),
            'gypsum_addition': np.random.normal(5.2, 0.3, len(dates)),
            'limestone_addition': np.random.normal(8.5, 0.5, len(dates)),
            'cement_mill_power': np.random.normal(32, 2.1, len(dates)),
            'cement_throughput': np.random.normal(13.2, 1.1, len(dates)),
            'blaine_fineness': np.random.normal(350, 25, len(dates)),
            'residue_45um': np.random.normal(8.5, 1.2, len(dates)),
            'residue_90um': np.random.normal(1.8, 0.4, len(dates)),
            'mill_temperature': np.random.normal(105, 8, len(dates)),
            'separator_speed': np.random.normal(85, 5, len(dates))
        }
        
        cement_df = pd.DataFrame(cement_data)
        
        # Save to Excel
        with pd.ExcelWriter(self.data_path / 'raw_grinding_operations.xlsx') as writer:
            raw_df.to_excel(writer, sheet_name='Raw_Material_Grinding', index=False)
            cement_df.to_excel(writer, sheet_name='Cement_Grinding', index=False)
    
    async def _generate_clinkerization_data(self):
        """Generate clinkerization process data"""
        dates = pd.date_range(start='2025-01-01', end='2025-09-12', freq='H')
        
        kiln_data = {
            'timestamp': dates,
            'preheater_temp': np.random.normal(1250, 30, len(dates)),
            'calciner_temp': np.random.normal(1850, 40, len(dates)),
            'kiln_inlet_temp': np.random.normal(1125, 25, len(dates)),
            'burning_zone_temp': np.random.normal(1450, 35, len(dates)),
            'cooler_temp': np.random.normal(175, 15, len(dates)),
            'kiln_speed': np.random.normal(2.8, 0.2, len(dates)),
            'fuel_flow_rate': np.random.normal(8.5, 0.8, len(dates)),
            'primary_air_flow': np.random.normal(185, 12, len(dates)),
            'secondary_air_temp': np.random.normal(950, 45, len(dates)),
            'kiln_draft': np.random.normal(-8, 1.5, len(dates)),
            'nox_emission': np.random.normal(420, 35, len(dates)),
            'co_emission': np.random.normal(85, 15, len(dates)),
            'so2_emission': np.random.normal(25, 8, len(dates)),
            'dust_emission': np.random.normal(15, 3, len(dates)),
            'clinker_production': np.random.normal(145, 8, len(dates)),
            'free_lime': np.random.normal(1.5, 0.3, len(dates)),
            'coating_thickness': np.random.normal(15, 3, len(dates))
        }
        
        kiln_df = pd.DataFrame(kiln_data)
        
        # Clinker Quality Data
        quality_dates = pd.date_range(start='2025-01-01', end='2025-09-12', freq='4H')
        
        quality_data = {
            'timestamp': quality_dates,
            'c3s_content': np.random.normal(58, 3, len(quality_dates)),
            'c2s_content': np.random.normal(18, 2, len(quality_dates)),
            'c3a_content': np.random.normal(8, 1, len(quality_dates)),
            'c4af_content': np.random.normal(10, 1, len(quality_dates)),
            'free_lime': np.random.normal(1.5, 0.3, len(quality_dates)),
            'free_cao': np.random.normal(0.8, 0.2, len(quality_dates)),
            'lsf': np.random.normal(95, 2, len(quality_dates)),
            'sm': np.random.normal(2.4, 0.1, len(quality_dates)),
            'am': np.random.normal(1.8, 0.1, len(quality_dates)),
            'burnability_index': np.random.normal(85, 5, len(quality_dates))
        }
        
        quality_df = pd.DataFrame(quality_data)
        
        # Save to Excel
        with pd.ExcelWriter(self.data_path / 'clinkerization_data.xlsx') as writer:
            kiln_df.to_excel(writer, sheet_name='Kiln_Operations', index=False)
            quality_df.to_excel(writer, sheet_name='Clinker_Quality', index=False)
    
    async def _generate_quality_control_data(self):
        """Generate quality control and testing data"""
        dates = pd.date_range(start='2025-01-01', end='2025-09-12', freq='2H')
        
        cement_quality = {
            'timestamp': dates,
            'blaine_fineness': np.random.normal(350, 25, len(dates)),
            'residue_45um': np.random.normal(8.5, 1.2, len(dates)),
            'residue_90um': np.random.normal(1.8, 0.4, len(dates)),
            'setting_time_initial': np.random.normal(180, 25, len(dates)),
            'setting_time_final': np.random.normal(280, 35, len(dates)),
            'compressive_strength_3d': np.random.normal(28, 3, len(dates)),
            'compressive_strength_7d': np.random.normal(38, 4, len(dates)),
            'compressive_strength_28d': np.random.normal(45, 5, len(dates)),
            'soundness': np.random.normal(2.5, 0.5, len(dates)),
            'consistency': np.random.normal(28, 2, len(dates)),
            'heat_of_hydration': np.random.normal(285, 15, len(dates)),
            'chloride_content': np.random.normal(0.08, 0.02, len(dates)),
            'so3_content': np.random.normal(2.8, 0.3, len(dates)),
            'loss_on_ignition': np.random.normal(2.2, 0.4, len(dates))
        }
        
        quality_df = pd.DataFrame(cement_quality)
        
        # Control Parameters
        control_data = {
            'timestamp': dates,
            'blaine_setpoint': np.random.normal(350, 5, len(dates)),
            'blaine_actual': np.random.normal(350, 25, len(dates)),
            'blaine_controller_output': np.random.normal(65, 10, len(dates)),
            'strength_prediction': np.random.normal(45, 3, len(dates)),
            'quality_index': np.random.normal(92, 5, len(dates)),
            'process_capability': np.random.normal(1.2, 0.2, len(dates)),
            'variability_index': np.random.normal(0.15, 0.03, len(dates))
        }
        
        control_df = pd.DataFrame(control_data)
        
        # Save to Excel
        with pd.ExcelWriter(self.data_path / 'quality_control_data.xlsx') as writer:
            quality_df.to_excel(writer, sheet_name='Cement_Quality_Tests', index=False)
            control_df.to_excel(writer, sheet_name='Quality_Control_Parameters', index=False)
    
    async def _generate_alternate_fuel_data(self):
        """Generate alternate fuel and TSR data"""
        dates = pd.date_range(start='2025-01-01', end='2025-09-12', freq='H')
        
        fuel_data = {
            'timestamp': dates,
            'coal_consumption': np.random.normal(6.8, 0.5, len(dates)),
            'rdf_consumption': np.random.normal(1.2, 0.3, len(dates)),
            'biomass_consumption': np.random.normal(0.8, 0.2, len(dates)),
            'plastic_waste_consumption': np.random.normal(0.2, 0.1, len(dates)),
            'tire_chips_consumption': np.random.normal(0.1, 0.05, len(dates)),
            'total_fuel_consumption': np.random.normal(9.1, 0.6, len(dates)),
            'tsr_percentage': np.random.normal(22, 3, len(dates)),
            'fuel_calorific_value': np.random.normal(28500, 1200, len(dates)),
            'fuel_moisture': np.random.normal(8, 2, len(dates)),
            'fuel_ash_content': np.random.normal(12, 2, len(dates)),
            'chlorine_content': np.random.normal(0.08, 0.02, len(dates)),
            'sulfur_content': np.random.normal(0.6, 0.1, len(dates))
        }
        
        fuel_df = pd.DataFrame(fuel_data)
        
        # Fuel Quality Analysis
        quality_dates = pd.date_range(start='2025-01-01', end='2025-09-12', freq='8H')
        
        fuel_quality = {
            'timestamp': quality_dates,
            'rdf_calorific_value': np.random.normal(18000, 1500, len(quality_dates)),
            'rdf_moisture': np.random.normal(15, 3, len(quality_dates)),
            'rdf_ash': np.random.normal(18, 4, len(quality_dates)),
            'rdf_chlorine': np.random.normal(0.12, 0.03, len(quality_dates)),
            'biomass_calorific_value': np.random.normal(15000, 1200, len(quality_dates)),
            'biomass_moisture': np.random.normal(25, 5, len(quality_dates)),
            'biomass_ash': np.random.normal(8, 2, len(quality_dates)),
            'plastic_calorific_value': np.random.normal(40000, 2000, len(quality_dates)),
            'plastic_chlorine': np.random.normal(0.25, 0.08, len(quality_dates)),
            'fuel_mix_optimization_score': np.random.normal(85, 8, len(quality_dates))
        }
        
        fuel_quality_df = pd.DataFrame(fuel_quality)
        
        # Save to Excel
        with pd.ExcelWriter(self.data_path / 'alternate_fuel_tsr_data.xlsx') as writer:
            fuel_df.to_excel(writer, sheet_name='Fuel_Consumption', index=False)
            fuel_quality_df.to_excel(writer, sheet_name='Fuel_Quality_Analysis', index=False)
    
    async def _generate_energy_efficiency_data(self):
        """Generate energy efficiency and power consumption data"""
        dates = pd.date_range(start='2025-01-01', end='2025-09-12', freq='H')
        
        energy_data = {
            'timestamp': dates,
            'total_power_consumption': np.random.normal(108, 6, len(dates)),
            'raw_mill_power': np.random.normal(18.5, 1.2, len(dates)),
            'cement_mill_power': np.random.normal(32, 2.1, len(dates)),
            'kiln_main_drive': np.random.normal(850, 45, len(dates)),
            'kiln_fan_power': np.random.normal(1200, 80, len(dates)),
            'preheater_fan_power': np.random.normal(950, 60, len(dates)),
            'cooler_fan_power': np.random.normal(680, 40, len(dates)),
            'compressor_power': np.random.normal(320, 25, len(dates)),
            'conveyor_power': np.random.normal(180, 15, len(dates)),
            'auxiliary_power': np.random.normal(450, 35, len(dates)),
            'power_factor': np.random.normal(0.92, 0.03, len(dates)),
            'energy_cost_per_ton': np.random.normal(12.5, 1.1, len(dates)),
            'heat_recovery_efficiency': np.random.normal(68, 4, len(dates)),
            'waste_heat_utilization': np.random.normal(45, 6, len(dates))
        }
        
        energy_df = pd.DataFrame(energy_data)
        
        # Efficiency Metrics
        efficiency_data = {
            'timestamp': dates,
            'overall_thermal_efficiency': np.random.normal(68.5, 3.2, len(dates)),
            'electrical_efficiency': np.random.normal(85.2, 2.8, len(dates)),
            'specific_heat_consumption': np.random.normal(3.2, 0.15, len(dates)),
            'specific_power_consumption': np.random.normal(108, 6, len(dates)),
            'energy_intensity_index': np.random.normal(0.92, 0.05, len(dates)),
            'carbon_footprint': np.random.normal(820, 35, len(dates)),
            'energy_cost_optimization': np.random.normal(88, 5, len(dates))
        }
        
        efficiency_df = pd.DataFrame(efficiency_data)
        
        # Save to Excel
        with pd.ExcelWriter(self.data_path / 'energy_efficiency_data.xlsx') as writer:
            energy_df.to_excel(writer, sheet_name='Power_Consumption', index=False)
            efficiency_df.to_excel(writer, sheet_name='Efficiency_Metrics', index=False)
    
    async def _generate_maintenance_data(self):
        """Generate maintenance and reliability data"""
        dates = pd.date_range(start='2025-01-01', end='2025-09-12', freq='D')
        
        maintenance_data = {
            'date': dates,
            'kiln_availability': np.random.normal(95.2, 2.1, len(dates)),
            'mill_availability': np.random.normal(92.8, 3.2, len(dates)),
            'overall_equipment_effectiveness': np.random.normal(78.5, 4.1, len(dates)),
            'planned_maintenance_hours': np.random.poisson(2, len(dates)),
            'unplanned_downtime_hours': np.random.poisson(1.2, len(dates)),
            'maintenance_cost_per_ton': np.random.normal(2.8, 0.5, len(dates)),
            'spare_parts_consumption': np.random.normal(15000, 2500, len(dates)),
            'mtbf_kiln': np.random.normal(720, 85, len(dates)),
            'mtbf_mill': np.random.normal(480, 65, len(dates)),
            'mttr_average': np.random.normal(4.2, 1.1, len(dates))
        }
        
        maintenance_df = pd.DataFrame(maintenance_data)
        
        # Condition Monitoring
        condition_dates = pd.date_range(start='2025-01-01', end='2025-09-12', freq='H')
        
        condition_data = {
            'timestamp': condition_dates,
            'kiln_vibration_de': np.random.normal(2.1, 0.4, len(condition_dates)),
            'kiln_vibration_nde': np.random.normal(1.9, 0.3, len(condition_dates)),
            'mill_vibration': np.random.normal(3.2, 0.6, len(condition_dates)),
            'bearing_temperature_kiln': np.random.normal(65, 8, len(condition_dates)),
            'bearing_temperature_mill': np.random.normal(58, 6, len(condition_dates)),
            'oil_analysis_score': np.random.normal(85, 10, len(condition_dates)),
            'refractory_thickness': np.random.normal(180, 15, len(condition_dates)),
            'liner_wear_percentage': np.random.normal(35, 8, len(condition_dates)),
            'predictive_maintenance_score': np.random.normal(88, 6, len(condition_dates))
        }
        
        condition_df = pd.DataFrame(condition_data)
        
        # Save to Excel
        with pd.ExcelWriter(self.data_path / 'maintenance_reliability_data.xlsx') as writer:
            maintenance_df.to_excel(writer, sheet_name='Maintenance_Metrics', index=False)
            condition_df.to_excel(writer, sheet_name='Condition_Monitoring', index=False)
