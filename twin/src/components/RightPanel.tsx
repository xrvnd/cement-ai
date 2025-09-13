import React, { useState } from 'react';
import styled from 'styled-components';
import { useData } from '../context/DataContext';
import { useGemini } from '../context/GeminiContext';

const RightPanelContainer = styled.div`
  width: 320px;
  background: linear-gradient(135deg, rgba(15, 20, 40, 0.98) 0%, rgba(44, 62, 80, 0.98) 100%);
  border-left: 2px solid rgba(116, 185, 255, 0.4);
  backdrop-filter: blur(15px);
  overflow-y: auto;
  position: relative;
`;

const PanelSection = styled.div`
  margin-bottom: 20px;
`;

const SectionTitle = styled.h3`
  color: #74b9ff;
  font-size: 16px;
  margin-bottom: 15px;
  border-bottom: 1px solid rgba(116, 185, 255, 0.2);
  padding-bottom: 5px;
`;

const DataCard = styled.div`
  background: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
  padding: 15px;
  margin-bottom: 10px;
  border: 1px solid rgba(116, 185, 255, 0.1);
`;

const DataHeader = styled.div`
  margin-bottom: 10px;
`;

const DataTitle = styled.h4`
  color: #8b9dc3;
  font-size: 14px;
  margin: 0;
`;

const FormGroup = styled.div`
  margin-bottom: 15px;
`;

const Label = styled.label`
  display: block;
  color: #8b9dc3;
  font-size: 12px;
  margin-bottom: 5px;
  font-weight: 500;
`;

const Input = styled.input`
  width: 100%;
  background: rgba(116, 185, 255, 0.1);
  border: 1px solid rgba(116, 185, 255, 0.3);
  border-radius: 6px;
  padding: 8px 12px;
  color: #74b9ff;
  font-size: 12px;
  transition: all 0.3s ease;

  &:focus {
    outline: none;
    border-color: rgba(116, 185, 255, 0.6);
    background: rgba(116, 185, 255, 0.15);
  }

  &::placeholder {
    color: rgba(116, 185, 255, 0.5);
  }
`;

const Button = styled.button<{ variant?: 'primary' | 'secondary' | 'ai' }>`
  padding: 8px 16px;
  border: none;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-right: 8px;
  margin-bottom: 8px;

  ${props => {
    if (props.variant === 'ai') {
      return `
        background: linear-gradient(135deg, #2ecc71 0%, #27ae60 100%);
        color: white;
        box-shadow: 0 2px 8px rgba(46, 204, 113, 0.3);
        
        &:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(46, 204, 113, 0.4);
        }
      `;
    } else if (props.variant === 'secondary') {
      return `
        background: rgba(116, 185, 255, 0.1);
        color: #74b9ff;
        border: 1px solid rgba(116, 185, 255, 0.3);
        
        &:hover {
          background: rgba(116, 185, 255, 0.2);
          border-color: rgba(116, 185, 255, 0.5);
        }
      `;
    } else {
      return `
        background: rgba(116, 185, 255, 0.2);
        color: #74b9ff;
        border: 1px solid rgba(116, 185, 255, 0.4);
        
        &:hover {
          background: rgba(116, 185, 255, 0.3);
          border-color: rgba(116, 185, 255, 0.6);
        }
      `;
    }
  }}

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }
`;

const ChartContainer = styled.div`
  background: rgba(0, 0, 0, 0.2);
  border-radius: 6px;
  padding: 15px;
  margin-bottom: 15px;
  border: 1px solid rgba(116, 185, 255, 0.2);
`;

const ChartTitle = styled.div`
  color: #74b9ff;
  font-size: 12px;
  font-weight: 600;
  margin-bottom: 10px;
  text-align: center;
`;

const ChartBar = styled.div<{ value: number; maxValue: number; color: string }>`
  height: 20px;
  background: ${props => props.color};
  border-radius: 3px;
  margin-bottom: 5px;
  position: relative;
  width: ${props => (props.value / props.maxValue) * 100}%;
  transition: width 0.5s ease;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
`;

const ChartLabel = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
`;

const ChartValue = styled.span`
  color: #8b9dc3;
  font-size: 11px;
`;

const ChartPercentage = styled.span`
  color: #74b9ff;
  font-size: 11px;
  font-weight: 600;
`;

const LoadingIndicator = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  color: #2ecc71;
  font-size: 12px;
  font-style: italic;
`;

const Spinner = styled.div`
  width: 14px;
  height: 14px;
  border: 2px solid rgba(46, 204, 113, 0.3);
  border-radius: 50%;
  border-top-color: #2ecc71;
  animation: spin 1s ease-in-out infinite;
  
  @keyframes spin {
    to { transform: rotate(360deg); }
  }
`;

const AIIndicator = styled.div`
  background: linear-gradient(135deg, #2ecc71 0%, #27ae60 100%);
  color: white;
  padding: 8px 12px;
  border-radius: 6px;
  font-size: 11px;
  font-weight: 600;
  text-align: center;
  margin-bottom: 15px;
  box-shadow: 0 2px 8px rgba(46, 204, 113, 0.3);
`;

interface SimulationFormData {
  preheaterTemp: number;
  calcinerTemp: number;
  kilnInletTemp: number;
  burningZoneTemp: number;
  coolerTemp: number;
  fuelRate: number;
  productionRate: number;
  motorLoad: number;
}

const RightPanel: React.FC = () => {
  const { simulationData, millData } = useData();
  const { callGeminiAPI } = useGemini();
  const [isLoading, setIsLoading] = useState(false);
  const [aiResponse, setAiResponse] = useState<string>('');
  
  const [formData, setFormData] = useState<SimulationFormData>({
    preheaterTemp: 1245,
    calcinerTemp: 1350,
    kilnInletTemp: 1100,
    burningZoneTemp: 1450,
    coolerTemp: 200,
    fuelRate: 12.5,
    productionRate: 120,
    motorLoad: 85
  });

  const handleInputChange = (field: keyof SimulationFormData, value: number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleReset = () => {
    setFormData({
      preheaterTemp: 1245,
      calcinerTemp: 1350,
      kilnInletTemp: 1100,
      burningZoneTemp: 1450,
      coolerTemp: 200,
      fuelRate: 12.5,
      productionRate: 120,
      motorLoad: 85
    });
    setAiResponse('');
  };

  const handleSave = () => {
    // Here you would typically save to context or backend
    // Simulation data saved
  };

  const handleAIOptimization = async () => {
    setIsLoading(true);
    try {
      const prompt = `As a cement plant optimization expert, analyze these production parameters and provide optimal values with insights:

Current Parameters:
- Preheater Temperature: ${formData.preheaterTemp}°C
- Calciner Temperature: ${formData.calcinerTemp}°C  
- Kiln Inlet Temperature: ${formData.kilnInletTemp}°C
- Burning Zone Temperature: ${formData.burningZoneTemp}°C
- Cooler Temperature: ${formData.coolerTemp}°C
- Fuel Rate: ${formData.fuelRate} ton/h
- Production Rate: ${formData.productionRate} ton/h
- Motor Load: ${formData.motorLoad}%

Please provide:
1. Optimal values for each parameter
2. Energy efficiency recommendations
3. Production optimization tips
4. Safety considerations
5. Cost-benefit analysis

Format the response in a clear, structured way.`;

      const response = await callGeminiAPI(prompt);
      setAiResponse(response);
    } catch (error) {
      setAiResponse('Error: Unable to get AI optimization. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const calculateEfficiency = () => {
    if (simulationData.length === 0) return 0;
    const avgTemp = simulationData.reduce((sum, data) => sum + data.burningZoneTemp, 0) / simulationData.length;
    const avgFuelRate = simulationData.reduce((sum, data) => sum + data.fuelRate, 0) / simulationData.length;
    
    const tempEfficiency = Math.max(0, 100 - Math.abs(avgTemp - 1450) / 10);
    const fuelEfficiency = Math.max(0, 100 - Math.abs(avgFuelRate - 12.5) / 0.5);
    
    return Math.round((tempEfficiency + fuelEfficiency) / 2);
  };

  const getChartData = () => {
    if (simulationData.length === 0) return [];
    
    const latest = simulationData[simulationData.length - 1];
    return [
      { label: 'Preheater Temp', value: latest.preheaterTemp, max: 1500, color: '#e74c3c' },
      { label: 'Calciner Temp', value: latest.calcinerTemp, max: 1500, color: '#f39c12' },
      { label: 'Burning Zone', value: latest.burningZoneTemp, max: 1500, color: '#e67e22' },
      { label: 'Cooler Temp', value: latest.coolerTemp, max: 300, color: '#3498db' },
      { label: 'Fuel Rate', value: latest.fuelRate, max: 20, color: '#9b59b6' },
      { label: 'Production', value: latest.productionRate, max: 150, color: '#2ecc71' }
    ];
  };

  return (
    <RightPanelContainer>
      <div style={{ padding: '20px' }}>
        <div style={{
          color: '#74b9ff',
          fontSize: '18px',
          fontWeight: 'bold',
          marginBottom: '20px',
          textAlign: 'center',
          textShadow: '0 2px 4px rgba(116, 185, 255, 0.3)'
        }}>
          🎮 Simulation Controls
        </div>

        <PanelSection>
          <SectionTitle>⚙️ Process Parameters</SectionTitle>
          
          <DataCard>
            <FormGroup>
              <Label>Preheater Temperature (°C)</Label>
              <Input
                type="number"
                value={formData.preheaterTemp}
                onChange={(e) => handleInputChange('preheaterTemp', Number(e.target.value))}
                placeholder="1200-1300"
                min="1200"
                max="1300"
              />
            </FormGroup>

            <FormGroup>
              <Label>Calciner Temperature (°C)</Label>
              <Input
                type="number"
                value={formData.calcinerTemp}
                onChange={(e) => handleInputChange('calcinerTemp', Number(e.target.value))}
                placeholder="1300-1400"
                min="1300"
                max="1400"
              />
            </FormGroup>

            <FormGroup>
              <Label>Kiln Inlet Temperature (°C)</Label>
              <Input
                type="number"
                value={formData.kilnInletTemp}
                onChange={(e) => handleInputChange('kilnInletTemp', Number(e.target.value))}
                placeholder="1000-1200"
                min="1000"
                max="1200"
              />
            </FormGroup>

            <FormGroup>
              <Label>Burning Zone Temperature (°C)</Label>
              <Input
                type="number"
                value={formData.burningZoneTemp}
                onChange={(e) => handleInputChange('burningZoneTemp', Number(e.target.value))}
                placeholder="1400-1500"
                min="1400"
                max="1500"
              />
            </FormGroup>

            <FormGroup>
              <Label>Cooler Temperature (°C)</Label>
              <Input
                type="number"
                value={formData.coolerTemp}
                onChange={(e) => handleInputChange('coolerTemp', Number(e.target.value))}
                placeholder="150-250"
                min="150"
                max="250"
              />
            </FormGroup>

            <FormGroup>
              <Label>Fuel Rate (ton/h)</Label>
              <Input
                type="number"
                value={formData.fuelRate}
                onChange={(e) => handleInputChange('fuelRate', Number(e.target.value))}
                placeholder="10-15"
                min="10"
                max="15"
                step="0.1"
              />
            </FormGroup>

            <FormGroup>
              <Label>Production Rate (ton/h)</Label>
              <Input
                type="number"
                value={formData.productionRate}
                onChange={(e) => handleInputChange('productionRate', Number(e.target.value))}
                placeholder="100-140"
                min="100"
                max="140"
              />
            </FormGroup>

            <FormGroup>
              <Label>Motor Load (%)</Label>
              <Input
                type="number"
                value={formData.motorLoad}
                onChange={(e) => handleInputChange('motorLoad', Number(e.target.value))}
                placeholder="70-95"
                min="70"
                max="95"
              />
            </FormGroup>

            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '15px' }}>
              <Button variant="ai" onClick={handleAIOptimization} disabled={isLoading}>
                {isLoading ? '🔄' : '🤖 AI Optimize'}
              </Button>
              <Button variant="secondary" onClick={handleReset}>
                🔄 Reset
              </Button>
              <Button onClick={handleSave}>
                💾 Save
              </Button>
            </div>
          </DataCard>
        </PanelSection>

        {aiResponse && (
          <PanelSection>
            <SectionTitle>🤖 AI Optimization Results</SectionTitle>
            <DataCard>
              <AIIndicator>
                ✨ AI-Powered Recommendations
              </AIIndicator>
              <div style={{ 
                color: '#8b9dc3', 
                fontSize: '11px', 
                lineHeight: '1.5',
                maxHeight: '200px',
                overflowY: 'auto'
              }}>
                {aiResponse}
              </div>
            </DataCard>
          </PanelSection>
        )}

        <PanelSection>
          <SectionTitle>📊 Performance Charts</SectionTitle>
          
          <ChartContainer>
            <ChartTitle>Temperature & Production Metrics</ChartTitle>
            {getChartData().map((item, index) => (
              <div key={index}>
                <ChartLabel>
                  <ChartValue>{item.label}</ChartValue>
                  <ChartPercentage>{Math.round((item.value / item.max) * 100)}%</ChartPercentage>
                </ChartLabel>
                <ChartBar 
                  value={item.value} 
                  maxValue={item.max} 
                  color={item.color}
                />
              </div>
            ))}
          </ChartContainer>

          <DataCard>
            <DataHeader>
              <DataTitle>System Performance</DataTitle>
            </DataHeader>
            <div style={{ marginBottom: '15px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ color: '#8b9dc3', fontSize: '12px' }}>Efficiency:</span>
                <span style={{ color: '#74b9ff', fontSize: '12px', fontWeight: 'bold' }}>
                  {calculateEfficiency()}%
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ color: '#8b9dc3', fontSize: '12px' }}>Data Points:</span>
                <span style={{ color: '#74b9ff', fontSize: '12px', fontWeight: 'bold' }}>
                  {simulationData.length}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#8b9dc3', fontSize: '12px' }}>Mill Records:</span>
                <span style={{ color: '#74b9ff', fontSize: '12px', fontWeight: 'bold' }}>
                  {millData.length}
                </span>
              </div>
            </div>
          </DataCard>
        </PanelSection>
      </div>
    </RightPanelContainer>
  );
};

export default RightPanel;
