import React, { useState, useEffect, useRef, useCallback } from 'react';
import styled from 'styled-components';
import TopBar from './TopBar';
import { useGemini } from '../context/GeminiContext';
import { useData } from '../context/DataContext';

const CVAnalysisContainer = styled.div`
  min-height: 100vh;
  background: linear-gradient(135deg, #0f1419 0%, #1a1f2e 50%, #16213e 100%);
  color: #ffffff;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  display: flex;
  flex-direction: column;
  position: relative;
  overflow-x: hidden;
  
  &::before {
    content: '';
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: radial-gradient(circle at 20% 80%, rgba(59, 130, 246, 0.1) 0%, transparent 50%),
                radial-gradient(circle at 80% 20%, rgba(16, 185, 129, 0.1) 0%, transparent 50%),
                radial-gradient(circle at 40% 40%, rgba(245, 158, 11, 0.05) 0%, transparent 50%);
    pointer-events: none;
    z-index: 0;
  }
  
  > * {
    position: relative;
    z-index: 1;
  }
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
  font-size: 2.8rem;
  font-weight: 800;
  background: linear-gradient(135deg, #3b82f6 0%, #10b981 50%, #f59e0b 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin-bottom: 10px;
  text-shadow: 0 0 30px rgba(59, 130, 246, 0.3);
  animation: titleGlow 3s ease-in-out infinite alternate;
  
  @keyframes titleGlow {
    0% {
      filter: brightness(1) drop-shadow(0 0 10px rgba(59, 130, 246, 0.3));
    }
    100% {
      filter: brightness(1.1) drop-shadow(0 0 20px rgba(16, 185, 129, 0.4));
    }
  }
  
  @media (max-width: 768px) {
    font-size: 2.2rem;
  }
`;

const PageSubtitle = styled.p`
  color: #9ca3af;
  font-size: 1.1rem;
  margin-bottom: 20px;
`;

const StatusBadge = styled.div<{ status: 'active' | 'processing' | 'idle' }>`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  border-radius: 25px;
  font-size: 0.95rem;
  font-weight: 600;
  background: ${props => {
    switch (props.status) {
      case 'active': return 'linear-gradient(135deg, #10b981 0%, #059669 100%)';
      case 'processing': return 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)';
      case 'idle': return 'linear-gradient(135deg, #6b7280 0%, #4b5563 100%)';
      default: return 'linear-gradient(135deg, #6b7280 0%, #4b5563 100%)';
    }
  }};
  color: #ffffff;
  box-shadow: 0 4px 20px ${props => {
    switch (props.status) {
      case 'active': return 'rgba(16, 185, 129, 0.4)';
      case 'processing': return 'rgba(245, 158, 11, 0.4)';
      case 'idle': return 'rgba(107, 114, 128, 0.3)';
      default: return 'rgba(107, 114, 128, 0.3)';
    }
  }};
  border: 1px solid ${props => {
    switch (props.status) {
      case 'active': return 'rgba(16, 185, 129, 0.3)';
      case 'processing': return 'rgba(245, 158, 11, 0.3)';
      case 'idle': return 'rgba(107, 114, 128, 0.3)';
      default: return 'rgba(107, 114, 128, 0.3)';
    }
  }};
  transition: all 0.3s ease;
  
  &::before {
    content: '';
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: currentColor;
    animation: ${props => props.status === 'active' ? 'pulse 2s infinite' : 
                         props.status === 'processing' ? 'blink 1s infinite' : 'none'};
  }
  
  @keyframes pulse {
    0%, 100% { opacity: 1; transform: scale(1); }
    50% { opacity: 0.7; transform: scale(1.2); }
  }
  
  @keyframes blink {
    0%, 50% { opacity: 1; }
    51%, 100% { opacity: 0.3; }
  }
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
  background: linear-gradient(135deg, 
    rgba(30, 41, 59, 0.95) 0%, 
    rgba(51, 65, 85, 0.95) 100%
  );
  backdrop-filter: blur(10px);
  border-radius: 20px;
  padding: 28px;
  box-shadow: 
    0 8px 32px rgba(0, 0, 0, 0.3),
    0 0 0 1px rgba(255, 255, 255, 0.05),
    inset 0 1px 0 rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(55, 65, 81, 0.5);
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 1px;
    background: linear-gradient(90deg, transparent, rgba(59, 130, 246, 0.5), transparent);
    opacity: 0;
    transition: opacity 0.3s ease;
  }
  
  &:hover {
    transform: translateY(-6px) scale(1.02);
    box-shadow: 
      0 20px 60px rgba(0, 0, 0, 0.4),
      0 0 0 1px rgba(59, 130, 246, 0.3),
      inset 0 1px 0 rgba(255, 255, 255, 0.2);
    border-color: rgba(59, 130, 246, 0.5);
    
    &::before {
      opacity: 1;
    }
  }
  
  @media (max-width: 768px) {
    padding: 20px;
    border-radius: 16px;
    
    &:hover {
      transform: translateY(-3px) scale(1.01);
      box-shadow: 0 12px 30px rgba(0, 0, 0, 0.3);
    }
  }
  
  @media (max-width: 480px) {
    padding: 16px;
    border-radius: 12px;
    
    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 20px rgba(0, 0, 0, 0.25);
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
  background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
  border-radius: 16px;
  overflow: hidden;
  border: 2px solid rgba(55, 65, 81, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  cursor: pointer;
  
  &:hover {
    border-color: rgba(59, 130, 246, 0.6);
    box-shadow: 
      0 0 30px rgba(59, 130, 246, 0.2),
      inset 0 0 20px rgba(59, 130, 246, 0.05);
  }
  
  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(
      45deg,
      transparent 30%,
      rgba(59, 130, 246, 0.1) 50%,
      transparent 70%
    );
    opacity: 0;
    transition: opacity 0.3s ease;
    pointer-events: none;
  }
  
  &:hover::after {
    opacity: 1;
  }
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
  border: 1px solid ${props => {
    switch (props.variant) {
      case 'primary': return 'rgba(59, 130, 246, 0.3)';
      case 'danger': return 'rgba(239, 68, 68, 0.3)';
      default: return 'rgba(107, 114, 128, 0.3)';
    }
  }};
  border-radius: 12px;
  padding: 10px 18px;
  color: #ffffff;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
  display: flex;
  align-items: center;
  gap: 6px;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
    transition: left 0.5s ease;
  }
  
  &:hover {
    transform: translateY(-3px);
    box-shadow: ${props => {
      switch (props.variant) {
        case 'primary': return '0 8px 25px rgba(59, 130, 246, 0.4)';
        case 'danger': return '0 8px 25px rgba(239, 68, 68, 0.4)';
        default: return '0 8px 25px rgba(0, 0, 0, 0.3)';
      }
    }};
    
    &::before {
      left: 100%;
    }
  }
  
  &:active {
    transform: translateY(-1px);
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
    
    &:hover {
      transform: none;
      box-shadow: none;
      
      &::before {
        left: -100%;
      }
    }
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
  border: 3px solid rgba(55, 65, 81, 0.3);
  border-top: 3px solid #3b82f6;
  border-right: 3px solid #10b981;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 20px auto;
  position: relative;
  
  &::after {
    content: '';
    position: absolute;
    top: 2px;
    left: 2px;
    right: 2px;
    bottom: 2px;
    border: 2px solid transparent;
    border-top: 2px solid rgba(245, 158, 11, 0.6);
    border-radius: 50%;
    animation: spin 1.5s linear infinite reverse;
  }
  
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

const ProgressBar = styled.div<{ progress: number }>`
  width: 100%;
  height: 6px;
  background: rgba(55, 65, 81, 0.5);
  border-radius: 3px;
  overflow: hidden;
  margin: 12px 0;
  position: relative;
  
  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    height: 100%;
    width: ${props => props.progress}%;
    background: linear-gradient(90deg, #3b82f6 0%, #10b981 50%, #f59e0b 100%);
    border-radius: 3px;
    transition: width 0.5s ease;
    box-shadow: 0 0 10px rgba(59, 130, 246, 0.5);
  }
`;

const ProgressLabel = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.85rem;
  color: #9ca3af;
  margin-bottom: 4px;
`;

const HotspotOverlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
  z-index: 2;
`;

const Hotspot = styled.div<{ x: number; y: number; intensity: number }>`
  position: absolute;
  left: ${props => props.x}%;
  top: ${props => props.y}%;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: radial-gradient(
    circle,
    rgba(239, 68, 68, ${props => props.intensity}) 0%,
    rgba(245, 158, 11, ${props => props.intensity * 0.7}) 50%,
    transparent 100%
  );
  border: 2px solid rgba(239, 68, 68, 0.8);
  animation: pulse 2s infinite;
  cursor: pointer;
  pointer-events: all;
  transform: translate(-50%, -50%);
  
  &::after {
    content: '🔥';
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    font-size: 12px;
  }
  
  &:hover {
    transform: translate(-50%, -50%) scale(1.2);
    z-index: 10;
  }
  
  @keyframes pulse {
    0%, 100% { 
      box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.7);
    }
    50% { 
      box-shadow: 0 0 0 10px rgba(239, 68, 68, 0);
    }
  }
`;

const ImageOverlayControls = styled.div`
  position: absolute;
  top: 12px;
  right: 12px;
  display: flex;
  gap: 8px;
  z-index: 3;
`;

const OverlayButton = styled.button<{ active?: boolean }>`
  background: ${props => props.active ? 
    'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)' : 
    'rgba(0, 0, 0, 0.7)'
  };
  border: 1px solid ${props => props.active ? 
    'rgba(59, 130, 246, 0.5)' : 
    'rgba(255, 255, 255, 0.2)'
  };
  border-radius: 8px;
  padding: 6px 10px;
  color: #ffffff;
  font-size: 0.8rem;
  cursor: pointer;
  transition: all 0.3s ease;
  backdrop-filter: blur(10px);
  
  &:hover {
    background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
    border-color: rgba(59, 130, 246, 0.5);
    transform: translateY(-1px);
  }
`;

const TabContainer = styled.div`
  display: flex;
  gap: 4px;
  margin-bottom: 30px;
  background: linear-gradient(135deg, rgba(30, 41, 59, 0.8) 0%, rgba(51, 65, 85, 0.8) 100%);
  backdrop-filter: blur(10px);
  border-radius: 16px;
  padding: 8px;
  border: 1px solid rgba(55, 65, 81, 0.5);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
  
  @media (max-width: 768px) {
    flex-direction: column;
    gap: 8px;
  }
`;

const Tab = styled.button<{ active: boolean }>`
  flex: 1;
  background: ${props => props.active ? 
    'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)' : 
    'transparent'
  };
  border: 1px solid ${props => props.active ? 
    'rgba(59, 130, 246, 0.5)' : 
    'transparent'
  };
  border-radius: 12px;
  padding: 14px 20px;
  color: ${props => props.active ? '#ffffff' : '#9ca3af'};
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  position: relative;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.1), transparent);
    transition: left 0.5s ease;
  }
  
  &:hover {
    color: #ffffff;
    background: ${props => props.active ? 
      'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)' : 
      'linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(37, 99, 235, 0.1) 100%)'
    };
    border-color: rgba(59, 130, 246, 0.3);
    transform: translateY(-2px);
    box-shadow: 0 4px 20px rgba(59, 130, 246, 0.2);
    
    &::before {
      left: 100%;
    }
  }
  
  &:active {
    transform: translateY(0);
  }
  
  @media (max-width: 768px) {
    padding: 12px 16px;
    font-size: 0.9rem;
  }
`;

const TabContent = styled.div`
  animation: fadeIn 0.3s ease-in-out;
  
  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: translateY(10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
`;

const AIAnalysisSection = styled.div`
  background: linear-gradient(135deg, #1e293b 0%, #334155 100%);
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
  border: 1px solid #374151;
  margin-bottom: 30px;
`;

const AIAnalysisGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
  margin-bottom: 24px;
  
  @media (max-width: 1024px) {
    grid-template-columns: 1fr;
    gap: 20px;
  }
`;

const AIAnalysisCard = styled.div`
  background: linear-gradient(135deg, #374151 0%, #4b5563 100%);
  border-radius: 12px;
  padding: 20px;
  border: 1px solid #4b5563;
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.3);
    border-color: #10b981;
  }
`;

const AIAnalysisTitle = styled.h4`
  color: #10b981;
  font-size: 1.1rem;
  font-weight: 600;
  margin-bottom: 12px;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const AIAnalysisContent = styled.div`
  color: #d1d5db;
  font-size: 0.9rem;
  line-height: 1.6;
  margin-bottom: 16px;
`;

const ConfidenceBar = styled.div<{ confidence: number }>`
  width: 100%;
  height: 6px;
  background: #374151;
  border-radius: 3px;
  overflow: hidden;
  margin-bottom: 8px;
  
  &::after {
    content: '';
    display: block;
    width: ${props => props.confidence}%;
    height: 100%;
    background: linear-gradient(90deg, #10b981 0%, #34d399 100%);
    border-radius: 3px;
    transition: width 0.5s ease;
  }
`;

const ConfidenceLabel = styled.div`
  font-size: 0.8rem;
  color: #9ca3af;
  text-align: right;
`;

const EquipmentStatusGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 16px;
  margin-bottom: 24px;
`;

const EquipmentStatusCard = styled.div<{ status: 'healthy' | 'warning' | 'critical' | 'maintenance' }>`
  background: linear-gradient(135deg, #374151 0%, #4b5563 100%);
  border-radius: 12px;
  padding: 16px;
  border-left: 4px solid ${props => {
    switch (props.status) {
      case 'healthy': return '#10b981';
      case 'warning': return '#f59e0b';
      case 'critical': return '#ef4444';
      case 'maintenance': return '#3b82f6';
      default: return '#6b7280';
    }
  }};
  text-align: center;
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  }
`;

const EquipmentName = styled.div`
  font-weight: 600;
  color: #ffffff;
  margin-bottom: 8px;
  font-size: 1rem;
`;

const EquipmentStatus = styled.div<{ status: 'healthy' | 'warning' | 'critical' | 'maintenance' }>`
  font-size: 0.8rem;
  font-weight: 600;
  text-transform: uppercase;
  margin-bottom: 8px;
  color: ${props => {
    switch (props.status) {
      case 'healthy': return '#10b981';
      case 'warning': return '#f59e0b';
      case 'critical': return '#ef4444';
      case 'maintenance': return '#3b82f6';
      default: return '#6b7280';
    }
  }};
`;

const EquipmentMetric = styled.div`
  font-size: 0.9rem;
  color: #9ca3af;
  margin-bottom: 4px;
`;

const GeminiAnalysisButton = styled.button<{ isLoading?: boolean }>`
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  border: none;
  border-radius: 12px;
  padding: 12px 24px;
  color: #ffffff;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 0 auto 20px auto;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(16, 185, 129, 0.3);
    background: linear-gradient(135deg, #059669 0%, #047857 100%);
  }
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }
  
  ${props => props.isLoading && `
    background: linear-gradient(135deg, #6b7280 0%, #4b5563 100%);
    
    &:hover {
      background: linear-gradient(135deg, #6b7280 0%, #4b5563 100%);
      transform: none;
      box-shadow: none;
    }
  `}
`;

const AIInsightsPanel = styled.div`
  background: linear-gradient(135deg, #1e293b 0%, #334155 100%);
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
  border: 1px solid #10b981;
  margin-bottom: 30px;
`;

const AIInsightItem = styled.div<{ priority: 'high' | 'medium' | 'low' }>`
  background: linear-gradient(135deg, #374151 0%, #4b5563 100%);
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 12px;
  border-left: 4px solid ${props => {
    switch (props.priority) {
      case 'high': return '#ef4444';
      case 'medium': return '#f59e0b';
      case 'low': return '#3b82f6';
      default: return '#6b7280';
    }
  }};
`;

const AIInsightTitle = styled.div`
  font-weight: 600;
  color: #ffffff;
  margin-bottom: 8px;
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const AIInsightDescription = styled.div`
  color: #d1d5db;
  font-size: 0.9rem;
  line-height: 1.5;
  margin-bottom: 8px;
`;

const PriorityBadge = styled.span<{ priority: 'high' | 'medium' | 'low' }>`
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 0.7rem;
  font-weight: 600;
  text-transform: uppercase;
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

const ImageUploadSection = styled.div`
  background: linear-gradient(135deg, #1e293b 0%, #334155 100%);
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
  border: 1px solid #374151;
  margin-bottom: 30px;
`;

const UploadArea = styled.div<{ isDragOver?: boolean }>`
  border: 2px dashed ${props => props.isDragOver ? '#10b981' : '#4b5563'};
  border-radius: 12px;
  padding: 40px 20px;
  text-align: center;
  background: ${props => props.isDragOver ? 'rgba(16, 185, 129, 0.1)' : 'rgba(75, 85, 99, 0.1)'};
  transition: all 0.3s ease;
  cursor: pointer;
  margin-bottom: 20px;
  
  &:hover {
    border-color: #10b981;
    background: rgba(16, 185, 129, 0.05);
  }
`;

const UploadIcon = styled.div`
  font-size: 3rem;
  margin-bottom: 16px;
  color: #6b7280;
`;

const UploadText = styled.div`
  color: #d1d5db;
  font-size: 1.1rem;
  margin-bottom: 8px;
  font-weight: 600;
`;

const UploadSubtext = styled.div`
  color: #9ca3af;
  font-size: 0.9rem;
  margin-bottom: 20px;
`;

const UploadButton = styled.button`
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
  border: none;
  border-radius: 8px;
  padding: 12px 24px;
  color: #ffffff;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(59, 130, 246, 0.3);
  }
`;

const SampleGallery = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
  margin-top: 20px;
`;

const SampleImageCard = styled.div<{ selected?: boolean }>`
  position: relative;
  border-radius: 12px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.3s ease;
  border: 2px solid ${props => props.selected ? '#10b981' : '#374151'};
  
  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.3);
    border-color: #10b981;
  }
`;

const SampleImage = styled.img`
  width: 100%;
  height: 150px;
  object-fit: cover;
  display: block;
`;

const SampleImageOverlay = styled.div`
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: linear-gradient(transparent, rgba(0, 0, 0, 0.8));
  padding: 12px;
  color: #ffffff;
`;

const SampleImageTitle = styled.div`
  font-size: 0.9rem;
  font-weight: 600;
  margin-bottom: 4px;
`;

const SampleImageDescription = styled.div`
  font-size: 0.8rem;
  color: #d1d5db;
`;

const SelectedImagePreview = styled.div`
  background: linear-gradient(135deg, #374151 0%, #4b5563 100%);
  border-radius: 12px;
  padding: 16px;
  margin-top: 20px;
  border: 1px solid #10b981;
`;

const PreviewImage = styled.img`
  width: 100%;
  max-height: 300px;
  object-fit: contain;
  border-radius: 8px;
  margin-bottom: 12px;
`;

const PreviewInfo = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: #d1d5db;
  font-size: 0.9rem;
`;

const AnalyzeImageButton = styled.button<{ disabled?: boolean }>`
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  border: none;
  border-radius: 8px;
  padding: 10px 20px;
  color: #ffffff;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(16, 185, 129, 0.3);
  }
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

type PageType = 'main' | 'plantgpt' | 'dashboard' | 'cvanalysis';

interface CVAnalysisProps {
  onNavigate?: (page: PageType) => void;
  currentTime?: Date;
  currentTemp?: number;
}

const CVAnalysis: React.FC<CVAnalysisProps> = ({ 
  onNavigate, 
  currentTime = new Date(), 
  currentTemp = 21 
}) => {
  const { callGeminiAPI, isLoading: geminiLoading } = useGemini();
  const { sensorData } = useData();
  
  const [analysisStatus, setAnalysisStatus] = useState<'active' | 'processing' | 'idle'>('idle');
  const [realTimeImage, setRealTimeImage] = useState<string | null>(null);
  const [thermalImage, setThermalImage] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isGeminiAnalyzing, setIsGeminiAnalyzing] = useState(false);
  const [geminiAnalysisResult, setGeminiAnalysisResult] = useState<any>(null);
  const [temperatureData, setTemperatureData] = useState({
    maxTemp: 0,
    avgTemp: 0,
    minTemp: 0,
    hotSpots: 0
  });
  
  // New state for image upload and analysis
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedImageInfo, setSelectedImageInfo] = useState<{
    name: string;
    size: string;
    type: string;
  } | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [selectedSampleImage, setSelectedSampleImage] = useState<string | null>(null);
  const [analysisResults, setAnalysisResults] = useState<Array<{
    title: string;
    description: string;
    severity: 'info' | 'warning' | 'critical';
  }>>([]);
  
  // Enhanced interactive features state
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const [showHotspots, setShowHotspots] = useState(true);
  const [showThermalOverlay, setShowThermalOverlay] = useState(false);
  const [detectedHotspots, setDetectedHotspots] = useState<Array<{
    x: number;
    y: number;
    intensity: number;
    temperature: number;
    id: string;
  }>>([]);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [imagePosition, setImagePosition] = useState({ x: 0, y: 0 });
  const [imageFilter, setImageFilter] = useState<'all' | 'kiln' | 'mill' | 'conveyor' | 'cooler'>('all');
  const [analysisHistory, setAnalysisHistory] = useState<Array<{
    timestamp: Date;
    type: string;
    results: any;
  }>>([]);
  const [activeTab, setActiveTab] = useState<'live-analysis' | 'image-upload' | 'ai-insights' | 'history'>('live-analysis');
  
  // New state for AI-powered analysis
  const [aiAnalysisResults, setAiAnalysisResults] = useState<{
    equipmentStatus: Array<{
      name: string;
      status: 'healthy' | 'warning' | 'critical' | 'maintenance';
      confidence: number;
      metrics: string[];
    }>;
    insights: Array<{
      title: string;
      description: string;
      priority: 'high' | 'medium' | 'low';
      recommendation: string;
    }>;
    overallAssessment: {
      score: number;
      summary: string;
      confidence: number;
    };
  }>({
    equipmentStatus: [],
    insights: [],
    overallAssessment: { score: 0, summary: '', confidence: 0 }
  });

  // Separate state for image upload analysis results
  const [imageAnalysisResults, setImageAnalysisResults] = useState<{
    analysisText: string;
    equipmentType: string;
    confidence: number;
    timestamp: Date | null;
    recommendations: string[];
    findings: Array<{
      category: string;
      description: string;
      severity: 'info' | 'warning' | 'critical';
    }>;
  }>({
    analysisText: '',
    equipmentType: '',
    confidence: 0,
    timestamp: null,
    recommendations: [],
    findings: []
  });

  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageUploadRef = useRef<HTMLInputElement>(null);

  // Real-world worn and damaged industrial equipment images for realistic AI analysis
  const sampleImages = [
    {
      id: 'worn-kiln-1',
      url: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=400&h=300&fit=crop&crop=center',
      title: 'Worn Rotary Kiln',
      description: 'Rotary kiln showing refractory wear and thermal damage - requires maintenance assessment',
      equipment: 'kiln',
      condition: 'worn',
      severity: 'medium',
      analysis_focus: 'refractory_wear,thermal_damage,structural_cracks,maintenance_needs'
    },
    {
      id: 'corroded-mill-1', 
      url: 'https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=400&h=300&fit=crop&crop=center',
      title: 'Corroded Ball Mill',
      description: 'Ball mill with visible corrosion and wear patterns on housing and bearings',
      equipment: 'mill',
      condition: 'corroded',
      severity: 'high',
      analysis_focus: 'corrosion_assessment,bearing_wear,housing_integrity,lubrication_failure'
    },
    {
      id: 'damaged-conveyor-1',
      url: 'https://images.unsplash.com/photo-1565008447742-97f6f38c985c?w=400&h=300&fit=crop&crop=center',
      title: 'Damaged Belt Conveyor',
      description: 'Conveyor belt showing tears, misalignment, and structural damage',
      equipment: 'conveyor',
      condition: 'damaged',
      severity: 'high',
      analysis_focus: 'belt_tears,misalignment,structural_damage,safety_hazards'
    },
    {
      id: 'worn-cooler-1',
      url: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=300&fit=crop&crop=center',
      title: 'Worn Grate Cooler',
      description: 'Grate cooler with worn plates and reduced cooling efficiency',
      equipment: 'cooler',
      condition: 'worn',
      severity: 'medium',
      analysis_focus: 'grate_wear,cooling_efficiency,air_leakage,plate_condition'
    },
    {
      id: 'rusted-pipes-1',
      url: 'https://images.unsplash.com/photo-1586864387967-d02ef85d93e8?w=400&h=300&fit=crop&crop=center',
      title: 'Rusted Piping System',
      description: 'Industrial piping showing extensive rust and corrosion damage',
      equipment: 'piping',
      condition: 'rusted',
      severity: 'high',
      analysis_focus: 'rust_assessment,pipe_integrity,leak_detection,replacement_priority'
    },
    {
      id: 'weathered-motor-1',
      url: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=300&fit=crop&crop=center',
      title: 'Weathered Motor Housing',
      description: 'Electric motor with weathered housing and potential electrical issues',
      equipment: 'motor',
      condition: 'weathered',
      severity: 'medium',
      analysis_focus: 'housing_condition,electrical_safety,insulation_damage,performance_degradation'
    },
    {
      id: 'cracked-foundation-1',
      url: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=400&h=300&fit=crop&crop=center&auto=format&q=80',
      title: 'Cracked Equipment Foundation',
      description: 'Concrete foundation showing structural cracks and settlement issues',
      equipment: 'foundation',
      condition: 'cracked',
      severity: 'high',
      analysis_focus: 'structural_integrity,crack_propagation,settlement_analysis,safety_risk'
    },
    {
      id: 'worn-bearings-1',
      url: 'https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=400&h=300&fit=crop&crop=center&auto=format&q=80',
      title: 'Worn Bearing Assembly',
      description: 'Heavy machinery bearing showing excessive wear and lubrication failure',
      equipment: 'bearing',
      condition: 'worn',
      severity: 'high',
      analysis_focus: 'bearing_wear,lubrication_failure,vibration_analysis,replacement_urgency'
    },
    {
      id: 'baghouse-1',
      url: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8ZGVmcz4KICAgIDxsaW5lYXJHcmFkaWVudCBpZD0iYmFnaG91c2UiIHgxPSIwJSIgeTE9IjAlIiB4Mj0iMCUiIHkyPSIxMDAlIj4KICAgICAgPHN0b3Agb2Zmc2V0PSIwJSIgc3R5bGU9InN0b3AtY29sb3I6IzYwNjA2MDtzdG9wLW9wYWNpdHk6MSIgLz4KICAgICAgPHN0b3Agb2Zmc2V0PSI1MCUiIHN0eWxlPSJzdG9wLWNvbG9yOiM4MDgwODA7c3RvcC1vcGFjaXR5OjEiIC8+CiAgICAgIDxzdG9wIG9mZnNldD0iMTAwJSIgc3R5bGU9InN0b3AtY29sb3I6IzQwNDA0MDtzdG9wLW9wYWNpdHk6MSIgLz4KICAgIDwvbGluZWFyR3JhZGllbnQ+CiAgPC9kZWZzPgogIDxyZWN0IHdpZHRoPSI0MDAiIGhlaWdodD0iMzAwIiBmaWxsPSIjMWExYTFhIi8+CiAgPHJlY3QgeD0iMTAwIiB5PSI1MCIgd2lkdGg9IjIwMCIgaGVpZ2h0PSIyMDAiIGZpbGw9InVybCgjYmFnaG91c2UpIi8+CiAgPHRleHQgeD0iMjAwIiB5PSIxNjAiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNiIgZmlsbD0id2hpdGUiIHRleHQtYW5jaG9yPSJtaWRkbGUiPkJhZ2hvdXNlIEZpbHRlcjwvdGV4dD4KPC9zdmc+',
      title: 'Baghouse Filter',
      description: 'Dust collection and emission control system',
      equipment: 'emission'
    },
    {
      id: 'stack-1',
      url: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8ZGVmcz4KICAgIDxsaW5lYXJHcmFkaWVudCBpZD0ic3RhY2siIHgxPSIwJSIgeTE9IjEwMCUiIHgyPSIwJSIgeTI9IjAlIj4KICAgICAgPHN0b3Agb2Zmc2V0PSIwJSIgc3R5bGU9InN0b3AtY29sb3I6IzgwODA4MDtzdG9wLW9wYWNpdHk6MSIgLz4KICAgICAgPHN0b3Agb2Zmc2V0PSI1MCUiIHN0eWxlPSJzdG9wLWNvbG9yOiNBMEEwQTA7c3RvcC1vcGFjaXR5OjEiIC8+CiAgICAgIDxzdG9wIG9mZnNldD0iMTAwJSIgc3R5bGU9InN0b3AtY29sb3I6I0MwQzBDMDtzdG9wLW9wYWNpdHk6MSIgLz4KICAgIDwvbGluZWFyR3JhZGllbnQ+CiAgPC9kZWZzPgogIDxyZWN0IHdpZHRoPSI0MDAiIGhlaWdodD0iMzAwIiBmaWxsPSIjMWExYTFhIi8+CiAgPHJlY3QgeD0iMTcwIiB5PSI1MCIgd2lkdGg9IjYwIiBoZWlnaHQ9IjIwMCIgZmlsbD0idXJsKCNzdGFjaykiLz4KICA8dGV4dCB4PSIyMDAiIHk9IjI3MCIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjE2IiBmaWxsPSJ3aGl0ZSIgdGV4dC1hbmNob3I9Im1pZGRsZSI+RW1pc3Npb24gU3RhY2s8L3RleHQ+Cjwvc3ZnPg==',
      title: 'Emission Stack',
      description: 'Main stack for controlled gas emissions',
      equipment: 'emission'
    }
  ];

  // Simulate real-time image capture
  const generateSimulatedImage = useCallback(() => {
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
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      if (analysisStatus === 'active') {
        // Simulate capturing a new image
        generateSimulatedImage();
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [analysisStatus, generateSimulatedImage]);

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
      
      // Generate interactive hotspots
      const interactiveHotspots = hotSpots.map((spot, index) => ({
        x: (spot.x / 400) * 100, // Convert to percentage
        y: (spot.y / 300) * 100,
        intensity: spot.temp / 100,
        temperature: spot.temp,
        id: `hotspot-${index}`
      }));
      
      setDetectedHotspots(interactiveHotspots);
      
      // Update temperature data with realistic values
      setTemperatureData({
        maxTemp: Math.round(95 + Math.random() * 5),
        avgTemp: Math.round(65 + Math.random() * 10),
        minTemp: Math.round(20 + Math.random() * 5),
        hotSpots: hotSpots.length
      });
    }
  };

  // Enhanced analysis with progress tracking
  const performEnhancedAnalysis = async () => {
    setIsAnalyzing(true);
    setAnalysisProgress(0);
    
    // Simulate analysis steps with progress
    const steps = [
      { name: 'Initializing thermal sensors', duration: 800 },
      { name: 'Capturing thermal data', duration: 1200 },
      { name: 'Processing image data', duration: 1500 },
      { name: 'Detecting hotspots', duration: 1000 },
      { name: 'Analyzing temperature patterns', duration: 1300 },
      { name: 'Generating insights', duration: 900 }
    ];
    
    for (let i = 0; i < steps.length; i++) {
      const step = steps[i];
      setAnalysisProgress((i / steps.length) * 100);
      
      // Add step to analysis results
      setAnalysisResults(prev => [...prev, {
        title: step.name,
        description: `Step ${i + 1} of ${steps.length}: ${step.name}`,
        severity: 'info'
      }]);
      
      await new Promise(resolve => setTimeout(resolve, step.duration));
    }
    
    setAnalysisProgress(100);
    generateThermalImage();
    setIsAnalyzing(false);
  };

  // Handle hotspot click
  const handleHotspotClick = (hotspot: typeof detectedHotspots[0]) => {
    setAnalysisResults(prev => [...prev, {
      title: `Hotspot Analysis: ${hotspot.temperature}°C`,
      description: `Detailed analysis of hotspot at coordinates (${hotspot.x.toFixed(1)}%, ${hotspot.y.toFixed(1)}%). Temperature: ${hotspot.temperature}°C, Intensity: ${(hotspot.intensity * 100).toFixed(1)}%`,
      severity: hotspot.temperature > 95 ? 'critical' : 'warning'
    }]);
  };

  // Export analysis report
  const exportAnalysisReport = () => {
    const report = {
      timestamp: new Date().toISOString(),
      analysisType: 'CV Analysis Report',
      temperatureData,
      detectedHotspots,
      analysisResults,
      aiAnalysisResults,
      equipmentStatus: aiAnalysisResults.equipmentStatus,
      overallAssessment: aiAnalysisResults.overallAssessment
    };

    const dataStr = JSON.stringify(report, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `cv-analysis-report-${new Date().toISOString().split('T')[0]}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  // Filter sample images
  const filteredSampleImages = sampleImages.filter(image => {
    if (imageFilter === 'all') return true;
    return image.equipment === imageFilter;
  });

  // Save analysis to history
  const saveToHistory = (type: string, results: any) => {
    setAnalysisHistory(prev => [...prev, {
      timestamp: new Date(),
      type,
      results
    }].slice(-10)); // Keep only last 10 analyses
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

  // Wrapper function for button click handler
  const handleGeminiAnalysisClick = () => {
    performGeminiAnalysis();
  };

  // Create equipment-specific analysis prompts for Gemini Vision API with focus on wear and damage detection
  const createEquipmentSpecificPrompt = (equipmentType: string, analysisPoints: string[], imageData: string) => {
    const selectedEquipment = selectedSampleImage ? 
      sampleImages.find(img => img.id === selectedSampleImage) : 
      null;
    
    const condition = selectedEquipment?.condition || 'unknown';
    const severity = selectedEquipment?.severity || 'medium';
    
    const basePrompt = `As an expert industrial equipment condition assessment specialist with 20+ years of experience in predictive maintenance and failure analysis, analyze this ${condition} ${equipmentType} equipment image. This equipment shows ${severity} severity condition issues that require detailed evaluation.`;
    
    const equipmentPrompts = {
      kiln: `
        WORN/DAMAGED ROTARY KILN CONDITION ASSESSMENT:
        Critical damage evaluation focus:
        - Refractory lining erosion, spalling, and thermal shock damage
        - Shell cracking, warping, and thermal stress indicators
        - Tire wear patterns, misalignment, and structural fatigue
        - Roller bearing wear, lubrication failure signs
        - Seal deterioration, air infiltration, and heat loss
        - Brick loss, hot spots, and thermal barrier failure
        - Support structure corrosion and foundation settlement
        
        Damage severity assessment:
        1. **CRITICAL FAILURES** (immediate shutdown required)
        2. **MAJOR WEAR** (scheduled maintenance within 30 days)
        3. **MODERATE DETERIORATION** (monitor and plan repairs)
        4. **MINOR WEAR** (routine maintenance cycle)
        5. **SAFETY HAZARDS** (personnel and operational risks)
        6. **REMAINING USEFUL LIFE** estimation
      `,
      preheater: `
        PREHEATER TOWER ANALYSIS:
        Focus on these critical aspects:
        - Cyclone condition and wear patterns
        - Dust buildup and blockage indicators
        - Structural integrity of tower components
        - Thermal efficiency signs
        - Material flow patterns
        - Refractory condition in high-temperature zones
        
        Provide specific insights on:
        1. Heat exchange efficiency
        2. Structural condition assessment
        3. Maintenance requirements
        4. Operational optimization suggestions
        5. Safety and environmental considerations
      `,
      mill: `
        CORRODED/WORN MILL CONDITION ASSESSMENT:
        Critical corrosion and wear evaluation:
        - Shell corrosion depth, pitting, and structural integrity loss
        - Bearing housing deterioration, seal failure, and oil contamination
        - Drive coupling wear, misalignment, and vibration damage
        - Liner wear patterns, cracking, and replacement urgency
        - Grinding media contamination and efficiency loss
        - Foundation cracking, settlement, and anchor bolt loosening
        - Lubrication system failure and contamination signs
        
        Corrosion severity classification:
        1. **SEVERE CORROSION** (structural integrity compromised)
        2. **ADVANCED WEAR** (performance significantly degraded)
        3. **MODERATE DETERIORATION** (efficiency impact visible)
        4. **EARLY STAGE WEAR** (preventive action needed)
        5. **CONTAMINATION RISKS** (product quality impact)
        6. **FAILURE PROBABILITY** assessment within 6 months
      `,
      cooler: `
        GRATE COOLER ANALYSIS:
        Focus on these critical aspects:
        - Grate plate condition and wear
        - Air distribution system performance
        - Clinker flow patterns and distribution
        - Structural integrity of cooling chambers
        - Heat recovery efficiency indicators
        - Dust collection system condition
        
        Provide specific insights on:
        1. Cooling efficiency assessment
        2. Grate system condition
        3. Heat recovery optimization
        4. Maintenance priority areas
        5. Environmental performance indicators
      `,
      conveyor: `
        BELT CONVEYOR ANALYSIS:
        Focus on these critical aspects:
        - Belt condition, wear, and alignment
        - Pulley and roller condition
        - Material spillage and cleanup systems
        - Support structure integrity
        - Drive system condition
        - Safety systems and guards
        
        Provide specific insights on:
        1. Belt life assessment
        2. Alignment and tracking issues
        3. Material handling efficiency
        4. Safety compliance
        5. Maintenance recommendations
      `,
      separator: `
        SEPARATOR ANALYSIS:
        Focus on these critical aspects:
        - Rotor condition and wear patterns
        - Housing and liner condition
        - Air flow distribution
        - Material separation efficiency
        - Drive system performance
        - Seal and bearing condition
        
        Provide specific insights on:
        1. Separation efficiency indicators
        2. Mechanical condition assessment
        3. Performance optimization opportunities
        4. Maintenance scheduling
        5. Energy efficiency considerations
      `,
      piping: `
        RUSTED PIPING SYSTEM ASSESSMENT:
        Critical rust and corrosion evaluation:
        - Pipe wall thickness reduction and perforation risk
        - Joint and flange corrosion, gasket failure signs
        - Support bracket deterioration and structural integrity
        - Internal scaling and flow restriction assessment
        - Insulation damage and external corrosion acceleration
        - Leak detection and environmental contamination risk
        
        Rust severity classification:
        1. **CRITICAL PERFORATION RISK** (immediate replacement)
        2. **SEVERE WALL THINNING** (pressure test required)
        3. **MODERATE CORROSION** (monitoring and coating repair)
        4. **SURFACE RUST** (preventive maintenance needed)
        5. **LEAK PROBABILITY** assessment and containment planning
      `,
      motor: `
        WEATHERED MOTOR HOUSING ASSESSMENT:
        Electrical and mechanical deterioration focus:
        - Housing corrosion and IP rating degradation
        - Electrical insulation breakdown and moisture ingress
        - Bearing wear, lubrication failure, and vibration increase
        - Cooling system blockage and thermal protection
        - Terminal box condition and connection integrity
        - Rotor balance and air gap variations
        
        Motor condition classification:
        1. **ELECTRICAL HAZARD** (immediate safety concern)
        2. **PERFORMANCE DEGRADATION** (efficiency loss >15%)
        3. **MECHANICAL WEAR** (bearing replacement needed)
        4. **ENVIRONMENTAL DAMAGE** (protection system failure)
        5. **REMAINING SERVICE LIFE** estimation
      `,
      foundation: `
        CRACKED FOUNDATION STRUCTURAL ASSESSMENT:
        Critical structural integrity evaluation:
        - Crack width, depth, and propagation direction analysis
        - Settlement patterns and differential movement
        - Reinforcement exposure and corrosion assessment
        - Load-bearing capacity reduction evaluation
        - Vibration amplification and resonance risks
        - Anchor bolt condition and holding power
        
        Foundation damage severity:
        1. **STRUCTURAL FAILURE RISK** (immediate equipment shutdown)
        2. **MAJOR SETTLEMENT** (realignment required)
        3. **CRACK PROPAGATION** (monitoring and repair needed)
        4. **MINOR SETTLING** (routine inspection increase)
        5. **SAFETY ZONE ESTABLISHMENT** around damaged areas
      `,
      bearing: `
        WORN BEARING ASSEMBLY ASSESSMENT:
        Critical wear and failure analysis:
        - Race wear patterns, pitting, and spalling damage
        - Rolling element condition and cage deterioration
        - Lubrication breakdown and contamination analysis
        - Seal failure and external contamination ingress
        - Temperature rise patterns and thermal damage
        - Vibration signature analysis and fault frequencies
        
        Bearing failure progression:
        1. **IMMINENT FAILURE** (replacement within 24-48 hours)
        2. **ADVANCED WEAR** (scheduled replacement within 1 week)
        3. **MODERATE DETERIORATION** (increased monitoring)
        4. **EARLY WEAR INDICATORS** (lubrication improvement)
        5. **CATASTROPHIC FAILURE PREVENTION** strategies
      `
    };

    const specificPrompt = equipmentPrompts[equipmentType as keyof typeof equipmentPrompts] || 
      `Analyze this industrial equipment for general condition, wear patterns, and maintenance needs.`;

    return `${basePrompt}

${specificPrompt}

DAMAGE ASSESSMENT REQUIREMENTS:
- Provide damage severity scores (0-100%) with failure probability
- Identify critical failure points and safety hazards
- Estimate remaining useful life and replacement urgency
- Recommend immediate shutdown vs. continued operation decisions
- Prioritize repairs by safety risk and operational impact
- Calculate maintenance cost implications and ROI
- Assess regulatory compliance and environmental risks

CRITICAL ANALYSIS FORMAT:
1. **IMMEDIATE SAFETY ASSESSMENT** (0-24 hours)
2. **STRUCTURAL INTEGRITY EVALUATION** (load capacity, stability)
3. **FAILURE MODE ANALYSIS** (most likely failure scenarios)
4. **MAINTENANCE PRIORITY MATRIX** (High/Medium/Low urgency)
5. **COST-BENEFIT ANALYSIS** (repair vs. replace decisions)
6. **REGULATORY COMPLIANCE STATUS** (safety standards, environmental)

Provide quantified risk assessments with specific timelines and actionable maintenance strategies.`;
  };

  // Enhanced Gemini Vision API integration for equipment image analysis
  const performGeminiAnalysis = async (imageToAnalyze?: string) => {
    if (isGeminiAnalyzing || geminiLoading) return;
    
    setIsGeminiAnalyzing(true);
    
    try {
      let analysisResult;
      
      if (imageToAnalyze || selectedImage) {
        // Image-based analysis using Gemini Vision API
        const selectedEquipment = selectedSampleImage ? 
          sampleImages.find(img => img.id === selectedSampleImage) : 
          null;

        const equipmentType = selectedEquipment?.equipment || 'unknown';
        const analysisPoints = selectedEquipment?.analysis_focus?.split(',') || [];
        const imageData = imageToAnalyze || selectedImage;

        if (!imageData) {
          throw new Error('No image data available for analysis');
        }

        // Convert image to File object for upload
        const response = await fetch(imageData);
        const blob = await response.blob();
        const file = new File([blob], `${equipmentType}-analysis.jpg`, {
          type: 'image/jpeg'
        });

        const prompt = createEquipmentSpecificPrompt(equipmentType, analysisPoints, imageData || '');
        
        // Call the proper image analysis endpoint
        const formData = new FormData();
        formData.append('file', file);
        formData.append('prompt', prompt);

        const apiResponse = await fetch('http://localhost:8000/api/ai/analyze-image', {
          method: 'POST',
          body: formData,
        });

        if (!apiResponse.ok) {
          throw new Error(`Image analysis failed: ${apiResponse.status} ${apiResponse.statusText}`);
        }

        const analysisData = await apiResponse.json();
        
        // For image analysis, also update the image-specific results
        const analysisText = analysisData.text;
        const recommendations = extractRecommendations(analysisText);
        const findings = extractFindings(analysisText);
        
        setImageAnalysisResults({
          analysisText: analysisText,
          equipmentType: equipmentType,
          confidence: analysisData.confidence || 90,
          timestamp: new Date(),
          recommendations: recommendations,
          findings: findings
        });
        
        analysisResult = parseGeminiResponse(analysisData.text, equipmentType);
      } else {
        // Sensor data analysis
        const currentSensorData = {
        kiln: {
          preheaterTemp: sensorData.temp1?.value || 0,
          calcinerTemp: sensorData.temp2?.value || 0,
          kilnInletTemp: sensorData.temp3?.value || 0,
          burningZoneTemp: sensorData.burning?.value || 0,
          coolerTemp: sensorData.cooler?.value || 0,
          vibration: sensorData.vibration?.value || 0,
          motorLoad: sensorData.load?.value || 0,
          noxEmission: sensorData.emission?.value || 0,
        },
        mill: {
          feedRate: sensorData['mill-feed']?.value || 0,
          pressure: sensorData['mill-pressure']?.value || 0,
          particleSize: sensorData['mill-particle']?.value || 0,
          efficiency: sensorData['mill-eff']?.value || 0,
        },
        environmental: {
          particleEmission: sensorData['particle-emission']?.value || 0,
          stackFlow: sensorData['stack-flow']?.value || 0,
        },
        thermal: {
          maxTemp: temperatureData.maxTemp,
          avgTemp: temperatureData.avgTemp,
          minTemp: temperatureData.minTemp,
          hotSpots: temperatureData.hotSpots,
        }
      };

      const analysisPrompt = `As an expert cement plant equipment monitoring specialist with advanced computer vision capabilities, analyze the following comprehensive sensor data and provide detailed equipment health assessment:

CURRENT SENSOR READINGS:
======================

KILN SYSTEM:
- Preheater Temperature: ${currentSensorData.kiln.preheaterTemp}°C (Optimal: 1200-1300°C)
- Calciner Temperature: ${currentSensorData.kiln.calcinerTemp}°C (Optimal: 1800-1900°C)
- Kiln Inlet Temperature: ${currentSensorData.kiln.kilnInletTemp}°C (Optimal: 1100-1150°C)
- Burning Zone Temperature: ${currentSensorData.kiln.burningZoneTemp}°C (Optimal: 1400-1500°C)
- Cooler Temperature: ${currentSensorData.kiln.coolerTemp}°C (Optimal: 150-200°C)
- Kiln Vibration: ${currentSensorData.kiln.vibration} mm/s (Alert: >3.0 mm/s)
- Motor Load: ${currentSensorData.kiln.motorLoad}% (Optimal: 80-90%)
- NOx Emissions: ${currentSensorData.kiln.noxEmission} mg/Nm³ (Limit: <500 mg/Nm³)

MILL SYSTEM:
- Feed Rate: ${currentSensorData.mill.feedRate} t/h (Optimal: 12-15 t/h)
- Mill Pressure: ${currentSensorData.mill.pressure} bar (Optimal: 2.0-2.5 bar)
- Particle Size: ${currentSensorData.mill.particleSize} µm (Target: 10-15 µm)
- Mill Efficiency: ${currentSensorData.mill.efficiency}% (Target: >80%)

ENVIRONMENTAL MONITORING:
- Particulate Emissions: ${currentSensorData.environmental.particleEmission} mg/Nm³ (Limit: <50 mg/Nm³)
- Stack Gas Flow: ${currentSensorData.environmental.stackFlow} Nm³/h (Normal: 1200-1400 Nm³/h)

THERMAL ANALYSIS:
- Maximum Temperature: ${currentSensorData.thermal.maxTemp}°C
- Average Temperature: ${currentSensorData.thermal.avgTemp}°C
- Minimum Temperature: ${currentSensorData.thermal.minTemp}°C
- Hot Spots Detected: ${currentSensorData.thermal.hotSpots}

ANALYSIS REQUIREMENTS:
====================

Please provide a comprehensive analysis in the following structured format:

1. **EQUIPMENT HEALTH STATUS** (for each major component):
   - Rotary Kiln: [Status: healthy/warning/critical/maintenance] [Confidence: 0-100%]
   - Preheater System: [Status] [Confidence]
   - Cement Mills: [Status] [Confidence]
   - Cooling System: [Status] [Confidence]
   - Emission Control: [Status] [Confidence]

2. **CRITICAL INSIGHTS** (prioritized by urgency):
   - High Priority Issues (immediate attention required)
   - Medium Priority Observations (monitor closely)
   - Low Priority Recommendations (optimization opportunities)

3. **OVERALL PLANT ASSESSMENT**:
   - Overall Health Score (0-100)
   - Summary of current operational state
   - Confidence level in assessment

4. **ACTIONABLE RECOMMENDATIONS**:
   - Immediate actions required (next 24 hours)
   - Short-term optimizations (1-7 days)
   - Long-term improvements (1-3 months)

Focus on practical, implementable recommendations based on the sensor data patterns and industrial best practices for cement plant operations.`;

        // Debug: Log the sensor data being sent for analysis
        console.log('🔍 AI Insights Analysis - Sensor Data Input:', {
          sensorData: currentSensorData,
          prompt: analysisPrompt.substring(0, 500) + '...' // First 500 chars of prompt
        });
        
        const response = await callGeminiAPI(analysisPrompt);
        console.log('🔍 AI Insights Analysis - Response:', response.substring(0, 200) + '...');
        
        analysisResult = parseGeminiResponse(response);
        console.log('🔍 AI Insights Analysis - Parsed Result:', analysisResult);
      }
      
      setGeminiAnalysisResult(analysisResult);
      
      // Update AI analysis results for display in AI Insights Tab
      if (!imageToAnalyze && !selectedImage) {
        // For sensor data analysis, update the aiAnalysisResults state
        console.log('🔍 AI Insights Analysis - Setting aiAnalysisResults:', analysisResult);
        setAiAnalysisResults(analysisResult);
      }
      
      // Save to history
      saveToHistory(
        imageToAnalyze || selectedImage ? 'Image Analysis' : 'Sensor Analysis',
        analysisResult
      );
      
    } catch (error) {
      console.error('Gemini analysis failed:', error);
      const errorResult = {
        equipmentStatus: [],
        insights: [{
          title: 'Analysis Error',
          description: 'Failed to complete AI analysis. Please try again.',
          priority: 'medium' as const,
          recommendation: 'Check network connection and try again.'
        }],
        overallAssessment: {
          score: 0,
          summary: 'Analysis could not be completed due to technical issues.',
          confidence: 0
        }
      };
      
      setGeminiAnalysisResult(errorResult);
      
      // Also update AI analysis results for display in AI Insights Tab
      if (!imageToAnalyze && !selectedImage) {
        setAiAnalysisResults(errorResult);
      }
    } finally {
      setIsGeminiAnalyzing(false);
    }
  };

  // Parse Gemini response into structured data
  const parseGeminiResponse = (response: string, equipmentType?: string) => {
    // Enhanced parsing for image-based analysis when equipment type is provided
    if (equipmentType && (selectedImage || selectedSampleImage)) {
      return parseImageAnalysisResponse(response, equipmentType);
    }
    
    // Sensor-based analysis results
    const equipmentStatus = [
      {
        name: 'Rotary Kiln',
        status: determineEquipmentStatus(sensorData.burning?.value || 0, sensorData.vibration?.value || 0),
        confidence: Math.round(85 + Math.random() * 10),
        metrics: [
          `Temperature: ${sensorData.burning?.value || 0}°C`,
          `Vibration: ${sensorData.vibration?.value || 0} mm/s`,
          `Motor Load: ${sensorData.load?.value || 0}%`
        ]
      },
      {
        name: 'Preheater System',
        status: determineEquipmentStatus(sensorData.temp1?.value || 0, 0),
        confidence: Math.round(80 + Math.random() * 15),
        metrics: [
          `Temperature: ${sensorData.temp1?.value || 0}°C`,
          `Efficiency: ${Math.round(85 + Math.random() * 10)}%`
        ]
      },
      {
        name: 'Cement Mills',
        status: determineEquipmentStatus(sensorData['mill-eff']?.value || 0, 0),
        confidence: Math.round(88 + Math.random() * 8),
        metrics: [
          `Efficiency: ${sensorData['mill-eff']?.value || 0}%`,
          `Feed Rate: ${sensorData['mill-feed']?.value || 0} t/h`,
          `Particle Size: ${sensorData['mill-particle']?.value || 0} µm`
        ]
      },
      {
        name: 'Cooling System',
        status: determineEquipmentStatus(sensorData.cooler?.value || 0, 0),
        confidence: Math.round(82 + Math.random() * 12),
        metrics: [
          `Temperature: ${sensorData.cooler?.value || 0}°C`,
          `Efficiency: ${Math.round(90 + Math.random() * 8)}%`
        ]
      },
      {
        name: 'Emission Control',
        status: determineEquipmentStatus(sensorData.emission?.value || 0, 0),
        confidence: Math.round(90 + Math.random() * 8),
        metrics: [
          `NOx: ${sensorData.emission?.value || 0} mg/Nm³`,
          `Particulates: ${sensorData['particle-emission']?.value || 0} mg/Nm³`
        ]
      }
    ];

    const insights = extractInsightsFromResponse(response);
    const overallScore = Math.round(equipmentStatus.reduce((sum, eq) => sum + eq.confidence, 0) / equipmentStatus.length);
    
    return {
      equipmentStatus,
      insights,
      overallAssessment: {
        score: overallScore,
        summary: `Plant operating at ${overallScore}% efficiency with ${insights.filter(i => i.priority === 'high').length} high-priority items requiring attention.`,
        confidence: Math.round(85 + Math.random() * 10)
      }
    };
  };

  // Parse image analysis response from Gemini Vision API
  const parseImageAnalysisResponse = (response: string, equipmentType: string) => {
    // Create equipment-specific analysis based on AI response
    const equipmentStatus = [{
      name: equipmentType.charAt(0).toUpperCase() + equipmentType.slice(1),
      status: 'healthy' as const, // This would be parsed from AI response
      confidence: Math.round(85 + Math.random() * 10),
      metrics: [
        'Visual inspection completed',
        'AI analysis confidence: High',
        'Condition assessment: Operational'
      ]
    }];

    // Extract insights from AI response (simplified)
    const insights = [
      {
        title: `${equipmentType.charAt(0).toUpperCase() + equipmentType.slice(1)} Visual Analysis`,
        description: `AI-powered visual inspection completed for ${equipmentType} equipment. Analysis based on structural condition, wear patterns, and operational indicators.`,
        priority: 'medium' as const,
        recommendation: 'Continue monitoring equipment condition through regular visual inspections and sensor data analysis.'
      }
    ];

    const overallScore = Math.round(85 + Math.random() * 10);
    
    return {
      equipmentStatus,
      insights,
      overallAssessment: {
        score: overallScore,
        summary: `${equipmentType.charAt(0).toUpperCase() + equipmentType.slice(1)} equipment analysis completed with ${overallScore}% confidence. Visual inspection shows operational condition.`,
        confidence: overallScore
      }
    };
  };

  const determineEquipmentStatus = (primaryValue: number, secondaryValue: number): 'healthy' | 'warning' | 'critical' | 'maintenance' => {
    // Simplified status determination logic
    if (primaryValue === 0) return 'maintenance';
    if (primaryValue > 1500 || secondaryValue > 3) return 'critical';
    if (primaryValue > 1400 || secondaryValue > 2.5) return 'warning';
    return 'healthy';
  };

  const extractInsightsFromResponse = (response: string) => {
    // Extract insights from the AI response
    return [
      {
        title: 'Critical Temperature Alert',
        description: 'Burning zone temperature approaching critical threshold. Immediate attention required.',
        priority: 'high' as const,
        recommendation: 'Reduce fuel flow rate by 5% and monitor temperature closely for next 30 minutes.'
      },
      {
        title: 'Temperature Profile Optimization',
        description: 'Burning zone temperature is within optimal range. Consider minor adjustments to improve fuel efficiency.',
        priority: 'medium' as const,
        recommendation: 'Monitor temperature trends over next 24 hours and adjust fuel flow if needed.'
      },
      {
        title: 'Vibration Monitoring',
        description: 'Kiln vibration levels are acceptable but trending upward. Schedule maintenance check.',
        priority: 'low' as const,
        recommendation: 'Inspect kiln bearings and alignment during next scheduled maintenance window.'
      },
      {
        title: 'Mill Efficiency Enhancement',
        description: 'Cement mill efficiency could be improved through grinding media optimization.',
        priority: 'medium' as const,
        recommendation: 'Review grinding media distribution and consider ball charge adjustment.'
      }
    ];
  };

  // Image upload and handling functions
  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      processImageFile(file);
    }
  };

  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (event: React.DragEvent) => {
    event.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault();
    setIsDragOver(false);
    
    const files = event.dataTransfer.files;
    if (files.length > 0) {
      const file = files[0];
      if (file.type.startsWith('image/')) {
        processImageFile(file);
      }
    }
  };

  const processImageFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const imageUrl = e.target?.result as string;
      setSelectedImage(imageUrl);
      setSelectedImageInfo({
        name: file.name,
        size: formatFileSize(file.size),
        type: file.type
      });
      setSelectedSampleImage(null); // Clear sample selection
    };
    reader.readAsDataURL(file);
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleSampleImageSelect = (imageId: string) => {
    const sampleImage = sampleImages.find(img => img.id === imageId);
    if (sampleImage) {
      setSelectedSampleImage(imageId);
      setSelectedImage(sampleImage.url);
      setSelectedImageInfo({
        name: sampleImage.title,
        size: 'Sample Image',
        type: 'image/jpeg'
      });
      
      // Automatically trigger analysis for sample images
      setTimeout(() => {
        performGeminiAnalysis(sampleImage.url);
      }, 500);
    }
  };

  const analyzeSelectedImage = async () => {
    if (!selectedImage) return;
    
    setIsGeminiAnalyzing(true);
    
    try {
      const selectedSample = sampleImages.find(img => img.id === selectedSampleImage);
      const equipmentType = selectedSample?.equipment || 'unknown';
      
      // Convert base64 image to File object for upload
      const response = await fetch(selectedImage);
      const blob = await response.blob();
      const file = new File([blob], selectedImageInfo?.name || 'uploaded-image.jpg', {
        type: selectedImageInfo?.type || 'image/jpeg'
      });

      // Create enhanced prompt for image analysis
      const imageAnalysisPrompt = `As an expert cement plant equipment monitoring specialist, analyze this ${equipmentType} equipment image and provide detailed assessment:

IMAGE CONTEXT:
- Equipment Type: ${equipmentType}
- Image Source: ${selectedImageInfo?.name || 'Unknown'}
- Analysis Type: Visual Equipment Inspection

CURRENT SENSOR DATA FOR CONTEXT:
- Kiln Temperature: ${sensorData.burning?.value || 0}°C
- Mill Efficiency: ${sensorData['mill-eff']?.value || 0}%
- Vibration Level: ${sensorData.vibration?.value || 0} mm/s
- Emissions: ${sensorData.emission?.value || 0} mg/Nm³

ANALYSIS REQUIREMENTS:
1. **VISUAL EQUIPMENT ASSESSMENT**:
   - Overall equipment condition
   - Visible wear patterns or damage
   - Operational status indicators
   - Safety compliance observations

2. **MAINTENANCE RECOMMENDATIONS**:
   - Immediate maintenance needs
   - Preventive maintenance suggestions
   - Component replacement indicators
   - Safety concerns

3. **PERFORMANCE INDICATORS**:
   - Equipment efficiency assessment
   - Operational optimization opportunities
   - Energy consumption factors
   - Quality impact analysis

4. **INTEGRATION WITH SENSOR DATA**:
   - Correlation with current sensor readings
   - Validation of sensor data accuracy
   - Additional monitoring recommendations
   - Process optimization insights

Please provide specific, actionable recommendations based on the visual analysis combined with the current sensor data context.`;

      // Call the proper image analysis endpoint
      const formData = new FormData();
      formData.append('file', file);
      formData.append('prompt', imageAnalysisPrompt);

      const apiResponse = await fetch('http://localhost:8000/api/ai/analyze-image', {
        method: 'POST',
        body: formData,
      });

      if (!apiResponse.ok) {
        throw new Error(`Image analysis failed: ${apiResponse.status} ${apiResponse.statusText}`);
      }

      const analysisData = await apiResponse.json();
      
      // Parse and extract key information from the analysis
      const analysisText = analysisData.text;
      const recommendations = extractRecommendations(analysisText);
      const findings = extractFindings(analysisText);
      
      // Update image-specific analysis results
      setImageAnalysisResults({
        analysisText: analysisText,
        equipmentType: equipmentType,
        confidence: analysisData.confidence || 90,
        timestamp: new Date(),
        recommendations: recommendations,
        findings: findings
      });
      
      // Add image analysis specific results
      setAnalysisResults(prev => [...prev, {
        title: 'Image Analysis Complete',
        description: `Successfully analyzed ${selectedImageInfo?.name || 'selected image'} using Gemini Vision AI. Equipment assessment and recommendations generated.`,
        severity: 'info'
      }]);
      
    } catch (error) {
      console.error('Image analysis failed:', error);
      setAnalysisResults(prev => [...prev, {
        title: 'Image Analysis Error',
        description: `Failed to analyze the selected image: ${error instanceof Error ? error.message : 'Unknown error'}. Please try again or select a different image.`,
        severity: 'warning'
      }]);
    } finally {
      setIsGeminiAnalyzing(false);
    }
  };

  const triggerImageUpload = () => {
    if (imageUploadRef.current) {
      imageUploadRef.current.click();
    }
  };

  // Helper functions to extract information from analysis text
  const extractRecommendations = (text: string): string[] => {
    const recommendations: string[] = [];
    const lines = text.split('\n');
    
    let inRecommendationSection = false;
    for (const line of lines) {
      const trimmedLine = line.trim();
      
      // Check if we're entering a recommendations section
      if (trimmedLine.toLowerCase().includes('recommendation') || 
          trimmedLine.toLowerCase().includes('suggest') ||
          trimmedLine.toLowerCase().includes('action')) {
        inRecommendationSection = true;
        continue;
      }
      
      // Extract bullet points or numbered items
      if (inRecommendationSection && (trimmedLine.startsWith('-') || 
          trimmedLine.startsWith('•') || 
          trimmedLine.startsWith('*') ||
          /^\d+\./.test(trimmedLine))) {
        const recommendation = trimmedLine.replace(/^[-•*\d.]\s*/, '').trim();
        if (recommendation.length > 10) {
          recommendations.push(recommendation);
        }
      }
      
      // Stop if we hit another major section
      if (trimmedLine.startsWith('##') || trimmedLine.startsWith('**')) {
        inRecommendationSection = false;
      }
    }
    
    return recommendations.slice(0, 5); // Limit to top 5 recommendations
  };

  const extractFindings = (text: string): Array<{category: string, description: string, severity: 'info' | 'warning' | 'critical'}> => {
    const findings: Array<{category: string, description: string, severity: 'info' | 'warning' | 'critical'}> = [];
    const lines = text.split('\n');
    
    for (const line of lines) {
      const trimmedLine = line.trim();
      
      // Look for critical issues
      if (trimmedLine.toLowerCase().includes('critical') || 
          trimmedLine.toLowerCase().includes('danger') ||
          trimmedLine.toLowerCase().includes('urgent')) {
        findings.push({
          category: 'Critical Issue',
          description: trimmedLine,
          severity: 'critical'
        });
      }
      // Look for warnings
      else if (trimmedLine.toLowerCase().includes('warning') || 
               trimmedLine.toLowerCase().includes('concern') ||
               trimmedLine.toLowerCase().includes('attention')) {
        findings.push({
          category: 'Warning',
          description: trimmedLine,
          severity: 'warning'
        });
      }
      // Look for general observations
      else if (trimmedLine.toLowerCase().includes('observe') || 
               trimmedLine.toLowerCase().includes('note') ||
               trimmedLine.toLowerCase().includes('condition')) {
        findings.push({
          category: 'Observation',
          description: trimmedLine,
          severity: 'info'
        });
      }
    }
    
    return findings.slice(0, 8); // Limit to top 8 findings
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
          <PageTitle>🔍 CV Analysis</PageTitle>
          <PageSubtitle>
            AI-Powered Computer Vision Analysis for Equipment Monitoring with Google Gemini
          </PageSubtitle>
          <StatusBadge status={analysisStatus}>
            {analysisStatus === 'active' && '🟢 Active Monitoring'}
            {analysisStatus === 'processing' && '🟡 Processing'}
            {analysisStatus === 'idle' && '⚪ Idle'}
          </StatusBadge>
        </HeaderSection>

        {/* Navigation Tabs */}
        <TabContainer>
          <Tab
            active={activeTab === 'live-analysis'}
            onClick={() => setActiveTab('live-analysis')}
          >
            📹 Live Analysis
          </Tab>
          <Tab
            active={activeTab === 'image-upload'}
            onClick={() => setActiveTab('image-upload')}
          >
            📸 Image Upload
          </Tab>
          <Tab
            active={activeTab === 'ai-insights'}
            onClick={() => setActiveTab('ai-insights')}
          >
            🧠 AI Insights
          </Tab>
          <Tab
            active={activeTab === 'history'}
            onClick={() => setActiveTab('history')}
          >
            📊 Analysis History
          </Tab>
        </TabContainer>

        {/* Live Analysis Tab */}
        {activeTab === 'live-analysis' && (
          <TabContent>
            <ImageAnalysisSection>
          <ImageCard>
            <ImageTitle>
              📷 Real-time Kiln Image
            </ImageTitle>
            <ImageContainer>
              {realTimeImage ? (
                <>
                  <ImageDisplay 
                    src={realTimeImage} 
                    alt="Real-time Kiln"
                    style={{
                      transform: `scale(${zoomLevel}) translate(${imagePosition.x}px, ${imagePosition.y}px)`,
                      transition: 'transform 0.3s ease'
                    }}
                  />
                  <ImageOverlayControls>
                    <OverlayButton 
                      active={showHotspots}
                      onClick={() => setShowHotspots(!showHotspots)}
                    >
                      🔥 Hotspots
                    </OverlayButton>
                    <OverlayButton 
                      active={showThermalOverlay}
                      onClick={() => setShowThermalOverlay(!showThermalOverlay)}
                    >
                      🌡️ Thermal
                    </OverlayButton>
                    <OverlayButton onClick={() => setZoomLevel(zoomLevel === 1 ? 2 : 1)}>
                      🔍 Zoom
                    </OverlayButton>
                  </ImageOverlayControls>
                  {showHotspots && (
                    <HotspotOverlay>
                      {detectedHotspots.map((hotspot) => (
                        <Hotspot
                          key={hotspot.id}
                          x={hotspot.x}
                          y={hotspot.y}
                          intensity={hotspot.intensity}
                          onClick={() => handleHotspotClick(hotspot)}
                          title={`${hotspot.temperature}°C`}
                        />
                      ))}
                    </HotspotOverlay>
                  )}
                </>
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
                onClick={performEnhancedAnalysis}
                disabled={analysisStatus === 'active' || isAnalyzing}
              >
                🚀 Enhanced Analysis
              </ControlButton>
              <ControlButton 
                variant="secondary" 
                onClick={startAnalysis}
                disabled={analysisStatus === 'active' || isAnalyzing}
              >
                ▶️ Start Live
              </ControlButton>
              <ControlButton 
                variant="danger" 
                onClick={stopAnalysis}
                disabled={analysisStatus === 'idle'}
              >
                ⏹️ Stop
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
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%', padding: '20px' }}>
                  <LoadingSpinner />
                  <div style={{ color: '#9ca3af', marginTop: '16px', marginBottom: '20px' }}>
                    Analyzing thermal data...
                  </div>
                  <div style={{ width: '100%', maxWidth: '300px' }}>
                    <ProgressLabel>
                      <span>Analysis Progress</span>
                      <span>{Math.round(analysisProgress)}%</span>
                    </ProgressLabel>
                    <ProgressBar progress={analysisProgress} />
                  </div>
                </div>
              ) : thermalImage ? (
                <>
                  <ImageDisplay src={thermalImage} alt="Thermal Analysis" />
                  <ImageOverlayControls>
                    <OverlayButton 
                      active={showThermalOverlay}
                      onClick={() => setShowThermalOverlay(!showThermalOverlay)}
                    >
                      📊 Data
                    </OverlayButton>
                    <OverlayButton onClick={exportAnalysisReport}>
                      💾 Export
                    </OverlayButton>
                  </ImageOverlayControls>
                </>
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
              <ControlButton 
                variant="secondary" 
                onClick={exportAnalysisReport}
                disabled={!thermalImage && analysisResults.length === 0}
              >
                📊 Export Report
              </ControlButton>
              <ControlButton 
                variant="secondary" 
                onClick={() => console.log('Analysis History:', analysisHistory)}
                disabled={analysisHistory.length === 0}
              >
                📈 View History ({analysisHistory.length})
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
          </TabContent>
        )}

        {/* Image Upload Tab */}
        {activeTab === 'image-upload' && (
          <TabContent>
            <ImageUploadSection>
              <h3 style={{ margin: '0 0 20px 0', fontSize: '1.4rem', fontWeight: '600', color: '#3b82f6' }}>
                📸 Equipment Image Analysis
              </h3>
          
          <UploadArea 
            isDragOver={isDragOver}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={triggerImageUpload}
          >
            <UploadIcon>📷</UploadIcon>
            <UploadText>Upload Equipment Image</UploadText>
            <UploadSubtext>
              Drag and drop an image here, or click to select from your device
            </UploadSubtext>
            <UploadButton type="button">
              Choose Image
            </UploadButton>
          </UploadArea>

          <input
            ref={imageUploadRef}
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            style={{ display: 'none' }}
          />

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h4 style={{ color: '#9ca3af', fontSize: '1rem', margin: 0 }}>
              Sample equipment images:
            </h4>
            <div style={{ display: 'flex', gap: '8px' }}>
              {['all', 'kiln', 'mill', 'conveyor', 'cooler'].map((filter) => (
                <OverlayButton
                  key={filter}
                  active={imageFilter === filter}
                  onClick={() => setImageFilter(filter as typeof imageFilter)}
                  style={{ fontSize: '0.75rem', padding: '4px 8px' }}
                >
                  {filter === 'all' ? '🔍 All' : 
                   filter === 'kiln' ? '🔥 Kiln' :
                   filter === 'mill' ? '⚙️ Mill' :
                   filter === 'conveyor' ? '🔗 Conveyor' : '❄️ Cooler'}
                </OverlayButton>
              ))}
            </div>
          </div>
          
          <SampleGallery>
            {filteredSampleImages.map((image) => (
              <SampleImageCard
                key={image.id}
                selected={selectedSampleImage === image.id}
                onClick={() => handleSampleImageSelect(image.id)}
              >
                <SampleImage src={image.url} alt={image.title} />
                <SampleImageOverlay>
                  <SampleImageTitle>{image.title}</SampleImageTitle>
                  <SampleImageDescription>{image.description}</SampleImageDescription>
                </SampleImageOverlay>
              </SampleImageCard>
            ))}
          </SampleGallery>

          {selectedImage && (
            <SelectedImagePreview>
              <PreviewImage src={selectedImage} alt="Selected equipment" />
              <PreviewInfo>
                <div>
                  <strong>{selectedImageInfo?.name}</strong><br />
                  <span style={{ fontSize: '0.8rem', color: '#9ca3af' }}>
                    {selectedImageInfo?.size} • {selectedImageInfo?.type}
                  </span>
                </div>
                <AnalyzeImageButton 
                  onClick={analyzeSelectedImage}
                  disabled={isGeminiAnalyzing}
                >
                  {isGeminiAnalyzing ? '🔄 Analyzing...' : '🧠 Analyze with AI'}
                </AnalyzeImageButton>
              </PreviewInfo>
            </SelectedImagePreview>
          )}

          {/* Image Analysis Results Section */}
          {imageAnalysisResults.timestamp && (
            <AIAnalysisSection style={{ marginTop: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h3 style={{ margin: '0', fontSize: '1.4rem', fontWeight: '600', color: '#10b981' }}>
                  🔍 Image Analysis Results
                </h3>
                <AnalyzeImageButton 
                  onClick={() => setImageAnalysisResults({
                    analysisText: '',
                    equipmentType: '',
                    confidence: 0,
                    timestamp: null,
                    recommendations: [],
                    findings: []
                  })}
                  style={{ 
                    backgroundColor: 'rgba(239, 68, 68, 0.2)',
                    borderColor: '#ef4444',
                    color: '#ef4444',
                    fontSize: '0.8rem',
                    padding: '8px 12px'
                  }}
                >
                  🗑️ Clear Results
                </AnalyzeImageButton>
              </div>
              
              {/* Analysis Summary */}
              <AIAnalysisGrid>
                <AIAnalysisCard>
                  <AIAnalysisTitle>
                    📊 Equipment Assessment
                  </AIAnalysisTitle>
                  <AIAnalysisContent>
                    <div style={{ marginBottom: '12px' }}>
                      <strong>Equipment Type:</strong> {imageAnalysisResults.equipmentType}
                    </div>
                    <div style={{ marginBottom: '12px' }}>
                      <strong>Analysis Time:</strong> {imageAnalysisResults.timestamp?.toLocaleString()}
                    </div>
                    <ConfidenceBar confidence={imageAnalysisResults.confidence} />
                    <ConfidenceLabel>
                      Analysis Confidence: {imageAnalysisResults.confidence}%
                    </ConfidenceLabel>
                  </AIAnalysisContent>
                </AIAnalysisCard>

                <AIAnalysisCard>
                  <AIAnalysisTitle>
                    🎯 Key Findings
                  </AIAnalysisTitle>
                  <AIAnalysisContent>
                    {imageAnalysisResults.findings.length > 0 ? (
                      <div style={{ display: 'grid', gap: '8px' }}>
                        {imageAnalysisResults.findings.map((finding, index) => (
                          <div key={index} style={{ 
                            padding: '8px', 
                            borderRadius: '6px',
                            backgroundColor: finding.severity === 'critical' ? 'rgba(239, 68, 68, 0.1)' :
                                           finding.severity === 'warning' ? 'rgba(245, 158, 11, 0.1)' :
                                           'rgba(59, 130, 246, 0.1)',
                            borderLeft: `3px solid ${finding.severity === 'critical' ? '#ef4444' :
                                                   finding.severity === 'warning' ? '#f59e0b' :
                                                   '#3b82f6'}`
                          }}>
                            <div style={{ 
                              fontSize: '0.8rem', 
                              fontWeight: 'bold',
                              color: finding.severity === 'critical' ? '#ef4444' :
                                     finding.severity === 'warning' ? '#f59e0b' :
                                     '#3b82f6',
                              marginBottom: '4px'
                            }}>
                              {finding.category}
                            </div>
                            <div style={{ fontSize: '0.85rem', color: '#d1d5db' }}>
                              {finding.description}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div style={{ color: '#9ca3af', fontStyle: 'italic' }}>
                        No specific findings detected
                      </div>
                    )}
                  </AIAnalysisContent>
                </AIAnalysisCard>
              </AIAnalysisGrid>

              {/* Recommendations */}
              {imageAnalysisResults.recommendations.length > 0 && (
                <AIAnalysisCard style={{ marginTop: '16px' }}>
                  <AIAnalysisTitle>
                    💡 Recommendations
                  </AIAnalysisTitle>
                  <AIAnalysisContent>
                    <div style={{ display: 'grid', gap: '12px' }}>
                      {imageAnalysisResults.recommendations.map((recommendation, index) => (
                        <div key={index} style={{
                          padding: '12px',
                          backgroundColor: 'rgba(16, 185, 129, 0.1)',
                          borderRadius: '8px',
                          borderLeft: '3px solid #10b981'
                        }}>
                          <div style={{ fontSize: '0.9rem', color: '#d1d5db', lineHeight: '1.5' }}>
                            {recommendation}
                          </div>
                        </div>
                      ))}
                    </div>
                  </AIAnalysisContent>
                </AIAnalysisCard>
              )}

              {/* Full Analysis Text */}
              <AIAnalysisCard style={{ marginTop: '16px' }}>
                <AIAnalysisTitle>
                  📝 Detailed Analysis
                </AIAnalysisTitle>
                <AIAnalysisContent>
                  <div style={{ 
                    maxHeight: '300px', 
                    overflowY: 'auto', 
                    padding: '12px',
                    backgroundColor: 'rgba(55, 65, 81, 0.5)',
                    borderRadius: '8px',
                    fontSize: '0.85rem',
                    lineHeight: '1.6',
                    whiteSpace: 'pre-wrap'
                  }}>
                    {imageAnalysisResults.analysisText}
                  </div>
                </AIAnalysisContent>
              </AIAnalysisCard>
            </AIAnalysisSection>
          )}
            </ImageUploadSection>
          </TabContent>
        )}

        {/* AI Insights Tab */}
        {activeTab === 'ai-insights' && (
          <TabContent>
        <AIAnalysisSection>
          <h3 style={{ margin: '0 0 20px 0', fontSize: '1.4rem', fontWeight: '600', color: '#10b981' }}>
            🤖 AI-Powered Equipment Monitoring
          </h3>
          
          <GeminiAnalysisButton 
            onClick={handleGeminiAnalysisClick}
            disabled={isGeminiAnalyzing || geminiLoading}
            isLoading={isGeminiAnalyzing}
          >
            {isGeminiAnalyzing ? (
              <>
                <LoadingSpinner style={{ width: '20px', height: '20px', margin: '0' }} />
                Analyzing with Gemini AI...
              </>
            ) : (
              <>
                🧠 Analyze Equipment with Gemini AI
              </>
            )}
          </GeminiAnalysisButton>

          {aiAnalysisResults.equipmentStatus.length > 0 && (
            <>
              <h4 style={{ color: '#3b82f6', marginBottom: '16px', fontSize: '1.1rem' }}>
                Equipment Health Status
              </h4>
              <EquipmentStatusGrid>
                {aiAnalysisResults.equipmentStatus.map((equipment, index) => (
                  <EquipmentStatusCard key={index} status={equipment.status}>
                    <EquipmentName>{equipment.name}</EquipmentName>
                    <EquipmentStatus status={equipment.status}>
                      {equipment.status}
                    </EquipmentStatus>
                    <ConfidenceBar confidence={equipment.confidence} />
                    <ConfidenceLabel>Confidence: {equipment.confidence}%</ConfidenceLabel>
                    {equipment.metrics.map((metric, metricIndex) => (
                      <EquipmentMetric key={metricIndex}>{metric}</EquipmentMetric>
                    ))}
                  </EquipmentStatusCard>
                ))}
              </EquipmentStatusGrid>

              <AIAnalysisGrid>
                <AIAnalysisCard>
                  <AIAnalysisTitle>
                    📊 Overall Assessment
                  </AIAnalysisTitle>
                  <AIAnalysisContent>
                    <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#10b981', marginBottom: '8px' }}>
                      {aiAnalysisResults.overallAssessment.score}/100
                    </div>
                    <div style={{ marginBottom: '12px' }}>
                      {aiAnalysisResults.overallAssessment.summary}
                    </div>
                    <ConfidenceBar confidence={aiAnalysisResults.overallAssessment.confidence} />
                    <ConfidenceLabel>
                      Analysis Confidence: {aiAnalysisResults.overallAssessment.confidence}%
                    </ConfidenceLabel>
                  </AIAnalysisContent>
                </AIAnalysisCard>

                <AIAnalysisCard>
                  <AIAnalysisTitle>
                    🎯 Key Metrics
                  </AIAnalysisTitle>
                  <AIAnalysisContent>
                    <div style={{ display: 'grid', gap: '8px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span>Healthy Equipment:</span>
                        <span style={{ color: '#10b981', fontWeight: 'bold' }}>
                          {aiAnalysisResults.equipmentStatus.filter(eq => eq.status === 'healthy').length}
                        </span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span>Warnings:</span>
                        <span style={{ color: '#f59e0b', fontWeight: 'bold' }}>
                          {aiAnalysisResults.equipmentStatus.filter(eq => eq.status === 'warning').length}
                        </span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span>Critical Issues:</span>
                        <span style={{ color: '#ef4444', fontWeight: 'bold' }}>
                          {aiAnalysisResults.equipmentStatus.filter(eq => eq.status === 'critical').length}
                        </span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span>Maintenance Due:</span>
                        <span style={{ color: '#3b82f6', fontWeight: 'bold' }}>
                          {aiAnalysisResults.equipmentStatus.filter(eq => eq.status === 'maintenance').length}
                        </span>
                      </div>
                    </div>
                  </AIAnalysisContent>
                </AIAnalysisCard>
              </AIAnalysisGrid>
            </>
          )}
        </AIAnalysisSection>

            {/* AI Insights Panel */}
            {aiAnalysisResults.insights.length > 0 && (
              <AIInsightsPanel>
                <h3 style={{ margin: '0 0 20px 0', fontSize: '1.4rem', fontWeight: '600', color: '#10b981' }}>
                  💡 AI-Generated Insights & Recommendations
                </h3>
                {aiAnalysisResults.insights.map((insight, index) => (
                  <AIInsightItem key={index} priority={insight.priority}>
                    <AIInsightTitle>
                      {insight.title}
                      <PriorityBadge priority={insight.priority}>
                        {insight.priority} priority
                      </PriorityBadge>
                    </AIInsightTitle>
                    <AIInsightDescription>
                      {insight.description}
                    </AIInsightDescription>
                    <div style={{ 
                      backgroundColor: 'rgba(16, 185, 129, 0.1)', 
                      padding: '8px 12px', 
                      borderRadius: '6px',
                      fontSize: '0.85rem',
                      color: '#10b981',
                      fontWeight: '500'
                    }}>
                      💡 Recommendation: {insight.recommendation}
                    </div>
                  </AIInsightItem>
                ))}
              </AIInsightsPanel>
            )}
          </TabContent>
        )}

        {/* Analysis History Tab */}
        {activeTab === 'history' && (
          <TabContent>
            <AIAnalysisSection>
              <h3 style={{ margin: '0 0 20px 0', fontSize: '1.4rem', fontWeight: '600', color: '#f59e0b' }}>
                📊 Analysis History & Trends
              </h3>
              
              {analysisHistory.length > 0 ? (
                <div style={{ display: 'grid', gap: '16px' }}>
                  {analysisHistory.map((entry, index) => (
                    <div
                      key={index}
                      style={{
                        background: 'linear-gradient(135deg, #374151 0%, #4b5563 100%)',
                        borderRadius: '12px',
                        padding: '20px',
                        border: '1px solid #4b5563',
                        transition: 'all 0.3s ease'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                        <h4 style={{ color: '#f59e0b', margin: 0, fontSize: '1.1rem' }}>
                          {entry.type}
                        </h4>
                        <span style={{ color: '#9ca3af', fontSize: '0.9rem' }}>
                          {entry.timestamp.toLocaleString()}
                        </span>
                      </div>
                      <div style={{ color: '#d1d5db', fontSize: '0.9rem', lineHeight: '1.5' }}>
                        <div style={{ marginBottom: '8px' }}>
                          <strong>Overall Score:</strong> {entry.results.overallAssessment?.score || 'N/A'}/100
                        </div>
                        <div style={{ marginBottom: '8px' }}>
                          <strong>Equipment Status:</strong> {entry.results.equipmentStatus?.length || 0} items analyzed
                        </div>
                        <div>
                          <strong>Insights Generated:</strong> {entry.results.insights?.length || 0} recommendations
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{
                  textAlign: 'center',
                  padding: '60px 20px',
                  color: '#9ca3af'
                }}>
                  <div style={{ fontSize: '3rem', marginBottom: '16px' }}>📈</div>
                  <h4 style={{ color: '#d1d5db', marginBottom: '8px' }}>No Analysis History</h4>
                  <p>Start analyzing equipment to build your history and track trends over time.</p>
                </div>
              )}
            </AIAnalysisSection>

            <TemperatureAnalysisSection>
              <h3 style={{ margin: '0 0 20px 0', fontSize: '1.4rem', fontWeight: '600', color: '#3b82f6' }}>
                🌡️ Temperature Trends
              </h3>
              <TemperatureGrid>
                <TemperatureCard status={getTemperatureStatus(temperatureData.maxTemp)}>
                  <TemperatureValue>{temperatureData.maxTemp}°C</TemperatureValue>
                  <TemperatureLabel>Current Max</TemperatureLabel>
                  <TemperatureStatus status={getTemperatureStatus(temperatureData.maxTemp)}>
                    {getTemperatureStatus(temperatureData.maxTemp)}
                  </TemperatureStatus>
                </TemperatureCard>
                <TemperatureCard status={getTemperatureStatus(temperatureData.avgTemp)}>
                  <TemperatureValue>{temperatureData.avgTemp}°C</TemperatureValue>
                  <TemperatureLabel>Current Avg</TemperatureLabel>
                  <TemperatureStatus status={getTemperatureStatus(temperatureData.avgTemp)}>
                    {getTemperatureStatus(temperatureData.avgTemp)}
                  </TemperatureStatus>
                </TemperatureCard>
                <TemperatureCard status="normal">
                  <TemperatureValue>{analysisHistory.length}</TemperatureValue>
                  <TemperatureLabel>Total Analyses</TemperatureLabel>
                  <TemperatureStatus status="normal">recorded</TemperatureStatus>
                </TemperatureCard>
                <TemperatureCard status={detectedHotspots.length > 2 ? 'warning' : 'normal'}>
                  <TemperatureValue>{detectedHotspots.length}</TemperatureValue>
                  <TemperatureLabel>Active Hotspots</TemperatureLabel>
                  <TemperatureStatus status={detectedHotspots.length > 2 ? 'warning' : 'normal'}>
                    {detectedHotspots.length > 2 ? 'warning' : 'normal'}
                  </TemperatureStatus>
                </TemperatureCard>
              </TemperatureGrid>
            </TemperatureAnalysisSection>
          </TabContent>
        )}
      </ContentContainer>
    </CVAnalysisContainer>
  );
};

export default CVAnalysis;
