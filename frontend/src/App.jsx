import React, { useState } from 'react';
import { getProfile } from './services/accountServices';
import Login from './Login';
import Signup from './Signup';
import Info from './Info';
import Settings from './Settings';
import Game from './Game';
import SessionExpired from './SessionExpired';
import { ThemeProvider } from '@mui/material/styles';
import {darkTheme, lightTheme} from './theme';
import { I18nProvider } from './i18n';
import Topbar from './Topbar';
import {  Box } from '@mui/material';



function App() {
  const [page, setPage] = useState(() => {
    if (window.location.pathname === '/session-expired') return 'session-expired';
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
    const accountId = localStorage.getItem('accountId');
    if (token) {
      try {
        const res = await getProfile(accountId);
        const data = res.data;
        if (data.profile) {
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
          {!['login', 'signup', 'session-expired'].includes(page) && (
            <>
              <Box sx={{ height: '1%' }} /> {/* Top margin */}
              <Box sx={{ height: '7%' }}>
                <Topbar onLogout={handleLogout} onSettings={handleOpenSettings} onMainPage={() => setPage('info')} />
              </Box>
              <Box sx={{ height: '1%' }} /> {/* Bottom margin */}
            </>
          )}
          <Box sx={{ height: ['login', 'signup', 'session-expired'].includes(page) ? '100%' : '91%' }}>
            {page === 'login' && <Login onLogin={handleLogin} onSwitch={() => setPage('signup')} />}
            {page === 'signup' && <Signup onSignup={handleSignup} onSwitch={() => setPage('login')} />}
            {page === 'session-expired' && <SessionExpired />}
            {page === 'info' && (
              <Info 
                accountId={accountId} 
                onStartGame={(deckId) => {
                  setSelectedDeckForGame(deckId);
                  setPage('game');
                }}
              />
            )}
            {page === 'game' && <Game deckId={selectedDeckForGame} onBackToDecks={() => setPage('info')} />}
            {page === 'settings' && <Settings onSettings={handleOpenSettings}  currentTheme={themeMode} onThemeChange={handleThemeChange} onMainPage={() => setPage('info')} onLangChange={setLang} />}
          </Box>
        </Box>
      </ThemeProvider>
    </I18nProvider>
  );
}

export default App;
