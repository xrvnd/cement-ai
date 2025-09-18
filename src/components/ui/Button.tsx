import React from 'react';
import styled from 'styled-components';
import { theme, componentThemes } from '../../styles/theme';

interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'error';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
  children: React.ReactNode;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
  className?: string;
}

const StyledButton = styled.button<ButtonProps>`
  /* Base styles */
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: ${theme.spacing[2]};
  border: none;
  border-radius: ${theme.borderRadius.lg};
  font-family: ${theme.typography.fontFamily.primary};
  font-weight: ${theme.typography.fontWeight.semibold};
  cursor: pointer;
  transition: all ${theme.animation.duration.normal} ${theme.animation.easing.default};
  position: relative;
  overflow: hidden;
  text-decoration: none;
  white-space: nowrap;
  user-select: none;
  
  /* Size variants */
  ${props => {
    switch (props.size) {
      case 'sm':
        return `
          padding: ${theme.spacing[2]} ${theme.spacing[4]};
          font-size: ${theme.typography.fontSize.sm};
          min-height: 32px;
        `;
      case 'lg':
        return `
          padding: ${theme.spacing[4]} ${theme.spacing[8]};
          font-size: ${theme.typography.fontSize.lg};
          min-height: 48px;
        `;
      default:
        return `
          padding: ${theme.spacing[3]} ${theme.spacing[6]};
          font-size: ${theme.typography.fontSize.base};
          min-height: 40px;
        `;
    }
  }}
  
  /* Color variants */
  ${props => {
    const variant = props.variant || 'primary';
    const colors = componentThemes.button[variant];
    
    return `
      background: ${colors.background};
      color: ${colors.text};
      border: 2px solid ${colors.border};
      box-shadow: ${colors.shadow};
      
      &:hover:not(:disabled) {
        background: ${colors.backgroundHover};
        transform: translateY(-2px);
        box-shadow: ${colors.shadow}, 0 8px 25px rgba(0, 0, 0, 0.15);
      }
      
      &:active:not(:disabled) {
        transform: translateY(0);
      }
    `;
  }}
  
  /* Full width */
  ${props => props.fullWidth && `
    width: 100%;
  `}
  
  /* Disabled state */
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none !important;
    box-shadow: none !important;
  }
  
  /* Loading state */
  ${props => props.loading && `
    cursor: wait;
    
    &::after {
      content: '';
      position: absolute;
      width: 16px;
      height: 16px;
      margin: auto;
      border: 2px solid transparent;
      border-top-color: currentColor;
      border-radius: 50%;
      animation: rotate 1s linear infinite;
    }
  `}
  
  /* Shine effect on hover */
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(
      90deg,
      transparent,
      rgba(255, 255, 255, 0.2),
      transparent
    );
    transition: left ${theme.animation.duration.slow} ${theme.animation.easing.default};
  }
  
  &:hover::before {
    left: 100%;
  }
  
  @keyframes rotate {
    from {
      transform: rotate(0deg);
    }
    to {
      transform: rotate(360deg);
    }
  }
`;

const LoadingSpinner = styled.div`
  width: 16px;
  height: 16px;
  border: 2px solid currentColor;
  border-top: 2px solid transparent;
  border-radius: 50%;
  animation: rotate 1s linear infinite;
`;

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  fullWidth = false,
  children,
  onClick,
  type = 'button',
  className,
  ...props
}) => {
  return (
    <StyledButton
      variant={variant}
      size={size}
      disabled={disabled || loading}
      loading={loading}
      fullWidth={fullWidth}
      onClick={onClick}
      type={type}
      className={className}
      {...props}
    >
      {loading && <LoadingSpinner />}
      {!loading && children}
    </StyledButton>
  );
};

export default Button;
