import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  loadDataFile,
  isCSVFormat,
  parseCSV,
  parseExcel,
  mapToSimulationData,
  mapToMillData,
  RawSimulationData,
  RawMillData,
  createFallbackSimulationData,
  createFallbackMillData,
} from '../utils/dataParser';
import { validateSensorData } from '../utils/sensorValidation';

export interface SensorData {
  value: number;
  unit: string;
  trend: 'up' | 'down' | 'stable';
  history: number[];
  position: [number, number, number];
  color: number;
  description: string;
}

export interface SimulationData {
  time: string;
  preheaterTemp: number;
  calcinerTemp: number;
  kilnInletTemp: number;
  burningZoneTemp: number;
  coolerTemp: number;
  kilnVibration: number;
  motorLoad: number;
  noxEmission: number;
  fuelRate: number;
  productionRate: number;
  co2Emission: number;
  so2Emission: number;
}

export interface MillData {
  time: string;
  mill1FeedRate: number;
  mill1Pressure: number;
  mill1ParticleSize: number;
  mill1Efficiency: number;
  mill2FeedRate: number;
  mill2Pressure: number;
  mill2ParticleSize: number;
  mill2Efficiency: number;
  powerConsumption: number;
  grindingMediaWear: number;
  productQuality: number;
}

interface DataContextType {
  sensorData: Record<string, SensorData>;
  simulationData: SimulationData[];
  millData: MillData[];
  currentTimeIndex: number;
  isSimulationMode: boolean;
  isRealtimeMode: boolean;
  setSimulationMode: (mode: boolean) => void;
  setIsRealtimeMode: (mode: boolean) => void;
  loadExcelData: () => Promise<void>;
  updateSensorData: (sensorId: string, data: Partial<SensorData>) => void;
  startRealtimeData: () => void;
  stopRealtimeData: () => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [sensorData, setSensorData] = useState<Record<string, SensorData>>({
    // Kiln sensors (real) - with 3D positions aligned to actual equipment
    temp1: { value:1245, unit:'°C', trend:'stable', history:[], position:[-6, 25, 0], color:0xe74c3c, description: 'Preheater Zone Temperature' },
    temp2: { value:1350, unit:'°C', trend:'up', history:[], position:[-6, 15, 0], color:0xff4757, description: 'Precalciner Zone Temperature' },
    temp3: { value:1120, unit:'°C', trend:'down', history:[], position:[-18.5, 6, 0], color:0xff6b6b, description: 'Kiln Inlet Temperature' },
    vibration: { value:2.3, unit:' mm/s', trend:'stable', history:[], position:[-6, 6, 0], color:0x74b9ff, description: 'Rotary Kiln Vibration' },
    load: { value:87, unit:'%', trend:'up', history:[], position:[-14, 4, 0], color:0x00b894, description: 'Kiln Drive Motor Load' },
    emission: { value:245, unit:' mg/Nm³', trend:'down', history:[], position:[-6, 34, 0], color:0xfd79a8, description: 'Nitrogen Oxide Emissions' },
    burning: { value:1450, unit:'°C', trend:'stable', history:[], position:[-6, 4, 0], color:0xff4757, description: 'Burning Zone Temperature' },
    cooler: { value:180, unit:'°C', trend:'stable', history:[], position:[6, 4, 0], color:0x74b9ff, description: 'Clinker Cooler Temperature' },

    // Mill sensors (real) - Updated positions for scaled mills
    'mill-feed': { value:12.4, unit:' t/h', trend:'stable', history:[], position:[20, 8, -8], color:0x6a5acd, description: 'Cement Mill #1 Feed Rate' },
    'mill-pressure': { value:2.1, unit:' bar', trend:'stable', history:[], position:[20, 8, 8], color:0x00b894, description: 'Cement Mill #2 Feed Rate' },
    'mill-particle': { value:12, unit:' µm', trend:'stable', history:[], position:[30, 8, 0], color:0xff6b6b, description: 'Storage Silo Level' },
    'mill-eff': { value:78, unit:'%', trend:'stable', history:[], position:[30, 8, 4], color:0xfdcb6e, description: 'Grinding Mill Efficiency' },
    
    // Additional monitoring sensors
    'particle-emission': { value:45, unit:' mg/Nm³', trend:'stable', history:[], position:[-6, 36, 0], color:0x95a5a6, description: 'Particulate Emissions' },
    'stack-flow': { value:1250, unit:' Nm³/h', trend:'stable', history:[], position:[-6, 30, 0], color:0x3498db, description: 'Stack Gas Flow Rate' }
  });

  const [simulationData, setSimulationData] = useState<SimulationData[]>([]);
  const [millData, setMillData] = useState<MillData[]>([]);
  const [currentTimeIndex, setCurrentTimeIndex] = useState(0);
  const [isSimulationMode, setIsSimulationMode] = useState(false);
  const [isRealtimeMode, setIsRealtimeModeState] = useState(true);
  const [realtimeInterval, setRealtimeInterval] = useState<NodeJS.Timeout | null>(null);

  const loadExcelData = useCallback(async () => {
    try {
      const [simulationData, millData] = await Promise.all([
        loadDataFile(
          '/data/kiln_simulation_data.xlsx',
          isCSVFormat,
          (text) => parseCSV<RawSimulationData>(text),
          parseExcel,
          mapToSimulationData
        ),
        loadDataFile(
          '/data/mill_simulation_data.xlsx',
          isCSVFormat,
          (text) => parseCSV<RawMillData>(text),
          parseExcel,
          mapToMillData
        ),
      ]);

      setSimulationData(simulationData.length > 0 ? simulationData : createFallbackSimulationData());
      setMillData(millData.length > 0 ? millData : createFallbackMillData());
    } catch (error) {
      console.error('Error loading data:', error);
      setSimulationData(createFallbackSimulationData());
      setMillData(createFallbackMillData());
    }
  }, []);



  const updateSensorData = useCallback((sensorId: string, data: Partial<SensorData>) => {
    const validatedData = validateSensorData(sensorId, data);
    setSensorData(prev => {
      const currentSensor = prev[sensorId];
      if (!currentSensor) return prev;

      const newSensorData = { ...currentSensor, ...validatedData };

      // Only update if data actually changed
      if (JSON.stringify(currentSensor) === JSON.stringify(newSensorData)) {
        return prev;
      }

      return {
        ...prev,
        [sensorId]: newSensorData
      };
    });
  }, []);

  // Start real-time data cycling from Excel files
  const startRealtimeData = useCallback(() => {
    if (realtimeInterval) {
      clearInterval(realtimeInterval);
    }

    const interval = setInterval(() => {
      setCurrentTimeIndex(prevIndex => {
        const newIndex = (prevIndex + 1) % Math.max(simulationData.length, millData.length, 1);
        
        // Update sensor data from Excel data
        if (simulationData.length > 0 && newIndex < simulationData.length) {
          const currentData = simulationData[newIndex];
          updateSensorData('temp1', { 
            value: currentData.preheaterTemp || 1245,
            trend: currentData.preheaterTemp > 1250 ? 'up' : currentData.preheaterTemp < 1240 ? 'down' : 'stable'
          });
          updateSensorData('temp2', { 
            value: currentData.calcinerTemp || 1850,
            trend: currentData.calcinerTemp > 1860 ? 'up' : currentData.calcinerTemp < 1840 ? 'down' : 'stable'
          });
          updateSensorData('temp3', { 
            value: currentData.kilnInletTemp || 1120,
            trend: currentData.kilnInletTemp > 1130 ? 'up' : currentData.kilnInletTemp < 1110 ? 'down' : 'stable'
          });
          updateSensorData('burning', { 
            value: currentData.burningZoneTemp || 1450,
            trend: currentData.burningZoneTemp > 1460 ? 'up' : currentData.burningZoneTemp < 1440 ? 'down' : 'stable'
          });
          updateSensorData('cooler', { 
            value: currentData.coolerTemp || 180,
            trend: currentData.coolerTemp > 190 ? 'up' : currentData.coolerTemp < 170 ? 'down' : 'stable'
          });
          updateSensorData('vibration', { 
            value: currentData.kilnVibration || 2.3,
            trend: currentData.kilnVibration > 2.5 ? 'up' : currentData.kilnVibration < 2.1 ? 'down' : 'stable'
          });
          updateSensorData('load', { 
            value: currentData.motorLoad || 87,
            trend: currentData.motorLoad > 90 ? 'up' : currentData.motorLoad < 85 ? 'down' : 'stable'
          });
          updateSensorData('emission', { 
            value: currentData.noxEmission || 245,
            trend: currentData.noxEmission > 250 ? 'up' : currentData.noxEmission < 240 ? 'down' : 'stable'
          });
          
          // Update additional sensors with realistic variations
          updateSensorData('particle-emission', { 
            value: 40 + Math.random() * 15,
            trend: Math.random() > 0.7 ? 'up' : Math.random() > 0.4 ? 'down' : 'stable'
          });
          
          updateSensorData('stack-flow', { 
            value: 1200 + Math.random() * 200,
            trend: Math.random() > 0.7 ? 'up' : Math.random() > 0.4 ? 'down' : 'stable'
          });
        }

        // Update mill data
        if (millData.length > 0 && newIndex < millData.length) {
          const currentMillData = millData[newIndex];
          updateSensorData('mill-feed', { 
            value: currentMillData.mill1FeedRate || 12.4,
            trend: currentMillData.mill1FeedRate > 13 ? 'up' : currentMillData.mill1FeedRate < 12 ? 'down' : 'stable'
          });
          updateSensorData('mill-pressure', { 
            value: currentMillData.mill1Pressure || 2.1,
            trend: currentMillData.mill1Pressure > 2.2 ? 'up' : currentMillData.mill1Pressure < 2.0 ? 'down' : 'stable'
          });
          updateSensorData('mill-particle', { 
            value: currentMillData.mill1ParticleSize || 12,
            trend: currentMillData.mill1ParticleSize > 13 ? 'up' : currentMillData.mill1ParticleSize < 11 ? 'down' : 'stable'
          });
          updateSensorData('mill-eff', { 
            value: currentMillData.mill1Efficiency || 78,
            trend: currentMillData.mill1Efficiency > 80 ? 'up' : currentMillData.mill1Efficiency < 76 ? 'down' : 'stable'
          });
        }

        return newIndex;
      });
    }, 2000); // Update every 2 seconds

    setRealtimeInterval(interval);
  }, [simulationData, millData, updateSensorData]);

  // Stop real-time data cycling
  const stopRealtimeData = useCallback(() => {
    if (realtimeInterval) {
      clearInterval(realtimeInterval);
      setRealtimeInterval(null);
    }
  }, [realtimeInterval]);

  const setIsRealtimeMode = useCallback((mode: boolean) => {
    setIsRealtimeModeState(mode);
    if (mode) {
      startRealtimeData();
    } else {
      stopRealtimeData();
    }
  }, [startRealtimeData, stopRealtimeData, realtimeInterval]);

  // Real-time data update function (matches HTML version)
  const updateDataTick = useCallback(() => {
    setSensorData(prev => {
      const newData = { ...prev };

      // Update each sensor with realistic variations
      Object.keys(newData).forEach(key => {
        const sensor = newData[key];
        const variation = (Math.random() - 0.5) * 0.02; // ±1%
        let newValue = sensor.value * (1 + variation);
        newValue = Math.round(newValue * 10) / 10;

        // Update trend based on comparison with last value
        if (sensor.history.length > 0) {
          const lastValue = sensor.history[sensor.history.length - 1];
          sensor.trend = newValue > lastValue ? 'up' : newValue < lastValue ? 'down' : 'stable';
        }

        sensor.value = newValue;
        sensor.history.push(newValue);

        // Keep only last 240 points
        if (sensor.history.length > 240) {
          sensor.history.shift();
        }
      });

      return newData;
    });
  }, []);

  useEffect(() => {
    loadExcelData();
  }, [loadExcelData]);

  // Start real-time data when Excel data is loaded
  useEffect(() => {
    if ((simulationData.length > 0 || millData.length > 0) && isRealtimeMode) {
      startRealtimeData();
    }
  }, [simulationData, millData, isRealtimeMode, startRealtimeData]);

  // Start data update loop (matches HTML version)
  useEffect(() => {
    const dataTimer = setInterval(updateDataTick, 1000); // Update every second
    return () => clearInterval(dataTimer);
  }, [updateDataTick]);

  useEffect(() => {
    if (isSimulationMode && simulationData.length > 0) {
      const interval = setInterval(() => {
        setCurrentTimeIndex(prev => (prev + 1) % simulationData.length);
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [isSimulationMode, simulationData]);

  useEffect(() => {
    if (isSimulationMode && simulationData.length > 0 && currentTimeIndex < simulationData.length) {
      const currentData = simulationData[currentTimeIndex];
      
      // Batch sensor updates to reduce re-renders
      const sensorUpdates = [
        { id: 'temp1', value: currentData.preheaterTemp },
        { id: 'temp2', value: currentData.calcinerTemp },
        { id: 'temp3', value: currentData.kilnInletTemp },
        { id: 'burning', value: currentData.burningZoneTemp },
        { id: 'cooler', value: currentData.coolerTemp },
        { id: 'vibration', value: currentData.kilnVibration },
        { id: 'load', value: currentData.motorLoad },
        { id: 'emission', value: currentData.noxEmission },
      ];

      sensorUpdates.forEach(({ id, value }) => {
        updateSensorData(id, { value });
      });
    }
  }, [currentTimeIndex, simulationData, isSimulationMode, updateSensorData]);

  const value: DataContextType = {
    sensorData,
    simulationData,
    millData,
    currentTimeIndex,
    isSimulationMode,
    isRealtimeMode,
    setSimulationMode: setIsSimulationMode,
    setIsRealtimeMode,
    loadExcelData,
    updateSensorData,
    startRealtimeData,
    stopRealtimeData
  };

  return (
    <DataContext.Provider value={value}>
      {children}
    </DataContext.Provider>
  );
};
