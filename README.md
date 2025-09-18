# 🏭 Cement Plant Digital Twin - AI-Enhanced Monitoring Platform

A comprehensive React TypeScript application that provides a sophisticated digital twin interface for cement plant monitoring, featuring real-time 3D visualization, AI-powered optimization, and Excel-based simulation data.

## 🚀 Features

### 🎯 Core Functionality
- **Real-time 3D Visualization**: Enhanced Three.js-based cement plant model with detailed components
- **AI Integration**: Gemini AI-powered process optimization and alert system
- **Excel Data Simulation**: 24-hour simulation data from Excel files for realistic process modeling
- **Interactive Controls**: Parameter input for emission testing and process optimization
- **Professional UI**: Dark-themed, industrial-grade interface with comprehensive data panels

### 🔥 Enhanced 3D Features
- **Heat Animations**: Dynamic heat wave effects around the kiln
- **Gas Emissions**: Animated particle systems for emission visualization
- **Mill Process**: Grinding particle animations and material flow
- **Sensor Integration**: Pulsing sensor indicators with real-time data
- **Material Flow**: Animated connections between plant components

### 🤖 AI-Powered Features
- **Burning Zone Alerts**: Automatic AI consultation when temperature exceeds 1600°C
- **Process Optimization**: AI recommendations for efficiency improvement
- **Emission Analysis**: Intelligent analysis of CO₂, NOx, and SO₂ emissions
- **Predictive Insights**: AI-driven maintenance and quality predictions

### 📊 Data Management
- **Excel Integration**: Real-time data loading from CSV/Excel files
- **24-Hour Simulation**: Complete day cycle with realistic parameter variations
- **Historical Tracking**: Sensor data history and trend analysis
- **Real-time Updates**: Live data synchronization across all components

## 🛠️ Technology Stack

- **Frontend**: React 18 + TypeScript
- **3D Graphics**: Three.js with enhanced materials and animations
- **Styling**: Styled-components with dark theme
- **AI Integration**: Google Gemini API
- **Data Processing**: XLSX library for Excel file handling
- **HTTP Client**: Axios for API communications
- **Charts**: Recharts for data visualization

## 📁 Project Structure

```
cement-plant-digital-twin/
├── public/
│   └── index.html
├── src/
│   ├── components/
│   │   ├── TopBar.tsx              # Header with time/temperature
│   │   ├── LeftPanel.tsx           # Raw materials & process data
│   │   ├── CenterArea.tsx          # 3D visualization & simulation
│   │   ├── RightPanel.tsx          # Performance metrics
│   │   ├── BottomNav.tsx           # Navigation menu
│   │   ├── Enhanced3DScene.tsx     # Advanced 3D scene
│   │   └── SimulationMode.tsx      # Parameter testing interface
│   ├── context/
│   │   ├── DataContext.tsx         # Excel data management
│   │   └── GeminiContext.tsx       # AI integration
│   ├── data/
│   │   ├── kiln_simulation_data.xlsx    # 24-hour kiln data
│   │   └── mill_simulation_data.xlsx    # 24-hour mill data
│   ├── App.tsx                     # Main application component
│   └── index.tsx                   # Application entry point
├── package.json
├── tsconfig.json
└── README.md
```

## 🚀 Installation & Setup

### Prerequisites
- Node.js 16+ 
- npm or yarn

### Installation Steps

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd cement-plant-digital-twin
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm start
   ```

4. **Open your browser**
   Navigate to `http://localhost:3000`

## 📊 Excel Data Structure

### Kiln Simulation Data (`kiln_simulation_data.xlsx`)
Contains 24-hour data with 15-minute intervals:
- **Time**: Timestamp for each reading
- **Preheater_Temp**: Preheater zone temperature (°C)
- **Calciner_Temp**: Precalciner zone temperature (°C)
- **Kiln_Inlet_Temp**: Kiln inlet temperature (°C)
- **Burning_Zone_Temp**: Burning zone temperature (°C)
- **Cooler_Temp**: Clinker cooler temperature (°C)
- **Kiln_Vibration**: Rotary kiln vibration (mm/s)
- **Motor_Load**: Kiln drive motor load (%)
- **NOx_Emission**: Nitrogen oxide emissions (mg/Nm³)
- **Fuel_Rate**: Fuel consumption rate (t/h)
- **Production_Rate**: Clinker production rate (t/h)
- **CO2_Emission**: Carbon dioxide emissions (kg/t)
- **SO2_Emission**: Sulfur dioxide emissions (mg/Nm³)

### Mill Simulation Data (`mill_simulation_data.xlsx`)
Contains grinding process parameters:
- **Time**: Timestamp for each reading
- **Mill1_Feed_Rate**: Cement mill #1 feed rate (t/h)
- **Mill1_Pressure**: Mill #1 grinding pressure (bar)
- **Mill1_Particle_Size**: Particle size distribution (µm)
- **Mill1_Efficiency**: Grinding efficiency (%)
- **Mill2_Feed_Rate**: Cement mill #2 feed rate (t/h)
- **Mill2_Pressure**: Mill #2 grinding pressure (bar)
- **Mill2_Particle_Size**: Particle size distribution (µm)
- **Mill2_Efficiency**: Grinding efficiency (%)
- **Power_Consumption**: Total power consumption (kW)
- **Grinding_Media_Wear**: Media wear rate (mm/h)
- **Product_Quality**: Cement quality index (%)

## 🤖 AI Integration

### Gemini API Configuration
The application uses Google's Gemini 2.0 Flash model for AI-powered insights:

```typescript
const GEMINI_API_KEY = 'your_gemini_api_key_here';
```

### AI Features
1. **Burning Zone Alert**: Automatically triggers when temperature > 1600°C
2. **Process Optimization**: Analyzes sensor data for efficiency improvements
3. **Emission Analysis**: Provides recommendations for emission reduction
4. **Predictive Maintenance**: Suggests maintenance schedules based on trends

### API Endpoint
```bash
curl "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent" \
  -H 'Content-Type: application/json' \
  -H 'X-goog-api-key: YOUR_API_KEY' \
  -X POST \
  -d '{
    "contents": [
      {
        "parts": [
          {
            "text": "Your prompt here"
          }
        ]
      }
    ]
  }'
```

## 🎮 Usage Guide

### Process Animation Mode
- **3D Navigation**: Use mouse to rotate, zoom, and pan around the plant
- **Sensor Interaction**: Hover over sensors for detailed information
- **Real-time Data**: Watch live sensor updates and animations
- **Component Labels**: View detailed process descriptions

### Simulation Mode
- **Parameter Input**: Adjust kiln temperatures, fuel rates, and other parameters
- **Emission Calculation**: Test different scenarios and view emission results
- **AI Optimization**: Get intelligent recommendations for process improvement
- **Data Export**: View calculated emissions and efficiency metrics

### Data Panels
- **Left Panel**: Raw material composition and quality metrics
- **Right Panel**: Process stability and performance indicators
- **Bottom Navigation**: Access different plant monitoring sections

## 🔧 Customization

### Adding New Sensors
1. Update `sensorData` in `DataContext.tsx`
2. Add 3D sensor mesh in `Enhanced3DScene.tsx`
3. Update Excel data files with new parameters

### Modifying 3D Models
1. Edit geometry creation in `Enhanced3DScene.tsx`
2. Adjust materials and animations
3. Update component positions and scales

### AI Prompts
1. Modify prompts in `GeminiContext.tsx`
2. Add new AI functions for specific use cases
3. Customize response parsing and display

## 📈 Performance Optimization

- **3D Rendering**: Optimized Three.js scene with efficient geometries
- **Data Loading**: Lazy loading of Excel data with caching
- **AI Calls**: Debounced API calls to prevent rate limiting
- **Memory Management**: Proper cleanup of 3D resources and event listeners

## 🔒 Security Considerations

- **API Key Protection**: Store API keys in environment variables
- **Data Validation**: Validate all user inputs and Excel data
- **Error Handling**: Comprehensive error handling for API failures
- **CORS Configuration**: Proper CORS setup for production deployment

## 🚀 Deployment

### Production Build
```bash
npm run build
```

### Environment Variables
Create `.env` file:
```
REACT_APP_GEMINI_API_KEY=your_api_key_here
REACT_APP_DATA_URL=your_data_endpoint
```

### Docker Deployment
```dockerfile
FROM node:16-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Contact the development team
- Check the documentation

## 🔄 Updates & Changes

### Recent Updates (2024)
- ✅ **Major Security Fixes**: Resolved 6/10 security vulnerabilities (nth-check, postcss, etc.)
- ✅ **TypeScript Conflict Resolution**: Fixed TypeScript 5.x vs react-scripts compatibility
- ✅ **Dependency Optimization**: Updated all packages to latest compatible versions
- ✅ **Performance Optimizations**: Refactored DataContext with utility functions, added request cancellation
- ✅ **Memory Leak Fixes**: Implemented proper cleanup and optimized re-renders
- ✅ **Code Quality Improvements**: Separated concerns, removed duplicate code, enhanced error handling
- ✅ **TypeScript Modernization**: Updated to TypeScript 4.9.5 with modern configuration
- ✅ **Compilation Fixes**: Resolved all TypeScript and ESLint errors
- ✅ **Security Overrides**: Added package overrides for vulnerable dependencies
- ✅ Converted from HTML to React TypeScript
- ✅ Added Gemini AI integration
- ✅ Enhanced 3D models with animations
- ✅ Created Excel-based simulation data
- ✅ Implemented simulation mode with parameter testing
- ✅ Added comprehensive sensor monitoring
- ✅ Enhanced UI with dark theme and professional styling

### Future Enhancements
- 🔄 Real-time data streaming from actual plant sensors
- 🔄 Advanced machine learning models for predictive analytics
- 🔄 Mobile-responsive design
- 🔄 Multi-plant monitoring capabilities
- 🔄 Advanced reporting and analytics dashboard
