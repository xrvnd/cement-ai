import React, { useState, useEffect, useCallback } from 'react';
import styled, { ThemeProvider } from 'styled-components';
import TopBar from './components/TopBar';
import LeftPanel from './components/LeftPanel';
import CenterArea from './components/CenterArea';
import RightPanel from './components/RightPanel';
import Chatbot from './components/Chatbot';
import PlantGPT from './components/PlantGPT';
import Dashboard from './components/Dashboard';
import CVAnalysis from './components/CVAnalysis';
import { DataProvider } from './context/DataContext';
import { GeminiProvider } from './context/GeminiContext';
import { PlantProvider } from './context/PlantContext';
import { GlobalStyles } from './styles/GlobalStyles';
import { theme } from './styles/theme';

const AppContainer = styled.div`
  min-height: 100vh;
  background: linear-gradient(135deg, ${theme.colors.background.primary} 0%, ${theme.colors.neutral[900]} 30%, ${theme.colors.background.secondary} 100%);
  color: ${theme.colors.text.primary};
  font-family: ${theme.typography.fontFamily.primary};
  overflow: hidden;
  position: relative;
  
  /* Add subtle texture overlay */
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-image: 
      radial-gradient(circle at 25% 25%, ${theme.colors.primary[900]}20 0%, transparent 50%),
      radial-gradient(circle at 75% 75%, ${theme.colors.secondary[900]}15 0%, transparent 50%);
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
      linear-gradient(${theme.colors.primary[800]}10 1px, transparent 1px),
      linear-gradient(90deg, ${theme.colors.primary[800]}10 1px, transparent 1px);
    background-size: 50px 50px;
    pointer-events: none;
    z-index: 0;
  }
`;

const MainContainer = styled.div<{ isFullScreen: boolean }>`
  display: flex;
  height: ${props => props.isFullScreen ? '100vh' : 'calc(100vh - 80px)'};
  position: relative;
  transition: all ${theme.animation.duration.normal} ${theme.animation.easing.default};
  width: ${props => props.isFullScreen ? '100vw' : 'auto'};
  margin: ${props => props.isFullScreen ? '0' : 'auto'};
  z-index: 1;
`;

const FullScreenToggle = styled.button<{ isFullScreen: boolean }>`
  position: fixed;
  top: ${theme.spacing[5]};
  right: ${theme.spacing[5]};
  width: 56px;
  height: 56px;
  background: ${props => props.isFullScreen 
    ? `linear-gradient(135deg, ${theme.colors.error[500]} 0%, ${theme.colors.error[600]} 100%)` 
    : `linear-gradient(135deg, ${theme.colors.success[500]} 0%, ${theme.colors.success[600]} 100%)`
  };
  border: 2px solid ${props => props.isFullScreen ? theme.colors.error[400] : theme.colors.success[400]};
  border-radius: ${theme.borderRadius.xl};
  color: ${theme.colors.text.primary};
  font-size: ${theme.typography.fontSize.lg};
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all ${theme.animation.duration.normal} ${theme.animation.easing.default};
  z-index: ${theme.zIndex.modal};
  box-shadow: ${props => props.isFullScreen ? theme.shadows.glowError : theme.shadows.glowSuccess};
  backdrop-filter: blur(10px);

  &:hover {
    transform: translateY(-2px) scale(1.05);
    box-shadow: ${props => props.isFullScreen 
      ? `0 8px 32px ${theme.colors.error[500]}40, ${theme.shadows.glowError}` 
      : `0 8px 32px ${theme.colors.success[500]}40, ${theme.shadows.glowSuccess}`
    };
  }

  &:active {
    transform: translateY(0) scale(1.02);
  }

  &::before {
    content: '';
    position: absolute;
    top: -3px;
    left: -3px;
    right: -3px;
    bottom: -3px;
    background: ${props => props.isFullScreen 
      ? `linear-gradient(135deg, ${theme.colors.error[400]} 0%, ${theme.colors.error[500]} 100%)` 
      : `linear-gradient(135deg, ${theme.colors.success[400]} 0%, ${theme.colors.success[500]} 100%)`
    };
    border-radius: ${theme.borderRadius.xl};
    opacity: 0.2;
    z-index: -1;
    animation: ${props => props.isFullScreen ? 'pulse' : 'none'} 2s ${theme.animation.easing.default} infinite;
  }

  @keyframes pulse {
    0% { 
      transform: scale(1); 
      opacity: 0.2; 
    }
    50% { 
      transform: scale(1.1); 
      opacity: 0.1; 
    }
    100% { 
      transform: scale(1); 
      opacity: 0.2; 
    }
  }
`;

type PageType = 'main' | 'plantgpt' | 'dashboard' | 'cvanalysis';

const App: React.FC = () => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [currentTemp] = useState(21);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [currentPage, setCurrentPage] = useState<PageType>('main');

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const toggleFullScreen = useCallback(() => {
    setIsFullScreen(!isFullScreen);
  }, [isFullScreen]);

  // Add keyboard shortcut for full-screen mode
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'F11' || (event.ctrlKey && event.key === 'f')) {
        event.preventDefault();
        toggleFullScreen();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isFullScreen, toggleFullScreen]);

  const renderPage = () => {
    switch (currentPage) {
      case 'plantgpt':
        return <PlantGPT onNavigate={setCurrentPage} currentTime={currentTime} currentTemp={currentTemp} />;
      case 'dashboard':
        return <Dashboard onNavigate={setCurrentPage} currentTime={currentTime} currentTemp={currentTemp} />;
      case 'cvanalysis':
        return <CVAnalysis onNavigate={setCurrentPage} currentTime={currentTime} currentTemp={currentTemp} />;
      case 'main':
      default:
        return (
          <>
            <TopBar 
              currentTime={currentTime} 
              currentTemp={currentTemp} 
              isFullScreen={isFullScreen}
              currentPage={currentPage}
              onPageChange={setCurrentPage}
            />
            
            <FullScreenToggle 
              isFullScreen={isFullScreen} 
              onClick={toggleFullScreen}
              title={isFullScreen ? 'Exit full-screen mode (F11/Ctrl+F)' : 'Enter full-screen showcase mode (F11/Ctrl+F)'}
            >
              {isFullScreen ? '⛶' : '⛶'}
            </FullScreenToggle>

            <MainContainer isFullScreen={isFullScreen}>
              {!isFullScreen && <LeftPanel />}
              <CenterArea isFullScreen={isFullScreen} />
              {!isFullScreen && <RightPanel />}
            </MainContainer>
            <Chatbot />
          </>
        );
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <GlobalStyles />
      <DataProvider>
        <GeminiProvider>
          <PlantProvider>
            <AppContainer className="animate-fade-in">
              {renderPage()}
            </AppContainer>
          </PlantProvider>
        </GeminiProvider>
      </DataProvider>
    </ThemeProvider>
  );
};

export default App;
