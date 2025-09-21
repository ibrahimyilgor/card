
import React, { useState } from 'react';
import Login from './Login';
import Signup from './Signup';
import Info from './Info';
import { ThemeProvider } from '@mui/material/styles';
import theme from './theme';



function App() {
  const [page, setPage] = useState(() => {
    return localStorage.getItem('token') ? 'info' : 'login';
  });

  const handleLogin = () => {
    setPage('info');
  };
  const handleSignup = () => {
    setPage('login');
  };
  const handleLogout = () => {
    setPage('login');
  };

  return (
    <ThemeProvider theme={theme}>
      {page === 'login' && <Login onLogin={handleLogin} onSwitch={() => setPage('signup')} />}
      {page === 'signup' && <Signup onSignup={handleSignup} onSwitch={() => setPage('login')} />}
      {page === 'info' && <Info onLogout={handleLogout} />}
    </ThemeProvider>
  );
}

export default App;
