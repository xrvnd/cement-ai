# Cement Plant Digital Twin with AI Integration

A comprehensive digital twin platform for cement plant operations featuring AI-powered optimization, real-time monitoring, and intelligent process control.

## 🏭 Features

### Core Capabilities
- **Digital Twin Visualization**: Interactive 3D representation of cement plant operations
- **Real-time Monitoring**: Live sensor data visualization and analysis
- **AI-Powered Optimization**: Advanced process optimization using Google Gemini AI
- **Predictive Analytics**: Equipment health monitoring and failure prediction

### New AI-Enhanced Features
- **PlantGPT**: RAG-based AI assistant for cement plant operations
- **Agentic AI Workflows**: Specialized AI agents for different plant operations
- **Comprehensive Dashboard**: Key performance indicators and focus areas
- **Advanced Analytics**: Energy efficiency, quality control, and sustainability metrics

## 🚀 Quick Start

### Prerequisites
- **Python 3.8+** with pip
- **Node.js 16+** with npm
- **Google Gemini API Key** (for AI features)

### One-Command Startup
```bash
./start_fullstack.sh
```

This will automatically:
1. Set up Python virtual environment
2. Install all dependencies
3. Generate sample data
4. Start backend server (port 8000)
5. Start frontend server (port 3000)

### Manual Setup

#### Backend Setup
```bash
cd backend
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt

# Configure environment
cp env_example.txt .env
# Edit .env with your API keys

# Generate sample data
python3 generate_data.py

# Start backend
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

#### Frontend Setup
```bash
# In project root
npm install
npm start
```

## 🌐 Application Access

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **API Documentation**: http://localhost:8000/docs

## 📱 Application Pages

### 🏭 Main View
- Interactive 3D cement plant visualization
- Real-time sensor monitoring
- Process control interface
- Equipment status display

### 🤖 PlantGPT
- AI-powered chat assistant
- RAG-based knowledge retrieval
- Cement plant operations expertise
- Contextual recommendations

### 📊 Dashboard
- Key performance indicators
- Focus areas management
- Real-time alerts
- Performance analytics

## 🎯 Key Focus Areas

The dashboard provides comprehensive monitoring and optimization for:

### 1. Reduce Specific Power Consumption
- **Raw Mill Power**: Target <16 kWh/ton
- **Cement Mill Power**: Target <30 kWh/ton
- **Kiln System Power**: Target <55 kWh/ton clinker

### 2. Improve Fuel Efficiency
- **Specific Heat Consumption**: Target <3.0 GJ/ton clinker
- **Thermal Substitution Rate**: Target >35%
- **Kiln Thermal Efficiency**: Target >72%

### 3. Ensure Consistent Quality
- **Blaine Fineness Control**: Reduce variability to <8 m²/kg std dev
- **28-day Strength**: Target <2.0 MPa std dev
- **Free Lime Content**: Target <1.2%

### 4. Increase Productivity
- **Kiln Production Rate**: Target >155 ton/hour
- **Mill Throughput**: Target >15 ton/hour
- **Overall Equipment Effectiveness**: Target >85%

### 5. Enhance Operational Stability
- **Process Variability Index**: Target <0.10
- **Equipment Availability**: Target >95%
- **Control Loop Performance**: Target >90%

### 6. Maximize Alternate Fuels
- **RDF Utilization**: Target >20%
- **Biomass Utilization**: Target >12%
- **Total TSR**: Target >35%

## 🤖 AI Agent Capabilities

### Specialized Agents
- **Kiln Optimizer**: Temperature profile optimization, fuel efficiency
- **Mill Optimizer**: Grinding efficiency, power consumption reduction
- **Quality Controller**: Blaine control, strength prediction, quality assurance
- **Fuel Optimizer**: Alternate fuel mix optimization, TSR maximization
- **Maintenance Planner**: Predictive maintenance, equipment reliability

### Agent Features
- **Agentic Workflows**: Autonomous task execution
- **Multi-agent Coordination**: Collaborative optimization
- **Real-time Decision Making**: Continuous process improvement
- **Knowledge Integration**: RAG-enhanced decision support

## 📊 Data Management

### Generated Data Files
The system includes comprehensive Excel datasets:

1. **raw_grinding_operations.xlsx**
   - Raw material grinding data
   - Cement grinding parameters
   - Mill performance metrics

2. **clinkerization_data.xlsx**
   - Kiln operations data
   - Clinker quality parameters
   - Emission monitoring

3. **quality_control_data.xlsx**
   - Cement quality tests
   - Control parameters
   - Process capability metrics

4. **alternate_fuel_tsr_data.xlsx**
   - Fuel consumption data
   - TSR optimization metrics
   - Fuel quality analysis

5. **energy_efficiency_data.xlsx**
   - Power consumption data
   - Efficiency metrics
   - Energy optimization

6. **maintenance_reliability_data.xlsx**
   - Maintenance metrics
   - Condition monitoring
   - Equipment reliability

## 🔧 API Endpoints

### Gemini AI Integration
- `POST /api/v1/gemini/generate` - General AI responses
- `POST /api/v1/gemini/analyze/kiln` - Kiln analysis
- `POST /api/v1/gemini/analyze/mill` - Mill analysis
- `POST /api/v1/gemini/optimize` - Process optimization

### PlantGPT RAG System
- `POST /api/v1/plantgpt/chat` - Chat with PlantGPT
- `GET /api/v1/plantgpt/conversations/{id}/history` - Conversation history
- `POST /api/v1/plantgpt/knowledge/search` - Knowledge base search

### Dashboard Analytics
- `GET /api/v1/dashboard/` - Complete dashboard data
- `GET /api/v1/dashboard/focus-areas` - Key focus areas
- `GET /api/v1/dashboard/alerts` - Real-time alerts
- `GET /api/v1/dashboard/performance-summary` - Performance metrics

### AI Agents
- `POST /api/v1/agents/tasks` - Create agent task
- `POST /api/v1/agents/tasks/{id}/execute` - Execute task
- `POST /api/v1/agents/kiln/optimize` - Kiln optimization
- `POST /api/v1/agents/mill/optimize` - Mill optimization

## 🏗️ Architecture

### Backend (Python FastAPI)
- **FastAPI**: Modern, fast web framework
- **Google Gemini AI**: Advanced language model integration
- **LangChain**: Agent framework and RAG implementation
- **ChromaDB**: Vector database for knowledge storage
- **SQLAlchemy**: Database ORM
- **Pandas**: Data processing and analysis

### Frontend (React TypeScript)
- **React 18**: Modern UI framework
- **TypeScript**: Type-safe development
- **Styled Components**: CSS-in-JS styling
- **Three.js**: 3D visualization
- **Recharts**: Data visualization
- **Axios**: HTTP client

### AI Integration
- **Google Gemini 2.0 Flash**: Primary language model
- **RAG System**: Retrieval-Augmented Generation
- **Agent Framework**: Multi-agent orchestration
- **Vector Search**: Semantic knowledge retrieval

## 🔒 Security & Configuration

### Environment Variables
```bash
GEMINI_API_KEY=your_gemini_api_key_here
GOOGLE_CLOUD_PROJECT_ID=your_project_id
CORS_ORIGINS=http://localhost:3000,http://localhost:3001
PORT=8000
ENVIRONMENT=development
```

### Security Features
- CORS protection
- API key management
- Request timeout handling
- Error handling and logging

## 🚀 Deployment

### Development
```bash
./start_fullstack.sh
```

### Production
1. Set environment variables
2. Configure production database
3. Set up reverse proxy (nginx)
4. Use production WSGI server (gunicorn)
5. Configure SSL certificates

### Docker Deployment (Optional)
```bash
# Build and run with Docker Compose
docker-compose up --build
```

## 📈 Performance Optimization

### Backend Optimizations
- Async/await for concurrent operations
- Connection pooling
- Caching strategies
- Background task processing

### Frontend Optimizations
- Code splitting
- Lazy loading
- Memoization
- Virtual scrolling for large datasets

## 🧪 Testing

### Backend Testing
```bash
cd backend
pytest tests/
```

### Frontend Testing
```bash
npm test
```

## 📚 Documentation

- **API Documentation**: Available at `/docs` when backend is running
- **Component Documentation**: React component library
- **Agent Documentation**: AI agent capabilities and usage

## 🤝 Contributing

1. Fork the repository
2. Create feature branch
3. Implement changes
4. Add tests
5. Submit pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:
- Check the API documentation at `/docs`
- Review the generated sample data
- Ensure all environment variables are configured
- Check backend logs for debugging

## 🔄 Updates & Migration

### From Previous Version
The application has been significantly enhanced with:
- Python backend replacing direct Gemini API calls
- Agentic AI workflows
- RAG-based PlantGPT system
- Comprehensive dashboard
- Advanced analytics and monitoring

### Migration Steps
1. Install Python dependencies
2. Configure environment variables
3. Generate new data files
4. Update frontend to use new backend endpoints
5. Test all new features

---

**Built with ❤️ for the cement industry**
