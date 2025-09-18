#!/usr/bin/env python3
"""
Generate comprehensive Excel data for Cement Plant Digital Twin Dashboard Demo
Creates realistic data with proper timestamps for sustainability, production, and environmental monitoring
"""

import pandas as pd
import numpy as np
from datetime import datetime, timedelta
import random
import os

# Create output directory
output_dir = "data/dashboard_demo"
os.makedirs(output_dir, exist_ok=True)

# Set random seed for reproducible data
np.random.seed(42)
random.seed(42)

def generate_timestamps(start_date, days=30, frequency='h'):
    """Generate timestamp range"""
    end_date = start_date + timedelta(days=days)
    return pd.date_range(start=start_date, end=end_date, freq=frequency)

def add_realistic_variation(base_value, variation_percent=10, trend=0):
    """Add realistic variation to base values with optional trend"""
    variation = abs(base_value) * (variation_percent / 100)
    noise = np.random.normal(0, max(0.01, variation/3))  # Ensure positive std dev
    return max(0, base_value + noise + trend)  # Ensure non-negative result

# Current timestamp for real-time demo
current_time = datetime.now()
start_time = current_time - timedelta(days=30)

print("🏭 Generating Cement Plant Dashboard Demo Data...")

# 1. SUSTAINABILITY METRICS DATA
print("📊 Creating Sustainability Metrics...")
sustainability_timestamps = generate_timestamps(start_time, days=30, frequency='h')

sustainability_data = []
for i, timestamp in enumerate(sustainability_timestamps):
    # Simulate daily and seasonal patterns
    hour = timestamp.hour
    day_factor = 1 + 0.1 * np.sin(2 * np.pi * hour / 24)  # Daily cycle
    trend_factor = 1 - 0.001 * i  # Slight improvement trend
    
    row = {
        'timestamp': timestamp,
        'overall_sustainability_score': add_realistic_variation(78 * day_factor * trend_factor, 5),
        'carbon_footprint_co2_per_ton': add_realistic_variation(0.82 * day_factor, 8),
        'energy_efficiency_percent': add_realistic_variation(85.4 * day_factor * trend_factor, 6),
        'water_usage_liters_per_ton': add_realistic_variation(245 / day_factor, 12),
        'water_recycling_rate_percent': add_realistic_variation(68 * trend_factor, 4),
        'renewable_energy_percent': add_realistic_variation(23.5 * trend_factor, 15),
        'waste_recycling_rate_percent': add_realistic_variation(92 * trend_factor, 3),
        'air_quality_index': add_realistic_variation(42, 20),
        'noise_level_db': add_realistic_variation(68, 8),
        'dust_emission_mg_per_m3': add_realistic_variation(15, 25),
        'water_discharge_quality_percent': add_realistic_variation(95, 3),
        'soil_quality_percent': add_realistic_variation(88, 5),
        'biodiversity_index': add_realistic_variation(72, 8)
    }
    sustainability_data.append(row)

sustainability_df = pd.DataFrame(sustainability_data)
sustainability_df.to_excel(f"{output_dir}/sustainability_metrics.xlsx", index=False)

# 2. PRODUCTION & OPERATIONAL DATA
print("⚙️ Creating Production & Operational Data...")
production_timestamps = generate_timestamps(start_time, days=30, frequency='30min')  # Every 30 minutes

production_data = []
for i, timestamp in enumerate(production_timestamps):
    hour = timestamp.hour
    # Production varies by shift (higher during day shift)
    shift_factor = 1.2 if 6 <= hour <= 18 else 0.9
    
    row = {
        'timestamp': timestamp,
        'clinker_production_tons_per_day': add_realistic_variation(2800 * shift_factor, 8),
        'cement_production_tons_per_day': add_realistic_variation(3200 * shift_factor, 10),
        'plant_utilization_percent': add_realistic_variation(87 * shift_factor, 5),
        'overall_equipment_effectiveness': add_realistic_variation(82, 6),
        'kiln_speed_rpm': add_realistic_variation(3.2, 4),
        'mill_throughput_tons_per_hour': add_realistic_variation(120 * shift_factor, 12),
        'fuel_consumption_tons_per_hour': add_realistic_variation(12.5 * shift_factor, 15),
        'power_consumption_mw': add_realistic_variation(28.5 * shift_factor, 8),
        'maintenance_efficiency_percent': add_realistic_variation(94, 4),
        'quality_compliance_percent': add_realistic_variation(98.5, 2)
    }
    production_data.append(row)

production_df = pd.DataFrame(production_data)
production_df.to_excel(f"{output_dir}/production_operational.xlsx", index=False)

# 3. ENVIRONMENTAL MONITORING DATA
print("🌍 Creating Environmental Monitoring Data...")
environmental_timestamps = generate_timestamps(start_time, days=30, frequency='15min')  # Every 15 minutes

environmental_data = []
for i, timestamp in enumerate(environmental_timestamps):
    hour = timestamp.hour
    weather_factor = 1 + 0.2 * np.sin(2 * np.pi * hour / 24)  # Weather influence
    
    row = {
        'timestamp': timestamp,
        'co2_emissions_kg_per_hour': add_realistic_variation(820 * weather_factor, 12),
        'nox_emissions_mg_per_nm3': add_realistic_variation(45 * weather_factor, 20),
        'so2_emissions_mg_per_nm3': add_realistic_variation(12, 25),
        'particulate_matter_mg_per_m3': add_realistic_variation(8, 30),
        'stack_temperature_celsius': add_realistic_variation(180 * weather_factor, 8),
        'ambient_temperature_celsius': add_realistic_variation(25 + 5 * np.sin(2 * np.pi * hour / 24), 15),
        'wind_speed_mps': add_realistic_variation(3.5, 40),
        'humidity_percent': add_realistic_variation(65, 20),
        'atmospheric_pressure_hpa': add_realistic_variation(1013, 2),
        'rainfall_mm': max(0, add_realistic_variation(0.1, 500)),
        'visibility_km': add_realistic_variation(15, 25)
    }
    environmental_data.append(row)

environmental_df = pd.DataFrame(environmental_data)
environmental_df.to_excel(f"{output_dir}/environmental_monitoring.xlsx", index=False)

# 4. ENERGY CONSUMPTION & EFFICIENCY DATA
print("⚡ Creating Energy Consumption Data...")
energy_timestamps = generate_timestamps(start_time, days=30, frequency='h')

energy_data = []
for i, timestamp in enumerate(energy_timestamps):
    hour = timestamp.hour
    peak_factor = 1.3 if 8 <= hour <= 20 else 0.8  # Peak hours
    
    row = {
        'timestamp': timestamp,
        'total_power_consumption_mw': add_realistic_variation(28.5 * peak_factor, 10),
        'kiln_power_consumption_mw': add_realistic_variation(12.5 * peak_factor, 8),
        'mill_power_consumption_mw': add_realistic_variation(8.2 * peak_factor, 12),
        'fan_power_consumption_mw': add_realistic_variation(4.5 * peak_factor, 15),
        'auxiliary_power_consumption_mw': add_realistic_variation(3.3 * peak_factor, 20),
        'solar_generation_mw': max(0, add_realistic_variation(2.5 * np.sin(max(0, np.pi * (hour - 6) / 12)), 30)),
        'wind_generation_mw': add_realistic_variation(1.8, 40),
        'grid_power_mw': add_realistic_variation(24.2 * peak_factor, 8),
        'power_factor': add_realistic_variation(0.92, 3),
        'energy_cost_per_mwh': add_realistic_variation(85, 12),
        'carbon_intensity_kg_co2_per_mwh': add_realistic_variation(0.45, 15)
    }
    energy_data.append(row)

energy_df = pd.DataFrame(energy_data)
energy_df.to_excel(f"{output_dir}/energy_consumption.xlsx", index=False)

# 5. WATER MANAGEMENT DATA
print("💧 Creating Water Management Data...")
water_timestamps = generate_timestamps(start_time, days=30, frequency='h')

water_data = []
for i, timestamp in enumerate(water_timestamps):
    hour = timestamp.hour
    usage_factor = 1.2 if 6 <= hour <= 22 else 0.8
    
    row = {
        'timestamp': timestamp,
        'total_water_consumption_m3_per_hour': add_realistic_variation(45 * usage_factor, 15),
        'process_water_m3_per_hour': add_realistic_variation(28 * usage_factor, 12),
        'cooling_water_m3_per_hour': add_realistic_variation(12 * usage_factor, 20),
        'domestic_water_m3_per_hour': add_realistic_variation(5 * usage_factor, 25),
        'recycled_water_m3_per_hour': add_realistic_variation(18 * usage_factor, 18),
        'treated_water_discharge_m3_per_hour': add_realistic_variation(8 * usage_factor, 30),
        'water_temperature_inlet_celsius': add_realistic_variation(22, 10),
        'water_temperature_outlet_celsius': add_realistic_variation(35, 15),
        'water_ph_level': add_realistic_variation(7.2, 5),
        'water_conductivity_us_per_cm': add_realistic_variation(450, 20),
        'suspended_solids_mg_per_l': add_realistic_variation(12, 40),
        'chemical_oxygen_demand_mg_per_l': add_realistic_variation(25, 30)
    }
    water_data.append(row)

water_df = pd.DataFrame(water_data)
water_df.to_excel(f"{output_dir}/water_management.xlsx", index=False)

# 6. TEMPERATURE MONITORING DATA
print("🌡️ Creating Temperature Monitoring Data...")
temperature_timestamps = generate_timestamps(start_time, days=30, frequency='5min')  # Every 5 minutes

temperature_data = []
for i, timestamp in enumerate(temperature_timestamps):
    hour = timestamp.hour
    operational_factor = 1.1 if 6 <= hour <= 22 else 0.95
    
    row = {
        'timestamp': timestamp,
        'preheater_temperature_celsius': add_realistic_variation(1250 * operational_factor, 5),
        'calciner_temperature_celsius': add_realistic_variation(1850 * operational_factor, 3),
        'kiln_inlet_temperature_celsius': add_realistic_variation(1120 * operational_factor, 6),
        'burning_zone_temperature_celsius': add_realistic_variation(1450 * operational_factor, 4),
        'cooler_inlet_temperature_celsius': add_realistic_variation(1200 * operational_factor, 8),
        'cooler_outlet_temperature_celsius': add_realistic_variation(180 * operational_factor, 12),
        'mill_inlet_temperature_celsius': add_realistic_variation(85, 15),
        'mill_outlet_temperature_celsius': add_realistic_variation(110, 10),
        'baghouse_temperature_celsius': add_realistic_variation(160, 8),
        'stack_temperature_celsius': add_realistic_variation(180, 10),
        'ambient_temperature_celsius': add_realistic_variation(25 + 8 * np.sin(2 * np.pi * hour / 24), 20)
    }
    temperature_data.append(row)

temperature_df = pd.DataFrame(temperature_data)
temperature_df.to_excel(f"{output_dir}/temperature_monitoring.xlsx", index=False)

# 7. QUALITY CONTROL DATA
print("🔬 Creating Quality Control Data...")
quality_timestamps = generate_timestamps(start_time, days=30, frequency='2h')  # Every 2 hours

quality_data = []
for i, timestamp in enumerate(quality_timestamps):
    row = {
        'timestamp': timestamp,
        'cement_blaine_fineness_cm2_per_g': add_realistic_variation(3200, 4),
        'compressive_strength_3_day_mpa': add_realistic_variation(25, 8),
        'compressive_strength_7_day_mpa': add_realistic_variation(35, 6),
        'compressive_strength_28_day_mpa': add_realistic_variation(45, 5),
        'setting_time_initial_minutes': add_realistic_variation(120, 15),
        'setting_time_final_minutes': add_realistic_variation(180, 12),
        'soundness_mm': add_realistic_variation(2.5, 20),
        'loss_on_ignition_percent': add_realistic_variation(3.2, 10),
        'insoluble_residue_percent': add_realistic_variation(0.8, 25),
        'sulfur_trioxide_percent': add_realistic_variation(2.8, 8),
        'chloride_content_percent': add_realistic_variation(0.05, 30),
        'alkali_content_percent': add_realistic_variation(0.6, 15),
        'free_lime_percent': add_realistic_variation(1.2, 20)
    }
    quality_data.append(row)

quality_df = pd.DataFrame(quality_data)
quality_df.to_excel(f"{output_dir}/quality_control.xlsx", index=False)

# 8. MAINTENANCE & RELIABILITY DATA
print("🔧 Creating Maintenance & Reliability Data...")
maintenance_timestamps = generate_timestamps(start_time, days=30, frequency='h')

maintenance_data = []
for i, timestamp in enumerate(maintenance_timestamps):
    row = {
        'timestamp': timestamp,
        'kiln_vibration_mm_per_s': add_realistic_variation(2.8, 25),
        'mill_vibration_mm_per_s': add_realistic_variation(3.2, 20),
        'fan_vibration_mm_per_s': add_realistic_variation(1.8, 30),
        'kiln_motor_current_amperes': add_realistic_variation(180, 8),
        'mill_motor_current_amperes': add_realistic_variation(220, 10),
        'bearing_temperature_kiln_celsius': add_realistic_variation(65, 12),
        'bearing_temperature_mill_celsius': add_realistic_variation(70, 15),
        'oil_pressure_kiln_bar': add_realistic_variation(2.5, 8),
        'oil_pressure_mill_bar': add_realistic_variation(3.0, 10),
        'equipment_availability_percent': add_realistic_variation(96, 3),
        'mean_time_between_failures_hours': add_realistic_variation(720, 15),
        'planned_maintenance_compliance_percent': add_realistic_variation(94, 5),
        'spare_parts_inventory_percent': add_realistic_variation(85, 8)
    }
    maintenance_data.append(row)

maintenance_df = pd.DataFrame(maintenance_data)
maintenance_df.to_excel(f"{output_dir}/maintenance_reliability.xlsx", index=False)

# 9. ALERTS & EVENTS DATA
print("🚨 Creating Alerts & Events Data...")
alerts_data = []
alert_types = [
    "Temperature Threshold Exceeded", "Vibration Alert", "Emission Limit Approached",
    "Water Quality Warning", "Energy Efficiency Drop", "Maintenance Due",
    "Quality Parameter Deviation", "Environmental Compliance Alert"
]

severities = ["low", "medium", "high", "critical"]
locations = [
    "Kiln Area", "Mill Section", "Preheater Tower", "Cooler Zone",
    "Baghouse Filter", "Control Room", "Water Treatment", "Power Station"
]

# Generate 100 alerts over the past 30 days
for i in range(100):
    alert_time = start_time + timedelta(
        days=random.randint(0, 29),
        hours=random.randint(0, 23),
        minutes=random.randint(0, 59)
    )
    
    alert = {
        'timestamp': alert_time,
        'alert_id': f"ALT-{2024090001 + i}",
        'alert_type': random.choice(alert_types),
        'severity': random.choice(severities),
        'location': random.choice(locations),
        'description': f"Automated alert generated for {random.choice(alert_types).lower()}",
        'status': random.choice(["active", "acknowledged", "resolved"]),
        'assigned_to': random.choice(["Operator A", "Maintenance Team", "Supervisor", "Engineer"]),
        'resolution_time_minutes': random.randint(15, 480) if random.random() > 0.3 else None
    }
    alerts_data.append(alert)

alerts_df = pd.DataFrame(alerts_data)
alerts_df = alerts_df.sort_values('timestamp')
alerts_df.to_excel(f"{output_dir}/alerts_events.xlsx", index=False)

# 10. REAL-TIME DASHBOARD SUMMARY
print("📋 Creating Real-Time Dashboard Summary...")
current_summary = {
    'last_updated': [current_time],
    'plant_status': ['Operational'],
    'overall_efficiency': [87.5],
    'sustainability_score': [78.2],
    'carbon_footprint': [0.82],
    'energy_efficiency': [85.4],
    'water_usage': [245],
    'production_rate': [3200],
    'active_alerts': [12],
    'critical_alerts': [2],
    'equipment_availability': [96.2],
    'environmental_compliance': [98.5]
}

summary_df = pd.DataFrame(current_summary)
summary_df.to_excel(f"{output_dir}/realtime_dashboard_summary.xlsx", index=False)

print("\n✅ Dashboard Demo Data Generation Complete!")
print(f"📁 Files created in: {output_dir}/")
print("\n📊 Generated Files:")
print("1. sustainability_metrics.xlsx - Environmental KPIs with hourly data")
print("2. production_operational.xlsx - Production metrics every 30 minutes")
print("3. environmental_monitoring.xlsx - Environmental data every 15 minutes")
print("4. energy_consumption.xlsx - Energy data hourly")
print("5. water_management.xlsx - Water usage and quality hourly")
print("6. temperature_monitoring.xlsx - Temperature data every 5 minutes")
print("7. quality_control.xlsx - Quality metrics every 2 hours")
print("8. maintenance_reliability.xlsx - Equipment health hourly")
print("9. alerts_events.xlsx - Historical alerts and events")
print("10. realtime_dashboard_summary.xlsx - Current status summary")

print(f"\n🎯 Total Data Points Generated: {len(sustainability_data) + len(production_data) + len(environmental_data) + len(energy_data) + len(water_data) + len(temperature_data) + len(quality_data) + len(maintenance_data) + len(alerts_data):,}")
print("🚀 Ready for Dashboard Demo!")
