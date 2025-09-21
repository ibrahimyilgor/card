import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    primary: { main: '#EEEEEE', main2: '#EEEEEEDD' },
    secondary: { main: '#2e4f88ff' },
    error: { main: '#AE445A' },
    background: { default: '#1d1d1f',

     },
     text: {
        primary: '#EEEEEE',
        secondary: '#1d1d1f',
        gray: "#AAAAAA"
    },
    border: {
        main: 'hsla(220, 20%, 25%, 0.6)'
    }
  },
  typography: {
    fontFamily: 'Inter, Roboto, Arial, sans-serif'
  },
  shape: {
    borderRadius: 4
  },
 
});

export default theme;
