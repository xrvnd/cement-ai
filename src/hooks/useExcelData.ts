/**
 * React Hook for Excel Data Integration
 * Provides real-time data loading from Excel files for dashboard demo
 */

import { useState, useEffect, useCallback } from 'react';
import { excelDataLoader, SustainabilityMetric, ProductionMetric, EnvironmentalMetric, AlertEvent } from '../utils/excelDataLoader';

interface UseExcelDataOptions {
  refreshInterval?: number; // milliseconds
  autoRefresh?: boolean;
}

interface ExcelDataState {
  sustainability: any;
  production: ProductionMetric[];
  environmental: EnvironmentalMetric[];
  alerts: AlertEvent[];
  summary: any;
  loading: boolean;
  error: string | null;
  lastUpdated: Date | null;
}

export const useExcelData = (options: UseExcelDataOptions = {}) => {
  const { refreshInterval = 30000, autoRefresh = true } = options;
  
  const [data, setData] = useState<ExcelDataState>({
    sustainability: null,
    production: [],
    environmental: [],
    alerts: [],
    summary: null,
    loading: true,
    error: null,
    lastUpdated: null
  });

  const loadData = useCallback(async () => {
    try {
      setData(prev => ({ ...prev, loading: true, error: null }));

      // Load all data in parallel for better performance
      const [
        sustainabilityData,
        productionData,
        environmentalData,
        alertsData,
        summaryData
      ] = await Promise.all([
        excelDataLoader.getSustainabilityDashboardData(),
        excelDataLoader.getProductionMetrics(50),
        excelDataLoader.getEnvironmentalMetrics(100),
        excelDataLoader.getAlertsEvents(20),
        excelDataLoader.getDashboardSummary()
      ]);

      setData({
        sustainability: sustainabilityData,
        production: productionData,
        environmental: environmentalData,
        alerts: alertsData,
        summary: summaryData,
        loading: false,
        error: null,
        lastUpdated: new Date()
      });

    } catch (error) {
      console.error('Error loading Excel data:', error);
      setData(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      }));
    }
  }, []);

  // Initial data load
  useEffect(() => {
    loadData();
  }, [loadData]);

  // Auto-refresh data
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(loadData, refreshInterval);
    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval, loadData]);

  // Manual refresh function
  const refresh = useCallback(() => {
    loadData();
  }, [loadData]);

  // Get chart data for specific metrics
  const getChartData = useCallback(async (metric: string, hours: number = 24) => {
    try {
      return await excelDataLoader.getRealtimeChartData(metric, hours);
    } catch (error) {
      console.error(`Error loading chart data for ${metric}:`, error);
      return [];
    }
  }, []);

  // Get specific sustainability metrics
  const getSustainabilityTrends = useCallback(async () => {
    try {
      const metrics = await excelDataLoader.getSustainabilityMetrics(168); // Last 7 days (hourly)
      
      // Group by day and calculate averages
      const dailyData: { [key: string]: any } = {};
      
      metrics.forEach(metric => {
        const date = new Date(metric.timestamp).toDateString();
        if (!dailyData[date]) {
          dailyData[date] = {
            date,
            carbonFootprint: [],
            energyEfficiency: [],
            waterUsage: [],
            wasteRecycling: []
          };
        }
        
        dailyData[date].carbonFootprint.push(metric.carbon_footprint_co2_per_ton);
        dailyData[date].energyEfficiency.push(metric.energy_efficiency_percent);
        dailyData[date].waterUsage.push(metric.water_usage_liters_per_ton);
        dailyData[date].wasteRecycling.push(metric.waste_recycling_rate_percent);
      });

      // Calculate daily averages
      return Object.values(dailyData).map((day: any) => ({
        date: day.date,
        carbonFootprint: day.carbonFootprint.reduce((a: number, b: number) => a + b, 0) / day.carbonFootprint.length,
        energyEfficiency: day.energyEfficiency.reduce((a: number, b: number) => a + b, 0) / day.energyEfficiency.length,
        waterUsage: day.waterUsage.reduce((a: number, b: number) => a + b, 0) / day.waterUsage.length,
        wasteRecycling: day.wasteRecycling.reduce((a: number, b: number) => a + b, 0) / day.wasteRecycling.length
      }));
    } catch (error) {
      console.error('Error loading sustainability trends:', error);
      return [];
    }
  }, []);

  // Get energy breakdown data
  const getEnergyBreakdown = useCallback(async () => {
    try {
      const energyData = await excelDataLoader.getEnergyMetrics(24); // Last 24 hours
      
      if (energyData.length === 0) return [];
      
      // Calculate averages for the day
      const totals = energyData.reduce((acc, curr) => ({
        solar: acc.solar + curr.solar_generation_mw,
        wind: acc.wind + curr.wind_generation_mw,
        grid: acc.grid + curr.grid_power_mw,
        total: acc.total + curr.total_power_consumption_mw
      }), { solar: 0, wind: 0, grid: 0, total: 0 });
      
      const count = energyData.length;
      const avgTotal = totals.total / count;
      
      return [
        { 
          source: 'Grid Power', 
          percentage: Math.round((totals.grid / count / avgTotal) * 100), 
          color: '#374151',
          emissions: 'High'
        },
        { 
          source: 'Solar', 
          percentage: Math.round((totals.solar / count / avgTotal) * 100), 
          color: '#f59e0b',
          emissions: 'Zero'
        },
        { 
          source: 'Wind', 
          percentage: Math.round((totals.wind / count / avgTotal) * 100), 
          color: '#06b6d4',
          emissions: 'Zero'
        }
      ].filter(item => item.percentage > 0);
    } catch (error) {
      console.error('Error loading energy breakdown:', error);
      return [];
    }
  }, []);

  // Get emission monitoring data
  const getEmissionData = useCallback(async () => {
    try {
      return await excelDataLoader.getEnvironmentalMetrics(96); // Last 24 hours (15-min intervals)
    } catch (error) {
      console.error('Error loading emission data:', error);
      return [];
    }
  }, []);

  // Get water management trends
  const getWaterTrends = useCallback(async () => {
    try {
      const waterData = await excelDataLoader.getWaterMetrics(168); // Last 7 days
      
      // Group by day
      const dailyData: { [key: string]: any } = {};
      
      waterData.forEach(metric => {
        const date = new Date(metric.timestamp).toDateString();
        if (!dailyData[date]) {
          dailyData[date] = {
            day: date,
            consumption: [],
            recycled: [],
            discharged: []
          };
        }
        
        dailyData[date].consumption.push(metric.total_water_consumption_m3_per_hour);
        dailyData[date].recycled.push(metric.recycled_water_m3_per_hour);
        dailyData[date].discharged.push(metric.treated_water_discharge_m3_per_hour);
      });

      return Object.values(dailyData).map((day: any) => ({
        day: day.day,
        consumption: Math.round(day.consumption.reduce((a: number, b: number) => a + b, 0) / day.consumption.length),
        recycled: Math.round(day.recycled.reduce((a: number, b: number) => a + b, 0) / day.recycled.length),
        discharged: Math.round(day.discharged.reduce((a: number, b: number) => a + b, 0) / day.discharged.length)
      }));
    } catch (error) {
      console.error('Error loading water trends:', error);
      return [];
    }
  }, []);

  return {
    data,
    loading: data.loading,
    error: data.error,
    lastUpdated: data.lastUpdated,
    refresh,
    getChartData,
    getSustainabilityTrends,
    getEnergyBreakdown,
    getEmissionData,
    getWaterTrends
  };
};

// Hook for real-time temperature data
export const useTemperatureData = (refreshInterval: number = 5000) => {
  const [temperatureData, setTemperatureData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const loadTemperatureData = useCallback(async () => {
    try {
      const data = await excelDataLoader.getTemperatureMetrics(288); // Last 24 hours (5-min intervals)
      setTemperatureData(data);
      setLoading(false);
    } catch (error) {
      console.error('Error loading temperature data:', error);
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadTemperatureData();
    const interval = setInterval(loadTemperatureData, refreshInterval);
    return () => clearInterval(interval);
  }, [loadTemperatureData, refreshInterval]);

  return { temperatureData, loading };
};

// Hook for production metrics
export const useProductionData = (refreshInterval: number = 30000) => {
  const [productionData, setProductionData] = useState<ProductionMetric[]>([]);
  const [loading, setLoading] = useState(true);

  const loadProductionData = useCallback(async () => {
    try {
      const data = await excelDataLoader.getProductionMetrics(48); // Last 24 hours (30-min intervals)
      setProductionData(data);
      setLoading(false);
    } catch (error) {
      console.error('Error loading production data:', error);
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProductionData();
    const interval = setInterval(loadProductionData, refreshInterval);
    return () => clearInterval(interval);
  }, [loadProductionData, refreshInterval]);

  return { productionData, loading };
};
