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
        main: '#6FA4AF',
        light: '#8FB8C1',
        dark: '#5B8A94',
        contrastText: '#F4E9D7'
      },
      secondary: { 
        main: '#D97D55',
        light: '#E19676',
        dark: '#B66744',
        contrastText: '#F4E9D7'
      },
      error: { 
        main: '#D97D55',
        light: '#E19676',
        dark: '#B66744'
      },
      background: {
        default: '#1d1d1f',
        paper: '#232326',
        gradient: 'linear-gradient(135deg, #1d1d1f 0%, #232326 100%)'
      },
      text: {
        primary: '#EFECE3',
        secondary: '#8FABD4',
        gray: '#D97D55'
      },
      border: {
        main: 'rgba(111, 164, 175, 0.2)'
      }
    },
    shadows: [
      "none",
      "0px 2px 8px 0px rgba(0,0,0,0.2)",
      "0px 4px 16px 0px rgba(0,0,0,0.3)",
      "0px 8px 32px 0px rgba(0,0,0,0.4)",
      "0px 12px 48px 0px rgba(0,0,0,0.5)",
      ...Array(20).fill("none")
    ]
  },
  light: {
    palette: {
      mode: 'light',
      primary: { 
        main: '#6FA4AF',
        light: '#8FB8C1',
        dark: '#5B8A94',
        contrastText: '#232326'
      },
      secondary: { 
        main: '#D97D55',
        light: '#E19676',
        dark: '#B66744',
        contrastText: '#232326'
      },
      error: { 
        main: '#D97D55',
        light: '#E19676',
        dark: '#B66744'
      },
      background: {
        default: '#F4E9D7',
        paper: '#FFFFFF',
        gradient: 'linear-gradient(135deg, #F4E9D7 0%, #FFFFFF 100%)'
      },
      text: {
        primary: '#232326',
        secondary: '#4A70A9',
        gray: '#B66744'
      },
      border: {
        main: 'rgba(74, 112, 169, 0.2)'
      }
    },
    shadows: [
      "none",
      "0px 2px 8px 0px rgba(0,0,0,0.05)",
      "0px 4px 16px 0px rgba(0,0,0,0.1)",
      "0px 8px 32px 0px rgba(0,0,0,0.15)",
      "0px 12px 48px 0px rgba(0,0,0,0.2)",
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
