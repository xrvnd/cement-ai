import React from 'react';
import styled from 'styled-components';
import { usePlant } from '../context/PlantContext';
import { theme } from '../styles/theme';

const TopBarContainer = styled.div<{ isFullScreen: boolean }>`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: ${theme.spacing[4]} ${theme.spacing[6]};
  background: linear-gradient(135deg, ${theme.colors.background.secondary}f0 0%, ${theme.colors.background.tertiary}f0 100%);
  border-bottom: 2px solid ${theme.colors.border.accent};
  backdrop-filter: blur(20px);
  height: 80px;
  opacity: ${props => props.isFullScreen ? '0' : '1'};
  transform: ${props => props.isFullScreen ? 'translateY(-100%)' : 'translateY(0)'};
  transition: all ${theme.animation.duration.normal} ${theme.animation.easing.default};
  position: ${props => props.isFullScreen ? 'absolute' : 'relative'};
  box-shadow: ${theme.shadows.lg};
  z-index: ${theme.zIndex.sticky};
  
  /* Professional gradient border effect */
  &::before {
    content: '';
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    height: 2px;
    background: linear-gradient(90deg, 
      ${theme.colors.primary[500]} 0%, 
      ${theme.colors.secondary[500]} 50%, 
      ${theme.colors.primary[500]} 100%
    );
    opacity: 0.8;
  }
`;

const Brand = styled.div`
  display: flex;
  align-items: center;
  gap: ${theme.spacing[4]};
  
  @media (max-width: ${theme.breakpoints.md}) {
    gap: ${theme.spacing[2]};
  }
`;

const BrandLogo = styled.div`
  font-size: ${theme.typography.fontSize.xl};
  font-weight: ${theme.typography.fontWeight.bold};
  font-family: ${theme.typography.fontFamily.display};
  background: linear-gradient(135deg, ${theme.colors.primary[400]} 0%, ${theme.colors.primary[600]} 50%, ${theme.colors.secondary[500]} 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  text-shadow: 0 2px 4px ${theme.colors.primary[500]}40;
  
  @media (max-width: ${theme.breakpoints.md}) {
    font-size: ${theme.typography.fontSize.lg};
  }
`;

const BrandSubtitle = styled.div`
  color: ${theme.colors.text.secondary};
  font-size: ${theme.typography.fontSize.sm};
  font-weight: ${theme.typography.fontWeight.medium};
  
  @media (max-width: ${theme.breakpoints.md}) {
    display: none;
  }
`;

const NavigationContainer = styled.div`
  display: flex;
  align-items: center;
  gap: ${theme.spacing[4]};
  
  @media (max-width: ${theme.breakpoints.lg}) {
    gap: ${theme.spacing[2]};
  }
`;

const NavButton = styled.button<{ active?: boolean }>`
  background: ${props => props.active 
    ? `linear-gradient(135deg, ${theme.colors.primary[500]} 0%, ${theme.colors.primary[600]} 100%)`
    : 'transparent'
  };
  border: 2px solid ${props => props.active ? theme.colors.primary[500] : theme.colors.border.secondary};
  border-radius: ${theme.borderRadius.lg};
  padding: ${theme.spacing[3]} ${theme.spacing[5]};
  color: ${props => props.active ? theme.colors.text.primary : theme.colors.text.secondary};
  font-size: ${theme.typography.fontSize.sm};
  font-weight: ${theme.typography.fontWeight.semibold};
  font-family: ${theme.typography.fontFamily.primary};
  cursor: pointer;
  transition: all ${theme.animation.duration.normal} ${theme.animation.easing.default};
  position: relative;
  overflow: hidden;
  
  /* Glass morphism effect */
  backdrop-filter: blur(10px);
  
  &:hover {
    border-color: ${theme.colors.primary[400]};
    color: ${theme.colors.text.primary};
    transform: translateY(-2px);
    box-shadow: ${theme.shadows.glow};
    background: ${props => props.active 
      ? `linear-gradient(135deg, ${theme.colors.primary[400]} 0%, ${theme.colors.primary[500]} 100%)`
      : `${theme.colors.primary[500]}20`
    };
  }
  
  &:active {
    transform: translateY(0);
  }
  
  /* Animated background on hover */
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, ${theme.colors.primary[400]}30, transparent);
    transition: left ${theme.animation.duration.slow} ${theme.animation.easing.default};
  }
  
  &:hover::before {
    left: 100%;
  }
  
  @media (max-width: ${theme.breakpoints.md}) {
    padding: ${theme.spacing[3]} ${theme.spacing[4]};
    font-size: ${theme.typography.fontSize.sm};
    min-height: 44px;
  }
  
  @media (max-width: ${theme.breakpoints.sm}) {
    padding: ${theme.spacing[2]} ${theme.spacing[3]};
    font-size: ${theme.typography.fontSize.xs};
    min-height: 40px;
  }
`;

const PlantSelector = styled.select`
  background: ${theme.colors.primary[500]}15;
  border: 2px solid ${theme.colors.border.accent};
  border-radius: ${theme.borderRadius.md};
  color: ${theme.colors.primary[400]};
  padding: ${theme.spacing[2]} ${theme.spacing[3]};
  font-size: ${theme.typography.fontSize.sm};
  font-weight: ${theme.typography.fontWeight.medium};
  cursor: pointer;
  transition: all ${theme.animation.duration.normal} ${theme.animation.easing.default};
  backdrop-filter: blur(10px);

  &:hover {
    background: ${theme.colors.primary[500]}25;
    border-color: ${theme.colors.primary[400]};
    transform: translateY(-1px);
  }

  &:focus {
    outline: none;
    border-color: ${theme.colors.primary[500]};
    box-shadow: 0 0 0 3px ${theme.colors.primary[500]}30;
  }

  option {
    background: ${theme.colors.background.tertiary};
    color: ${theme.colors.text.primary};
    padding: ${theme.spacing[2]};
  }
  
  @media (max-width: ${theme.breakpoints.md}) {
    padding: ${theme.spacing[1]} ${theme.spacing[2]};
    font-size: ${theme.typography.fontSize.xs};
  }
`;

const StatusInfo = styled.div`
  display: flex;
  align-items: center;
  gap: ${theme.spacing[5]};
  font-size: ${theme.typography.fontSize.sm};
  
  @media (max-width: ${theme.breakpoints.lg}) {
    gap: ${theme.spacing[3]};
  }
  
  @media (max-width: ${theme.breakpoints.md}) {
    display: none;
  }
`;

const StatusItem = styled.div`
  display: flex;
  align-items: center;
  gap: ${theme.spacing[2]};
  color: ${theme.colors.text.secondary};
  font-weight: ${theme.typography.fontWeight.medium};
  padding: ${theme.spacing[2]} ${theme.spacing[3]};
  background: ${theme.colors.background.tertiary}40;
  border-radius: ${theme.borderRadius.md};
  border: 1px solid ${theme.colors.border.primary};
  backdrop-filter: blur(10px);
  transition: all ${theme.animation.duration.normal} ${theme.animation.easing.default};
  
  &:hover {
    background: ${theme.colors.background.tertiary}60;
    transform: translateY(-1px);
    box-shadow: ${theme.shadows.md};
  }
  
  span:first-child {
    font-size: ${theme.typography.fontSize.base};
  }
`;

type PageType = 'main' | 'plantgpt' | 'dashboard' | 'cvanalysis';

interface TopBarProps {
  currentTime: Date;
  currentTemp: number;
  isFullScreen?: boolean;
  currentPage?: PageType;
  onPageChange?: (page: PageType) => void;
}

const TopBar: React.FC<TopBarProps> = ({ 
  currentTime, 
  currentTemp, 
  isFullScreen = false, 
  currentPage = 'main',
  onPageChange 
}) => {
  const { selectedPlant, setSelectedPlant, plantOptions } = usePlant();

  return (
    <TopBarContainer isFullScreen={isFullScreen}>
      <Brand>
        <BrandLogo>🏭 JK Cement Plant</BrandLogo>
        <PlantSelector 
          value={selectedPlant} 
          onChange={(e) => setSelectedPlant(e.target.value as any)}
        >
          {plantOptions.map(plant => (
            <option key={plant.id} value={plant.id}>
              {plant.location}
            </option>
          ))}
        </PlantSelector>
      </Brand>
      
      <NavigationContainer>
        <NavButton 
          active={currentPage === 'main'}
          onClick={() => onPageChange?.('main')}
        >
          🏭 Main View
        </NavButton>
        <NavButton 
          active={currentPage === 'plantgpt'}
          onClick={() => onPageChange?.('plantgpt')}
        >
          🤖 PlantGPT
        </NavButton>
        <NavButton 
          active={currentPage === 'dashboard'}
          onClick={() => onPageChange?.('dashboard')}
        >
          📊 Dashboard
        </NavButton>
        <NavButton 
          active={currentPage === 'cvanalysis'}
          onClick={() => onPageChange?.('cvanalysis')}
        >
          🔍 CV Analysis
        </NavButton>
      </NavigationContainer>
      
      <StatusInfo>
        <StatusItem>
          <span>🌡️</span>
          <span>{currentTemp}°C</span>
        </StatusItem>
        <StatusItem>
          <span>🕐</span>
          <span>{currentTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</span>
        </StatusItem>
        <StatusItem>
          <span>📅</span>
          <span>{currentTime.toLocaleDateString('en-US', { year: 'numeric', month: '2-digit', day: '2-digit', weekday: 'long' })}</span>
        </StatusItem>
      </StatusInfo>
    </TopBarContainer>
  );
};

export default TopBar;
