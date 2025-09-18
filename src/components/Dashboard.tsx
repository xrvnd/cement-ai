import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell, AreaChart, Area, RadialBarChart, RadialBar } from 'recharts';
import TopBar from './TopBar';
import { usePlant } from '../context/PlantContext';

const DashboardContainer = styled.div`
  min-height: 100vh;
  background: linear-gradient(135deg, #0a0f1c 0%, #1a1f2e 30%, #16213e 100%);
  color: #ffffff;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
  display: flex;
  flex-direction: column;
  position: relative;
  
  /* Add subtle texture overlay for depth */
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-image: 
      radial-gradient(circle at 25% 25%, rgba(14, 165, 233, 0.1) 0%, transparent 50%),
      radial-gradient(circle at 75% 75%, rgba(245, 158, 11, 0.08) 0%, transparent 50%);
    pointer-events: none;
    z-index: 0;
  }
  
  /* Professional grid pattern */
  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-image: 
      linear-gradient(rgba(14, 165, 233, 0.05) 1px, transparent 1px),
      linear-gradient(90deg, rgba(14, 165, 233, 0.05) 1px, transparent 1px);
    background-size: 50px 50px;
    pointer-events: none;
    z-index: 0;
  }
`;

const ContentContainer = styled.div`
  flex: 1;
  padding: 20px;
  overflow-y: auto;
`;


const GridContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: 24px;
  margin-bottom: 30px;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 16px;
    margin-bottom: 20px;
  }
  
  @media (max-width: 480px) {
    gap: 12px;
    margin-bottom: 16px;
  }
`;

const Card = styled.div`
  background: linear-gradient(135deg, rgba(30, 41, 59, 0.8) 0%, rgba(51, 65, 85, 0.8) 100%);
  backdrop-filter: blur(20px);
  border-radius: 16px;
  padding: 24px;
  box-shadow: 
    0 8px 32px rgba(0, 0, 0, 0.3),
    0 0 0 1px rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(55, 65, 81, 0.3);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  z-index: 1;
  
  &:hover {
    transform: translateY(-4px) scale(1.02);
    box-shadow: 
      0 12px 40px rgba(0, 0, 0, 0.4),
      0 0 0 1px rgba(59, 130, 246, 0.3),
      0 0 20px rgba(59, 130, 246, 0.1);
    border-color: rgba(59, 130, 246, 0.5);
  }
  
  /* Add subtle inner glow */
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    border-radius: 16px;
    background: linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, transparent 50%);
    pointer-events: none;
    z-index: -1;
  }
  
  @media (max-width: 768px) {
    padding: 16px;
    border-radius: 12px;
    
    &:hover {
      transform: translateY(-2px) scale(1.01);
    }
  }
  
  @media (max-width: 480px) {
    padding: 12px;
    border-radius: 8px;
    
    &:hover {
      transform: translateY(-1px) scale(1.005);
    }
  }
`;

const CardTitle = styled.h3`
  margin: 0 0 20px 0;
  font-size: 1.4rem;
  font-weight: 600;
  color: #3b82f6;
`;

const MetricsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
`;

const MetricCard = styled.div<{ status: string }>`
  background: linear-gradient(135deg, #374151 0%, #4b5563 100%);
  border-radius: 12px;
  padding: 16px;
  border-left: 4px solid ${props => {
    switch (props.status) {
      case 'excellent': return '#10b981';
      case 'good': return '#3b82f6';
      case 'fair': return '#f59e0b';
      case 'poor': return '#ef4444';
      case 'critical': return '#dc2626';
      default: return '#6b7280';
    }
  }};
`;

const MetricName = styled.div`
  font-size: 0.9rem;
  color: #9ca3af;
  margin-bottom: 8px;
`;

const MetricValue = styled.div`
  font-size: 1.8rem;
  font-weight: 700;
  color: #ffffff;
  margin-bottom: 4px;
`;

const MetricUnit = styled.span`
  font-size: 1rem;
  color: #9ca3af;
  margin-left: 4px;
`;

const MetricTarget = styled.div`
  font-size: 0.8rem;
  color: #6b7280;
`;

const StatusBadge = styled.span<{ status: string }>`
  display: inline-block;
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 600;
  text-transform: uppercase;
  background: ${props => {
    switch (props.status) {
      case 'excellent': return '#10b981';
      case 'good': return '#3b82f6';
      case 'fair': return '#f59e0b';
      case 'poor': return '#ef4444';
      case 'critical': return '#dc2626';
      default: return '#6b7280';
    }
  }};
  color: #ffffff;
`;

const TrendIndicator = styled.span<{ trend: string }>`
  margin-left: 8px;
  color: ${props => {
    switch (props.trend) {
      case 'increasing': return '#10b981';
      case 'decreasing': return '#ef4444';
      case 'stable': return '#f59e0b';
      default: return '#6b7280';
    }
  }};
`;

const RecommendationsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const RecommendationItem = styled.div<{ priority: string }>`
  background: linear-gradient(135deg, #374151 0%, #4b5563 100%);
  border-radius: 8px;
  padding: 16px;
  border-left: 4px solid ${props => {
    switch (props.priority) {
      case 'high': return '#ef4444';
      case 'medium': return '#f59e0b';
      case 'low': return '#3b82f6';
      default: return '#6b7280';
    }
  }};
`;

const RecommendationTitle = styled.div`
  font-weight: 600;
  color: #ffffff;
  margin-bottom: 8px;
`;

const RecommendationDescription = styled.div`
  color: #9ca3af;
  font-size: 0.9rem;
  line-height: 1.5;
`;

const PriorityBadge = styled.span<{ priority: string }>`
  display: inline-block;
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 0.7rem;
  font-weight: 600;
  text-transform: uppercase;
  margin-top: 8px;
  background: ${props => {
    switch (props.priority) {
      case 'high': return '#ef4444';
      case 'medium': return '#f59e0b';
      case 'low': return '#3b82f6';
      default: return '#6b7280';
    }
  }};
  color: #ffffff;
`;

const AlertsContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const AlertItem = styled.div<{ severity: string }>`
  background: linear-gradient(135deg, #374151 0%, #4b5563 100%);
  border-radius: 8px;
  padding: 16px;
  border-left: 4px solid ${props => {
    switch (props.severity) {
      case 'high': return '#ef4444';
      case 'medium': return '#f59e0b';
      case 'low': return '#3b82f6';
      default: return '#6b7280';
    }
  }};
`;

const AlertTitle = styled.div`
  font-weight: 600;
  color: #ffffff;
  margin-bottom: 4px;
`;

const AlertDescription = styled.div`
  color: #9ca3af;
  font-size: 0.9rem;
  margin-bottom: 8px;
`;

const AlertMeta = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.8rem;
  color: #6b7280;
`;

// Enhanced Sustainability Components
const SustainabilityCard = styled(Card)`
  background: linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(5, 150, 105, 0.1) 100%);
  border: 1px solid rgba(16, 185, 129, 0.3);
  
  &:hover {
    border-color: rgba(16, 185, 129, 0.6);
    box-shadow: 
      0 12px 40px rgba(0, 0, 0, 0.4),
      0 0 0 1px rgba(16, 185, 129, 0.3),
      0 0 20px rgba(16, 185, 129, 0.2);
  }
`;

const EcoMetricCard = styled(MetricCard)<{ ecoStatus: string }>`
  background: linear-gradient(135deg, 
    ${props => {
      switch (props.ecoStatus) {
        case 'excellent': return 'rgba(16, 185, 129, 0.2) 0%, rgba(5, 150, 105, 0.2) 100%';
        case 'good': return 'rgba(34, 197, 94, 0.2) 0%, rgba(21, 128, 61, 0.2) 100%';
        case 'fair': return 'rgba(245, 158, 11, 0.2) 0%, rgba(217, 119, 6, 0.2) 100%';
        case 'poor': return 'rgba(239, 68, 68, 0.2) 0%, rgba(220, 38, 38, 0.2) 100%';
        default: return '#374151 0%, #4b5563 100%';
      }
    }}
  );
  border-left: 4px solid ${props => {
    switch (props.ecoStatus) {
      case 'excellent': return '#10b981';
      case 'good': return '#22c55e';
      case 'fair': return '#f59e0b';
      case 'poor': return '#ef4444';
      default: return '#6b7280';
    }
  }};
  position: relative;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    right: 0;
    width: 40px;
    height: 40px;
    background: ${props => {
      switch (props.ecoStatus) {
        case 'excellent': return 'linear-gradient(45deg, #10b981, #059669)';
        case 'good': return 'linear-gradient(45deg, #22c55e, #15803d)';
        case 'fair': return 'linear-gradient(45deg, #f59e0b, #d97706)';
        case 'poor': return 'linear-gradient(45deg, #ef4444, #dc2626)';
        default: return 'linear-gradient(45deg, #6b7280, #4b5563)';
      }
    }};
    border-radius: 0 0 0 40px;
    opacity: 0.3;
  }
`;

const SustainabilityIcon = styled.div`
  font-size: 2rem;
  margin-bottom: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const CarbonFootprintCard = styled(Card)`
  background: linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(37, 99, 235, 0.1) 100%);
  border: 1px solid rgba(59, 130, 246, 0.3);
  
  &:hover {
    border-color: rgba(59, 130, 246, 0.6);
    box-shadow: 
      0 12px 40px rgba(0, 0, 0, 0.4),
      0 0 0 1px rgba(59, 130, 246, 0.3),
      0 0 20px rgba(59, 130, 246, 0.2);
  }
`;

const EnergyEfficiencyCard = styled(Card)`
  background: linear-gradient(135deg, rgba(245, 158, 11, 0.1) 0%, rgba(217, 119, 6, 0.1) 100%);
  border: 1px solid rgba(245, 158, 11, 0.3);
  
  &:hover {
    border-color: rgba(245, 158, 11, 0.6);
    box-shadow: 
      0 12px 40px rgba(0, 0, 0, 0.4),
      0 0 0 1px rgba(245, 158, 11, 0.3),
      0 0 20px rgba(245, 158, 11, 0.2);
  }
`;

const WaterManagementCard = styled(Card)`
  background: linear-gradient(135deg, rgba(6, 182, 212, 0.1) 0%, rgba(8, 145, 178, 0.1) 100%);
  border: 1px solid rgba(6, 182, 212, 0.3);
  
  &:hover {
    border-color: rgba(6, 182, 212, 0.6);
    box-shadow: 
      0 12px 40px rgba(0, 0, 0, 0.4),
      0 0 0 1px rgba(6, 182, 212, 0.3),
      0 0 20px rgba(6, 182, 212, 0.2);
  }
`;

const SustainabilityTarget = styled.div<{ achieved: boolean }>`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 12px;
  background: ${props => props.achieved ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)'};
  border-radius: 8px;
  margin-top: 8px;
  font-size: 0.8rem;
  
  &::before {
    content: '${props => props.achieved ? '✅' : '⚠️'}';
    margin-right: 8px;
  }
`;

const EnvironmentalAlert = styled(AlertItem)`
  background: linear-gradient(135deg, rgba(239, 68, 68, 0.1) 0%, rgba(220, 38, 38, 0.1) 100%);
  border-left: 4px solid #ef4444;
  
  &::before {
    content: '🌍';
    position: absolute;
    top: 16px;
    right: 16px;
    font-size: 1.2rem;
  }
`;

const SustainabilityScore = styled.div<{ score: number }>`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 120px;
  height: 120px;
  border-radius: 50%;
  background: conic-gradient(
    from 0deg,
    ${props => {
      if (props.score >= 80) return '#10b981 0deg, #10b981 ' + (props.score * 3.6) + 'deg, rgba(16, 185, 129, 0.2) ' + (props.score * 3.6) + 'deg';
      if (props.score >= 60) return '#f59e0b 0deg, #f59e0b ' + (props.score * 3.6) + 'deg, rgba(245, 158, 11, 0.2) ' + (props.score * 3.6) + 'deg';
      return '#ef4444 0deg, #ef4444 ' + (props.score * 3.6) + 'deg, rgba(239, 68, 68, 0.2) ' + (props.score * 3.6) + 'deg';
    }}
  );
  position: relative;
  margin: 0 auto;
  
  &::before {
    content: '';
    position: absolute;
    width: 90px;
    height: 90px;
    border-radius: 50%;
    background: #1f2937;
  }
  
  span {
    position: relative;
    z-index: 1;
    font-size: 1.5rem;
    font-weight: 700;
    color: #ffffff;
  }
  
  small {
    position: relative;
    z-index: 1;
    font-size: 0.7rem;
    color: #9ca3af;
    margin-top: -4px;
  }
`;

const TabContainer = styled.div`
  display: flex;
  background: rgba(31, 41, 55, 0.8);
  border-radius: 12px;
  padding: 4px;
  margin-bottom: 24px;
  backdrop-filter: blur(10px);
`;

const Tab = styled.button<{ active: boolean }>`
  flex: 1;
  padding: 12px 16px;
  border: none;
  border-radius: 8px;
  background: ${props => props.active ? 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)' : 'transparent'};
  color: ${props => props.active ? '#ffffff' : '#9ca3af'};
  font-weight: ${props => props.active ? '600' : '400'};
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 0.9rem;
  
  &:hover {
    background: ${props => props.active ? 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)' : 'rgba(59, 130, 246, 0.1)'};
    color: ${props => props.active ? '#ffffff' : '#ffffff'};
  }
`;

const InsightCard = styled(Card)`
  background: linear-gradient(135deg, rgba(139, 92, 246, 0.1) 0%, rgba(124, 58, 237, 0.1) 100%);
  border: 1px solid rgba(139, 92, 246, 0.3);
  
  &:hover {
    border-color: rgba(139, 92, 246, 0.6);
    box-shadow: 
      0 12px 40px rgba(0, 0, 0, 0.4),
      0 0 0 1px rgba(139, 92, 246, 0.3),
      0 0 20px rgba(139, 92, 246, 0.2);
  }
`;




type PageType = 'main' | 'plantgpt' | 'dashboard' | 'cvanalysis';

interface DashboardProps {
  onNavigate?: (page: PageType) => void;
  currentTime?: Date;
  currentTemp?: number;
}

const Dashboard: React.FC<DashboardProps> = ({ onNavigate, currentTime = new Date(), currentTemp = 21 }) => {
  const { currentPlantData } = usePlant();
  const [activeTab, setActiveTab] = useState<'overview' | 'sustainability' | 'insights'>('overview');
  const [sustainabilityData, setSustainabilityData] = useState<any>(null);

  // Use plant context data directly instead of API calls
  const dashboardData = currentPlantData;

  // Generate sustainability data
  useEffect(() => {
    const generateSustainabilityData = () => {
      return {
        overallScore: 78,
        carbonFootprint: {
          current: 0.82,
          target: 0.75,
          trend: 'decreasing',
          monthlyReduction: 5.2
        },
        energyEfficiency: {
          current: 85.4,
          target: 90.0,
          trend: 'increasing',
          savings: 12.3
        },
        waterUsage: {
          current: 245,
          target: 220,
          trend: 'stable',
          recyclingRate: 68
        },
        wasteManagement: {
          recyclingRate: 92,
          target: 95,
          wasteReduction: 15.7,
          trend: 'increasing'
        },
        renewableEnergy: {
          percentage: 23.5,
          target: 30.0,
          solarGeneration: 1250,
          windGeneration: 890
        },
        environmentalCompliance: {
          airQuality: 'excellent',
          waterDischarge: 'good',
          noiseLevel: 'good',
          dustEmission: 'fair'
        }
      };
    };

    setSustainabilityData(generateSustainabilityData());
  }, []);


  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString();
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'increasing': return '↗️';
      case 'decreasing': return '↘️';
      case 'stable': return '➡️';
      default: return '➡️';
    }
  };

  // Chart data generation functions
  const getTemperatureData = () => {
    const hours = Array.from({ length: 24 }, (_, i) => i);
    return hours.map(hour => ({
      time: `${hour.toString().padStart(2, '0')}:00`,
      preheater: 1200 + Math.random() * 100,
      calciner: 1800 + Math.random() * 100,
      burningZone: 1400 + Math.random() * 100,
      cooler: 150 + Math.random() * 50
    }));
  };

  const getProductionData = () => [
    { category: 'Clinker Production', current: 2800, target: 3000 },
    { category: 'Cement Production', current: 3200, target: 3500 },
    { category: 'Energy Efficiency', current: 85, target: 90 },
    { category: 'Mill Throughput', current: 120, target: 130 },
    { category: 'Fuel Efficiency', current: 92, target: 95 }
  ];

  const getProductionDistribution = () => [
    { name: 'OPC 43 Grade', value: 45, color: '#3b82f6' },
    { name: 'OPC 53 Grade', value: 30, color: '#10b981' },
    { name: 'PPC', value: 20, color: '#f59e0b' },
    { name: 'Others', value: 5, color: '#ef4444' }
  ];

  const getQualityData = () => {
    const hours = Array.from({ length: 12 }, (_, i) => i * 2);
    return hours.map(hour => ({
      time: `${hour.toString().padStart(2, '0')}:00`,
      blaine: 320 + Math.random() * 40,
      strength: 42 + Math.random() * 8,
      freeLime: 1.0 + Math.random() * 0.5
    }));
  };

  // Sustainability Data Functions
  const getSustainabilityTrends = () => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
    return months.map(month => ({
      month,
      carbonFootprint: 0.85 - Math.random() * 0.1,
      energyEfficiency: 80 + Math.random() * 10,
      waterUsage: 250 - Math.random() * 30,
      wasteRecycling: 85 + Math.random() * 10
    }));
  };

  const getEnergyBreakdown = () => [
    { source: 'Coal', percentage: 45, color: '#374151', emissions: 'High' },
    { source: 'Natural Gas', percentage: 20, color: '#3b82f6', emissions: 'Medium' },
    { source: 'Biomass', percentage: 15, color: '#10b981', emissions: 'Low' },
    { source: 'Solar', percentage: 12, color: '#f59e0b', emissions: 'Zero' },
    { source: 'Wind', percentage: 8, color: '#06b6d4', emissions: 'Zero' }
  ];

  const getCarbonEmissionData = () => {
    const hours = Array.from({ length: 24 }, (_, i) => i);
    return hours.map(hour => ({
      time: `${hour.toString().padStart(2, '0')}:00`,
      co2: 820 + Math.random() * 100,
      nox: 45 + Math.random() * 15,
      so2: 12 + Math.random() * 8,
      particulates: 8 + Math.random() * 5
    }));
  };

  const getWaterManagementData = () => {
    const days = Array.from({ length: 7 }, (_, i) => i + 1);
    return days.map(day => ({
      day: `Day ${day}`,
      consumption: 240 + Math.random() * 30,
      recycled: 160 + Math.random() * 20,
      discharged: 80 + Math.random() * 15,
      efficiency: 65 + Math.random() * 10
    }));
  };

  const getEnvironmentalKPIs = () => [
    { 
      name: 'Air Quality Index', 
      current: 42, 
      target: 50, 
      unit: 'AQI',
      status: 'excellent',
      icon: '🌬️'
    },
    { 
      name: 'Water Discharge Quality', 
      current: 95, 
      target: 90, 
      unit: '%',
      status: 'excellent',
      icon: '💧'
    },
    { 
      name: 'Noise Level', 
      current: 68, 
      target: 70, 
      unit: 'dB',
      status: 'good',
      icon: '🔊'
    },
    { 
      name: 'Dust Emission', 
      current: 15, 
      target: 10, 
      unit: 'mg/m³',
      status: 'fair',
      icon: '💨'
    },
    { 
      name: 'Soil Quality', 
      current: 88, 
      target: 85, 
      unit: '%',
      status: 'excellent',
      icon: '🌱'
    },
    { 
      name: 'Biodiversity Index', 
      current: 72, 
      target: 75, 
      unit: 'BDI',
      status: 'good',
      icon: '🦋'
    }
  ];

  if (!dashboardData) return null;

  return (
    <DashboardContainer>
      <TopBar 
        currentTime={currentTime}
        currentTemp={currentTemp}
        currentPage="dashboard"
        onPageChange={onNavigate}
      />
      
      <ContentContainer>
        {/* Navigation Tabs */}
        <TabContainer>
          <Tab 
            active={activeTab === 'overview'} 
            onClick={() => setActiveTab('overview')}
          >
            📊 Plant Overview
          </Tab>
          <Tab 
            active={activeTab === 'sustainability'} 
            onClick={() => setActiveTab('sustainability')}
          >
            🌱 Sustainability Dashboard
          </Tab>
          <Tab 
            active={activeTab === 'insights'} 
            onClick={() => setActiveTab('insights')}
          >
            🧠 AI Insights
          </Tab>
        </TabContainer>

        {/* Plant Overview Tab */}
        {activeTab === 'overview' && (
          <>
            {/* Plant Overview */}
            <GridContainer>
        <Card>
          <CardTitle>Plant Overview</CardTitle>
          <MetricsGrid>
            <MetricCard status="good">
              <MetricName>Clinker Production</MetricName>
              <MetricValue>
                {dashboardData.current_production.clinker}
                <MetricUnit>ton/day</MetricUnit>
              </MetricValue>
              <MetricTarget>
                Capacity: {dashboardData.capacity.clinker}
              </MetricTarget>
            </MetricCard>
            <MetricCard status="good">
              <MetricName>Cement Production</MetricName>
              <MetricValue>
                {dashboardData.current_production.cement}
                <MetricUnit>ton/day</MetricUnit>
              </MetricValue>
              <MetricTarget>
                Capacity: {dashboardData.capacity.cement}
              </MetricTarget>
            </MetricCard>
            <MetricCard status="excellent">
              <MetricName>Plant Utilization</MetricName>
              <MetricValue>
                {dashboardData.current_production.utilization}
                <MetricUnit>%</MetricUnit>
              </MetricValue>
              <MetricTarget>Target: 95%</MetricTarget>
            </MetricCard>
          </MetricsGrid>
        </Card>

        <Card>
          <CardTitle>Performance Summary</CardTitle>
          <MetricsGrid>
            <MetricCard status="good">
              <MetricName>Overall Score</MetricName>
              <MetricValue>
                {dashboardData.performance_summary.overall_score}
                <MetricUnit>/100</MetricUnit>
              </MetricValue>
            </MetricCard>
            <MetricCard status="good">
              <MetricName>Energy Efficiency</MetricName>
              <MetricValue>
                {dashboardData.performance_summary.categories.energy_efficiency.score}
                <MetricUnit>/100</MetricUnit>
              </MetricValue>
              <StatusBadge status="good">
                {dashboardData.performance_summary.categories.energy_efficiency.trend}
              </StatusBadge>
            </MetricCard>
            <MetricCard status="excellent">
              <MetricName>Quality Performance</MetricName>
              <MetricValue>
                {dashboardData.performance_summary.categories.quality_performance.score}
                <MetricUnit>/100</MetricUnit>
              </MetricValue>
              <StatusBadge status="excellent">
                {dashboardData.performance_summary.categories.quality_performance.trend}
              </StatusBadge>
            </MetricCard>
          </MetricsGrid>
        </Card>
      </GridContainer>

      {/* Charts Section */}
      <GridContainer>
        <Card>
          <CardTitle>🌡️ Temperature Trends</CardTitle>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={getTemperatureData()}>
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
              <Line type="monotone" dataKey="preheater" stroke="#ef4444" strokeWidth={2} name="Preheater (°C)" />
              <Line type="monotone" dataKey="calciner" stroke="#f97316" strokeWidth={2} name="Calciner (°C)" />
              <Line type="monotone" dataKey="burningZone" stroke="#eab308" strokeWidth={2} name="Burning Zone (°C)" />
              <Line type="monotone" dataKey="cooler" stroke="#3b82f6" strokeWidth={2} name="Cooler (°C)" />
            </LineChart>
          </ResponsiveContainer>
        </Card>

        <Card>
          <CardTitle>⚡ Energy & Production</CardTitle>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={getProductionData()}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="category" stroke="#9ca3af" />
              <YAxis stroke="#9ca3af" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#1f2937', 
                  border: '1px solid #374151',
                  borderRadius: '8px'
                }} 
              />
              <Legend />
              <Bar dataKey="current" fill="#10b981" name="Current" />
              <Bar dataKey="target" fill="#6b7280" name="Target" />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <Card>
          <CardTitle>🏭 Production Distribution</CardTitle>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={getProductionDistribution()}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {getProductionDistribution().map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </Card>

        <Card>
          <CardTitle>📊 Quality Metrics</CardTitle>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={getQualityData()}>
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
              <Line type="monotone" dataKey="blaine" stroke="#8b5cf6" strokeWidth={2} name="Blaine Fineness" />
              <Line type="monotone" dataKey="strength" stroke="#06b6d4" strokeWidth={2} name="Compressive Strength" />
              <Line type="monotone" dataKey="freeLime" stroke="#f59e0b" strokeWidth={2} name="Free Lime %" />
            </LineChart>
          </ResponsiveContainer>
        </Card>
      </GridContainer>

      {/* Focus Areas */}
      {dashboardData.focus_areas.map((focusArea, index) => (
        <Card key={index} style={{ marginBottom: '24px' }}>
          <CardTitle>
            {focusArea.name}
            <span style={{ 
              marginLeft: '16px', 
              fontSize: '0.9rem', 
              color: '#3b82f6',
              fontWeight: 'normal'
            }}>
              Priority Score: {focusArea.priority_score}/10
            </span>
          </CardTitle>
          <p style={{ color: '#9ca3af', marginBottom: '24px' }}>
            {focusArea.description}
          </p>
          
          <div style={{ marginBottom: '24px' }}>
            <h4 style={{ color: '#ffffff', marginBottom: '16px' }}>Key Metrics</h4>
            <MetricsGrid>
              {focusArea.metrics.map((metric, metricIndex) => (
                <MetricCard key={metricIndex} status={metric.status}>
                  <MetricName>{metric.name}</MetricName>
                  <MetricValue>
                    {metric.current_value}
                    <MetricUnit>{metric.unit}</MetricUnit>
                    <TrendIndicator trend={metric.trend}>
                      {getTrendIcon(metric.trend)}
                    </TrendIndicator>
                  </MetricValue>
                  <MetricTarget>Target: {metric.target_value} {metric.unit}</MetricTarget>
                  <div style={{ marginTop: '8px' }}>
                    <StatusBadge status={metric.status}>{metric.status}</StatusBadge>
                  </div>
                </MetricCard>
              ))}
            </MetricsGrid>
          </div>

          <div>
            <h4 style={{ color: '#ffffff', marginBottom: '16px' }}>Recommendations</h4>
            <RecommendationsList>
              {focusArea.recommendations.map((recommendation, recIndex) => (
                <RecommendationItem key={recIndex} priority={recommendation.priority}>
                  <RecommendationTitle>{recommendation.title}</RecommendationTitle>
                  <RecommendationDescription>{recommendation.description}</RecommendationDescription>
                  {recommendation.estimated_impact && (
                    <div style={{ color: '#34d399', fontSize: '0.8rem', marginTop: '4px' }}>
                      Impact: {recommendation.estimated_impact}
                    </div>
                  )}
                  <PriorityBadge priority={recommendation.priority}>
                    {recommendation.priority} priority
                  </PriorityBadge>
                </RecommendationItem>
              ))}
            </RecommendationsList>
          </div>
        </Card>
      ))}

      {/* Real-time Alerts */}
      <Card>
        <CardTitle>Real-time Alerts</CardTitle>
        <AlertsContainer>
          {dashboardData.real_time_alerts.map((alert, index) => (
            <AlertItem key={index} severity={alert.severity}>
              <AlertTitle>{alert.title}</AlertTitle>
              <AlertDescription>{alert.description}</AlertDescription>
              <AlertMeta>
                <span>{alert.location}</span>
                <span>{formatTimestamp(alert.timestamp)}</span>
              </AlertMeta>
              {alert.action_required && (
                <div style={{ marginTop: '8px' }}>
                  <StatusBadge status="poor">Action Required</StatusBadge>
                </div>
              )}
            </AlertItem>
          ))}
        </AlertsContainer>
      </Card>
          </>
        )}

        {/* Sustainability Dashboard Tab */}
        {activeTab === 'sustainability' && sustainabilityData && (
          <>
            {/* Sustainability Overview */}
            <GridContainer>
              <SustainabilityCard>
                <CardTitle>🌍 Sustainability Overview</CardTitle>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div>
                    <h2 style={{ color: '#10b981', margin: '0 0 8px 0' }}>Overall Score</h2>
                    <p style={{ color: '#9ca3af', margin: 0 }}>Environmental Performance Index</p>
                  </div>
                  <SustainabilityScore score={sustainabilityData.overallScore}>
                    <span>{sustainabilityData.overallScore}</span>
                    <small>/ 100</small>
                  </SustainabilityScore>
                </div>
              </SustainabilityCard>

              <CarbonFootprintCard>
                <CardTitle>🏭 Carbon Footprint</CardTitle>
                <MetricsGrid>
                  <EcoMetricCard status="good" ecoStatus="good">
                    <SustainabilityIcon>🌡️</SustainabilityIcon>
                    <MetricName>CO₂ Emissions</MetricName>
                    <MetricValue>
                      {sustainabilityData.carbonFootprint.current}
                      <MetricUnit>t CO₂/t cement</MetricUnit>
                    </MetricValue>
                    <SustainabilityTarget achieved={sustainabilityData.carbonFootprint.current < sustainabilityData.carbonFootprint.target}>
                      Target: {sustainabilityData.carbonFootprint.target} t CO₂/t cement
                    </SustainabilityTarget>
                  </EcoMetricCard>
                </MetricsGrid>
              </CarbonFootprintCard>

              <EnergyEfficiencyCard>
                <CardTitle>⚡ Energy Management</CardTitle>
                <MetricsGrid>
                  <EcoMetricCard status="good" ecoStatus="good">
                    <SustainabilityIcon>⚡</SustainabilityIcon>
                    <MetricName>Energy Efficiency</MetricName>
                    <MetricValue>
                      {sustainabilityData.energyEfficiency.current}
                      <MetricUnit>%</MetricUnit>
                    </MetricValue>
                    <SustainabilityTarget achieved={sustainabilityData.energyEfficiency.current > 80}>
                      Target: {sustainabilityData.energyEfficiency.target}%
                    </SustainabilityTarget>
                  </EcoMetricCard>
                  <EcoMetricCard status="fair" ecoStatus="fair">
                    <SustainabilityIcon>🌞</SustainabilityIcon>
                    <MetricName>Renewable Energy</MetricName>
                    <MetricValue>
                      {sustainabilityData.renewableEnergy.percentage}
                      <MetricUnit>%</MetricUnit>
                    </MetricValue>
                    <SustainabilityTarget achieved={sustainabilityData.renewableEnergy.percentage > 20}>
                      Target: {sustainabilityData.renewableEnergy.target}%
                    </SustainabilityTarget>
                  </EcoMetricCard>
                </MetricsGrid>
              </EnergyEfficiencyCard>

              <WaterManagementCard>
                <CardTitle>💧 Water Management</CardTitle>
                <MetricsGrid>
                  <EcoMetricCard status="fair" ecoStatus="fair">
                    <SustainabilityIcon>💧</SustainabilityIcon>
                    <MetricName>Water Usage</MetricName>
                    <MetricValue>
                      {sustainabilityData.waterUsage.current}
                      <MetricUnit>L/t cement</MetricUnit>
                    </MetricValue>
                    <SustainabilityTarget achieved={sustainabilityData.waterUsage.current < sustainabilityData.waterUsage.target}>
                      Target: {sustainabilityData.waterUsage.target} L/t cement
                    </SustainabilityTarget>
                  </EcoMetricCard>
                  <EcoMetricCard status="good" ecoStatus="good">
                    <SustainabilityIcon>♻️</SustainabilityIcon>
                    <MetricName>Water Recycling</MetricName>
                    <MetricValue>
                      {sustainabilityData.waterUsage.recyclingRate}
                      <MetricUnit>%</MetricUnit>
                    </MetricValue>
                    <SustainabilityTarget achieved={sustainabilityData.waterUsage.recyclingRate > 60}>
                      Target: 70%
                    </SustainabilityTarget>
                  </EcoMetricCard>
                </MetricsGrid>
              </WaterManagementCard>
            </GridContainer>

            {/* Environmental KPIs */}
            <Card>
              <CardTitle>🌿 Environmental Performance Indicators</CardTitle>
              <MetricsGrid>
                {getEnvironmentalKPIs().map((kpi, index) => (
                  <EcoMetricCard key={index} status={kpi.status} ecoStatus={kpi.status}>
                    <SustainabilityIcon>{kpi.icon}</SustainabilityIcon>
                    <MetricName>{kpi.name}</MetricName>
                    <MetricValue>
                      {kpi.current}
                      <MetricUnit>{kpi.unit}</MetricUnit>
                    </MetricValue>
                    <SustainabilityTarget achieved={kpi.current <= kpi.target || (kpi.name.includes('Quality') && kpi.current >= kpi.target)}>
                      Target: {kpi.target} {kpi.unit}
                    </SustainabilityTarget>
                  </EcoMetricCard>
                ))}
              </MetricsGrid>
            </Card>

            {/* Sustainability Charts */}
            <GridContainer>
              <Card>
                <CardTitle>📈 Sustainability Trends</CardTitle>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={getSustainabilityTrends()}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis dataKey="month" stroke="#9ca3af" />
                    <YAxis stroke="#9ca3af" />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#1f2937', 
                        border: '1px solid #374151',
                        borderRadius: '8px'
                      }} 
                    />
                    <Legend />
                    <Area type="monotone" dataKey="energyEfficiency" stackId="1" stroke="#f59e0b" fill="rgba(245, 158, 11, 0.3)" name="Energy Efficiency %" />
                    <Area type="monotone" dataKey="wasteRecycling" stackId="2" stroke="#10b981" fill="rgba(16, 185, 129, 0.3)" name="Waste Recycling %" />
                  </AreaChart>
                </ResponsiveContainer>
              </Card>

              <Card>
                <CardTitle>🔋 Energy Source Distribution</CardTitle>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={getEnergyBreakdown()}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ source, percentage }) => `${source} ${percentage}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="percentage"
                    >
                      {getEnergyBreakdown().map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </Card>

              <Card>
                <CardTitle>🌬️ Emission Monitoring</CardTitle>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={getCarbonEmissionData()}>
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
                    <Line type="monotone" dataKey="co2" stroke="#ef4444" strokeWidth={2} name="CO₂ (kg/h)" />
                    <Line type="monotone" dataKey="nox" stroke="#f59e0b" strokeWidth={2} name="NOx (mg/Nm³)" />
                    <Line type="monotone" dataKey="so2" stroke="#3b82f6" strokeWidth={2} name="SO₂ (mg/Nm³)" />
                  </LineChart>
                </ResponsiveContainer>
              </Card>

              <Card>
                <CardTitle>💧 Water Management Trends</CardTitle>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={getWaterManagementData()}>
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
                    <Bar dataKey="consumption" fill="#3b82f6" name="Consumption (L)" />
                    <Bar dataKey="recycled" fill="#10b981" name="Recycled (L)" />
                    <Bar dataKey="discharged" fill="#f59e0b" name="Discharged (L)" />
                  </BarChart>
                </ResponsiveContainer>
              </Card>
            </GridContainer>
          </>
        )}

        {/* AI Insights Tab */}
        {activeTab === 'insights' && (
          <>
            <GridContainer>
              <InsightCard>
                <CardTitle>🧠 AI-Powered Sustainability Insights</CardTitle>
                <RecommendationsList>
                  <RecommendationItem priority="high">
                    <RecommendationTitle>🎯 Carbon Reduction Opportunity</RecommendationTitle>
                    <RecommendationDescription>
                      AI analysis suggests switching to alternative fuels during off-peak hours could reduce CO₂ emissions by 8-12%. 
                      Optimal implementation window: 2:00 AM - 6:00 AM daily.
                    </RecommendationDescription>
                    <PriorityBadge priority="high">High Impact</PriorityBadge>
                  </RecommendationItem>
                  
                  <RecommendationItem priority="medium">
                    <RecommendationTitle>💧 Water Optimization Strategy</RecommendationTitle>
                    <RecommendationDescription>
                      Predictive models indicate 15% water savings potential through improved cooling tower efficiency and 
                      enhanced recycling loop optimization.
                    </RecommendationDescription>
                    <PriorityBadge priority="medium">Medium Impact</PriorityBadge>
                  </RecommendationItem>
                  
                  <RecommendationItem priority="low">
                    <RecommendationTitle>⚡ Energy Efficiency Enhancement</RecommendationTitle>
                    <RecommendationDescription>
                      Machine learning algorithms detect potential 5% energy savings through optimized mill operation 
                      scheduling and improved load balancing.
                    </RecommendationDescription>
                    <PriorityBadge priority="low">Long-term Benefit</PriorityBadge>
                  </RecommendationItem>
                </RecommendationsList>
              </InsightCard>

              <Card>
                <CardTitle>📊 Predictive Analytics</CardTitle>
                <MetricsGrid>
                  <MetricCard status="excellent">
                    <MetricName>Sustainability Score Forecast</MetricName>
                    <MetricValue>
                      85<MetricUnit>%</MetricUnit>
                    </MetricValue>
                    <MetricTarget>Projected for next quarter</MetricTarget>
                  </MetricCard>
                  <MetricCard status="good">
                    <MetricName>Carbon Reduction Potential</MetricName>
                    <MetricValue>
                      12.5<MetricUnit>%</MetricUnit>
                    </MetricValue>
                    <MetricTarget>Within 6 months</MetricTarget>
                  </MetricCard>
                  <MetricCard status="good">
                    <MetricName>Energy Savings Opportunity</MetricName>
                    <MetricValue>
                      ₹2.3M<MetricUnit>/year</MetricUnit>
                    </MetricValue>
                    <MetricTarget>Cost savings potential</MetricTarget>
                  </MetricCard>
                </MetricsGrid>
              </Card>
            </GridContainer>

            {/* Environmental Alerts */}
            <Card>
              <CardTitle>🚨 Environmental Alerts & Compliance</CardTitle>
              <AlertsContainer>
                <EnvironmentalAlert severity="medium">
                  <AlertTitle>Dust Emission Threshold Approaching</AlertTitle>
                  <AlertDescription>
                    Current particulate matter levels at 15 mg/m³, approaching regulatory limit of 20 mg/m³. 
                    Baghouse filter efficiency may need optimization.
                  </AlertDescription>
                  <AlertMeta>
                    <span>Stack Monitoring Station</span>
                    <span>{new Date().toLocaleString()}</span>
                  </AlertMeta>
                </EnvironmentalAlert>
                
                <AlertItem severity="low">
                  <AlertTitle>Water Recycling Efficiency Opportunity</AlertTitle>
                  <AlertDescription>
                    Current recycling rate at 68%. Implementing advanced filtration could increase to 75% target.
                  </AlertDescription>
                  <AlertMeta>
                    <span>Water Treatment Plant</span>
                    <span>{new Date().toLocaleString()}</span>
                  </AlertMeta>
                </AlertItem>
                
                <AlertItem severity="high">
                  <AlertTitle>Renewable Energy Integration Ready</AlertTitle>
                  <AlertDescription>
                    Solar panel installation completed. Ready to increase renewable energy percentage from 23.5% to 30%.
                  </AlertDescription>
                  <AlertMeta>
                    <span>Energy Management System</span>
                    <span>{new Date().toLocaleString()}</span>
                  </AlertMeta>
                </AlertItem>
              </AlertsContainer>
            </Card>
          </>
        )}
      </ContentContainer>
    </DashboardContainer>
  );
};

export default Dashboard;
