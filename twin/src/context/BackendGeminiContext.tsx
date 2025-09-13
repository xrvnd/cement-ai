import React, { createContext, useContext, useState, useCallback } from 'react';
import axios, { CancelTokenSource } from 'axios';

interface GeminiResponse {
  text: string;
  confidence: number;
  recommendations: AIRecommendation[];
  analysis_type: string;
  timestamp: string;
}

interface AIRecommendation {
  title: string;
  description: string;
  priority: string;
  category: string;
  action_required: boolean;
  estimated_impact?: string;
}

interface SensorReading {
  value: number;
  unit: string;
  timestamp: string;
  status: string;
}

interface KilnSensorData {
  temp1?: SensorReading;
  temp2?: SensorReading;
  temp3?: SensorReading;
  burning?: SensorReading;
  cooler?: SensorReading;
  vibration?: SensorReading;
  load?: SensorReading;
  emission?: SensorReading;
}

interface MillSensorData {
  'mill-feed'?: SensorReading;
  'mill-pressure'?: SensorReading;
  'mill-particle'?: SensorReading;
  'mill-eff'?: SensorReading;
}

interface GeminiContextType {
  geminiApiKey: string;
  aiResponse: GeminiResponse | null;
  isLoading: boolean;
  error: string | null;
  callGeminiAPI: (prompt: string) => Promise<string>;
  checkBurningZoneAlert: (temperature: number) => Promise<void>;
  optimizeProcess: (sensorData: any) => Promise<void>;
  analyzeKiln: (sensorData: any) => Promise<void>;
  analyzeMill: (sensorData: any) => Promise<void>;
}

const GeminiContext = createContext<GeminiContextType | undefined>(undefined);

export const useGemini = () => {
  const context = useContext(GeminiContext);
  if (!context) {
    throw new Error('useGemini must be used within a GeminiProvider');
  }
  return context;
};

export const GeminiProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [geminiApiKey] = useState('backend-managed');
  const [aiResponse, setAiResponse] = useState<GeminiResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cancelTokenSource, setCancelTokenSource] = useState<CancelTokenSource | null>(null);

  const API_BASE_URL = 'http://localhost:8000/api/v1';

  const callGeminiAPI = useCallback(async (prompt: string): Promise<string> => {
    // Cancel any existing request
    if (cancelTokenSource) {
      cancelTokenSource.cancel('Request cancelled by new request');
    }

    const newCancelTokenSource = axios.CancelToken.source();
    setCancelTokenSource(newCancelTokenSource);

    setIsLoading(true);
    setError(null);

    try {
      const response = await axios.post<GeminiResponse>(
        `${API_BASE_URL}/gemini/generate`,
        {
          prompt: prompt,
          analysis_type: 'general'
        },
        {
          headers: {
            'Content-Type': 'application/json'
          },
          cancelToken: newCancelTokenSource.token,
          timeout: 60000, // 60 second timeout
        }
      );

      setAiResponse(response.data);
      return response.data.text;

    } catch (err) {
      if (!axios.isCancel(err)) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to call Gemini API via backend';
        setError(errorMessage);
        console.error('Backend Gemini API Error:', err);
      }
      throw err;
    } finally {
      setIsLoading(false);
      setCancelTokenSource(null);
    }
  }, [cancelTokenSource]);

  const checkBurningZoneAlert = async (temperature: number) => {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/gemini/alert/burning-zone`,
        null,
        {
          params: { temperature },
          timeout: 30000
        }
      );

      if (response.data.alert && response.data.response) {
        setAiResponse(response.data.response);
      }
    } catch (err) {
      console.error('Burning zone alert check failed:', err);
      setError('Failed to check burning zone alert');
    }
  };

  const optimizeProcess = async (sensorData: any) => {
    try {
      setIsLoading(true);
      setError(null);

      // Convert sensor data to backend format
      const kilnData = convertToKilnSensorData(sensorData);
      const millData = convertToMillSensorData(sensorData);

      const response = await axios.post<GeminiResponse>(
        `${API_BASE_URL}/gemini/optimize`,
        {
          kiln_data: kilnData,
          mill_data: millData,
          optimization_goals: [
            'reduce_power_consumption',
            'improve_fuel_efficiency',
            'ensure_quality',
            'increase_productivity'
          ]
        },
        {
          timeout: 60000
        }
      );

      setAiResponse(response.data);
    } catch (err) {
      console.error('Process optimization failed:', err);
      setError('Failed to optimize process');
    } finally {
      setIsLoading(false);
    }
  };

  const analyzeKiln = useCallback(async (sensorData: any) => {
    try {
      setIsLoading(true);
      setError(null);

      const kilnData = convertToKilnSensorData(sensorData);

      const response = await axios.post<GeminiResponse>(
        `${API_BASE_URL}/analyze/kiln`,
        {
          sensor_data: kilnData,
          analysis_depth: 'comprehensive'
        },
        {
          timeout: 60000
        }
      );

      setAiResponse(response.data);
    } catch (err) {
      console.error('Kiln analysis failed:', err);
      setError('Failed to analyze kiln data');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const analyzeMill = useCallback(async (sensorData: any) => {
    try {
      setIsLoading(true);
      setError(null);

      const millData = convertToMillSensorData(sensorData);

      const response = await axios.post<GeminiResponse>(
        `${API_BASE_URL}/analyze/mill`,
        {
          sensor_data: millData,
          analysis_depth: 'comprehensive'
        },
        {
          timeout: 60000
        }
      );

      setAiResponse(response.data);
    } catch (err) {
      console.error('Mill analysis failed:', err);
      setError('Failed to analyze mill data');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Helper functions to convert sensor data
  const convertToKilnSensorData = (sensorData: any): KilnSensorData => {
    const currentTime = new Date().toISOString();
    
    return {
      temp1: sensorData.temp1 ? {
        value: sensorData.temp1.value || 0,
        unit: '°C',
        timestamp: currentTime,
        status: 'normal'
      } : undefined,
      temp2: sensorData.temp2 ? {
        value: sensorData.temp2.value || 0,
        unit: '°C',
        timestamp: currentTime,
        status: 'normal'
      } : undefined,
      temp3: sensorData.temp3 ? {
        value: sensorData.temp3.value || 0,
        unit: '°C',
        timestamp: currentTime,
        status: 'normal'
      } : undefined,
      burning: sensorData.burning ? {
        value: sensorData.burning.value || 0,
        unit: '°C',
        timestamp: currentTime,
        status: 'normal'
      } : undefined,
      cooler: sensorData.cooler ? {
        value: sensorData.cooler.value || 0,
        unit: '°C',
        timestamp: currentTime,
        status: 'normal'
      } : undefined,
      vibration: sensorData.vibration ? {
        value: sensorData.vibration.value || 0,
        unit: 'mm/s',
        timestamp: currentTime,
        status: 'normal'
      } : undefined,
      load: sensorData.load ? {
        value: sensorData.load.value || 0,
        unit: '%',
        timestamp: currentTime,
        status: 'normal'
      } : undefined,
      emission: sensorData.emission ? {
        value: sensorData.emission.value || 0,
        unit: 'mg/Nm³',
        timestamp: currentTime,
        status: 'normal'
      } : undefined
    };
  };

  const convertToMillSensorData = (sensorData: any): MillSensorData => {
    const currentTime = new Date().toISOString();
    
    return {
      'mill-feed': sensorData['mill-feed'] ? {
        value: sensorData['mill-feed'].value || 0,
        unit: 't/h',
        timestamp: currentTime,
        status: 'normal'
      } : undefined,
      'mill-pressure': sensorData['mill-pressure'] ? {
        value: sensorData['mill-pressure'].value || 0,
        unit: 'bar',
        timestamp: currentTime,
        status: 'normal'
      } : undefined,
      'mill-particle': sensorData['mill-particle'] ? {
        value: sensorData['mill-particle'].value || 0,
        unit: 'µm',
        timestamp: currentTime,
        status: 'normal'
      } : undefined,
      'mill-eff': sensorData['mill-eff'] ? {
        value: sensorData['mill-eff'].value || 0,
        unit: '%',
        timestamp: currentTime,
        status: 'normal'
      } : undefined
    };
  };

  const value: GeminiContextType = {
    geminiApiKey,
    aiResponse,
    isLoading,
    error,
    callGeminiAPI,
    checkBurningZoneAlert,
    optimizeProcess,
    analyzeKiln,
    analyzeMill
  };

  return (
    <GeminiContext.Provider value={value}>
      {children}
    </GeminiContext.Provider>
  );
};
