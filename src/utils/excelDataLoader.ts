/**
 * Excel Data Loader for Dashboard Demo
 * Utility to load and process Excel data for real-time dashboard simulation
 */

import * as XLSX from 'xlsx';

export interface SustainabilityMetric {
  timestamp: string;
  overall_sustainability_score: number;
  carbon_footprint_co2_per_ton: number;
  energy_efficiency_percent: number;
  water_usage_liters_per_ton: number;
  water_recycling_rate_percent: number;
  renewable_energy_percent: number;
  waste_recycling_rate_percent: number;
  air_quality_index: number;
  noise_level_db: number;
  dust_emission_mg_per_m3: number;
  water_discharge_quality_percent: number;
  soil_quality_percent: number;
  biodiversity_index: number;
}

export interface ProductionMetric {
  timestamp: string;
  clinker_production_tons_per_day: number;
  cement_production_tons_per_day: number;
  plant_utilization_percent: number;
  overall_equipment_effectiveness: number;
  kiln_speed_rpm: number;
  mill_throughput_tons_per_hour: number;
  fuel_consumption_tons_per_hour: number;
  power_consumption_mw: number;
  maintenance_efficiency_percent: number;
  quality_compliance_percent: number;
}

export interface EnvironmentalMetric {
  timestamp: string;
  co2_emissions_kg_per_hour: number;
  nox_emissions_mg_per_nm3: number;
  so2_emissions_mg_per_nm3: number;
  particulate_matter_mg_per_m3: number;
  stack_temperature_celsius: number;
  ambient_temperature_celsius: number;
  wind_speed_mps: number;
  humidity_percent: number;
  atmospheric_pressure_hpa: number;
  rainfall_mm: number;
  visibility_km: number;
}

export interface EnergyMetric {
  timestamp: string;
  total_power_consumption_mw: number;
  kiln_power_consumption_mw: number;
  mill_power_consumption_mw: number;
  fan_power_consumption_mw: number;
  auxiliary_power_consumption_mw: number;
  solar_generation_mw: number;
  wind_generation_mw: number;
  grid_power_mw: number;
  power_factor: number;
  energy_cost_per_mwh: number;
  carbon_intensity_kg_co2_per_mwh: number;
}

export interface WaterMetric {
  timestamp: string;
  total_water_consumption_m3_per_hour: number;
  process_water_m3_per_hour: number;
  cooling_water_m3_per_hour: number;
  domestic_water_m3_per_hour: number;
  recycled_water_m3_per_hour: number;
  treated_water_discharge_m3_per_hour: number;
  water_temperature_inlet_celsius: number;
  water_temperature_outlet_celsius: number;
  water_ph_level: number;
  water_conductivity_us_per_cm: number;
  suspended_solids_mg_per_l: number;
  chemical_oxygen_demand_mg_per_l: number;
}

export interface TemperatureMetric {
  timestamp: string;
  preheater_temperature_celsius: number;
  calciner_temperature_celsius: number;
  kiln_inlet_temperature_celsius: number;
  burning_zone_temperature_celsius: number;
  cooler_inlet_temperature_celsius: number;
  cooler_outlet_temperature_celsius: number;
  mill_inlet_temperature_celsius: number;
  mill_outlet_temperature_celsius: number;
  baghouse_temperature_celsius: number;
  stack_temperature_celsius: number;
  ambient_temperature_celsius: number;
}

export interface AlertEvent {
  timestamp: string;
  alert_id: string;
  alert_type: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  location: string;
  description: string;
  status: 'active' | 'acknowledged' | 'resolved';
  assigned_to: string;
  resolution_time_minutes?: number;
}

export interface DashboardSummary {
  last_updated: string;
  plant_status: string;
  overall_efficiency: number;
  sustainability_score: number;
  carbon_footprint: number;
  energy_efficiency: number;
  water_usage: number;
  production_rate: number;
  active_alerts: number;
  critical_alerts: number;
  equipment_availability: number;
  environmental_compliance: number;
}

class ExcelDataLoader {
  private basePath = '/data/dashboard_demo/';
  
  /**
   * Load Excel file and convert to JSON
   */
  private async loadExcelFile(filename: string): Promise<any[]> {
    try {
      const response = await fetch(`${this.basePath}${filename}`);
      if (!response.ok) {
        throw new Error(`Failed to load ${filename}: ${response.statusText}`);
      }
      
      const arrayBuffer = await response.arrayBuffer();
      const workbook = XLSX.read(arrayBuffer, { type: 'array' });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      
      return XLSX.utils.sheet_to_json(worksheet);
    } catch (error) {
      console.error(`Error loading Excel file ${filename}:`, error);
      return [];
    }
  }

  /**
   * Get latest sustainability metrics
   */
  async getSustainabilityMetrics(limit: number = 100): Promise<SustainabilityMetric[]> {
    const data = await this.loadExcelFile('sustainability_metrics.xlsx');
    return data.slice(-limit) as SustainabilityMetric[];
  }

  /**
   * Get latest production metrics
   */
  async getProductionMetrics(limit: number = 100): Promise<ProductionMetric[]> {
    const data = await this.loadExcelFile('production_operational.xlsx');
    return data.slice(-limit) as ProductionMetric[];
  }

  /**
   * Get latest environmental metrics
   */
  async getEnvironmentalMetrics(limit: number = 100): Promise<EnvironmentalMetric[]> {
    const data = await this.loadExcelFile('environmental_monitoring.xlsx');
    return data.slice(-limit) as EnvironmentalMetric[];
  }

  /**
   * Get latest energy metrics
   */
  async getEnergyMetrics(limit: number = 100): Promise<EnergyMetric[]> {
    const data = await this.loadExcelFile('energy_consumption.xlsx');
    return data.slice(-limit) as EnergyMetric[];
  }

  /**
   * Get latest water metrics
   */
  async getWaterMetrics(limit: number = 100): Promise<WaterMetric[]> {
    const data = await this.loadExcelFile('water_management.xlsx');
    return data.slice(-limit) as WaterMetric[];
  }

  /**
   * Get latest temperature metrics
   */
  async getTemperatureMetrics(limit: number = 100): Promise<TemperatureMetric[]> {
    const data = await this.loadExcelFile('temperature_monitoring.xlsx');
    return data.slice(-limit) as TemperatureMetric[];
  }

  /**
   * Get recent alerts and events
   */
  async getAlertsEvents(limit: number = 50): Promise<AlertEvent[]> {
    const data = await this.loadExcelFile('alerts_events.xlsx');
    return data.slice(-limit) as AlertEvent[];
  }

  /**
   * Get current dashboard summary
   */
  async getDashboardSummary(): Promise<DashboardSummary | null> {
    const data = await this.loadExcelFile('realtime_dashboard_summary.xlsx');
    return data.length > 0 ? data[0] as DashboardSummary : null;
  }

  /**
   * Get real-time data for charts (simulates live updates)
   */
  async getRealtimeChartData(metric: string, hours: number = 24): Promise<any[]> {
    const now = new Date();
    const startTime = new Date(now.getTime() - (hours * 60 * 60 * 1000));
    
    let data: any[] = [];
    
    switch (metric) {
      case 'temperature':
        data = await this.getTemperatureMetrics(hours * 12); // 5-minute intervals
        break;
      case 'sustainability':
        data = await this.getSustainabilityMetrics(hours);
        break;
      case 'energy':
        data = await this.getEnergyMetrics(hours);
        break;
      case 'environmental':
        data = await this.getEnvironmentalMetrics(hours * 4); // 15-minute intervals
        break;
      case 'production':
        data = await this.getProductionMetrics(hours * 2); // 30-minute intervals
        break;
      default:
        return [];
    }
    
    // Filter data to requested time range
    return data.filter(item => {
      const itemTime = new Date(item.timestamp);
      return itemTime >= startTime && itemTime <= now;
    });
  }

  /**
   * Get aggregated sustainability data for dashboard cards
   */
  async getSustainabilityDashboardData(): Promise<any> {
    const metrics = await this.getSustainabilityMetrics(1);
    if (metrics.length === 0) return null;
    
    const latest = metrics[0];
    
    return {
      overallScore: Math.round(latest.overall_sustainability_score),
      carbonFootprint: {
        current: Number(latest.carbon_footprint_co2_per_ton.toFixed(2)),
        target: 0.75,
        trend: 'decreasing',
        monthlyReduction: 5.2
      },
      energyEfficiency: {
        current: Number(latest.energy_efficiency_percent.toFixed(1)),
        target: 90.0,
        trend: 'increasing',
        savings: 12.3
      },
      waterUsage: {
        current: Math.round(latest.water_usage_liters_per_ton),
        target: 220,
        trend: 'stable',
        recyclingRate: Math.round(latest.water_recycling_rate_percent)
      },
      wasteManagement: {
        recyclingRate: Math.round(latest.waste_recycling_rate_percent),
        target: 95,
        wasteReduction: 15.7,
        trend: 'increasing'
      },
      renewableEnergy: {
        percentage: Number(latest.renewable_energy_percent.toFixed(1)),
        target: 30.0,
        solarGeneration: 1250,
        windGeneration: 890
      },
      environmentalCompliance: {
        airQuality: latest.air_quality_index < 50 ? 'excellent' : latest.air_quality_index < 100 ? 'good' : 'fair',
        waterDischarge: latest.water_discharge_quality_percent > 95 ? 'excellent' : 'good',
        noiseLevel: latest.noise_level_db < 70 ? 'good' : 'fair',
        dustEmission: latest.dust_emission_mg_per_m3 < 10 ? 'excellent' : latest.dust_emission_mg_per_m3 < 20 ? 'good' : 'fair'
      }
    };
  }

  /**
   * Simulate real-time updates by adding small variations to latest data
   */
  simulateRealtimeUpdate(baseData: any, variationPercent: number = 2): any {
    const updated = { ...baseData };
    
    Object.keys(updated).forEach(key => {
      if (typeof updated[key] === 'number' && key !== 'timestamp') {
        const variation = updated[key] * (variationPercent / 100);
        const change = (Math.random() - 0.5) * 2 * variation;
        updated[key] = Math.max(0, updated[key] + change);
      }
    });
    
    updated.timestamp = new Date().toISOString();
    return updated;
  }
}

// Export singleton instance
export const excelDataLoader = new ExcelDataLoader();

// Utility functions for data formatting
export const formatTimestamp = (timestamp: string): string => {
  return new Date(timestamp).toLocaleString();
};

export const formatNumber = (value: number, decimals: number = 1): string => {
  return value.toFixed(decimals);
};

export const getStatusColor = (status: string): string => {
  switch (status.toLowerCase()) {
    case 'excellent': return '#10b981';
    case 'good': return '#3b82f6';
    case 'fair': return '#f59e0b';
    case 'poor': return '#ef4444';
    case 'critical': return '#dc2626';
    default: return '#6b7280';
  }
};

export const getTrendIcon = (trend: string): string => {
  switch (trend.toLowerCase()) {
    case 'increasing': return '↗️';
    case 'decreasing': return '↘️';
    case 'stable': return '➡️';
    default: return '➡️';
  }
};
