// Professional Industrial Design System for Cement Plant Digital Twin
// Inspired by modern industrial control systems and enterprise software

export const theme = {
  // Primary Color Palette - Industrial Blue & Steel
  colors: {
    primary: {
      50: '#f0f9ff',   // Lightest blue
      100: '#e0f2fe',  // Very light blue
      200: '#bae6fd',  // Light blue
      300: '#7dd3fc',  // Medium light blue
      400: '#38bdf8',  // Medium blue
      500: '#0ea5e9',  // Primary blue
      600: '#0284c7',  // Dark blue
      700: '#0369a1',  // Darker blue
      800: '#075985',  // Very dark blue
      900: '#0c4a6e',  // Darkest blue
    },

    // Secondary Color Palette - Industrial Orange/Amber
    secondary: {
      50: '#fffbeb',
      100: '#fef3c7',
      200: '#fde68a',
      300: '#fcd34d',
      400: '#fbbf24',
      500: '#f59e0b',  // Primary orange
      600: '#d97706',
      700: '#b45309',
      800: '#92400e',
      900: '#78350f',
    },

    // Status Colors - Professional System
    success: {
      50: '#ecfdf5',
      100: '#d1fae5',
      200: '#a7f3d0',
      300: '#6ee7b7',
      400: '#34d399',
      500: '#10b981',  // Primary success
      600: '#059669',
      700: '#047857',
      800: '#065f46',
      900: '#064e3b',
    },

    warning: {
      50: '#fffbeb',
      100: '#fef3c7',
      200: '#fde68a',
      300: '#fcd34d',
      400: '#fbbf24',
      500: '#f59e0b',  // Primary warning
      600: '#d97706',
      700: '#b45309',
      800: '#92400e',
      900: '#78350f',
    },

    error: {
      50: '#fef2f2',
      100: '#fee2e2',
      200: '#fecaca',
      300: '#fca5a5',
      400: '#f87171',
      500: '#ef4444',  // Primary error
      600: '#dc2626',
      700: '#b91c1c',
      800: '#991b1b',
      900: '#7f1d1d',
    },

    // Neutral Colors - Industrial Gray Scale
    neutral: {
      50: '#f8fafc',   // Almost white
      100: '#f1f5f9',  // Very light gray
      200: '#e2e8f0',  // Light gray
      300: '#cbd5e1',  // Medium light gray
      400: '#94a3b8',  // Medium gray
      500: '#64748b',  // Base gray
      600: '#475569',  // Dark gray
      700: '#334155',  // Darker gray
      800: '#1e293b',  // Very dark gray
      900: '#0f172a',  // Almost black
    },

    // Background System - Enhanced Dark Theme with Better Contrast
    background: {
      primary: '#0a0f1c',      // Main background
      secondary: '#111827',     // Panel background
      tertiary: '#1f2937',     // Card background
      elevated: '#374151',     // Elevated elements
      overlay: 'rgba(17, 24, 39, 0.95)', // Modal overlay
      glass: 'rgba(31, 41, 55, 0.8)', // Glass morphism effect
      gradient: 'linear-gradient(135deg, #0a0f1c 0%, #1a1f2e 50%, #16213e 100%)',
    },

    // Text Colors - High Contrast
    text: {
      primary: '#f9fafb',      // Primary text (white)
      secondary: '#d1d5db',    // Secondary text (light gray)
      tertiary: '#9ca3af',     // Tertiary text (medium gray)
      muted: '#6b7280',        // Muted text (dark gray)
      inverse: '#111827',      // Inverse text (dark on light)
    },

    // Border Colors
    border: {
      primary: '#374151',      // Primary borders
      secondary: '#4b5563',    // Secondary borders
      accent: '#0ea5e9',       // Accent borders
      success: '#10b981',      // Success borders
      warning: '#f59e0b',      // Warning borders
      error: '#ef4444',        // Error borders
    },

    // Industrial Accent Colors - Enhanced Realism
    industrial: {
      steel: '#8b9dc3',        // Steel blue
      copper: '#b87333',       // Copper
      iron: '#a0522d',         // Iron oxide
      concrete: '#95a5a6',     // Concrete gray
      safety: '#ff6b35',       // Safety orange
      electric: '#00d4ff',     // Electric blue
      refractory: '#8B4513',   // Refractory brick
      insulation: '#F4A460',   // Insulation material
      hotMetal: '#FF4500',     // Hot metal glow
      burningZone: '#FF6B35',  // Burning zone temperature
      preheater: '#FFA500',    // Preheater temperature
      cooler: '#87CEEB',       // Cooler temperature
      ambient: '#E0E0E0',      // Ambient temperature
    }
  },

  // Typography System
  typography: {
    fontFamily: {
      primary: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif",
      mono: "'JetBrains Mono', 'Fira Code', 'Consolas', monospace",
      display: "'Poppins', -apple-system, BlinkMacSystemFont, sans-serif",
    },
    
    fontSize: {
      xs: '0.75rem',     // 12px
      sm: '0.875rem',    // 14px
      base: '1rem',      // 16px
      lg: '1.125rem',    // 18px
      xl: '1.25rem',     // 20px
      '2xl': '1.5rem',   // 24px
      '3xl': '1.875rem', // 30px
      '4xl': '2.25rem',  // 36px
      '5xl': '3rem',     // 48px
    },

    fontWeight: {
      light: 300,
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
      extrabold: 800,
    },

    lineHeight: {
      tight: 1.25,
      normal: 1.5,
      relaxed: 1.75,
    },
  },

  // Spacing System (8px grid)
  spacing: {
    0: '0',
    1: '0.25rem',   // 4px
    2: '0.5rem',    // 8px
    3: '0.75rem',   // 12px
    4: '1rem',      // 16px
    5: '1.25rem',   // 20px
    6: '1.5rem',    // 24px
    8: '2rem',      // 32px
    10: '2.5rem',   // 40px
    12: '3rem',     // 48px
    16: '4rem',     // 64px
    20: '5rem',     // 80px
    24: '6rem',     // 96px
  },

  // Border Radius
  borderRadius: {
    none: '0',
    sm: '0.25rem',    // 4px
    base: '0.375rem', // 6px
    md: '0.5rem',     // 8px
    lg: '0.75rem',    // 12px
    xl: '1rem',       // 16px
    '2xl': '1.5rem',  // 24px
    full: '9999px',
  },

  // Shadows - Industrial Design
  shadows: {
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    base: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
    xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
    inner: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)',
    glow: '0 0 20px rgba(14, 165, 233, 0.3)',
    glowSuccess: '0 0 20px rgba(16, 185, 129, 0.3)',
    glowWarning: '0 0 20px rgba(245, 158, 11, 0.3)',
    glowError: '0 0 20px rgba(239, 68, 68, 0.3)',
  },

  // Animation & Transitions
  animation: {
    duration: {
      fast: '150ms',
      normal: '300ms',
      slow: '500ms',
    },
    easing: {
      default: 'cubic-bezier(0.4, 0, 0.2, 1)',
      in: 'cubic-bezier(0.4, 0, 1, 1)',
      out: 'cubic-bezier(0, 0, 0.2, 1)',
      inOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
    },
  },

  // Breakpoints for Responsive Design
  breakpoints: {
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
    '2xl': '1536px',
  },

  // Z-Index Scale
  zIndex: {
    hide: -1,
    auto: 'auto',
    base: 0,
    docked: 10,
    dropdown: 1000,
    sticky: 1100,
    banner: 1200,
    overlay: 1300,
    modal: 1400,
    popover: 1500,
    skipLink: 1600,
    toast: 1700,
    tooltip: 1800,
  },
};

// Component-specific color schemes
export const componentThemes = {
  // Button variants
  button: {
    primary: {
      background: `linear-gradient(135deg, ${theme.colors.primary[500]} 0%, ${theme.colors.primary[600]} 100%)`,
      backgroundHover: `linear-gradient(135deg, ${theme.colors.primary[400]} 0%, ${theme.colors.primary[500]} 100%)`,
      text: theme.colors.text.primary,
      border: theme.colors.primary[500],
      shadow: theme.shadows.glow,
    },
    secondary: {
      background: `linear-gradient(135deg, ${theme.colors.neutral[700]} 0%, ${theme.colors.neutral[800]} 100%)`,
      backgroundHover: `linear-gradient(135deg, ${theme.colors.neutral[600]} 0%, ${theme.colors.neutral[700]} 100%)`,
      text: theme.colors.text.primary,
      border: theme.colors.border.secondary,
      shadow: theme.shadows.md,
    },
    success: {
      background: `linear-gradient(135deg, ${theme.colors.success[500]} 0%, ${theme.colors.success[600]} 100%)`,
      backgroundHover: `linear-gradient(135deg, ${theme.colors.success[400]} 0%, ${theme.colors.success[500]} 100%)`,
      text: theme.colors.text.primary,
      border: theme.colors.success[500],
      shadow: theme.shadows.glowSuccess,
    },
    warning: {
      background: `linear-gradient(135deg, ${theme.colors.warning[500]} 0%, ${theme.colors.warning[600]} 100%)`,
      backgroundHover: `linear-gradient(135deg, ${theme.colors.warning[400]} 0%, ${theme.colors.warning[500]} 100%)`,
      text: theme.colors.text.primary,
      border: theme.colors.warning[500],
      shadow: theme.shadows.glowWarning,
    },
    error: {
      background: `linear-gradient(135deg, ${theme.colors.error[500]} 0%, ${theme.colors.error[600]} 100%)`,
      backgroundHover: `linear-gradient(135deg, ${theme.colors.error[400]} 0%, ${theme.colors.error[500]} 100%)`,
      text: theme.colors.text.primary,
      border: theme.colors.error[500],
      shadow: theme.shadows.glowError,
    },
  },

  // Panel themes
  panel: {
    primary: {
      background: `linear-gradient(135deg, ${theme.colors.background.secondary} 0%, ${theme.colors.background.tertiary} 100%)`,
      border: theme.colors.border.primary,
      shadow: theme.shadows.xl,
    },
    elevated: {
      background: `linear-gradient(135deg, ${theme.colors.background.tertiary} 0%, ${theme.colors.background.elevated} 100%)`,
      border: theme.colors.border.accent,
      shadow: theme.shadows.glow,
    },
  },

  // Status indicators
  status: {
    optimal: {
      color: theme.colors.success[400],
      background: `${theme.colors.success[500]}20`,
      border: theme.colors.success[500],
    },
    normal: {
      color: theme.colors.primary[400],
      background: `${theme.colors.primary[500]}20`,
      border: theme.colors.primary[500],
    },
    warning: {
      color: theme.colors.warning[400],
      background: `${theme.colors.warning[500]}20`,
      border: theme.colors.warning[500],
    },
    critical: {
      color: theme.colors.error[400],
      background: `${theme.colors.error[500]}20`,
      border: theme.colors.error[500],
    },
  },
};

export type Theme = typeof theme;
export type ComponentThemes = typeof componentThemes;
