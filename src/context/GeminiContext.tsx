import React, { createContext, useContext, useState, useCallback } from 'react';
import axios, { CancelTokenSource } from 'axios';

interface GeminiResponse {
  text: string;
  confidence: number;
  recommendations: string[];
}

interface GeminiContextType {
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
  const [aiResponse, setAiResponse] = useState<GeminiResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cancelTokenSource, setCancelTokenSource] = useState<CancelTokenSource | null>(null);

  const createKilnAnalysisPrompt = useCallback((sensorData: any) => {
    const currentTime = new Date().toLocaleString();
    const kilnData = {
      preheaterTemp: sensorData.temp1?.value || 0,
      calcinerTemp: sensorData.temp2?.value || 0,
      kilnInletTemp: sensorData.temp3?.value || 0,
      burningZoneTemp: sensorData.burning?.value || 0,
      coolerTemp: sensorData.cooler?.value || 0,
      vibration: sensorData.vibration?.value || 0,
      motorLoad: sensorData.load?.value || 0,
      noxEmission: sensorData.emission?.value || 0
    };

    return `As an expert cement plant process engineer with 20+ years of experience in rotary kiln operations, analyze the following JK Cement plant kiln operation data and provide comprehensive insights for optimization:

TIMESTAMP: ${currentTime}

KILN OPERATION DATA (JK Cement Standards):
- Preheater Temperature: ${kilnData.preheaterTemp}°C (Optimal: 1200-1300°C)
- Calciner Temperature: ${kilnData.calcinerTemp}°C (Optimal: 1800-1900°C)
- Kiln Inlet Temperature: ${kilnData.kilnInletTemp}°C (Optimal: 1100-1150°C)
- Burning Zone Temperature: ${kilnData.burningZoneTemp}°C (Optimal: 1400-1500°C)
- Cooler Temperature: ${kilnData.coolerTemp}°C (Optimal: 150-200°C)
- Kiln Vibration: ${kilnData.vibration} mm/s (Alert: >3.0 mm/s)
- Motor Load: ${kilnData.motorLoad}% (Optimal: 80-90%)
- NOx Emissions: ${kilnData.noxEmission} mg/Nm³ (Limit: <500 mg/Nm³)

Please provide a detailed analysis covering:

1. **OPERATIONAL STATUS ASSESSMENT**
   - Current efficiency rating (Excellent/Good/Fair/Poor)
   - Key performance indicators status
   - Comparison with JK Cement best practices

2. **CRITICAL ISSUES DETECTION**
   - Temperature profile analysis
   - Vibration and mechanical health
   - Environmental compliance status
   - Energy efficiency indicators

3. **OPTIMIZATION RECOMMENDATIONS**
   - Specific temperature adjustments
   - Fuel optimization strategies
   - Maintenance scheduling suggestions
   - Quality improvement measures

4. **SAFETY & COMPLIANCE**
   - Safety risk assessment
   - Environmental impact analysis
   - Regulatory compliance status

5. **ACTIONABLE IMPROVEMENTS**
   - Immediate actions (next 24 hours)
   - Short-term optimizations (1-7 days)
   - Long-term strategic improvements (1-3 months)

6. **PREDICTIVE INSIGHTS**
   - Potential equipment failures
   - Quality trend predictions
   - Energy consumption forecasts

Format your response with clear sections, bullet points, and specific numerical recommendations. Focus on practical, implementable solutions for JK Cement plant operators.`;
  }, []);

  const createMillAnalysisPrompt = useCallback((sensorData: any) => {
    const currentTime = new Date().toLocaleString();
    const millData = {
      feedRate: sensorData['mill-feed']?.value || 0,
      pressure: sensorData['mill-pressure']?.value || 0,
      particleSize: sensorData['mill-particle']?.value || 0,
      efficiency: sensorData['mill-eff']?.value || 0
    };

    return `As an expert cement plant process engineer with 20+ years of experience in grinding operations and cement mill optimization, analyze the following JK Cement plant mill operation data and provide comprehensive insights for optimization:

TIMESTAMP: ${currentTime}

MILL OPERATION DATA (JK Cement Standards):
- Feed Rate: ${millData.feedRate} t/h (Optimal: 12-15 t/h)
- Mill Pressure: ${millData.pressure} bar (Optimal: 2.0-2.5 bar)
- Particle Size Distribution: ${millData.particleSize} µm (Target: 10-15 µm)
- Grinding Efficiency: ${millData.efficiency}% (Target: >80%)

Please provide a detailed analysis covering:

1. **MILL PERFORMANCE ASSESSMENT**
   - Current efficiency rating (Excellent/Good/Fair/Poor)
   - Throughput optimization potential
   - Energy consumption analysis
   - Comparison with JK Cement best practices

2. **GRINDING QUALITY ANALYSIS**
   - Particle size distribution assessment
   - Cement quality indicators
   - Blaine fineness analysis
   - Strength development potential

3. **OPERATIONAL OPTIMIZATION**
   - Feed rate optimization strategies
   - Grinding media efficiency
   - Separator performance analysis
   - Power consumption optimization

4. **MAINTENANCE & RELIABILITY**
   - Equipment health assessment
   - Predictive maintenance recommendations
   - Wear pattern analysis
   - Spare parts optimization

5. **ENERGY EFFICIENCY**
   - Specific energy consumption analysis
   - Power optimization strategies
   - Heat recovery opportunities
   - Cost reduction measures

6. **QUALITY CONTROL**
   - Product consistency measures
   - Quality assurance protocols
   - Process control improvements
   - Customer satisfaction impact

7. **ACTIONABLE RECOMMENDATIONS**
   - Immediate operational adjustments
   - Short-term optimization plans
   - Long-term strategic improvements
   - ROI projections for improvements

Format your response with clear sections, specific numerical targets, and practical implementation steps. Focus on JK Cement's quality standards and operational excellence.`;
  }, []);

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
      const response = await axios.post(
        'http://localhost:8000/api/v1/gemini/generate',
        {
          prompt: prompt,
          context: {
            analysis_type: "general",
            plant_context: "JK Cement Plant Operations"
          }
        },
        {
          headers: {
            'Content-Type': 'application/json'
          },
          cancelToken: newCancelTokenSource.token,
          timeout: 30000, // 30 second timeout
        }
      );

      if (response.data?.text) {
        const responseText = response.data.text;

        setAiResponse({
          text: responseText,
          confidence: response.data.confidence || 0.95,
          recommendations: response.data.recommendations?.map((rec: any) => rec.description) || extractRecommendations(responseText)
        });

        return responseText; // Return the response text
      } else {
        throw new Error('Invalid response format from backend API');
      }
    } catch (err) {
      if (!axios.isCancel(err)) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to call Gemini API via backend';
        setError(errorMessage);
        console.error('Backend Gemini API Error:', err);
      }
      throw err; // Re-throw the error
    } finally {
      setIsLoading(false);
      setCancelTokenSource(null);
    }
  }, [cancelTokenSource]);

  const checkBurningZoneAlert = async (temperature: number) => {
    if (temperature > 1600) {
      const prompt = `ALERT: Cement kiln burning zone temperature has exceeded 1600°C (currently ${temperature}°C). 
      
      This is a critical safety and quality issue. Please provide:
      1. Immediate safety recommendations
      2. Process optimization suggestions
      3. Quality impact assessment
      4. Preventive measures for future occurrences
      
      Respond in a structured format with clear action items.`;
      
      await callGeminiAPI(prompt);
    }
  };

  const optimizeProcess = async (sensorData: any) => {
    const prompt = `Cement Plant Process Optimization Analysis:
    
    Current sensor readings:
    - Preheater Temperature: ${sensorData.temp1?.value}°C
    - Calciner Temperature: ${sensorData.temp2?.value}°C
    - Burning Zone Temperature: ${sensorData.burning?.value}°C
    - NOx Emissions: ${sensorData.emission?.value} mg/Nm³
    - Kiln Vibration: ${sensorData.vibration?.value} mm/s
    - Motor Load: ${sensorData.load?.value}%
    
    Please analyze these parameters and provide:
    1. Process efficiency optimization recommendations
    2. Energy consumption reduction strategies
    3. Quality improvement suggestions
    4. Environmental compliance optimization
    5. Predictive maintenance insights
    
    Focus on practical, actionable recommendations.`;
    
    await callGeminiAPI(prompt);
  };

  const extractRecommendations = (text: string): string[] => {
    // Simple extraction of recommendations from AI response
    const lines = text.split('\n');
    const recommendations: string[] = [];
    
    lines.forEach(line => {
      if (line.trim().startsWith('-') || line.trim().startsWith('•') || line.trim().startsWith('*')) {
        recommendations.push(line.trim().substring(1).trim());
      }
    });
    
    return recommendations.length > 0 ? recommendations : [text];
  };

  const analyzeKiln = useCallback(async (sensorData: any) => {
    const prompt = createKilnAnalysisPrompt(sensorData);
    await callGeminiAPI(prompt);
  }, [callGeminiAPI, createKilnAnalysisPrompt]);

  const analyzeMill = useCallback(async (sensorData: any) => {
    const prompt = createMillAnalysisPrompt(sensorData);
    await callGeminiAPI(prompt);
  }, [callGeminiAPI, createMillAnalysisPrompt]);

  const value: GeminiContextType = {
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
