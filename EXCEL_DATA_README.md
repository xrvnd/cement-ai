# 📊 Excel Data Integration for Cement Plant Digital Twin Dashboard

## 🎯 Overview

This comprehensive Excel data system provides **realistic, time-series data** for the cement plant digital twin dashboard demo. The system generates **16,308+ data points** across multiple operational categories with proper timestamps and realistic variations.

## 📁 Generated Excel Files

### 📍 Location: `public/data/dashboard_demo/`

| File | Description | Frequency | Data Points | Size |
|------|-------------|-----------|-------------|------|
| `sustainability_metrics.xlsx` | Environmental KPIs & sustainability scores | Hourly | 721 | 152KB |
| `production_operational.xlsx` | Production metrics & equipment performance | 30 minutes | 1,441 | 216KB |
| `environmental_monitoring.xlsx` | Air quality, emissions, weather data | 15 minutes | 2,881 | 472KB |
| `energy_consumption.xlsx` | Power usage, renewable energy, costs | Hourly | 721 | 112KB |
| `water_management.xlsx` | Water usage, recycling, quality metrics | Hourly | 721 | 124KB |
| `temperature_monitoring.xlsx` | Equipment temperatures across plant | 5 minutes | 8,641 | 1.3MB |
| `quality_control.xlsx` | Cement quality parameters & testing | 2 hours | 361 | 72KB |
| `maintenance_reliability.xlsx` | Equipment health & maintenance data | Hourly | 721 | 132KB |
| `alerts_events.xlsx` | Historical alerts & system events | Event-based | 100 | 12KB |
| `realtime_dashboard_summary.xlsx` | Current status summary | Real-time | 1 | 8KB |

**Total Data Points: 16,308**  
**Total Size: ~2.6MB**

## 🔧 Technical Implementation

### 📊 Data Generation Script
```bash
python3 generate_dashboard_data.py
```

**Features:**
- ✅ **Realistic Variations**: Uses statistical models for authentic data patterns
- ✅ **Time-based Patterns**: Simulates daily, shift, and operational cycles
- ✅ **Trend Analysis**: Includes improvement trends and seasonal variations
- ✅ **Proper Timestamps**: 30-day historical data with current timestamps
- ✅ **Industrial Standards**: Based on real cement plant operational parameters

### 🛠️ Integration Components

#### 1. **Excel Data Loader** (`src/utils/excelDataLoader.ts`)
```typescript
import { excelDataLoader } from '../utils/excelDataLoader';

// Load sustainability metrics
const sustainabilityData = await excelDataLoader.getSustainabilityMetrics(100);

// Get real-time chart data
const chartData = await excelDataLoader.getRealtimeChartData('temperature', 24);
```

#### 2. **React Hooks** (`src/hooks/useExcelData.ts`)
```typescript
import { useExcelData, useTemperatureData } from '../hooks/useExcelData';

// In your component
const { data, loading, refresh } = useExcelData({
  refreshInterval: 30000, // 30 seconds
  autoRefresh: true
});

// Temperature-specific hook
const { temperatureData } = useTemperatureData(5000); // 5 seconds
```

## 📈 Data Categories & Parameters

### 🌱 **Sustainability Metrics**
- **Overall Sustainability Score**: 78/100 (with realistic variations)
- **Carbon Footprint**: 0.82 t CO₂/t cement (trending down)
- **Energy Efficiency**: 85.4% (improving trend)
- **Water Usage**: 245 L/t cement (optimization target: 220)
- **Renewable Energy**: 23.5% (target: 30%)
- **Waste Recycling**: 92% (target: 95%)
- **Environmental KPIs**: Air quality, noise, dust emissions

### ⚙️ **Production & Operations**
- **Clinker Production**: 2,800 tons/day (varies by shift)
- **Cement Production**: 3,200 tons/day
- **Plant Utilization**: 87% (shift-dependent)
- **Equipment Effectiveness**: 82%
- **Mill Throughput**: 120 tons/hour
- **Fuel Consumption**: 12.5 tons/hour
- **Quality Compliance**: 98.5%

### 🌍 **Environmental Monitoring**
- **CO₂ Emissions**: 820 kg/hour (weather-influenced)
- **NOx Emissions**: 45 mg/Nm³ (regulatory limit: 500)
- **Particulate Matter**: 8 mg/m³ (limit: 20)
- **Stack Temperature**: 180°C
- **Ambient Conditions**: Temperature, humidity, wind
- **Weather Data**: Real-time meteorological parameters

### ⚡ **Energy Management**
- **Total Power**: 28.5 MW (peak/off-peak variations)
- **Kiln Power**: 12.5 MW
- **Mill Power**: 8.2 MW
- **Solar Generation**: 2.5 MW (daylight hours)
- **Wind Generation**: 1.8 MW
- **Power Factor**: 0.92
- **Energy Costs**: ₹85/MWh

### 💧 **Water Management**
- **Total Consumption**: 45 m³/hour
- **Process Water**: 28 m³/hour
- **Cooling Water**: 12 m³/hour
- **Recycled Water**: 18 m³/hour (68% recycling rate)
- **Water Quality**: pH, conductivity, suspended solids
- **Discharge Quality**: 95% compliance

### 🌡️ **Temperature Monitoring**
- **Preheater**: 1,250°C (optimal: 1200-1300°C)
- **Calciner**: 1,850°C (optimal: 1800-1900°C)
- **Burning Zone**: 1,450°C (optimal: 1400-1500°C)
- **Cooler**: 180°C (optimal: 150-200°C)
- **Mill Temperatures**: Inlet/outlet monitoring
- **Ambient**: 25°C (daily cycle simulation)

### 🔬 **Quality Control**
- **Blaine Fineness**: 3,200 cm²/g
- **Compressive Strength**: 25/35/45 MPa (3/7/28 days)
- **Setting Time**: 120/180 minutes (initial/final)
- **Chemical Composition**: SO₃, chlorides, alkalis
- **Free Lime**: 1.2%

### 🔧 **Maintenance & Reliability**
- **Equipment Vibration**: Kiln, mill, fan monitoring
- **Motor Currents**: Load monitoring
- **Bearing Temperatures**: Thermal monitoring
- **Oil Pressures**: Lubrication system health
- **Availability**: 96% (target: 98%)
- **MTBF**: 720 hours

### 🚨 **Alerts & Events**
- **Alert Types**: Temperature, vibration, emission, quality
- **Severity Levels**: Low, medium, high, critical
- **Locations**: 8 plant areas
- **Status Tracking**: Active, acknowledged, resolved
- **Resolution Times**: 15-480 minutes

## 🎯 Demo Usage Examples

### 1. **Dashboard Integration**
```typescript
// In Dashboard component
const { data, loading } = useExcelData();

if (loading) return <LoadingSpinner />;

return (
  <SustainabilityCard>
    <SustainabilityScore score={data.sustainability.overallScore} />
    <MetricValue>{data.sustainability.carbonFootprint.current}</MetricValue>
  </SustainabilityCard>
);
```

### 2. **Real-time Charts**
```typescript
// Temperature trends
const { temperatureData } = useTemperatureData();

<LineChart data={temperatureData}>
  <Line dataKey="burning_zone_temperature_celsius" stroke="#ef4444" />
  <Line dataKey="preheater_temperature_celsius" stroke="#f97316" />
</LineChart>
```

### 3. **Sustainability Trends**
```typescript
// Sustainability dashboard
const { getSustainabilityTrends } = useExcelData();

useEffect(() => {
  getSustainabilityTrends().then(setTrendData);
}, []);
```

## 🚀 Benefits for Demo

### ✅ **Realistic Data Patterns**
- **Daily Cycles**: Production varies by shift (day/night)
- **Weather Influence**: Environmental data affected by conditions
- **Operational Trends**: Gradual improvements over time
- **Equipment Behavior**: Realistic variations and correlations

### ✅ **Comprehensive Coverage**
- **10 Data Categories**: Complete plant monitoring
- **Multiple Frequencies**: From 5-minute to daily data
- **30-Day History**: Sufficient for trend analysis
- **Real-time Simulation**: Live dashboard updates

### ✅ **Professional Quality**
- **Industry Standards**: Based on real cement plant parameters
- **Proper Timestamps**: Accurate time-series data
- **Statistical Accuracy**: Realistic variations and distributions
- **Scalable Architecture**: Easy to extend and modify

## 🔄 Data Refresh & Updates

### **Automatic Refresh**
- **Dashboard**: 30-second intervals
- **Temperature**: 5-second updates
- **Charts**: Real-time data streaming
- **Alerts**: Immediate notifications

### **Manual Refresh**
```typescript
const { refresh } = useExcelData();

// Trigger manual refresh
refresh();
```

## 📊 Performance Optimization

### **Efficient Loading**
- **Parallel Requests**: Multiple files loaded simultaneously
- **Data Caching**: Reduced server requests
- **Selective Loading**: Load only required data ranges
- **Compression**: Optimized file sizes

### **Memory Management**
- **Data Limits**: Configurable data point limits
- **Cleanup**: Automatic old data removal
- **Lazy Loading**: Load data on demand

## 🎉 Ready for Demo!

The Excel data system provides a **professional-grade foundation** for showcasing the cement plant digital twin dashboard with:

- ✅ **16,308+ realistic data points**
- ✅ **10 comprehensive data categories**
- ✅ **Real-time simulation capabilities**
- ✅ **Professional industrial parameters**
- ✅ **Easy integration with React components**
- ✅ **Scalable and maintainable architecture**

**Perfect for demonstrating the full capabilities of the sustainability-enhanced dashboard!** 🌟
