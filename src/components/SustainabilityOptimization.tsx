import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell, AreaChart, Area } from 'recharts';

const OptimizationContainer = styled.div`
  position: absolute;
  top: 20px;
  right: 20px;
  width: 400px;
  background: linear-gradient(135deg, rgba(15, 20, 40, 0.95) 0%, rgba(44, 62, 80, 0.95) 100%);
  backdrop-filter: blur(20px);
  border-radius: 16px;
  padding: 20px;
  border: 1px solid rgba(116, 185, 255, 0.3);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
  z-index: 1000;
  max-height: 80vh;
  overflow-y: auto;
`;

const SectionTitle = styled.h3`
  color: #74b9ff;
  font-size: 16px;
  margin-bottom: 15px;
  border-bottom: 2px solid rgba(116, 185, 255, 0.3);
  padding-bottom: 8px;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const MetricCard = styled.div<{ status: 'optimal' | 'good' | 'warning' | 'critical' }>`
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.05) 0%, rgba(255, 255, 255, 0.02) 100%);
  border-radius: 8px;
  padding: 12px;
  margin-bottom: 10px;
  border-left: 4px solid ${props => {
    switch (props.status) {
      case 'optimal': return '#00b894';
      case 'good': return '#74b9ff';
      case 'warning': return '#f39c12';
      case 'critical': return '#e74c3c';
      default: return '#6b7280';
    }
  }};
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  }
`;

const MetricLabel = styled.div`
  color: #8b9dc3;
  font-size: 12px;
  margin-bottom: 4px;
`;

const MetricValue = styled.div`
  color: #ffffff;
  font-size: 18px;
  font-weight: bold;
  margin-bottom: 4px;
`;

const MetricUnit = styled.span`
  color: #74b9ff;
  font-size: 12px;
  margin-left: 4px;
`;

const StatusBadge = styled.span<{ status: 'optimal' | 'good' | 'warning' | 'critical' }>`
  display: inline-block;
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 10px;
  font-weight: 600;
  text-transform: uppercase;
  background: ${props => {
    switch (props.status) {
      case 'optimal': return '#00b894';
      case 'good': return '#74b9ff';
      case 'warning': return '#f39c12';
      case 'critical': return '#e74c3c';
      default: return '#6b7280';
    }
  }};
  color: white;
`;

const OptimizationButton = styled.button<{ variant: 'primary' | 'secondary' | 'success' | 'warning' }>`
  padding: 8px 16px;
  border: none;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  margin: 4px;
  
  ${props => {
    switch (props.variant) {
      case 'primary':
        return `
          background: linear-gradient(135deg, #74b9ff 0%, #0984e3 100%);
          color: white;
          &:hover { transform: translateY(-2px); box-shadow: 0 4px 12px rgba(116, 185, 255, 0.3); }
        `;
      case 'secondary':
        return `
          background: rgba(116, 185, 255, 0.1);
          color: #74b9ff;
          border: 1px solid rgba(116, 185, 255, 0.3);
          &:hover { background: rgba(116, 185, 255, 0.2); }
        `;
      case 'success':
        return `
          background: linear-gradient(135deg, #00b894 0%, #00a085 100%);
          color: white;
          &:hover { transform: translateY(-2px); box-shadow: 0 4px 12px rgba(0, 184, 148, 0.3); }
        `;
      case 'warning':
        return `
          background: linear-gradient(135deg, #f39c12 0%, #e67e22 100%);
          color: white;
          &:hover { transform: translateY(-2px); box-shadow: 0 4px 12px rgba(243, 156, 18, 0.3); }
        `;
    }
  }}
`;

const ProgressBar = styled.div<{ value: number; maxValue: number; color: string }>`
  width: 100%;
  height: 6px;
  background: rgba(116, 185, 255, 0.1);
  border-radius: 3px;
  overflow: hidden;
  margin-top: 8px;
`;

const ProgressFill = styled.div<{ value: number; maxValue: number; color: string }>`
  height: 100%;
  background: ${props => props.color};
  width: ${props => (props.value / props.maxValue) * 100}%;
  transition: width 0.5s ease;
  border-radius: 3px;
`;

interface SustainabilityOptimizationProps {
  onClose: () => void;
}

const SustainabilityOptimization: React.FC<SustainabilityOptimizationProps> = ({ onClose }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'fuels' | 'energy' | 'quality' | 'cross-process'>('overview');
  const [optimizationData, setOptimizationData] = useState({
    tsr: 22,
    targetTsr: 35,
    energyEfficiency: 85.2,
    targetEnergyEfficiency: 90,
    qualityIndex: 92.8,
    targetQualityIndex: 95,
    carbonFootprint: 820,
    targetCarbonFootprint: 700,
    wasteHeatRecovery: 45,
    targetWasteHeatRecovery: 60,
    waterConsumption: 0.12,
    targetWaterConsumption: 0.08,
    renewableEnergy: 15,
    targetRenewableEnergy: 25
  });

  // Generate real-time optimization data
  useEffect(() => {
    const interval = setInterval(() => {
      setOptimizationData(prev => ({
        ...prev,
        tsr: Math.max(20, Math.min(35, prev.tsr + (Math.random() - 0.5) * 0.5)),
        energyEfficiency: Math.max(80, Math.min(95, prev.energyEfficiency + (Math.random() - 0.5) * 0.3)),
        qualityIndex: Math.max(85, Math.min(98, prev.qualityIndex + (Math.random() - 0.5) * 0.2)),
        carbonFootprint: Math.max(700, Math.min(900, prev.carbonFootprint + (Math.random() - 0.5) * 2)),
        wasteHeatRecovery: Math.max(40, Math.min(65, prev.wasteHeatRecovery + (Math.random() - 0.5) * 0.5)),
        renewableEnergy: Math.max(10, Math.min(30, prev.renewableEnergy + (Math.random() - 0.5) * 0.3))
      }));
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  const getStatus = (current: number, target: number): 'optimal' | 'good' | 'warning' | 'critical' => {
    const percentage = (current / target) * 100;
    if (percentage >= 95) return 'optimal';
    if (percentage >= 85) return 'good';
    if (percentage >= 70) return 'warning';
    return 'critical';
  };

  const getFuelMixData = () => [
    { name: 'Coal', value: 68, color: '#2c3e50' },
    { name: 'RDF', value: 12, color: '#e74c3c' },
    { name: 'Biomass', value: 8, color: '#27ae60' },
    { name: 'Plastic Waste', value: 2, color: '#f39c12' },
    { name: 'Tire Chips', value: 1, color: '#8e44ad' },
    { name: 'Other', value: 9, color: '#95a5a6' }
  ];

  const getEnergyOptimizationData = () => {
    const hours = Array.from({ length: 24 }, (_, i) => i);
    return hours.map(hour => ({
      time: `${hour.toString().padStart(2, '0')}:00`,
      current: 108 + Math.random() * 10,
      optimized: 95 + Math.random() * 8,
      renewable: 15 + Math.random() * 5,
      wasteHeat: 45 + Math.random() * 10
    }));
  };

  const getQualityTrendData = () => {
    const days = Array.from({ length: 30 }, (_, i) => i + 1);
    return days.map(day => ({
      day,
      blaine: 350 + Math.random() * 20,
      strength: 45 + Math.random() * 5,
      freeLime: 1.2 + Math.random() * 0.3,
      qualityIndex: 92 + Math.random() * 6
    }));
  };

  const getCrossProcessData = () => [
    { process: 'Raw Grinding', efficiency: 88, optimization: 92, color: '#3498db' },
    { process: 'Clinkerization', efficiency: 85, optimization: 90, color: '#e74c3c' },
    { process: 'Cement Grinding', efficiency: 82, optimization: 88, color: '#f39c12' },
    { process: 'Quality Control', efficiency: 95, optimization: 97, color: '#27ae60' },
    { process: 'Material Handling', efficiency: 78, optimization: 85, color: '#9b59b6' },
    { process: 'Utilities', efficiency: 75, optimization: 82, color: '#1abc9c' }
  ];

  const handleOptimize = (type: string) => {
    console.log(`Optimizing ${type}...`);
    // Here you would implement actual optimization logic
  };

  const renderOverview = () => (
    <div>
      <SectionTitle>🌱 Sustainability Overview</SectionTitle>
      
      <MetricCard status={getStatus(optimizationData.tsr, optimizationData.targetTsr)}>
        <MetricLabel>Thermal Substitution Rate (TSR)</MetricLabel>
        <MetricValue>
          {optimizationData.tsr.toFixed(1)}<MetricUnit>%</MetricUnit>
          <StatusBadge status={getStatus(optimizationData.tsr, optimizationData.targetTsr)}>
            {getStatus(optimizationData.tsr, optimizationData.targetTsr)}
          </StatusBadge>
        </MetricValue>
        <ProgressBar value={optimizationData.tsr} maxValue={optimizationData.targetTsr} color="#00b894">
          <ProgressFill value={optimizationData.tsr} maxValue={optimizationData.targetTsr} color="#00b894" />
        </ProgressBar>
        <div style={{ fontSize: '10px', color: '#8b9dc3', marginTop: '4px' }}>
          Target: {optimizationData.targetTsr}% | Gap: {(optimizationData.targetTsr - optimizationData.tsr).toFixed(1)}%
        </div>
      </MetricCard>

      <MetricCard status={getStatus(optimizationData.energyEfficiency, optimizationData.targetEnergyEfficiency)}>
        <MetricLabel>Energy Efficiency</MetricLabel>
        <MetricValue>
          {optimizationData.energyEfficiency.toFixed(1)}<MetricUnit>%</MetricUnit>
          <StatusBadge status={getStatus(optimizationData.energyEfficiency, optimizationData.targetEnergyEfficiency)}>
            {getStatus(optimizationData.energyEfficiency, optimizationData.targetEnergyEfficiency)}
          </StatusBadge>
        </MetricValue>
        <ProgressBar value={optimizationData.energyEfficiency} maxValue={optimizationData.targetEnergyEfficiency} color="#74b9ff">
          <ProgressFill value={optimizationData.energyEfficiency} maxValue={optimizationData.targetEnergyEfficiency} color="#74b9ff" />
        </ProgressBar>
      </MetricCard>

      <MetricCard status={getStatus(optimizationData.carbonFootprint, optimizationData.targetCarbonFootprint)}>
        <MetricLabel>Carbon Footprint</MetricLabel>
        <MetricValue>
          {optimizationData.carbonFootprint.toFixed(0)}<MetricUnit>kg CO₂/ton</MetricUnit>
          <StatusBadge status={getStatus(optimizationData.carbonFootprint, optimizationData.targetCarbonFootprint)}>
            {getStatus(optimizationData.carbonFootprint, optimizationData.targetCarbonFootprint)}
          </StatusBadge>
        </MetricValue>
        <ProgressBar value={optimizationData.targetCarbonFootprint} maxValue={optimizationData.carbonFootprint} color="#e74c3c">
          <ProgressFill value={optimizationData.targetCarbonFootprint} maxValue={optimizationData.carbonFootprint} color="#e74c3c" />
        </ProgressBar>
      </MetricCard>

      <div style={{ marginTop: '20px' }}>
        <OptimizationButton variant="success" onClick={() => handleOptimize('tsr')}>
          🚀 Optimize TSR
        </OptimizationButton>
        <OptimizationButton variant="primary" onClick={() => handleOptimize('energy')}>
          ⚡ Optimize Energy
        </OptimizationButton>
        <OptimizationButton variant="warning" onClick={() => handleOptimize('carbon')}>
          🌍 Reduce Carbon
        </OptimizationButton>
      </div>
    </div>
  );

  const renderAlternativeFuels = () => (
    <div>
      <SectionTitle>🔥 Alternative Fuel Optimization</SectionTitle>
      
      <div style={{ marginBottom: '20px' }}>
        <h4 style={{ color: '#74b9ff', fontSize: '14px', marginBottom: '10px' }}>Current Fuel Mix</h4>
        <ResponsiveContainer width="100%" height={200}>
          <PieChart>
            <Pie
              data={getFuelMixData()}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              outerRadius={60}
              fill="#8884d8"
              dataKey="value"
            >
              {getFuelMixData().map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </div>

      <MetricCard status="warning">
        <MetricLabel>RDF Utilization Potential</MetricLabel>
        <MetricValue>
          12.0<MetricUnit>%</MetricUnit>
          <StatusBadge status="warning">Can Improve</StatusBadge>
        </MetricValue>
        <div style={{ fontSize: '11px', color: '#8b9dc3', marginTop: '4px' }}>
          Target: 20% | Opportunity: +8% TSR increase
        </div>
      </MetricCard>

      <MetricCard status="good">
        <MetricLabel>Biomass Integration</MetricLabel>
        <MetricValue>
          8.0<MetricUnit>%</MetricUnit>
          <StatusBadge status="good">Good</StatusBadge>
        </MetricValue>
        <div style={{ fontSize: '11px', color: '#8b9dc3', marginTop: '4px' }}>
          Target: 12% | Sustainable fuel source
        </div>
      </MetricCard>

      <div style={{ marginTop: '20px' }}>
        <OptimizationButton variant="success" onClick={() => handleOptimize('rdf')}>
          📈 Increase RDF Usage
        </OptimizationButton>
        <OptimizationButton variant="primary" onClick={() => handleOptimize('biomass')}>
          🌿 Optimize Biomass
        </OptimizationButton>
        <OptimizationButton variant="warning" onClick={() => handleOptimize('plastic')}>
          ♻️ Process Plastic Waste
        </OptimizationButton>
      </div>
    </div>
  );

  const renderEnergyOptimization = () => (
    <div>
      <SectionTitle>⚡ Energy Efficiency Optimization</SectionTitle>
      
      <div style={{ marginBottom: '20px' }}>
        <h4 style={{ color: '#74b9ff', fontSize: '14px', marginBottom: '10px' }}>24h Energy Profile</h4>
        <ResponsiveContainer width="100%" height={200}>
          <AreaChart data={getEnergyOptimizationData()}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis dataKey="time" stroke="#9ca3af" />
            <YAxis stroke="#9ca3af" />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: '#1f2937', 
                border: '1px solid #374151',
                borderRadius: '8px'
              }} 
            />
            <Legend />
            <Area type="monotone" dataKey="current" stackId="1" stroke="#e74c3c" fill="#e74c3c" fillOpacity={0.3} name="Current" />
            <Area type="monotone" dataKey="optimized" stackId="2" stroke="#00b894" fill="#00b894" fillOpacity={0.3} name="Optimized" />
            <Area type="monotone" dataKey="renewable" stackId="3" stroke="#f39c12" fill="#f39c12" fillOpacity={0.3} name="Renewable" />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <MetricCard status={getStatus(optimizationData.wasteHeatRecovery, optimizationData.targetWasteHeatRecovery)}>
        <MetricLabel>Waste Heat Recovery</MetricLabel>
        <MetricValue>
          {optimizationData.wasteHeatRecovery.toFixed(1)}<MetricUnit>%</MetricUnit>
          <StatusBadge status={getStatus(optimizationData.wasteHeatRecovery, optimizationData.targetWasteHeatRecovery)}>
            {getStatus(optimizationData.wasteHeatRecovery, optimizationData.targetWasteHeatRecovery)}
          </StatusBadge>
        </MetricValue>
        <ProgressBar value={optimizationData.wasteHeatRecovery} maxValue={optimizationData.targetWasteHeatRecovery} color="#f39c12">
          <ProgressFill value={optimizationData.wasteHeatRecovery} maxValue={optimizationData.targetWasteHeatRecovery} color="#f39c12" />
        </ProgressBar>
      </MetricCard>

      <MetricCard status={getStatus(optimizationData.renewableEnergy, optimizationData.targetRenewableEnergy)}>
        <MetricLabel>Renewable Energy Share</MetricLabel>
        <MetricValue>
          {optimizationData.renewableEnergy.toFixed(1)}<MetricUnit>%</MetricUnit>
          <StatusBadge status={getStatus(optimizationData.renewableEnergy, optimizationData.targetRenewableEnergy)}>
            {getStatus(optimizationData.renewableEnergy, optimizationData.targetRenewableEnergy)}
          </StatusBadge>
        </MetricValue>
        <ProgressBar value={optimizationData.renewableEnergy} maxValue={optimizationData.targetRenewableEnergy} color="#27ae60">
          <ProgressFill value={optimizationData.renewableEnergy} maxValue={optimizationData.targetRenewableEnergy} color="#27ae60" />
        </ProgressBar>
      </MetricCard>

      <div style={{ marginTop: '20px' }}>
        <OptimizationButton variant="success" onClick={() => handleOptimize('heat-recovery')}>
          🔥 Enhance Heat Recovery
        </OptimizationButton>
        <OptimizationButton variant="primary" onClick={() => handleOptimize('renewable')}>
          ☀️ Increase Renewables
        </OptimizationButton>
        <OptimizationButton variant="warning" onClick={() => handleOptimize('power-consumption')}>
          ⚡ Reduce Power Usage
        </OptimizationButton>
      </div>
    </div>
  );

  const renderQualityControl = () => (
    <div>
      <SectionTitle>📊 Quality Consistency Optimization</SectionTitle>
      
      <div style={{ marginBottom: '20px' }}>
        <h4 style={{ color: '#74b9ff', fontSize: '14px', marginBottom: '10px' }}>Quality Trends (30 Days)</h4>
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={getQualityTrendData()}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis dataKey="day" stroke="#9ca3af" />
            <YAxis stroke="#9ca3af" />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: '#1f2937', 
                border: '1px solid #374151',
                borderRadius: '8px'
              }} 
            />
            <Legend />
            <Line type="monotone" dataKey="blaine" stroke="#8b5cf6" strokeWidth={2} name="Blaine (m²/kg)" />
            <Line type="monotone" dataKey="strength" stroke="#06b6d4" strokeWidth={2} name="Strength (MPa)" />
            <Line type="monotone" dataKey="qualityIndex" stroke="#10b981" strokeWidth={2} name="Quality Index" />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <MetricCard status={getStatus(optimizationData.qualityIndex, optimizationData.targetQualityIndex)}>
        <MetricLabel>Overall Quality Index</MetricLabel>
        <MetricValue>
          {optimizationData.qualityIndex.toFixed(1)}<MetricUnit>/100</MetricUnit>
          <StatusBadge status={getStatus(optimizationData.qualityIndex, optimizationData.targetQualityIndex)}>
            {getStatus(optimizationData.qualityIndex, optimizationData.targetQualityIndex)}
          </StatusBadge>
        </MetricValue>
        <ProgressBar value={optimizationData.qualityIndex} maxValue={optimizationData.targetQualityIndex} color="#10b981">
          <ProgressFill value={optimizationData.qualityIndex} maxValue={optimizationData.targetQualityIndex} color="#10b981" />
        </ProgressBar>
      </MetricCard>

      <MetricCard status="good">
        <MetricLabel>Blaine Fineness Control</MetricLabel>
        <MetricValue>
          350<MetricUnit>m²/kg</MetricUnit>
          <StatusBadge status="good">Stable</StatusBadge>
        </MetricValue>
        <div style={{ fontSize: '11px', color: '#8b9dc3', marginTop: '4px' }}>
          Variability: ±15 m²/kg | Target: ±8 m²/kg
        </div>
      </MetricCard>

      <MetricCard status="warning">
        <MetricLabel>Free Lime Content</MetricLabel>
        <MetricValue>
          1.8<MetricUnit>%</MetricUnit>
          <StatusBadge status="warning">High</StatusBadge>
        </MetricValue>
        <div style={{ fontSize: '11px', color: '#8b9dc3', marginTop: '4px' }}>
          Target: 1.2% | Action: Optimize burning zone
        </div>
      </MetricCard>

      <div style={{ marginTop: '20px' }}>
        <OptimizationButton variant="success" onClick={() => handleOptimize('blaine')}>
          🎯 Optimize Blaine
        </OptimizationButton>
        <OptimizationButton variant="primary" onClick={() => handleOptimize('free-lime')}>
          🔥 Reduce Free Lime
        </OptimizationButton>
        <OptimizationButton variant="warning" onClick={() => handleOptimize('consistency')}>
          📈 Improve Consistency
        </OptimizationButton>
      </div>
    </div>
  );

  const renderCrossProcess = () => (
    <div>
      <SectionTitle>🔄 Cross-Process Optimization</SectionTitle>
      
      <div style={{ marginBottom: '20px' }}>
        <h4 style={{ color: '#74b9ff', fontSize: '14px', marginBottom: '10px' }}>Process Efficiency Matrix</h4>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={getCrossProcessData()}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis dataKey="process" stroke="#9ca3af" />
            <YAxis stroke="#9ca3af" />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: '#1f2937', 
                border: '1px solid #374151',
                borderRadius: '8px'
              }} 
            />
            <Legend />
            <Bar dataKey="efficiency" fill="#74b9ff" name="Current Efficiency" />
            <Bar dataKey="optimization" fill="#00b894" name="Optimization Potential" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <MetricCard status="good">
        <MetricLabel>Overall Plant Efficiency</MetricLabel>
        <MetricValue>
          87.5<MetricUnit>%</MetricUnit>
          <StatusBadge status="good">Good</StatusBadge>
        </MetricValue>
        <div style={{ fontSize: '11px', color: '#8b9dc3', marginTop: '4px' }}>
          Target: 92% | Cross-process optimization potential: +4.5%
        </div>
      </MetricCard>

      <MetricCard status="warning">
        <MetricLabel>Material Handling Efficiency</MetricLabel>
        <MetricValue>
          78.0<MetricUnit>%</MetricUnit>
          <StatusBadge status="warning">Needs Improvement</StatusBadge>
        </MetricValue>
        <div style={{ fontSize: '11px', color: '#8b9dc3', marginTop: '4px' }}>
          Opportunity: +7% through conveyor optimization
        </div>
      </MetricCard>

      <MetricCard status="good">
        <MetricLabel>Utilities Optimization</MetricLabel>
        <MetricValue>
          75.0<MetricUnit>%</MetricUnit>
          <StatusBadge status="warning">Moderate</StatusBadge>
        </MetricValue>
        <div style={{ fontSize: '11px', color: '#8b9dc3', marginTop: '4px' }}>
          Opportunity: +7% through smart grid integration
        </div>
      </MetricCard>

      <div style={{ marginTop: '20px' }}>
        <OptimizationButton variant="success" onClick={() => handleOptimize('cross-process')}>
          🔄 Optimize All Processes
        </OptimizationButton>
        <OptimizationButton variant="primary" onClick={() => handleOptimize('material-handling')}>
          📦 Improve Material Flow
        </OptimizationButton>
        <OptimizationButton variant="warning" onClick={() => handleOptimize('utilities')}>
          ⚙️ Optimize Utilities
        </OptimizationButton>
      </div>
    </div>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'overview': return renderOverview();
      case 'fuels': return renderAlternativeFuels();
      case 'energy': return renderEnergyOptimization();
      case 'quality': return renderQualityControl();
      case 'cross-process': return renderCrossProcess();
      default: return renderOverview();
    }
  };

  return (
    <OptimizationContainer>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2 style={{ color: '#74b9ff', margin: 0, fontSize: '18px' }}>🌱 Sustainability & Optimization</h2>
        <button
          onClick={onClose}
          style={{
            background: 'none',
            border: 'none',
            color: '#8b9dc3',
            fontSize: '20px',
            cursor: 'pointer',
            padding: '4px'
          }}
        >
          ×
        </button>
      </div>

      <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', flexWrap: 'wrap' }}>
        {[
          { key: 'overview', label: '📊 Overview', icon: '📊' },
          { key: 'fuels', label: '🔥 Fuels', icon: '🔥' },
          { key: 'energy', label: '⚡ Energy', icon: '⚡' },
          { key: 'quality', label: '📈 Quality', icon: '📈' },
          { key: 'cross-process', label: '🔄 Cross-Process', icon: '🔄' }
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as any)}
            style={{
              padding: '6px 12px',
              border: 'none',
              borderRadius: '6px',
              fontSize: '11px',
              cursor: 'pointer',
              background: activeTab === tab.key ? '#74b9ff' : 'rgba(116, 185, 255, 0.1)',
              color: activeTab === tab.key ? 'white' : '#74b9ff',
              transition: 'all 0.3s ease'
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {renderContent()}
    </OptimizationContainer>
  );
};

export default SustainabilityOptimization;
