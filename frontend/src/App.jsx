import React, { useState } from 'react';
import Login from './Login';
import Signup from './Signup';
import Info from './Info';

function App() {
  const [page, setPage] = useState('login');
  const [username, setUsername] = useState('');

  const handleLogin = (user) => {
    setUsername(user);
    setPage('info');
  };
  const handleSignup = (user) => {
    setPage('login');
  };
  const handleLogout = () => {
    setUsername('');
    setPage('login');
  };

  if (page === 'login') {
    return <Login onLogin={handleLogin} onSwitch={() => setPage('signup')} />;
  }
  if (page === 'signup') {
    return <Signup onSignup={handleSignup} onSwitch={() => setPage('login')} />;
  }
  if (page === 'info') {
    return <Info username={username} onLogout={handleLogout} />;
  }
  return null;
}

export default App;
