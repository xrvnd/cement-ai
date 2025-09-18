import { createGlobalStyle } from 'styled-components';
import { theme } from './theme';

export const GlobalStyles = createGlobalStyle`
  /* Import Professional Fonts */
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');
  @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700;800&display=swap');
  @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@300;400;500;600;700&display=swap');

  /* CSS Reset & Base Styles */
  *, *::before, *::after {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
  }

  html {
    font-size: 16px;
    line-height: 1.5;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    text-rendering: optimizeLegibility;
    scroll-behavior: smooth;
  }

  body {
    font-family: ${theme.typography.fontFamily.primary};
    font-weight: ${theme.typography.fontWeight.normal};
    color: ${theme.colors.text.primary};
    background: ${theme.colors.background.primary};
    line-height: ${theme.typography.lineHeight.normal};
    overflow-x: hidden;
    
    /* Prevent text selection on UI elements */
    -webkit-user-select: none;
    -moz-user-select: none;
    -ms-user-select: none;
    user-select: none;
  }

  /* Allow text selection in content areas */
  .selectable-text {
    -webkit-user-select: text;
    -moz-user-select: text;
    -ms-user-select: text;
    user-select: text;
  }

  /* Scrollbar Styling */
  ::-webkit-scrollbar {
    width: 8px;
    height: 8px;
  }

  ::-webkit-scrollbar-track {
    background: ${theme.colors.neutral[800]};
    border-radius: ${theme.borderRadius.base};
  }

  ::-webkit-scrollbar-thumb {
    background: linear-gradient(135deg, ${theme.colors.primary[600]}, ${theme.colors.primary[700]});
    border-radius: ${theme.borderRadius.base};
    border: 1px solid ${theme.colors.neutral[700]};
  }

  ::-webkit-scrollbar-thumb:hover {
    background: linear-gradient(135deg, ${theme.colors.primary[500]}, ${theme.colors.primary[600]});
  }

  /* Firefox Scrollbar */
  * {
    scrollbar-width: thin;
    scrollbar-color: ${theme.colors.primary[600]} ${theme.colors.neutral[800]};
  }

  /* Focus Styles */
  :focus {
    outline: 2px solid ${theme.colors.primary[500]};
    outline-offset: 2px;
  }

  :focus:not(:focus-visible) {
    outline: none;
  }

  /* Button Reset */
  button {
    font-family: inherit;
    font-size: inherit;
    line-height: inherit;
    color: inherit;
    background: transparent;
    border: none;
    cursor: pointer;
    padding: 0;
    margin: 0;
  }

  /* Input Reset */
  input, textarea, select {
    font-family: inherit;
    font-size: inherit;
    line-height: inherit;
    color: inherit;
    background: transparent;
    border: none;
    outline: none;
    padding: 0;
    margin: 0;
  }

  /* Link Reset */
  a {
    color: inherit;
    text-decoration: none;
  }

  /* List Reset */
  ul, ol {
    list-style: none;
  }

  /* Image Reset */
  img {
    max-width: 100%;
    height: auto;
    display: block;
  }

  /* Typography Utilities */
  .text-xs { font-size: ${theme.typography.fontSize.xs}; }
  .text-sm { font-size: ${theme.typography.fontSize.sm}; }
  .text-base { font-size: ${theme.typography.fontSize.base}; }
  .text-lg { font-size: ${theme.typography.fontSize.lg}; }
  .text-xl { font-size: ${theme.typography.fontSize.xl}; }
  .text-2xl { font-size: ${theme.typography.fontSize['2xl']}; }
  .text-3xl { font-size: ${theme.typography.fontSize['3xl']}; }
  .text-4xl { font-size: ${theme.typography.fontSize['4xl']}; }
  .text-5xl { font-size: ${theme.typography.fontSize['5xl']}; }

  .font-light { font-weight: ${theme.typography.fontWeight.light}; }
  .font-normal { font-weight: ${theme.typography.fontWeight.normal}; }
  .font-medium { font-weight: ${theme.typography.fontWeight.medium}; }
  .font-semibold { font-weight: ${theme.typography.fontWeight.semibold}; }
  .font-bold { font-weight: ${theme.typography.fontWeight.bold}; }
  .font-extrabold { font-weight: ${theme.typography.fontWeight.extrabold}; }

  .text-primary { color: ${theme.colors.text.primary}; }
  .text-secondary { color: ${theme.colors.text.secondary}; }
  .text-tertiary { color: ${theme.colors.text.tertiary}; }
  .text-muted { color: ${theme.colors.text.muted}; }

  /* Animation Utilities */
  .animate-fade-in {
    animation: fadeIn ${theme.animation.duration.normal} ${theme.animation.easing.default};
  }

  .animate-slide-up {
    animation: slideUp ${theme.animation.duration.normal} ${theme.animation.easing.default};
  }

  .animate-slide-down {
    animation: slideDown ${theme.animation.duration.normal} ${theme.animation.easing.default};
  }

  .animate-pulse {
    animation: pulse 2s ${theme.animation.easing.default} infinite;
  }

  .animate-glow {
    animation: glow 2s ${theme.animation.easing.default} infinite alternate;
  }

  /* Keyframe Animations */
  @keyframes fadeIn {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }

  @keyframes slideUp {
    from {
      opacity: 0;
      transform: translateY(20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  @keyframes slideDown {
    from {
      opacity: 0;
      transform: translateY(-20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  @keyframes pulse {
    0%, 100% {
      opacity: 1;
    }
    50% {
      opacity: 0.7;
    }
  }

  @keyframes glow {
    from {
      box-shadow: 0 0 20px ${theme.colors.primary[500]}40;
    }
    to {
      box-shadow: 0 0 30px ${theme.colors.primary[400]}60, 0 0 40px ${theme.colors.primary[500]}40;
    }
  }

  @keyframes rotate {
    from {
      transform: rotate(0deg);
    }
    to {
      transform: rotate(360deg);
    }
  }

  @keyframes bounce {
    0%, 20%, 53%, 80%, 100% {
      transform: translate3d(0, 0, 0);
    }
    40%, 43% {
      transform: translate3d(0, -30px, 0);
    }
    70% {
      transform: translate3d(0, -15px, 0);
    }
    90% {
      transform: translate3d(0, -4px, 0);
    }
  }

  /* Loading Spinner */
  .loading-spinner {
    width: 20px;
    height: 20px;
    border: 2px solid ${theme.colors.neutral[600]};
    border-top: 2px solid ${theme.colors.primary[500]};
    border-radius: 50%;
    animation: rotate 1s linear infinite;
  }

  /* Status Indicators */
  .status-dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    display: inline-block;
    margin-right: ${theme.spacing[2]};
  }

  .status-optimal { background: ${theme.colors.success[500]}; box-shadow: 0 0 8px ${theme.colors.success[500]}60; }
  .status-normal { background: ${theme.colors.primary[500]}; box-shadow: 0 0 8px ${theme.colors.primary[500]}60; }
  .status-warning { background: ${theme.colors.warning[500]}; box-shadow: 0 0 8px ${theme.colors.warning[500]}60; }
  .status-critical { background: ${theme.colors.error[500]}; box-shadow: 0 0 8px ${theme.colors.error[500]}60; }

  /* Utility Classes */
  .glass-effect {
    background: rgba(255, 255, 255, 0.05);
    backdrop-filter: blur(20px);
    border: 1px solid rgba(255, 255, 255, 0.1);
  }

  .gradient-border {
    position: relative;
    background: ${theme.colors.background.tertiary};
    
    &::before {
      content: '';
      position: absolute;
      inset: 0;
      padding: 1px;
      background: linear-gradient(135deg, ${theme.colors.primary[500]}, ${theme.colors.secondary[500]});
      border-radius: inherit;
      mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
      mask-composite: xor;
    }
  }

  .hover-lift {
    transition: transform ${theme.animation.duration.normal} ${theme.animation.easing.default};
    
    &:hover {
      transform: translateY(-2px);
    }
  }

  .hover-glow {
    transition: box-shadow ${theme.animation.duration.normal} ${theme.animation.easing.default};
    
    &:hover {
      box-shadow: ${theme.shadows.glow};
    }
  }

  /* Responsive Utilities */
  .container {
    width: 100%;
    margin: 0 auto;
    padding: 0 ${theme.spacing[4]};
    
    @media (min-width: ${theme.breakpoints.sm}) {
      max-width: 640px;
    }
    
    @media (min-width: ${theme.breakpoints.md}) {
      max-width: 768px;
    }
    
    @media (min-width: ${theme.breakpoints.lg}) {
      max-width: 1024px;
    }
    
    @media (min-width: ${theme.breakpoints.xl}) {
      max-width: 1280px;
    }
    
    @media (min-width: ${theme.breakpoints['2xl']}) {
      max-width: 1536px;
    }
  }

  /* Hide scrollbar but keep functionality */
  .hide-scrollbar {
    -ms-overflow-style: none;
    scrollbar-width: none;
    
    &::-webkit-scrollbar {
      display: none;
    }
  }

  /* Print Styles */
  @media print {
    * {
      background: white !important;
      color: black !important;
      box-shadow: none !important;
    }
    
    .no-print {
      display: none !important;
    }
  }

  /* High Contrast Mode Support */
  @media (prefers-contrast: high) {
    :root {
      --primary-color: #0066cc;
      --background-color: #000000;
      --text-color: #ffffff;
    }
  }

  /* Reduced Motion Support */
  @media (prefers-reduced-motion: reduce) {
    *,
    *::before,
    *::after {
      animation-duration: 0.01ms !important;
      animation-iteration-count: 1 !important;
      transition-duration: 0.01ms !important;
      scroll-behavior: auto !important;
    }
  }
`;
