
import React, { useState } from 'react';
import Login from './Login';
import Signup from './Signup';
import Info from './Info';
import Settings from './Settings';
import Game from './Game';
import { ThemeProvider } from '@mui/material/styles';
import {darkTheme, lightTheme} from './theme';
import { I18nProvider } from './i18n';
import Topbar from './Topbar';
import {  Box } from '@mui/material';



function App() {
  const [page, setPage] = useState(() => {
    return localStorage.getItem('token') ? 'info' : 'login';
  });
  const [themeMode, setThemeMode] = useState(localStorage.getItem('theme') || 'dark');
  const [lang, setLang] = useState(null);
  const [accountId, setAccountId] = useState(() => localStorage.getItem('accountId') || null);
  const [selectedDeckForGame, setSelectedDeckForGame] = useState(null);

  // Fetch theme_preference and language after login
  const handleLogin = async () => {
    setPage('info');
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const res = await fetch(window.location.protocol + '//' + window.location.hostname + ':5000/account/profile', {
          headers: { 'Authorization': 'Bearer ' + token }
        });
        const data = await res.json();
        if (res.ok && data.profile) {
          if (data.profile.theme_preference) {
            setThemeMode(data.profile.theme_preference === 'light' ? 'light' : 'dark');
            localStorage.setItem('theme', data.profile.theme_preference === 'light' ? 'light' : 'dark');
          }
          if (data.profile.language) {
            setLang(data.profile.language);
          }
          console.log("ibrahimdata", data.profile)
          if (data.profile.account_id) {
            setAccountId(data.profile.account_id);
            localStorage.setItem('accountId', data.profile.account_id);
          }
        }
      } catch (err) {
        // fallback: do nothing
      }
    }
  };

  const handleSignup = () => {
    setPage('login');
  };
  const handleLogout = () => {
    setPage('login');
  };
  const handleOpenSettings = () => {
    setPage('settings');
  };
  const handleThemeChange = (mode) => {
    setThemeMode(mode);
    localStorage.setItem('theme', mode);
  };



  const selectTheme = () => {
    if(['login', 'signup'].includes(page)) {
      return darkTheme;
    }
    if (themeMode === 'light') {
      return lightTheme;
    }
    return darkTheme;
  }

  return (
    <I18nProvider lang={lang} setLang={setLang}>
      <ThemeProvider theme={selectTheme()}>
        <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: selectTheme().palette.background.default }}>
          {!['login', 'signup'].includes(page) && (
            <>
              <Box sx={{ height: '1%' }} /> {/* Top margin */}
              <Box sx={{ height: '7%' }}>
                <Topbar onLogout={handleLogout} onSettings={handleOpenSettings} onMainPage={() => setPage('info')} />
              </Box>
              <Box sx={{ height: '1%' }} /> {/* Bottom margin */}
            </>
          )}
          <Box sx={{ height: ['login', 'signup'].includes(page) ? '100%' : '91%' }}>
            {page === 'login' && <Login onLogin={handleLogin} onSwitch={() => setPage('signup')} />}
            {page === 'signup' && <Signup onSignup={handleSignup} onSwitch={() => setPage('login')} />}
            {page === 'info' && (
              <Info 
                accountId={accountId} 
                onStartGame={(deckId) => {
                  setSelectedDeckForGame(deckId);
                  setPage('game');
                }}
              />
            )}
            {page === 'game' && <Game deckId={selectedDeckForGame} />}
            {page === 'settings' && <Settings onSettings={handleOpenSettings}  currentTheme={themeMode} onThemeChange={handleThemeChange} onMainPage={() => setPage('info')} onLangChange={setLang} />}
          </Box>
        </Box>
      </ThemeProvider>
    </I18nProvider>
  );
}

export default App;
