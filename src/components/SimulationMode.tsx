import React, { useState } from 'react';
import styled from 'styled-components';
import { useData } from '../context/DataContext';
import { useGemini } from '../context/GeminiContext';

const SimulationContainer = styled.div`
  padding: 20px;
  background: rgba(15, 20, 40, 0.9);
  border-radius: 8px;
  border: 1px solid rgba(116, 185, 255, 0.3);
  margin: 10px;
`;

const Title = styled.h3`
  color: #74b9ff;
  margin-bottom: 20px;
  font-size: 18px;
`;

const InputGroup = styled.div`
  margin-bottom: 15px;
`;

const Label = styled.label`
  display: block;
  color: #8b9dc3;
  margin-bottom: 5px;
  font-size: 14px;
`;

const Input = styled.input`
  width: 100%;
  padding: 8px 12px;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(116, 185, 255, 0.3);
  border-radius: 4px;
  color: #ffffff;
  font-size: 14px;
  
  &:focus {
    outline: none;
    border-color: #74b9ff;
    box-shadow: 0 0 0 2px rgba(116, 185, 255, 0.2);
  }
`;

const Button = styled.button`
  background: linear-gradient(135deg, #74b9ff 0%, #0984e3 100%);
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  margin-right: 10px;
  margin-bottom: 10px;
  
  &:hover {
    background: linear-gradient(135deg, #0984e3 0%, #74b9ff 100%);
  }
  
  &:disabled {
    background: #666;
    cursor: not-allowed;
  }
`;

const ResultsContainer = styled.div`
  margin-top: 20px;
  padding: 15px;
  background: rgba(0, 0, 0, 0.3);
  border-radius: 4px;
  border-left: 3px solid #74b9ff;
`;

const ResultItem = styled.div`
  margin-bottom: 10px;
  color: #ffffff;
  font-size: 14px;
`;

const AIResponseContainer = styled.div`
  margin-top: 20px;
  padding: 15px;
  background: rgba(0, 255, 136, 0.1);
  border-radius: 4px;
  border-left: 3px solid #00ff88;
`;

const AIResponseTitle = styled.h4`
  color: #00ff88;
  margin-bottom: 10px;
  font-size: 16px;
`;

const AIResponseText = styled.div`
  color: #ffffff;
  font-size: 14px;
  line-height: 1.5;
  white-space: pre-wrap;
`;

const LoadingSpinner = styled.div`
  display: inline-block;
  width: 20px;
  height: 20px;
  border: 3px solid rgba(116, 185, 255, 0.3);
  border-radius: 50%;
  border-top-color: #74b9ff;
  animation: spin 1s ease-in-out infinite;
  
  @keyframes spin {
    to { transform: rotate(360deg); }
  }
`;

const SimulationMode: React.FC = () => {
  const { sensorData, updateSensorData, isSimulationMode, setSimulationMode } = useData();
  const { aiResponse, isLoading, optimizeProcess } = useGemini();
  
  const [inputs, setInputs] = useState({
    preheaterTemp: sensorData.temp1?.value || 1245,
    calcinerTemp: sensorData.temp2?.value || 1850,
    burningZoneTemp: sensorData.burning?.value || 1450,
    fuelRate: 45.2,
    kilnSpeed: 2.5,
    airFlow: 1200,
    materialFeed: 150
  });

  const [results, setResults] = useState<{
    co2Emission: number;
    noxEmission: number;
    so2Emission: number;
    efficiency: number;
    quality: number;
  } | null>(null);

  // Enhanced simulation controls
  const [simulationState, setSimulationState] = useState<'stopped' | 'playing' | 'paused'>('stopped');
  const [simulationSpeed, setSimulationSpeed] = useState(1); // 1x, 2x, 4x, etc.

  const handleInputChange = (field: string, value: number) => {
    setInputs(prev => ({ ...prev, [field]: value }));
  };

  const calculateEmissions = () => {
    // Simplified emission calculation model
    const co2Emission = inputs.fuelRate * 2.5 + inputs.burningZoneTemp * 0.1;
    const noxEmission = inputs.burningZoneTemp * 0.15 + inputs.airFlow * 0.02;
    const so2Emission = inputs.fuelRate * 0.3 + inputs.materialFeed * 0.01;
    
    const efficiency = Math.max(0, 100 - (inputs.burningZoneTemp - 1450) * 0.05);
    const quality = Math.max(0, 100 - Math.abs(inputs.burningZoneTemp - 1450) * 0.1);
    
    setResults({
      co2Emission: Math.round(co2Emission * 100) / 100,
      noxEmission: Math.round(noxEmission * 100) / 100,
      so2Emission: Math.round(so2Emission * 100) / 100,
      efficiency: Math.round(efficiency * 100) / 100,
      quality: Math.round(quality * 100) / 100
    });

    // Update sensor data with new values
    updateSensorData('temp1', { value: inputs.preheaterTemp });
    updateSensorData('temp2', { value: inputs.calcinerTemp });
    updateSensorData('burning', { value: inputs.burningZoneTemp });
  };

  const runOptimization = async () => {
    await optimizeProcess(sensorData);
  };

  const resetToDefaults = () => {
    setInputs({
      preheaterTemp: 1245,
      calcinerTemp: 1850,
      burningZoneTemp: 1450,
      fuelRate: 45.2,
      kilnSpeed: 2.5,
      airFlow: 1200,
      materialFeed: 150
    });
    setResults(null);
  };

  return (
    <SimulationContainer>
      <Title>🔬 Simulation Mode - Process Parameter Testing</Title>
      
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
        <div>
          <InputGroup>
            <Label>Preheater Temperature (°C)</Label>
            <Input
              type="number"
              value={inputs.preheaterTemp}
              onChange={(e) => handleInputChange('preheaterTemp', Number(e.target.value))}
              min="800"
              max="1400"
            />
          </InputGroup>

          <InputGroup>
            <Label>Calciner Temperature (°C)</Label>
            <Input
              type="number"
              value={inputs.calcinerTemp}
              onChange={(e) => handleInputChange('calcinerTemp', Number(e.target.value))}
              min="1400"
              max="2000"
            />
          </InputGroup>

          <InputGroup>
            <Label>Burning Zone Temperature (°C)</Label>
            <Input
              type="number"
              value={inputs.burningZoneTemp}
              onChange={(e) => handleInputChange('burningZoneTemp', Number(e.target.value))}
              min="1200"
              max="1800"
            />
          </InputGroup>

          <InputGroup>
            <Label>Fuel Rate (t/h)</Label>
            <Input
              type="number"
              value={inputs.fuelRate}
              onChange={(e) => handleInputChange('fuelRate', Number(e.target.value))}
              min="30"
              max="70"
              step="0.1"
            />
          </InputGroup>
        </div>

        <div>
          <InputGroup>
            <Label>Kiln Speed (rpm)</Label>
            <Input
              type="number"
              value={inputs.kilnSpeed}
              onChange={(e) => handleInputChange('kilnSpeed', Number(e.target.value))}
              min="1"
              max="5"
              step="0.1"
            />
          </InputGroup>

          <InputGroup>
            <Label>Air Flow (m³/h)</Label>
            <Input
              type="number"
              value={inputs.airFlow}
              onChange={(e) => handleInputChange('airFlow', Number(e.target.value))}
              min="800"
              max="1600"
            />
          </InputGroup>

          <InputGroup>
            <Label>Material Feed Rate (t/h)</Label>
            <Input
              type="number"
              value={inputs.materialFeed}
              onChange={(e) => handleInputChange('materialFeed', Number(e.target.value))}
              min="100"
              max="200"
            />
          </InputGroup>

          <InputGroup>
            <Label>Simulation Mode</Label>
            <div style={{ marginTop: '5px' }}>
              <Button
                onClick={() => setSimulationMode(!isSimulationMode)}
                style={{ 
                  background: isSimulationMode 
                    ? 'linear-gradient(135deg, #00b894 0%, #00a085 100%)' 
                    : 'linear-gradient(135deg, #74b9ff 0%, #0984e3 100%)'
                }}
              >
                {isSimulationMode ? '🔄 Real-time Active' : '▶️ Start Simulation'}
              </Button>
            </div>
          </InputGroup>
        </div>
      </div>

      <div style={{ marginTop: '20px' }}>
        <Button onClick={calculateEmissions}>📊 Calculate Emissions</Button>
        <Button onClick={runOptimization} disabled={isLoading}>
          {isLoading ? <LoadingSpinner /> : '🤖 AI Optimization'}
        </Button>
        <Button onClick={resetToDefaults}>🔄 Reset to Defaults</Button>
      </div>

      {/* Enhanced Simulation Controls */}
      <div style={{ marginTop: '20px', padding: '15px', background: 'rgba(0, 0, 0, 0.2)', borderRadius: '4px' }}>
        <h4 style={{ color: '#74b9ff', marginBottom: '15px' }}>🎮 Simulation Controls</h4>
        
        <div style={{ display: 'flex', gap: '10px', marginBottom: '15px', flexWrap: 'wrap' }}>
          <Button 
            onClick={() => {
              setSimulationState('playing');
              setSimulationMode(true);
            }}
            disabled={simulationState === 'playing'}
            style={{ 
              background: simulationState === 'playing' 
                ? 'linear-gradient(135deg, #00b894 0%, #00a085 100%)' 
                : 'linear-gradient(135deg, #74b9ff 0%, #0984e3 100%)'
            }}
          >
            ▶️ Play
          </Button>
          
          <Button 
            onClick={() => setSimulationState('paused')}
            disabled={simulationState !== 'playing'}
          >
            ⏸️ Pause
          </Button>
          
          <Button 
            onClick={() => {
              setSimulationState('stopped');
              setSimulationMode(false);
            }}
            disabled={simulationState === 'stopped'}
          >
            ⏹️ Stop
          </Button>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ color: '#8b9dc3', fontSize: '14px' }}>Speed:</span>
          <select 
            value={simulationSpeed} 
            onChange={(e) => setSimulationSpeed(Number(e.target.value))}
            style={{
              background: 'rgba(255, 255, 255, 0.1)',
              border: '1px solid rgba(116, 185, 255, 0.3)',
              borderRadius: '4px',
              color: '#ffffff',
              padding: '5px 10px',
              fontSize: '14px'
            }}
          >
            <option value={0.5}>0.5x</option>
            <option value={1}>1x</option>
            <option value={2}>2x</option>
            <option value={4}>4x</option>
            <option value={8}>8x</option>
          </select>
        </div>
      </div>

      {results && (
        <ResultsContainer>
          <h4 style={{ color: '#74b9ff', marginBottom: '15px' }}>📈 Simulation Results</h4>
          <ResultItem>CO₂ Emission: <strong>{results.co2Emission} kg/t</strong></ResultItem>
          <ResultItem>NOx Emission: <strong>{results.noxEmission} mg/Nm³</strong></ResultItem>
          <ResultItem>SO₂ Emission: <strong>{results.so2Emission} mg/Nm³</strong></ResultItem>
          <ResultItem>Process Efficiency: <strong>{results.efficiency}%</strong></ResultItem>
          <ResultItem>Product Quality: <strong>{results.quality}%</strong></ResultItem>
        </ResultsContainer>
      )}

      {aiResponse && (
        <AIResponseContainer>
          <AIResponseTitle>🤖 AI Optimization Recommendations</AIResponseTitle>
          <AIResponseText>{aiResponse.text}</AIResponseText>
        </AIResponseContainer>
      )}
    </SimulationContainer>
  );
};

export default SimulationMode;
