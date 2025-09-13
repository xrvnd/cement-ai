import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import Enhanced3DScene from './Enhanced3DScene';
import { useData } from '../context/DataContext';
import { useGemini } from '../context/GeminiContext';

const CenterContainer = styled.div<{ isFullScreen: boolean }>`
  display: flex;
  flex-direction: column;
  height: 100%;
  flex: 1;
  background: linear-gradient(135deg, rgba(26, 31, 58, 0.95) 0%, rgba(44, 62, 80, 0.9) 100%);
  border-radius: ${props => props.isFullScreen ? '0' : '12px'};
  overflow: hidden;
  box-shadow: ${props => props.isFullScreen ? 'none' : '0 8px 32px rgba(0, 0, 0, 0.3)'};
  border: ${props => props.isFullScreen ? 'none' : '1px solid rgba(116, 185, 255, 0.2)'};
  transition: all 0.3s ease;
  width: ${props => props.isFullScreen ? '100vw' : 'auto'};
  min-height: ${props => props.isFullScreen ? '100vh' : 'auto'};
`;

const CenterHeader = styled.div<{ isFullScreen: boolean }>`
  padding: ${props => props.isFullScreen ? '15px 40px' : '20px 28px'};
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: ${props => props.isFullScreen ? '3px solid rgba(116, 185, 255, 0.4)' : '2px solid rgba(116, 185, 255, 0.3)'};
  background: linear-gradient(90deg, rgba(116, 185, 255, 0.05) 0%, rgba(116, 185, 255, 0.02) 100%);
  backdrop-filter: blur(10px);
  transition: all 0.3s ease;
`;

const CenterTitle = styled.h2<{ isFullScreen: boolean }>`
  font-size: ${props => props.isFullScreen ? '28px' : '22px'};
  font-weight: 700;
  color: #74b9ff;
  margin: 0;
  text-shadow: 0 2px 4px rgba(116, 185, 255, 0.3);
  letter-spacing: 0.5px;
  transition: all 0.3s ease;
`;

const CenterControls = styled.div`
  display: flex;
  gap: 12px;
`;

const ControlButton = styled.button<{ active?: boolean }>`
  padding: 8px 16px;
  background: rgba(116, 185, 255, 0.1);
  border: 1px solid rgba(116, 185, 255, 0.3);
  border-radius: 6px;
  color: #74b9ff;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.3s ease;

  &:hover {
    background: rgba(116, 185, 255, 0.2);
    border-color: rgba(116, 185, 255, 0.5);
  }

  ${props => props.active && `
    background: rgba(116, 185, 255, 0.3);
    border-color: #74b9ff;
  `}
`;



const GeminiButton = styled(ControlButton)<{ disabled?: boolean }>`
  background: linear-gradient(135deg, #9b59b6 0%, #8e44ad 100%);
  color: #ffffff;
  border: 1px solid rgba(155, 89, 182, 0.5);
  font-weight: 600;

  &:hover {
    ${props => !props.disabled && `
      background: linear-gradient(135deg, #8e44ad 0%, #9b59b6 100%);
      transform: scale(1.05);
    `}
  }

  ${props => props.disabled && `
    opacity: 0.6;
    cursor: not-allowed;
    transform: none !important;
  `}
`;

const CanvasContainer = styled.div<{ isFullScreen: boolean }>`
  flex: 1;
  position: relative;
  background: linear-gradient(135deg, #0a0e27 0%, #1a1f3a 100%);
  border-radius: ${props => props.isFullScreen ? '0' : '0 0 12px 12px'};
  transition: all 0.3s ease;
  min-height: ${props => props.isFullScreen ? 'calc(100vh - 80px)' : 'auto'};
`;

// Analysis Modal Component
const AnalysisModal = styled.div<{ show: boolean }>`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.8);
  display: ${props => props.show ? 'flex' : 'none'};
  justify-content: center;
  align-items: center;
  z-index: 1000;
  padding: 20px;
`;

const ModalContent = styled.div`
  background: rgba(26, 31, 58, 0.95);
  border: 1px solid rgba(116, 185, 255, 0.3);
  border-radius: 12px;
  padding: 20px;
  max-width: 600px;
  width: 100%;
  max-height: 80vh;
  overflow-y: auto;
  backdrop-filter: blur(10px);
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  border-bottom: 1px solid rgba(116, 185, 255, 0.2);
  padding-bottom: 15px;
`;

const ModalTitle = styled.h3`
  color: #74b9ff;
  margin: 0;
  font-size: 20px;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  color: #8b9dc3;
  font-size: 24px;
  cursor: pointer;
  padding: 0;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: all 0.3s ease;

  &:hover {
    background: rgba(116, 185, 255, 0.1);
    color: #74b9ff;
  }
`;

const ModalBody = styled.div`
  color: #e8eaf6;
  font-family: 'Courier New', monospace;
  font-size: 14px;
  line-height: 1.6;
  white-space: pre-wrap;
  word-wrap: break-word;
`;

interface CenterAreaProps {
  isFullScreen: boolean;
}

const CenterArea: React.FC<CenterAreaProps> = React.memo(({ isFullScreen }) => {
  const [showAnalysisModal, setShowAnalysisModal] = useState(false);
  const [analysisContent, setAnalysisContent] = useState('');
  const [analysisTitle, setAnalysisTitle] = useState('');
  const [pendingAnalysis, setPendingAnalysis] = useState<string | null>(null);
  const { sensorData } = useData();
  const { analyzeKiln, analyzeMill, isLoading, aiResponse } = useGemini();

  // Handle AI response updates
  useEffect(() => {
    if (aiResponse && pendingAnalysis) {
      setAnalysisTitle(pendingAnalysis === 'kiln' ? 'Kiln Analysis' : 'Mill Analysis');
      setAnalysisContent(aiResponse.text);
      setShowAnalysisModal(true);
      setPendingAnalysis(null);
    }
  }, [aiResponse, pendingAnalysis]);



  const handleAnalyzeKiln = async () => {
    try {
      setPendingAnalysis('kiln');
      await analyzeKiln(sensorData);
    } catch (error) {
      // Error handling for kiln analysis
      setPendingAnalysis(null);
    }
  };

  const handleAnalyzeMill = async () => {
    try {
      setPendingAnalysis('mill');
      await analyzeMill(sensorData);
    } catch (error) {
      // Error handling for mill analysis
      setPendingAnalysis(null);
    }
  };

  const closeAnalysisModal = () => {
    setShowAnalysisModal(false);
    setAnalysisContent('');
    setAnalysisTitle('');
  };

  return (
    <CenterContainer isFullScreen={isFullScreen}>
      <CenterHeader isFullScreen={isFullScreen}>
        <CenterTitle isFullScreen={isFullScreen}>🏭 JK Cement Plant Digital Twin</CenterTitle>
        <CenterControls>
          <GeminiButton
            id="analyzeKilnBtn"
            onClick={handleAnalyzeKiln}
            disabled={isLoading}
          >
            {isLoading ? '🔄 Analyzing...' : '🔍 Analyze Kiln'}
          </GeminiButton>
          <GeminiButton
            id="analyzeMillBtn"
            onClick={handleAnalyzeMill}
            disabled={isLoading}
          >
            {isLoading ? '🔄 Analyzing...' : '🔍 Analyze Mill'}
          </GeminiButton>
        </CenterControls>
      </CenterHeader>

      <CanvasContainer isFullScreen={isFullScreen}>
        <Enhanced3DScene canvasId="mainCanvas" />
        {isFullScreen && (
          <div style={{
            position: 'absolute',
            top: '20px',
            right: '20px',
            background: 'rgba(116, 185, 255, 0.1)',
            border: '2px solid rgba(116, 185, 255, 0.3)',
            borderRadius: '8px',
            padding: '8px 12px',
            color: '#74b9ff',
            fontSize: '12px',
            fontWeight: 'bold',
            backdropFilter: 'blur(10px)',
            zIndex: 1000
          }}>
            ⛶ FULL-SCREEN MODE
          </div>
        )}
      </CanvasContainer>

      {/* Analysis Modal */}
      <AnalysisModal show={showAnalysisModal} onClick={closeAnalysisModal}>
        <ModalContent onClick={(e) => e.stopPropagation()}>
          <ModalHeader>
            <ModalTitle>{analysisTitle}</ModalTitle>
            <CloseButton onClick={closeAnalysisModal}>✖</CloseButton>
          </ModalHeader>
          <ModalBody>
            {analysisContent || 'Loading analysis...'}
          </ModalBody>
        </ModalContent>
      </AnalysisModal>
    </CenterContainer>
  );
});

CenterArea.displayName = 'CenterArea';

export default CenterArea;
