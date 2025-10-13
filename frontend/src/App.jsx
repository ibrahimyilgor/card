
import React, { useState } from 'react';
import Login from './Login';
import Signup from './Signup';
import Info from './Info';
import Settings from './Settings';
import { ThemeProvider } from '@mui/material/styles';
import theme from './theme';
import { I18nProvider } from './i18n';



function App() {
  const [page, setPage] = useState(() => {
    return localStorage.getItem('token') ? 'info' : 'login';
  });
  const [themeMode, setThemeMode] = useState('dark');
  const [lang, setLang] = useState(null);
  const [userId, setUserId] = useState(() => localStorage.getItem('userId') || null);

  // Fetch theme_preference and language after login
  const handleLogin = async () => {
    setPage('info');
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const res = await fetch(window.location.protocol + '//' + window.location.hostname + ':5000/user/profile', {
          headers: { 'Authorization': 'Bearer ' + token }
        });
        const data = await res.json();
        if (res.ok && data.profile) {
          if (data.profile.theme_preference) {
            setThemeMode(data.profile.theme_preference === 'light' ? 'light' : 'dark');
          }
          if (data.profile.language) {
            setLang(data.profile.language);
          }
          console.log("ibrahimdata", data.profile)
          if (data.profile.user_id) {
            setUserId(data.profile.user_id);
            localStorage.setItem('userId', data.profile.user_id);
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
    // Optionally: persist to backend
  };

  // Theme switching logic
  const darkThemeObj = {
    ...theme,
    palette: {
      ...theme.palette,
      mode: 'dark',
      background: {
        ...theme.palette.background,
        default: '#1d1d1f',
        paper: '#232326',
      },
      text: {
        ...theme.palette.text,
        primary: '#EEEEEE',
        secondary: '#1d1d1f',
      },
    },
  };
  const themeObj = {
    ...theme,
    palette: {
      ...theme.palette,
      mode: themeMode,
      background: {
        ...theme.palette.background,
        default: themeMode === 'dark' ? '#1d1d1f' : '#f5f5f5',
        paper: themeMode === 'dark' ? '#232326' : '#fff',
      },
      text: {
        ...theme.palette.text,
        primary: themeMode === 'dark' ? '#EEEEEE' : '#222',
        secondary: themeMode === 'dark' ? '#1d1d1f' : '#555',
      },
    },
  };

  return (
    <I18nProvider lang={lang} setLang={setLang}>
      <ThemeProvider theme={page === 'login' || page === 'signup' ? darkThemeObj : themeObj}>
        {page === 'login' && <Login onLogin={handleLogin} onSwitch={() => setPage('signup')} />}
        {page === 'signup' && <Signup onSignup={handleSignup} onSwitch={() => setPage('login')} />}
        {page === 'info' && <Info onLogout={handleLogout} onSettings={handleOpenSettings} userId={userId} />}
        {page === 'settings' && <Settings currentTheme={themeMode} onThemeChange={handleThemeChange} onMainPage={() => setPage('info')} onLangChange={setLang} onLogout={handleLogout} />}
      </ThemeProvider>
    </I18nProvider>
  );
}

export default App;
