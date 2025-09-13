import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import TopBar from './TopBar';

const CVAnalysisContainer = styled.div`
  min-height: 100vh;
  background: linear-gradient(135deg, #0f1419 0%, #1a1f2e 50%, #16213e 100%);
  color: #ffffff;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  display: flex;
  flex-direction: column;
`;

const ContentContainer = styled.div`
  flex: 1;
  padding: 20px;
  overflow-y: auto;
`;

const HeaderSection = styled.div`
  text-align: center;
  margin-bottom: 30px;
`;

const PageTitle = styled.h1`
  font-size: 2.5rem;
  font-weight: 700;
  background: linear-gradient(135deg, #3b82f6 0%, #10b981 50%, #f59e0b 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin-bottom: 10px;
`;

const PageSubtitle = styled.p`
  color: #9ca3af;
  font-size: 1.1rem;
  margin-bottom: 20px;
`;

const StatusBadge = styled.div<{ status: 'active' | 'processing' | 'idle' }>`
  display: inline-block;
  padding: 8px 16px;
  border-radius: 20px;
  font-size: 0.9rem;
  font-weight: 600;
  background: ${props => {
    switch (props.status) {
      case 'active': return '#10b981';
      case 'processing': return '#f59e0b';
      case 'idle': return '#6b7280';
      default: return '#6b7280';
    }
  }};
  color: #ffffff;
  box-shadow: 0 0 20px ${props => {
    switch (props.status) {
      case 'active': return '#10b98140';
      case 'processing': return '#f59e0b40';
      case 'idle': return '#6b728040';
      default: return '#6b728040';
    }
  }};
`;

const ImageAnalysisSection = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
  margin-bottom: 30px;
  
  @media (max-width: 1024px) {
    grid-template-columns: 1fr;
    gap: 20px;
  }
  
  @media (max-width: 768px) {
    gap: 16px;
    margin-bottom: 20px;
  }
  
  @media (max-width: 480px) {
    gap: 12px;
    margin-bottom: 16px;
  }
`;

const ImageCard = styled.div`
  background: linear-gradient(135deg, #1e293b 0%, #334155 100%);
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
  border: 1px solid #374151;
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 12px 40px rgba(0, 0, 0, 0.4);
    border-color: #3b82f6;
  }
  
  @media (max-width: 768px) {
    padding: 16px;
    border-radius: 12px;
    
    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 25px rgba(0, 0, 0, 0.3);
    }
  }
  
  @media (max-width: 480px) {
    padding: 12px;
    border-radius: 8px;
    
    &:hover {
      transform: translateY(-1px);
      box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
    }
  }
`;

const ImageTitle = styled.h3`
  margin: 0 0 20px 0;
  font-size: 1.4rem;
  font-weight: 600;
  color: #3b82f6;
  display: flex;
  align-items: center;
  gap: 10px;
`;

const ImageContainer = styled.div`
  position: relative;
  width: 100%;
  height: 400px;
  background: #0f172a;
  border-radius: 12px;
  overflow: hidden;
  border: 2px solid #374151;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const ImageDisplay = styled.img`
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
  border-radius: 8px;
`;

const PlaceholderImage = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: #6b7280;
  font-size: 1.1rem;
  text-align: center;
  
  .icon {
    font-size: 3rem;
    margin-bottom: 16px;
    opacity: 0.5;
  }
`;

const ImageControls = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 16px;
  gap: 12px;
`;

const ControlButton = styled.button<{ variant?: 'primary' | 'secondary' | 'danger' }>`
  background: ${props => {
    switch (props.variant) {
      case 'primary': return 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)';
      case 'danger': return 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)';
      default: return 'linear-gradient(135deg, #6b7280 0%, #4b5563 100%)';
    }
  }};
  border: none;
  border-radius: 8px;
  padding: 8px 16px;
  color: #ffffff;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
  }
`;

const TemperatureAnalysisSection = styled.div`
  background: linear-gradient(135deg, #1e293b 0%, #334155 100%);
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
  border: 1px solid #374151;
  margin-bottom: 30px;
`;

const TemperatureGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
  margin-bottom: 24px;
`;

const TemperatureCard = styled.div<{ status: 'normal' | 'warning' | 'critical' }>`
  background: linear-gradient(135deg, #374151 0%, #4b5563 100%);
  border-radius: 12px;
  padding: 16px;
  border-left: 4px solid ${props => {
    switch (props.status) {
      case 'normal': return '#10b981';
      case 'warning': return '#f59e0b';
      case 'critical': return '#ef4444';
      default: return '#6b7280';
    }
  }};
  text-align: center;
`;

const TemperatureValue = styled.div`
  font-size: 2rem;
  font-weight: 700;
  color: #ffffff;
  margin-bottom: 4px;
`;

const TemperatureLabel = styled.div`
  font-size: 0.9rem;
  color: #9ca3af;
  margin-bottom: 8px;
`;

const TemperatureStatus = styled.div<{ status: 'normal' | 'warning' | 'critical' }>`
  font-size: 0.8rem;
  font-weight: 600;
  text-transform: uppercase;
  color: ${props => {
    switch (props.status) {
      case 'normal': return '#10b981';
      case 'warning': return '#f59e0b';
      case 'critical': return '#ef4444';
      default: return '#6b7280';
    }
  }};
`;

const AnalysisResults = styled.div`
  background: linear-gradient(135deg, #1e293b 0%, #334155 100%);
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
  border: 1px solid #374151;
`;

const ResultsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const ResultItem = styled.div<{ severity: 'info' | 'warning' | 'critical' }>`
  background: linear-gradient(135deg, #374151 0%, #4b5563 100%);
  border-radius: 8px;
  padding: 16px;
  border-left: 4px solid ${props => {
    switch (props.severity) {
      case 'info': return '#3b82f6';
      case 'warning': return '#f59e0b';
      case 'critical': return '#ef4444';
      default: return '#6b7280';
    }
  }};
`;

const ResultTitle = styled.div`
  font-weight: 600;
  color: #ffffff;
  margin-bottom: 8px;
`;

const ResultDescription = styled.div`
  color: #9ca3af;
  font-size: 0.9rem;
  line-height: 1.5;
`;

const LoadingSpinner = styled.div`
  width: 40px;
  height: 40px;
  border: 3px solid #374151;
  border-top: 3px solid #3b82f6;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 20px auto;
  
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

type PageType = 'main' | 'plantgpt' | 'dashboard' | 'cvanalysis';

interface CVAnalysisProps {
  onNavigate?: (page: PageType) => void;
  currentTime?: Date;
  currentTemp?: number;
}

const CVAnalysis: React.FC<CVAnalysisProps> = React.memo(({ 
  onNavigate, 
  currentTime = new Date(), 
  currentTemp = 21 
}) => {
  const [analysisStatus, setAnalysisStatus] = useState<'active' | 'processing' | 'idle'>('idle');
  const [realTimeImage, setRealTimeImage] = useState<string | null>(null);
  const [thermalImage, setThermalImage] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [temperatureData, setTemperatureData] = useState({
    maxTemp: 0,
    avgTemp: 0,
    minTemp: 0,
    hotSpots: 0
  });
  const [analysisResults, setAnalysisResults] = useState<Array<{
    title: string;
    description: string;
    severity: 'info' | 'warning' | 'critical';
  }>>([]);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Simulate real-time image capture
  useEffect(() => {
    const interval = setInterval(() => {
      if (analysisStatus === 'active') {
        // Simulate capturing a new image
        generateSimulatedImage();
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [analysisStatus]);

  const generateSimulatedImage = () => {
    // Create a realistic kiln image with canvas
    const canvas = document.createElement('canvas');
    canvas.width = 400;
    canvas.height = 300;
    const ctx = canvas.getContext('2d');
    
    if (ctx) {
      // Draw industrial background
      ctx.fillStyle = '#1a1a1a';
      ctx.fillRect(0, 0, 400, 300);
      
      // Draw kiln structure with realistic proportions
      ctx.fillStyle = '#4a5568';
      ctx.fillRect(50, 50, 300, 200);
      
      // Add kiln shell details
      ctx.strokeStyle = '#718096';
      ctx.lineWidth = 2;
      ctx.strokeRect(50, 50, 300, 200);
      
      // Add kiln segments
      const segments = [
        { x: 50, width: 75, name: 'Feed' },
        { x: 125, width: 75, name: 'Preheater' },
        { x: 200, width: 75, name: 'Burning' },
        { x: 275, width: 75, name: 'Cooler' }
      ];
      
      segments.forEach(segment => {
        ctx.strokeStyle = '#a0aec0';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(segment.x, 50);
        ctx.lineTo(segment.x, 250);
        ctx.stroke();
        
        // Add segment labels
        ctx.fillStyle = '#ffffff';
        ctx.font = '10px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(segment.name, segment.x + segment.width/2, 40);
      });
      
      // Add grayscale heat glow effects
      const heatGradient = ctx.createRadialGradient(237, 150, 0, 237, 150, 60);
      heatGradient.addColorStop(0, 'rgba(255, 255, 255, 0.8)');
      heatGradient.addColorStop(0.5, 'rgba(192, 192, 192, 0.4)');
      heatGradient.addColorStop(1, 'transparent');
      ctx.fillStyle = heatGradient;
      ctx.fillRect(200, 100, 75, 100);
      
      // Add material flow indicators in grayscale
      ctx.fillStyle = '#808080';
      for (let i = 0; i < 5; i++) {
        ctx.fillRect(60 + i * 15, 60, 8, 3);
        ctx.fillRect(60 + i * 15, 240, 8, 3);
      }
      
      // Add temperature indicators in grayscale
      ctx.fillStyle = '#C0C0C0';
      ctx.font = '12px Arial';
      ctx.textAlign = 'left';
      ctx.fillText('🔥 1450°C', 210, 80);
      ctx.fillText('🌡️ 850°C', 130, 80);
      ctx.fillText('❄️ 200°C', 290, 80);
      
      setRealTimeImage(canvas.toDataURL());
      generateThermalImage();
    }
  };

  const generateThermalImage = () => {
    // Create a realistic thermal representation of a cement kiln
    const canvas = document.createElement('canvas');
    canvas.width = 400;
    canvas.height = 300;
    const ctx = canvas.getContext('2d');
    
    if (ctx) {
      // Clear background
      ctx.fillStyle = '#1a1a1a';
      ctx.fillRect(0, 0, 400, 300);
      
      // Draw kiln structure outline
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.strokeRect(50, 50, 300, 200);
      
      // Create realistic thermal zones for cement kiln
      const zones = [
        { x: 50, y: 50, width: 75, height: 200, temp: 45, name: 'Feed Zone' },
        { x: 125, y: 50, width: 75, height: 200, temp: 75, name: 'Preheater' },
        { x: 200, y: 50, width: 75, height: 200, temp: 95, name: 'Burning Zone' },
        { x: 275, y: 50, width: 75, height: 200, temp: 25, name: 'Cooler' }
      ];
      
      zones.forEach(zone => {
        // Create thermal gradient for each zone
        const gradient = ctx.createLinearGradient(zone.x, zone.y, zone.x + zone.width, zone.y);
        
        // Grayscale thermal intensity mapping
        if (zone.temp > 90) {
          // Hot zone - White to Light Gray
          gradient.addColorStop(0, '#ffffff');
          gradient.addColorStop(0.5, '#f0f0f0');
          gradient.addColorStop(1, '#e0e0e0');
        } else if (zone.temp > 70) {
          // Warm zone - Light Gray to Medium Gray
          gradient.addColorStop(0, '#e0e0e0');
          gradient.addColorStop(0.5, '#d0d0d0');
          gradient.addColorStop(1, '#c0c0c0');
        } else if (zone.temp > 50) {
          // Medium zone - Medium Gray
          gradient.addColorStop(0, '#c0c0c0');
          gradient.addColorStop(0.5, '#b0b0b0');
          gradient.addColorStop(1, '#a0a0a0');
        } else if (zone.temp > 30) {
          // Cool zone - Medium to Dark Gray
          gradient.addColorStop(0, '#a0a0a0');
          gradient.addColorStop(0.5, '#909090');
          gradient.addColorStop(1, '#808080');
        } else {
          // Cold zone - Dark Gray to Black
          gradient.addColorStop(0, '#808080');
          gradient.addColorStop(0.5, '#606060');
          gradient.addColorStop(1, '#404040');
        }
        
        ctx.fillStyle = gradient;
        ctx.fillRect(zone.x, zone.y, zone.width, zone.height);
        
        // Add zone labels
        ctx.fillStyle = '#ffffff';
        ctx.font = '12px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(zone.name, zone.x + zone.width/2, zone.y + zone.height/2);
        ctx.fillText(`${zone.temp}°C`, zone.x + zone.width/2, zone.y + zone.height/2 + 15);
      });
      
      // Add hot spots in burning zone
      const hotSpots = [
        { x: 220, y: 120, radius: 15, temp: 98 },
        { x: 240, y: 140, radius: 12, temp: 96 },
        { x: 210, y: 160, radius: 10, temp: 94 }
      ];
      
      hotSpots.forEach(spot => {
        const spotGradient = ctx.createRadialGradient(spot.x, spot.y, 0, spot.x, spot.y, spot.radius);
        spotGradient.addColorStop(0, '#ffffff');
        spotGradient.addColorStop(0.3, '#c0c0c0');
        spotGradient.addColorStop(1, 'transparent');
        
        ctx.fillStyle = spotGradient;
        ctx.beginPath();
        ctx.arc(spot.x, spot.y, spot.radius, 0, 2 * Math.PI);
        ctx.fill();
      });
      
      // Add grayscale temperature scale
      const scaleGradient = ctx.createLinearGradient(20, 50, 20, 250);
      scaleGradient.addColorStop(0, '#404040'); // Cold
      scaleGradient.addColorStop(0.2, '#606060');
      scaleGradient.addColorStop(0.4, '#808080');
      scaleGradient.addColorStop(0.6, '#a0a0a0');
      scaleGradient.addColorStop(0.8, '#c0c0c0');
      scaleGradient.addColorStop(1, '#ffffff'); // Hot
      
      ctx.fillStyle = scaleGradient;
      ctx.fillRect(20, 50, 15, 200);
      
      // Add scale labels
      ctx.fillStyle = '#ffffff';
      ctx.font = '10px Arial';
      ctx.textAlign = 'left';
      const scaleTemps = [20, 40, 60, 80, 100];
      scaleTemps.forEach((temp, i) => {
        ctx.fillText(`${temp}°C`, 40, 50 + i * 40);
      });
      
      setThermalImage(canvas.toDataURL());
      
      // Update temperature data with realistic values
      setTemperatureData({
        maxTemp: Math.round(95 + Math.random() * 5),
        avgTemp: Math.round(65 + Math.random() * 10),
        minTemp: Math.round(20 + Math.random() * 5),
        hotSpots: hotSpots.length
      });
    }
  };

  const startAnalysis = () => {
    setAnalysisStatus('active');
    generateSimulatedImage();
  };

  const stopAnalysis = () => {
    setAnalysisStatus('idle');
    setRealTimeImage(null);
    setThermalImage(null);
  };

  const captureImage = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const imageUrl = e.target?.result as string;
        setRealTimeImage(imageUrl);
        setAnalysisStatus('processing');
        setIsAnalyzing(true);
        
        // Simulate analysis processing
        setTimeout(() => {
          generateThermalImage();
          setIsAnalyzing(false);
          setAnalysisStatus('active');
          
          // Generate analysis results
          setAnalysisResults([
            {
              title: 'Temperature Analysis Complete',
              description: 'Thermal imaging analysis completed successfully. Detected normal operating temperatures with minor variations.',
              severity: 'info'
            },
            {
              title: 'Hot Spot Detection',
              description: `Identified ${temperatureData.hotSpots} potential hot spots in the kiln structure. Monitor these areas closely.`,
              severity: temperatureData.hotSpots > 2 ? 'warning' : 'info'
            },
            {
              title: 'Thermal Distribution',
              description: 'Temperature distribution appears normal with expected variations across the kiln surface.',
              severity: 'info'
            }
          ]);
        }, 3000);
      };
      reader.readAsDataURL(file);
    }
  };

  const getTemperatureStatus = (temp: number): 'normal' | 'warning' | 'critical' => {
    if (temp > 90) return 'critical';
    if (temp > 75) return 'warning';
    return 'normal';
  };

  return (
    <CVAnalysisContainer>
      <TopBar 
        currentTime={currentTime}
        currentTemp={currentTemp}
        currentPage="cvanalysis"
        onPageChange={onNavigate}
      />
      
      <ContentContainer>
        <HeaderSection>
          <PageTitle>🔍 Kiln Thermal Analysis</PageTitle>
          <PageSubtitle>
            Computer Vision Analysis for Real-time Kiln Monitoring and Temperature Detection
          </PageSubtitle>
          <StatusBadge status={analysisStatus}>
            {analysisStatus === 'active' && '🟢 Active Monitoring'}
            {analysisStatus === 'processing' && '🟡 Processing'}
            {analysisStatus === 'idle' && '⚪ Idle'}
          </StatusBadge>
        </HeaderSection>

        <ImageAnalysisSection>
          <ImageCard>
            <ImageTitle>
              📷 Real-time Kiln Image
            </ImageTitle>
            <ImageContainer>
              {realTimeImage ? (
                <ImageDisplay src={realTimeImage} alt="Real-time Kiln" />
              ) : (
                <PlaceholderImage>
                  <div className="icon">📷</div>
                  <div>No image captured</div>
                  <div style={{ fontSize: '0.9rem', marginTop: '8px' }}>
                    Click "Capture Image" to start analysis
                  </div>
                </PlaceholderImage>
              )}
            </ImageContainer>
            <ImageControls>
              <ControlButton 
                variant="primary" 
                onClick={captureImage}
                disabled={isAnalyzing}
              >
                📷 Capture Image
              </ControlButton>
              <ControlButton 
                variant="secondary" 
                onClick={startAnalysis}
                disabled={analysisStatus === 'active' || isAnalyzing}
              >
                ▶️ Start Live Analysis
              </ControlButton>
              <ControlButton 
                variant="danger" 
                onClick={stopAnalysis}
                disabled={analysisStatus === 'idle'}
              >
                ⏹️ Stop Analysis
              </ControlButton>
            </ImageControls>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileUpload}
              style={{ display: 'none' }}
            />
          </ImageCard>

          <ImageCard>
            <ImageTitle>
              🌡️ Thermal Image Analysis
            </ImageTitle>
            <ImageContainer>
              {isAnalyzing ? (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <LoadingSpinner />
                  <div style={{ color: '#9ca3af', marginTop: '16px' }}>
                    Analyzing thermal data...
                  </div>
                </div>
              ) : thermalImage ? (
                <ImageDisplay src={thermalImage} alt="Thermal Analysis" />
              ) : (
                <PlaceholderImage>
                  <div className="icon">🌡️</div>
                  <div>No thermal data</div>
                  <div style={{ fontSize: '0.9rem', marginTop: '8px' }}>
                    Thermal analysis will appear here
                  </div>
                </PlaceholderImage>
              )}
            </ImageContainer>
            <ImageControls>
              <ControlButton variant="secondary" disabled>
                📊 Export Data
              </ControlButton>
              <ControlButton variant="secondary" disabled>
                📈 View History
              </ControlButton>
            </ImageControls>
          </ImageCard>
        </ImageAnalysisSection>

        <TemperatureAnalysisSection>
          <h3 style={{ margin: '0 0 20px 0', fontSize: '1.4rem', fontWeight: '600', color: '#3b82f6' }}>
            🌡️ Temperature Analysis
          </h3>
          <TemperatureGrid>
            <TemperatureCard status={getTemperatureStatus(temperatureData.maxTemp)}>
              <TemperatureValue>{temperatureData.maxTemp}°C</TemperatureValue>
              <TemperatureLabel>Maximum Temperature</TemperatureLabel>
              <TemperatureStatus status={getTemperatureStatus(temperatureData.maxTemp)}>
                {getTemperatureStatus(temperatureData.maxTemp)}
              </TemperatureStatus>
            </TemperatureCard>
            <TemperatureCard status={getTemperatureStatus(temperatureData.avgTemp)}>
              <TemperatureValue>{temperatureData.avgTemp}°C</TemperatureValue>
              <TemperatureLabel>Average Temperature</TemperatureLabel>
              <TemperatureStatus status={getTemperatureStatus(temperatureData.avgTemp)}>
                {getTemperatureStatus(temperatureData.avgTemp)}
              </TemperatureStatus>
            </TemperatureCard>
            <TemperatureCard status="normal">
              <TemperatureValue>{temperatureData.minTemp}°C</TemperatureValue>
              <TemperatureLabel>Minimum Temperature</TemperatureLabel>
              <TemperatureStatus status="normal">normal</TemperatureStatus>
            </TemperatureCard>
            <TemperatureCard status={temperatureData.hotSpots > 2 ? 'warning' : 'normal'}>
              <TemperatureValue>{temperatureData.hotSpots}</TemperatureValue>
              <TemperatureLabel>Hot Spots Detected</TemperatureLabel>
              <TemperatureStatus status={temperatureData.hotSpots > 2 ? 'warning' : 'normal'}>
                {temperatureData.hotSpots > 2 ? 'warning' : 'normal'}
              </TemperatureStatus>
            </TemperatureCard>
          </TemperatureGrid>
        </TemperatureAnalysisSection>

        <AnalysisResults>
          <h3 style={{ margin: '0 0 20px 0', fontSize: '1.4rem', fontWeight: '600', color: '#3b82f6' }}>
            📋 Analysis Results
          </h3>
          <ResultsList>
            {analysisResults.length > 0 ? (
              analysisResults.map((result, index) => (
                <ResultItem key={index} severity={result.severity}>
                  <ResultTitle>{result.title}</ResultTitle>
                  <ResultDescription>{result.description}</ResultDescription>
                </ResultItem>
              ))
            ) : (
              <ResultItem severity="info">
                <ResultTitle>Ready for Analysis</ResultTitle>
                <ResultDescription>
                  Upload an image or start live analysis to begin thermal monitoring of the kiln.
                </ResultDescription>
              </ResultItem>
            )}
          </ResultsList>
        </AnalysisResults>
      </ContentContainer>
    </CVAnalysisContainer>
  );
});

CVAnalysis.displayName = 'CVAnalysis';

export default CVAnalysis;
