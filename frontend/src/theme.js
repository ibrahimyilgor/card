import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    primary: { 
      main: '#6FA4AF', // Ana mavi ton
      light: '#8FB8C1', // Açık mavi
      dark: '#5B8A94', // Koyu mavi
      contrastText: '#F4E9D7' // Krem rengi metin
    },
    secondary: { 
      main: '#D97D55', // Turuncu
      light: '#E19676', // Açık turuncu
      dark: '#B66744', // Koyu turuncu
      contrastText: '#F4E9D7' // Krem rengi
    },
    error: { 
      main: '#D97D55', // Turuncu hata rengi
      light: '#E19676',
      dark: '#B66744'
    },
    background: {
      default: 'linear-gradient(135deg, #B8C4A9 0%, #6FA4AF 100%)', // Yeşilden maviye gradyan
      paper: '#F4E9D7', // Krem rengi arka plan
    },
    text: {
      primary: '#6FA4AF', // Mavi metin
      secondary: '#B8C4A9', // Yeşil ikincil metin
      gray: '#D97D55', // Turuncu gri
    },
    border: {
      main: 'rgba(111, 164, 175, 0.2)' // Yarı saydam mavi (#6FA4AF)
    }
  },
  typography: {
    fontFamily: 'Inter, Roboto, Arial, sans-serif',
    fontWeightBold: 700,
    fontWeightMedium: 600,
    fontWeightRegular: 400,
  },
  shape: {
    borderRadius: 3
  },
  shadows: [
    "none",
    "0px 2px 8px 0px #23232622",
    "0px 4px 16px 0px #23232644",
    "0px 8px 32px 0px #23232666",
    "0px 12px 48px 0px #23232688",
    ...Array(20).fill("none")
  ],
});

export default theme;
