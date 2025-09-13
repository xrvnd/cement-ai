#!/usr/bin/env python3
"""
Simple script to generate Excel data files for cement plant operations
"""

import pandas as pd
import numpy as np
from datetime import datetime, timedelta
import os
from pathlib import Path

def generate_excel_data_files():
    """Generate comprehensive Excel data files for cement operations"""
    
    # Create data directory
    data_path = Path("../data")
    data_path.mkdir(exist_ok=True)
    
    print("Generating Excel data files...")
    
    # Generate Raw Material and Grinding Data
    generate_raw_grinding_data(data_path)
    
    # Generate Clinkerization Data
    generate_clinkerization_data(data_path)
    
    # Generate Quality Control Data
    generate_quality_control_data(data_path)
    
    # Generate Alternate Fuel and TSR Data
    generate_alternate_fuel_data(data_path)
    
    # Generate Energy Efficiency Data
    generate_energy_efficiency_data(data_path)
    
    # Generate Maintenance and Reliability Data
    generate_maintenance_data(data_path)
    
    print("Excel data files generated successfully!")
    print(f"Files saved to: {data_path.absolute()}")

def generate_raw_grinding_data(data_path):
    """Generate raw material and grinding operations data"""
    print("Generating raw material and grinding data...")
    
    # Raw Material Data
    dates = pd.date_range(start='2025-01-01', end='2025-09-12', freq='h')
    
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
    with pd.ExcelWriter(data_path / 'raw_grinding_operations.xlsx') as writer:
        raw_df.to_excel(writer, sheet_name='Raw_Material_Grinding', index=False)
        cement_df.to_excel(writer, sheet_name='Cement_Grinding', index=False)

def generate_clinkerization_data(data_path):
    """Generate clinkerization process data"""
    print("Generating clinkerization data...")
    
    dates = pd.date_range(start='2025-01-01', end='2025-09-12', freq='h')
    
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
    quality_dates = pd.date_range(start='2025-01-01', end='2025-09-12', freq='4h')
    
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
    with pd.ExcelWriter(data_path / 'clinkerization_data.xlsx') as writer:
        kiln_df.to_excel(writer, sheet_name='Kiln_Operations', index=False)
        quality_df.to_excel(writer, sheet_name='Clinker_Quality', index=False)

def generate_quality_control_data(data_path):
    """Generate quality control and testing data"""
    print("Generating quality control data...")
    
    dates = pd.date_range(start='2025-01-01', end='2025-09-12', freq='2h')
    
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
    with pd.ExcelWriter(data_path / 'quality_control_data.xlsx') as writer:
        quality_df.to_excel(writer, sheet_name='Cement_Quality_Tests', index=False)
        control_df.to_excel(writer, sheet_name='Quality_Control_Parameters', index=False)

def generate_alternate_fuel_data(data_path):
    """Generate alternate fuel and TSR data"""
    print("Generating alternate fuel and TSR data...")
    
    dates = pd.date_range(start='2025-01-01', end='2025-09-12', freq='h')
    
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
    quality_dates = pd.date_range(start='2025-01-01', end='2025-09-12', freq='8h')
    
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
    with pd.ExcelWriter(data_path / 'alternate_fuel_tsr_data.xlsx') as writer:
        fuel_df.to_excel(writer, sheet_name='Fuel_Consumption', index=False)
        fuel_quality_df.to_excel(writer, sheet_name='Fuel_Quality_Analysis', index=False)

def generate_energy_efficiency_data(data_path):
    """Generate energy efficiency and power consumption data"""
    print("Generating energy efficiency data...")
    
    dates = pd.date_range(start='2025-01-01', end='2025-09-12', freq='h')
    
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
    with pd.ExcelWriter(data_path / 'energy_efficiency_data.xlsx') as writer:
        energy_df.to_excel(writer, sheet_name='Power_Consumption', index=False)
        efficiency_df.to_excel(writer, sheet_name='Efficiency_Metrics', index=False)

def generate_maintenance_data(data_path):
    """Generate maintenance and reliability data"""
    print("Generating maintenance and reliability data...")
    
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
    condition_dates = pd.date_range(start='2025-01-01', end='2025-09-12', freq='h')
    
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
    with pd.ExcelWriter(data_path / 'maintenance_reliability_data.xlsx') as writer:
        maintenance_df.to_excel(writer, sheet_name='Maintenance_Metrics', index=False)
        condition_df.to_excel(writer, sheet_name='Condition_Monitoring', index=False)

if __name__ == "__main__":
    generate_excel_data_files()
