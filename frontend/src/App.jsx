import React, { useState } from 'react';
import Login from './Login';
import Signup from './Signup';
import Info from './Info';


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

  if (page === 'login') {
    return <Login onLogin={handleLogin} onSwitch={() => setPage('signup')} />;
  }
  if (page === 'signup') {
    return <Signup onSignup={handleSignup} onSwitch={() => setPage('login')} />;
  }
  if (page === 'info') {
    return <Info onLogout={handleLogout} />;
  }
  return null;
}

export default App;
