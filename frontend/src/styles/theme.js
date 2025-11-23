import { createTheme } from '@mui/material/styles';

const theme = {
  common: {
    typography: {
      fontFamily: 'Inter, Roboto, Arial, sans-serif',
      fontWeightBold: 700,
      fontWeightMedium: 600,
      fontWeightRegular: 400,
    },
    shape: {
      borderRadius: 3
    }
  },
  dark: {
    palette: {
      mode: 'dark',
      primary: {
        main: '#161b22',
        light: '#3b82f6', // Accent Blue
        dark: '#1e40af',
        contrastText: '#e5e7eb' // Header text
      },
      secondary: {
        main: '#3b82f6', // Accent
        light: '#60a5fa', // Icon blue
        dark: '#1e40af',
        contrastText: '#e5e7eb'
      },
      error: {
        main: '#dc2626', // Soft red
        light: '#f87171',
        dark: '#991b1b'
      },
      background: {
        default: '#0b0f14', // Page background
        paper: '#111827', // Card background
        gradient: 'linear-gradient(135deg, #0b0f14 0%, #e5e7eb 100%)'
      },
      text: {
        primary: '#e5e7eb', // Header text
        secondary: '#93c5fd', // Icon text
        cardTitle: '#f1f5f9', // Card title
        cardSubtitle: '#94a3b8', // Card subtitle
      },
      border: {
        main: 'rgba(37, 99, 235, 0.12)'
      },
      action: {
        edit: '#60a5fa',
        play: '#3b82f6',
        delete: '#dc2626',
        icon: '#93c5fd',
        hover: '#2563eb',
        newDeckBg: '#1f2937',
        newDeckText: '#e2e8f0',
        newDeckIcon: '#93c5fd',
        newDeckHover: '#374151',
        shadow: '0px 2px 8px 0px rgba(0,0,0,0.04)'
      }
    },
    shadows: [
      "none",
      "0px 2px 8px 0px rgba(0,0,0,0.04)",
      "0px 4px 16px 0px rgba(0,0,0,0.08)",
      "0px 8px 32px 0px rgba(0,0,0,0.12)",
      "0px 12px 48px 0px rgba(0,0,0,0.16)",
      ...Array(20).fill("none")
    ]
  },
  light: {
    palette: {
      mode: 'light',
      primary: {
        main: '#2563eb',
        light: '#3b82f6',
        dark: '#1e40af',
        contrastText: '#e5e7eb'
      },
      secondary: {
        main: '#3b82f6',
        light: '#60a5fa',
        dark: '#1e40af',
        contrastText: '#e5e7eb'
      },
      error: {
        main: '#dc2626',
        light: '#f87171',
        dark: '#991b1b'
      },
      background: {
        default: '#f8fafc', // Off-white
        paper: '#ffffff', // Card background
        gradient: 'linear-gradient(135deg, #f8fafc 0%, #ffffff 100%)'
      },
      text: {
        primary: '#e5e7eb', // Header text
        secondary: '#2563eb', // Icon text
        cardTitle: '#1e293b', // Card title
        cardSubtitle: '#64748b', // Card subtitle
      },
      border: {
        main: 'rgba(37, 99, 235, 0.12)'
      },
      action: {
        edit: '#2563eb',
        play: '#2563eb',
        delete: '#dc2626',
        icon: '#3b82f6',
        hover: '#2563eb',
        newDeckBg: '#1f2937',
        newDeckText: '#e2e8f0',
        newDeckIcon: '#93c5fd',
        newDeckHover: '#374151',
        shadow: '0px 2px 8px 0px rgba(0,0,0,0.04)'
      }
    },
    shadows: [
      "none",
      "0px 2px 8px 0px rgba(0,0,0,0.04)",
      "0px 4px 16px 0px rgba(0,0,0,0.08)",
      "0px 8px 32px 0px rgba(0,0,0,0.12)",
      "0px 12px 48px 0px rgba(0,0,0,0.16)",
      ...Array(20).fill("none")
    ]
  }
};

const createCustomTheme = (mode) => {
  return createTheme({
    ...theme.common,
    ...theme[mode],
  });
};

export const darkTheme = createCustomTheme('dark');
export const lightTheme = createCustomTheme('light');
