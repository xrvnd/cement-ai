import React from 'react';
import styled from 'styled-components';
import { useData } from '../context/DataContext';
import { theme, componentThemes } from '../styles/theme';

const LeftPanelContainer = styled.div`
  width: 320px;
  background: ${componentThemes.panel.primary.background};
  border-right: 2px solid ${theme.colors.border.accent};
  backdrop-filter: blur(20px);
  overflow-y: auto;
  position: relative;
  box-shadow: ${componentThemes.panel.primary.shadow};
  
  /* Professional grid overlay */
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-image: 
      linear-gradient(${theme.colors.primary[800]}08 1px, transparent 1px),
      linear-gradient(90deg, ${theme.colors.primary[800]}08 1px, transparent 1px);
    background-size: 20px 20px;
    pointer-events: none;
    z-index: 0;
  }
  
  @media (max-width: ${theme.breakpoints.lg}) {
    width: 280px;
  }
`;

const PanelSection = styled.div`
  margin-bottom: ${theme.spacing[6]};
  position: relative;
  z-index: 1;
`;

const SectionTitle = styled.h3`
  color: ${theme.colors.primary[400]};
  font-size: ${theme.typography.fontSize.base};
  font-weight: ${theme.typography.fontWeight.semibold};
  font-family: ${theme.typography.fontFamily.display};
  margin-bottom: ${theme.spacing[4]};
  border-bottom: 2px solid ${theme.colors.primary[500]}40;
  padding-bottom: ${theme.spacing[2]};
  text-align: center;
  position: relative;
  
  /* Gradient text effect */
  background: linear-gradient(135deg, ${theme.colors.primary[400]} 0%, ${theme.colors.secondary[500]} 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  
  /* Animated underline */
  &::after {
    content: '';
    position: absolute;
    bottom: -2px;
    left: 50%;
    width: 0;
    height: 2px;
    background: linear-gradient(90deg, ${theme.colors.primary[500]}, ${theme.colors.secondary[500]});
    transition: all ${theme.animation.duration.normal} ${theme.animation.easing.default};
    transform: translateX(-50%);
  }
  
  &:hover::after {
    width: 100%;
  }
`;

const DataCard = styled.div`
  background: ${theme.colors.background.tertiary}60;
  border-radius: ${theme.borderRadius.xl};
  padding: ${theme.spacing[4]};
  margin-bottom: ${theme.spacing[3]};
  border: 1px solid ${theme.colors.border.primary};
  backdrop-filter: blur(10px);
  transition: all ${theme.animation.duration.normal} ${theme.animation.easing.default};
  position: relative;
  overflow: hidden;
  
  &:hover {
    background: ${theme.colors.background.tertiary}80;
    border-color: ${theme.colors.border.accent};
    transform: translateY(-2px);
    box-shadow: ${theme.shadows.lg};
  }
  
  /* Subtle gradient border effect */
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 1px;
    background: linear-gradient(90deg, transparent, ${theme.colors.primary[500]}60, transparent);
  }
`;

const DataHeader = styled.div`
  margin-bottom: 8px;
`;

const DataTitle = styled.h4`
  color: #8b9dc3;
  font-size: 12px;
  margin: 0;
  font-weight: 600;
`;

const MetricRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 6px;
  padding: 4px 0;
`;

const MetricLabel = styled.span`
  color: #8b9dc3;
  font-size: 11px;
  font-weight: 500;
`;

const MetricValue = styled.span<{ status?: 'normal' | 'warning' | 'critical' | 'optimal' }>`
  color: ${props => {
    if (props.status === 'critical') return '#e74c3c';
    if (props.status === 'warning') return '#f39c12';
    if (props.status === 'optimal') return '#00b894';
    return '#74b9ff';
  }};
  font-size: 11px;
  font-weight: bold;
`;

const StatusIndicator = styled.div<{ status: 'normal' | 'warning' | 'critical' | 'optimal' }>`
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: ${props => {
    if (props.status === 'critical') return '#e74c3c';
    if (props.status === 'warning') return '#f39c12';
    if (props.status === 'optimal') return '#00b894';
    return '#74b9ff';
  }};
  margin-right: 8px;
  box-shadow: 0 0 6px ${props => {
    if (props.status === 'critical') return '#e74c3c';
    if (props.status === 'warning') return '#f39c12';
    if (props.status === 'optimal') return '#00b894';
    return '#74b9ff';
  }};
`;

const AlertCard = styled.div<{ type: 'info' | 'warning' | 'critical' }>`
  background: ${props => {
    if (props.type === 'critical') return 'rgba(231, 76, 60, 0.1)';
    if (props.type === 'warning') return 'rgba(243, 156, 18, 0.1)';
    return 'rgba(116, 185, 255, 0.1)';
  }};
  border: 1px solid ${props => {
    if (props.type === 'critical') return 'rgba(231, 76, 60, 0.3)';
    if (props.type === 'warning') return 'rgba(243, 156, 18, 0.3)';
    return 'rgba(116, 185, 255, 0.3)';
  }};
  border-radius: 6px;
  padding: 10px;
  margin-bottom: 8px;
  font-size: 11px;
`;

const AlertTitle = styled.div<{ type: 'info' | 'warning' | 'critical' }>`
  color: ${props => {
    if (props.type === 'critical') return '#e74c3c';
    if (props.type === 'warning') return '#f39c12';
    return '#74b9ff';
  }};
  font-weight: bold;
  margin-bottom: 4px;
  display: flex;
  align-items: center;
  gap: 6px;
`;

const ProgressBar = styled.div<{ value: number; maxValue: number; color: string }>`
  width: 100%;
  height: 6px;
  background: rgba(116, 185, 255, 0.1);
  border-radius: 3px;
  overflow: hidden;
  margin-top: 4px;
`;

const ProgressFill = styled.div<{ value: number; maxValue: number; color: string }>`
  height: 100%;
  background: ${props => props.color};
  width: ${props => (props.value / props.maxValue) * 100}%;
  transition: width 0.5s ease;
  border-radius: 3px;
`;

const LeftPanel: React.FC = () => {
  const { sensorData, isRealtimeMode, isSimulationMode, simulationData, millData } = useData();

  // Get latest simulation data
  const latestSimulation = simulationData.length > 0 ? simulationData[simulationData.length - 1] : null;
  const latestMill = millData.length > 0 ? millData[millData.length - 1] : null;

  // Calculate process efficiency based on real-time sensor data
  const calculateProcessEfficiency = () => {
    const burningTemp = sensorData.burning?.value || 1450;
    const motorLoad = sensorData.load?.value || 87;
    const vibration = sensorData.vibration?.value || 2.3;
    const noxEmission = sensorData.emission?.value || 245;
    const millEfficiency = sensorData['mill-eff']?.value || 78;
    
    // Temperature efficiency (optimal around 1450°C)
    const tempEfficiency = Math.max(0, 100 - Math.abs(burningTemp - 1450) / 10);
    
    // Motor load efficiency (optimal around 85%)
    const loadEfficiency = Math.max(0, 100 - Math.abs(motorLoad - 85) / 2);
    
    // Vibration efficiency (optimal around 2.0 mm/s)
    const vibrationEfficiency = Math.max(0, 100 - Math.abs(vibration - 2.0) * 20);
    
    // Emission efficiency (lower is better, optimal around 200 mg/Nm³)
    const emissionEfficiency = Math.max(0, 100 - Math.abs(noxEmission - 200) / 5);
    
    // Mill efficiency (direct from sensor)
    const millEff = millEfficiency;
    
    return Math.round((tempEfficiency + loadEfficiency + vibrationEfficiency + emissionEfficiency + millEff) / 5);
  };

  // Get status for metrics
  const getStatus = (value: number, optimal: number, tolerance: number): 'normal' | 'warning' | 'critical' | 'optimal' => {
    const diff = Math.abs(value - optimal);
    if (diff <= tolerance * 0.3) return 'optimal';
    if (diff <= tolerance * 0.7) return 'normal';
    if (diff <= tolerance) return 'warning';
    return 'critical';
  };

  // Get alerts based on real-time sensor data
  const getAlerts = () => {
    const alerts = [];
    
    // Temperature alerts
    const burningTemp = sensorData.burning?.value || 1450;
    if (burningTemp > 1480) {
      alerts.push({
        type: 'critical' as const,
        title: '🔥 Critical Burning Zone Temperature',
        message: `Temperature at ${Math.round(burningTemp)}°C exceeds safe limits. Immediate action required.`
      });
    } else if (burningTemp > 1460) {
      alerts.push({
        type: 'warning' as const,
        title: '⚠️ Elevated Burning Zone Temperature',
        message: `Temperature at ${Math.round(burningTemp)}°C approaching upper safety limit. Monitor closely.`
      });
    }

    // Vibration alerts
    const vibration = sensorData.vibration?.value || 2.3;
    if (vibration > 3.5) {
      alerts.push({
        type: 'critical' as const,
        title: '⚡ High Kiln Vibration',
        message: `Vibration at ${vibration.toFixed(1)} mm/s exceeds safe limits. Check bearings and alignment.`
      });
    } else if (vibration > 3.0) {
      alerts.push({
        type: 'warning' as const,
        title: '⚠️ Elevated Kiln Vibration',
        message: `Vibration at ${vibration.toFixed(1)} mm/s above normal. Schedule maintenance check.`
      });
    }

    // Emissions alerts
    const noxEmission = sensorData.emission?.value || 245;
    if (noxEmission > 300) {
      alerts.push({
        type: 'warning' as const,
        title: '🌫️ High NOx Emissions',
        message: `NOx emissions at ${Math.round(noxEmission)} mg/Nm³ above optimal range. Check combustion settings.`
      });
    }

    const particleEmission = sensorData['particle-emission']?.value || 45;
    if (particleEmission > 60) {
      alerts.push({
        type: 'warning' as const,
        title: '💨 High Particulate Emissions',
        message: `Particulate emissions at ${Math.round(particleEmission)} mg/Nm³. Check baghouse filters.`
      });
    }

    // Mill performance alerts
    const millFeed = sensorData['mill-feed']?.value || 12.4;
    if (millFeed < 10) {
      alerts.push({
        type: 'warning' as const,
        title: '⚙️ Low Mill Feed Rate',
        message: `Mill feed rate at ${millFeed.toFixed(1)} t/h below optimal. Check material supply.`
      });
    }

    const millEfficiency = sensorData['mill-eff']?.value || 78;
    if (millEfficiency < 70) {
      alerts.push({
        type: 'warning' as const,
        title: '📉 Low Mill Efficiency',
        message: `Mill efficiency at ${Math.round(millEfficiency)}% below target. Check grinding media and liner condition.`
      });
    }

    // Motor load alerts
    const motorLoad = sensorData.load?.value || 87;
    if (motorLoad > 95) {
      alerts.push({
        type: 'critical' as const,
        title: '⚡ High Motor Load',
        message: `Motor load at ${Math.round(motorLoad)}% approaching maximum. Risk of overload.`
      });
    } else if (motorLoad > 90) {
      alerts.push({
        type: 'warning' as const,
        title: '⚠️ Elevated Motor Load',
        message: `Motor load at ${Math.round(motorLoad)}% above normal operating range.`
      });
    }

    return alerts;
  };

  const alerts = getAlerts();
  const processEfficiency = calculateProcessEfficiency();

  return (
    <LeftPanelContainer>
      <div style={{ padding: '20px' }}>
        <div style={{
          color: '#74b9ff',
          fontSize: '18px',
          fontWeight: 'bold',
          marginBottom: '20px',
          textAlign: 'center',
          textShadow: '0 2px 4px rgba(116, 185, 255, 0.3)'
        }}>
          🏭 JK Cement Plant
        </div>

        {/* System Mode Status */}
        <PanelSection>
          <DataCard>
            <div style={{ textAlign: 'center' }}>
              <div style={{ color: '#74b9ff', fontWeight: 'bold', marginBottom: '8px' }}>
                🎮 System Mode
              </div>
              <div style={{ 
                color: isSimulationMode ? '#9b59b6' : isRealtimeMode ? '#00b894' : '#74b9ff',
                fontSize: '14px',
                fontWeight: 'bold'
              }}>
                {isSimulationMode ? '🎮 SIMULATION' : isRealtimeMode ? '⚡ REAL-TIME' : '📊 NORMAL'}
              </div>
              <div style={{ color: '#8b9dc3', fontSize: '11px', marginTop: '4px' }}>
                {isSimulationMode ? 'Enhanced visual effects active' : 
                 isRealtimeMode ? 'Live data streaming' : 'Standard monitoring mode'}
              </div>
            </div>
          </DataCard>
        </PanelSection>

        {/* Process Efficiency */}
        <PanelSection>
          <SectionTitle>📊 Process Efficiency</SectionTitle>
          <DataCard>
            <div style={{ textAlign: 'center' }}>
              <div style={{ color: '#74b9ff', fontSize: '24px', fontWeight: 'bold', marginBottom: '5px' }}>
                {processEfficiency}%
              </div>
              <div style={{ color: '#8b9dc3', fontSize: '11px' }}>
                Overall Process Efficiency
              </div>
              <ProgressBar value={processEfficiency} maxValue={100} color="#00b894">
                <ProgressFill value={processEfficiency} maxValue={100} color="#00b894" />
              </ProgressBar>
            </div>
          </DataCard>
        </PanelSection>

        {/* Kiln Real-time Data */}
        <PanelSection>
          <SectionTitle>🔥 Kiln Operations {isRealtimeMode && <span style={{color: '#00b894', fontSize: '10px'}}>⚡ LIVE</span>}</SectionTitle>
          
          <DataCard>
            <DataHeader>
              <DataTitle>Temperature Zones</DataTitle>
            </DataHeader>
            
            <>
              <MetricRow>
                <MetricLabel>Preheater</MetricLabel>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <StatusIndicator status={getStatus(sensorData.temp1?.value || 1245, 1245, 50)} />
                  <MetricValue status={getStatus(sensorData.temp1?.value || 1245, 1245, 50)}>
                    {Math.round(sensorData.temp1?.value || 1245)}°C
                  </MetricValue>
                  {sensorData.temp1?.trend && (
                    <span style={{ marginLeft: '4px', fontSize: '10px', color: sensorData.temp1.trend === 'up' ? '#e74c3c' : sensorData.temp1.trend === 'down' ? '#3498db' : '#95a5a6' }}>
                      {sensorData.temp1.trend === 'up' ? '↗' : sensorData.temp1.trend === 'down' ? '↘' : '→'}
                    </span>
                  )}
                </div>
              </MetricRow>
              
              <MetricRow>
                <MetricLabel>Calciner</MetricLabel>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <StatusIndicator status={getStatus(sensorData.temp2?.value || 1350, 1350, 50)} />
                  <MetricValue status={getStatus(sensorData.temp2?.value || 1350, 1350, 50)}>
                    {Math.round(sensorData.temp2?.value || 1350)}°C
                  </MetricValue>
                  {sensorData.temp2?.trend && (
                    <span style={{ marginLeft: '4px', fontSize: '10px', color: sensorData.temp2.trend === 'up' ? '#e74c3c' : sensorData.temp2.trend === 'down' ? '#3498db' : '#95a5a6' }}>
                      {sensorData.temp2.trend === 'up' ? '↗' : sensorData.temp2.trend === 'down' ? '↘' : '→'}
                    </span>
                  )}
                </div>
              </MetricRow>
              
              <MetricRow>
                <MetricLabel>Kiln Inlet</MetricLabel>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <StatusIndicator status={getStatus(sensorData.temp3?.value || 1120, 1100, 100)} />
                  <MetricValue status={getStatus(sensorData.temp3?.value || 1120, 1100, 100)}>
                    {Math.round(sensorData.temp3?.value || 1120)}°C
                  </MetricValue>
                  {sensorData.temp3?.trend && (
                    <span style={{ marginLeft: '4px', fontSize: '10px', color: sensorData.temp3.trend === 'up' ? '#e74c3c' : sensorData.temp3.trend === 'down' ? '#3498db' : '#95a5a6' }}>
                      {sensorData.temp3.trend === 'up' ? '↗' : sensorData.temp3.trend === 'down' ? '↘' : '→'}
                    </span>
                  )}
                </div>
              </MetricRow>
              
              <MetricRow>
                <MetricLabel>Burning Zone</MetricLabel>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <StatusIndicator status={getStatus(sensorData.burning?.value || 1450, 1450, 50)} />
                  <MetricValue status={getStatus(sensorData.burning?.value || 1450, 1450, 50)}>
                    {Math.round(sensorData.burning?.value || 1450)}°C
                  </MetricValue>
                  {sensorData.burning?.trend && (
                    <span style={{ marginLeft: '4px', fontSize: '10px', color: sensorData.burning.trend === 'up' ? '#e74c3c' : sensorData.burning.trend === 'down' ? '#3498db' : '#95a5a6' }}>
                      {sensorData.burning.trend === 'up' ? '↗' : sensorData.burning.trend === 'down' ? '↘' : '→'}
                    </span>
                  )}
                </div>
              </MetricRow>
              
              <MetricRow>
                <MetricLabel>Cooler</MetricLabel>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <StatusIndicator status={getStatus(sensorData.cooler?.value || 180, 200, 50)} />
                  <MetricValue status={getStatus(sensorData.cooler?.value || 180, 200, 50)}>
                    {Math.round(sensorData.cooler?.value || 180)}°C
                  </MetricValue>
                  {sensorData.cooler?.trend && (
                    <span style={{ marginLeft: '4px', fontSize: '10px', color: sensorData.cooler.trend === 'up' ? '#e74c3c' : sensorData.cooler.trend === 'down' ? '#3498db' : '#95a5a6' }}>
                      {sensorData.cooler.trend === 'up' ? '↗' : sensorData.cooler.trend === 'down' ? '↘' : '→'}
                    </span>
                  )}
                </div>
              </MetricRow>
            </>
          </DataCard>

          <DataCard>
            <DataHeader>
              <DataTitle>Performance Metrics</DataTitle>
            </DataHeader>
            
            <>
              <MetricRow>
                <MetricLabel>Motor Load</MetricLabel>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <StatusIndicator status={getStatus(sensorData.load?.value || 87, 85, 15)} />
                  <MetricValue status={getStatus(sensorData.load?.value || 87, 85, 15)}>
                    {Math.round(sensorData.load?.value || 87)}%
                  </MetricValue>
                  {sensorData.load?.trend && (
                    <span style={{ marginLeft: '4px', fontSize: '10px', color: sensorData.load.trend === 'up' ? '#e74c3c' : sensorData.load.trend === 'down' ? '#3498db' : '#95a5a6' }}>
                      {sensorData.load.trend === 'up' ? '↗' : sensorData.load.trend === 'down' ? '↘' : '→'}
                    </span>
                  )}
                </div>
              </MetricRow>
              
              <MetricRow>
                <MetricLabel>Kiln Vibration</MetricLabel>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <StatusIndicator status={getStatus(sensorData.vibration?.value || 2.3, 2, 1)} />
                  <MetricValue status={getStatus(sensorData.vibration?.value || 2.3, 2, 1)}>
                    {(sensorData.vibration?.value || 2.3).toFixed(1)} mm/s
                  </MetricValue>
                  {sensorData.vibration?.trend && (
                    <span style={{ marginLeft: '4px', fontSize: '10px', color: sensorData.vibration.trend === 'up' ? '#e74c3c' : sensorData.vibration.trend === 'down' ? '#3498db' : '#95a5a6' }}>
                      {sensorData.vibration.trend === 'up' ? '↗' : sensorData.vibration.trend === 'down' ? '↘' : '→'}
                    </span>
                  )}
                </div>
              </MetricRow>
              
              <MetricRow>
                <MetricLabel>NOx Emissions</MetricLabel>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <StatusIndicator status={getStatus(sensorData.emission?.value || 245, 250, 50)} />
                  <MetricValue status={getStatus(sensorData.emission?.value || 245, 250, 50)}>
                    {Math.round(sensorData.emission?.value || 245)} mg/Nm³
                  </MetricValue>
                  {sensorData.emission?.trend && (
                    <span style={{ marginLeft: '4px', fontSize: '10px', color: sensorData.emission.trend === 'up' ? '#e74c3c' : sensorData.emission.trend === 'down' ? '#3498db' : '#95a5a6' }}>
                      {sensorData.emission.trend === 'up' ? '↗' : sensorData.emission.trend === 'down' ? '↘' : '→'}
                    </span>
                  )}
                </div>
              </MetricRow>
              
              <MetricRow>
                <MetricLabel>Particulate Emissions</MetricLabel>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <StatusIndicator status={getStatus(sensorData['particle-emission']?.value || 45, 50, 15)} />
                  <MetricValue status={getStatus(sensorData['particle-emission']?.value || 45, 50, 15)}>
                    {Math.round(sensorData['particle-emission']?.value || 45)} mg/Nm³
                  </MetricValue>
                  {sensorData['particle-emission']?.trend && (
                    <span style={{ marginLeft: '4px', fontSize: '10px', color: sensorData['particle-emission'].trend === 'up' ? '#e74c3c' : sensorData['particle-emission'].trend === 'down' ? '#3498db' : '#95a5a6' }}>
                      {sensorData['particle-emission'].trend === 'up' ? '↗' : sensorData['particle-emission'].trend === 'down' ? '↘' : '→'}
                    </span>
                  )}
                </div>
              </MetricRow>
            </>
          </DataCard>
        </PanelSection>

        {/* Mill Operations Data */}
        <PanelSection>
          <SectionTitle>⚙️ Mill Operations {isRealtimeMode && <span style={{color: '#00b894', fontSize: '10px'}}>⚡ LIVE</span>}</SectionTitle>
          
          <DataCard>
            <DataHeader>
              <DataTitle>Mill Performance</DataTitle>
            </DataHeader>
            
            <>
              <MetricRow>
                <MetricLabel>Mill #1 Feed Rate</MetricLabel>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <StatusIndicator status={getStatus(sensorData['mill-feed']?.value || 12.4, 12, 3)} />
                  <MetricValue status={getStatus(sensorData['mill-feed']?.value || 12.4, 12, 3)}>
                    {(sensorData['mill-feed']?.value || 12.4).toFixed(1)} t/h
                  </MetricValue>
                  {sensorData['mill-feed']?.trend && (
                    <span style={{ marginLeft: '4px', fontSize: '10px', color: sensorData['mill-feed'].trend === 'up' ? '#e74c3c' : sensorData['mill-feed'].trend === 'down' ? '#3498db' : '#95a5a6' }}>
                      {sensorData['mill-feed'].trend === 'up' ? '↗' : sensorData['mill-feed'].trend === 'down' ? '↘' : '→'}
                    </span>
                  )}
                </div>
              </MetricRow>
              
              <MetricRow>
                <MetricLabel>Mill #2 Pressure</MetricLabel>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <StatusIndicator status={getStatus(sensorData['mill-pressure']?.value || 2.1, 2.0, 0.5)} />
                  <MetricValue status={getStatus(sensorData['mill-pressure']?.value || 2.1, 2.0, 0.5)}>
                    {(sensorData['mill-pressure']?.value || 2.1).toFixed(1)} bar
                  </MetricValue>
                  {sensorData['mill-pressure']?.trend && (
                    <span style={{ marginLeft: '4px', fontSize: '10px', color: sensorData['mill-pressure'].trend === 'up' ? '#e74c3c' : sensorData['mill-pressure'].trend === 'down' ? '#3498db' : '#95a5a6' }}>
                      {sensorData['mill-pressure'].trend === 'up' ? '↗' : sensorData['mill-pressure'].trend === 'down' ? '↘' : '→'}
                    </span>
                  )}
                </div>
              </MetricRow>
              
              <MetricRow>
                <MetricLabel>Particle Size</MetricLabel>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <StatusIndicator status={getStatus(sensorData['mill-particle']?.value || 12, 12, 3)} />
                  <MetricValue status={getStatus(sensorData['mill-particle']?.value || 12, 12, 3)}>
                    {Math.round(sensorData['mill-particle']?.value || 12)} µm
                  </MetricValue>
                  {sensorData['mill-particle']?.trend && (
                    <span style={{ marginLeft: '4px', fontSize: '10px', color: sensorData['mill-particle'].trend === 'up' ? '#e74c3c' : sensorData['mill-particle'].trend === 'down' ? '#3498db' : '#95a5a6' }}>
                      {sensorData['mill-particle'].trend === 'up' ? '↗' : sensorData['mill-particle'].trend === 'down' ? '↘' : '→'}
                    </span>
                  )}
                </div>
              </MetricRow>
              
              <MetricRow>
                <MetricLabel>Mill Efficiency</MetricLabel>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <StatusIndicator status={getStatus(sensorData['mill-eff']?.value || 78, 85, 15)} />
                  <MetricValue status={getStatus(sensorData['mill-eff']?.value || 78, 85, 15)}>
                    {Math.round(sensorData['mill-eff']?.value || 78)}%
                  </MetricValue>
                  {sensorData['mill-eff']?.trend && (
                    <span style={{ marginLeft: '4px', fontSize: '10px', color: sensorData['mill-eff'].trend === 'up' ? '#e74c3c' : sensorData['mill-eff'].trend === 'down' ? '#3498db' : '#95a5a6' }}>
                      {sensorData['mill-eff'].trend === 'up' ? '↗' : sensorData['mill-eff'].trend === 'down' ? '↘' : '→'}
                    </span>
                  )}
                </div>
              </MetricRow>
              
              <MetricRow>
                <MetricLabel>Stack Gas Flow</MetricLabel>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <StatusIndicator status={getStatus(sensorData['stack-flow']?.value || 1250, 1250, 200)} />
                  <MetricValue status={getStatus(sensorData['stack-flow']?.value || 1250, 1250, 200)}>
                    {Math.round(sensorData['stack-flow']?.value || 1250)} Nm³/h
                  </MetricValue>
                  {sensorData['stack-flow']?.trend && (
                    <span style={{ marginLeft: '4px', fontSize: '10px', color: sensorData['stack-flow'].trend === 'up' ? '#e74c3c' : sensorData['stack-flow'].trend === 'down' ? '#3498db' : '#95a5a6' }}>
                      {sensorData['stack-flow'].trend === 'up' ? '↗' : sensorData['stack-flow'].trend === 'down' ? '↘' : '→'}
                    </span>
                  )}
                </div>
              </MetricRow>
            </>
          </DataCard>
        </PanelSection>



        {/* Critical Alerts */}
        {alerts.length > 0 && (
          <PanelSection>
            <SectionTitle>🚨 Critical Alerts</SectionTitle>
            {alerts.map((alert, index) => (
              <AlertCard key={index} type={alert.type}>
                <AlertTitle type={alert.type}>
                  {alert.title}
                </AlertTitle>
                <div style={{ color: '#8b9dc3', fontSize: '10px', lineHeight: '1.4' }}>
                  {alert.message}
                </div>
              </AlertCard>
            ))}
          </PanelSection>
        )}

        {/* Sensor Status Summary */}
        <PanelSection>
          <SectionTitle>📡 Sensor Status</SectionTitle>
          <DataCard>
            <div style={{ marginBottom: '10px' }}>
              <div style={{ color: '#8b9dc3', fontSize: '11px', marginBottom: '5px' }}>
                Active Sensors: {Object.keys(sensorData).length}
              </div>
              <div style={{ color: '#8b9dc3', fontSize: '11px' }}>
                Data Points: {simulationData.length + millData.length}
              </div>
            </div>
            
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
              {Object.entries(sensorData).map(([key, sensor]) => (
                <div key={key} style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  background: sensor.trend === 'stable' ? '#00b894' : sensor.trend === 'up' ? '#f39c12' : '#e74c3c',
                  boxShadow: `0 0 4px ${sensor.trend === 'stable' ? '#00b894' : sensor.trend === 'up' ? '#f39c12' : '#e74c3c'}`
                }} />
              ))}
            </div>
          </DataCard>
        </PanelSection>
      </div>
    </LeftPanelContainer>
  );
};

export default LeftPanel;
