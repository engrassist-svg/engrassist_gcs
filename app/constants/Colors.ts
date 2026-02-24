/**
 * EngrAssist Color Theme
 * 
 * Brand colors derived from the existing website (navy + gold) and
 * the Rork prototype's dark theme. These are used throughout the app
 * for consistency.
 */

export const Colors = {
  // Primary brand colors
  primary: '#d4a843',        // Gold accent (buttons, active states, highlights)
  primaryDark: '#b8922e',    // Darker gold for pressed states
  primaryLight: '#e8c76a',   // Lighter gold for subtle accents

  // Background layers (dark theme)
  background: '#0a1628',     // Deepest background (main screen bg)
  surface: '#0f2040',        // Card backgrounds, elevated surfaces
  surfaceLight: '#1a3055',   // Lighter surface for nested elements
  surfaceBorder: '#1e3a60',  // Card borders, dividers

  // Text colors
  textPrimary: '#ffffff',    // Primary text on dark backgrounds
  textSecondary: '#8899b0',  // Secondary/muted text
  textTertiary: '#5a6a80',   // Disabled or hint text
  textOnPrimary: '#0a1628',  // Text on gold/primary buttons

  // Discipline accent colors (matching Rork screenshots)
  mechanical: '#3b82f6',     // Blue for mechanical/HVAC
  electrical: '#f59e0b',     // Amber/orange for electrical
  plumbing: '#10b981',       // Green for plumbing

  // Status colors
  available: '#10b981',      // Green - tool is ready
  comingSoon: '#6b7280',     // Gray - tool coming soon
  error: '#ef4444',          // Red for errors
  warning: '#f59e0b',        // Amber for warnings
  info: '#3b82f6',           // Blue for info

  // UI element colors
  tabBarBackground: '#0a1628',
  tabBarBorder: '#1e3a60',
  tabBarActive: '#d4a843',
  tabBarInactive: '#5a6a80',
  inputBackground: '#1a3055',
  inputBorder: '#2a4570',
  inputFocusBorder: '#d4a843',
  badgeBackground: 'rgba(212, 168, 67, 0.15)',
  badgeText: '#d4a843',

  // Gradient pairs for cards
  cardGradientStart: '#0f2040',
  cardGradientEnd: '#1a3055',
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
};

export const BorderRadius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  full: 9999,
};

export const FontSizes = {
  xs: 11,
  sm: 13,
  md: 15,
  lg: 17,
  xl: 20,
  xxl: 24,
  xxxl: 32,
  hero: 40,
};

export default { Colors, Spacing, BorderRadius, FontSizes };
