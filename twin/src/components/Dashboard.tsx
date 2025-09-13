import React from 'react';
import styled from 'styled-components';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';
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




type PageType = 'main' | 'plantgpt' | 'dashboard' | 'cvanalysis';

interface DashboardProps {
  onNavigate?: (page: PageType) => void;
  currentTime?: Date;
  currentTemp?: number;
}

const Dashboard: React.FC<DashboardProps> = React.memo(({ onNavigate, currentTime = new Date(), currentTemp = 21 }) => {
  const { currentPlantData } = usePlant();

  // Use plant context data directly instead of API calls
  const dashboardData = currentPlantData;


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
      </ContentContainer>
    </DashboardContainer>
  );
});

Dashboard.displayName = 'Dashboard';

export default Dashboard;
