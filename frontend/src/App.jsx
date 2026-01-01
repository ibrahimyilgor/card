import React, { useState, useEffect, useCallback } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { getProfile } from './services/accountServices';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Info from './pages/Info';
import Stats from './pages/Stats';
import Settings from './pages/Settings';
import Game from './pages/Game';
import SessionExpired from './pages/SessionExpired';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { darkTheme, lightTheme } from './styles/theme';
import { I18nProvider } from './utils/i18n';
import Topbar from './components/Topbar';
import { Box } from '@mui/material';

import '@fontsource/inter/400.css';
import '@fontsource/inter/600.css';
import '@fontsource/inter/700.css';

// Page transition variants
const pageVariants = {
  initial: {
    opacity: 0,
    y: 8,
  },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.3,
      ease: [0.25, 0.46, 0.45, 0.94],
    },
  },
  exit: {
    opacity: 0,
    y: -8,
    transition: {
      duration: 0.2,
    },
  },
};

// Animated page wrapper
const AnimatedPage = ({ children }) => (
  <motion.div
    variants={pageVariants}
    initial="initial"
    animate="animate"
    exit="exit"
    style={{ height: '100%' }}
  >
    {children}
  </motion.div>
);

// Protected route wrapper
const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

// Layout component with Topbar
const MainLayout = ({ children, onLogout, themeMode }) => {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <Box
      sx={{
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: 'background.default',
        overflow: 'hidden',
      }}
    >
      <Box
        component={motion.div}
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.3, delay: 0.1 }}
        sx={{ flexShrink: 0 }}
      >
        <Topbar
          onLogout={onLogout}
          onSettings={() => navigate('/settings')}
          onMainPage={() => navigate('/')}
          onStats={() => navigate('/stats')}
          currentPath={location.pathname}
        />
      </Box>
      <Box
        sx={{
          flex: 1,
          overflow: 'auto',
          position: 'relative',
        }}
      >
        <AnimatePresence mode="wait">
          {children}
        </AnimatePresence>
      </Box>
    </Box>
  );
};

// App content component (uses hooks that need Router context)
const AppContent = () => {
  const [themeMode, setThemeMode] = useState(localStorage.getItem('theme') || 'dark');
  const [lang, setLang] = useState(null);
  const [accountId, setAccountId] = useState(() => localStorage.getItem('accountId') || null);
  const [isInitialized, setIsInitialized] = useState(false);
  
  const navigate = useNavigate();
  const location = useLocation();

  const currentTheme = themeMode === 'light' ? lightTheme : darkTheme;

  // Fetch user profile on mount if token exists
  useEffect(() => {
    const initializeApp = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const res = await getProfile();
          const data = res.data;
          if (data.profile) {
            if (data.profile.theme_preference) {
              const theme = data.profile.theme_preference === 'light' ? 'light' : 'dark';
              setThemeMode(theme);
              localStorage.setItem('theme', theme);
            }
            if (data.profile.language) {
              setLang(data.profile.language);
            }
            if (data.profile.account_id) {
              setAccountId(data.profile.account_id);
              localStorage.setItem('accountId', data.profile.account_id);
            }
          }
        } catch (err) {
          // Token might be invalid, redirect to login
          localStorage.removeItem('token');
          navigate('/login');
        }
      }
      setIsInitialized(true);
    };

    initializeApp();
  }, [navigate]);

  const handleLogin = useCallback(async () => {
    try {
      const res = await getProfile();
      const data = res.data;
      if (data.profile) {
        if (data.profile.theme_preference) {
          const theme = data.profile.theme_preference === 'light' ? 'light' : 'dark';
          setThemeMode(theme);
          localStorage.setItem('theme', theme);
        }
        if (data.profile.language) {
          setLang(data.profile.language);
        }
        if (data.profile.account_id) {
          setAccountId(data.profile.account_id);
          localStorage.setItem('accountId', data.profile.account_id);
        }
      }
    } catch (err) {
      // Continue anyway
    }
    navigate('/');
  }, [navigate]);

  const handleLogout = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('accountId');
    navigate('/login');
  }, [navigate]);

  const handleThemeChange = useCallback((mode) => {
    setThemeMode(mode);
    localStorage.setItem('theme', mode);
  }, []);

  // Determine if we should show the layout with Topbar
  const isAuthPage = ['/login', '/signup', '/session-expired'].includes(location.pathname);

  // Use dark theme for auth pages
  const activeTheme = isAuthPage ? darkTheme : currentTheme;

  return (
    <I18nProvider lang={lang} setLang={setLang}>
      <ThemeProvider theme={activeTheme}>
        <CssBaseline />
        {isAuthPage ? (
          <Box
            sx={{
              height: '100vh',
              backgroundColor: 'background.default',
              overflow: 'hidden',
            }}
          >
            <AnimatePresence mode="wait">
              <Routes location={location} key={location.pathname}>
                <Route
                  path="/login"
                  element={
                    <AnimatedPage>
                      <Login onLogin={handleLogin} onSwitch={() => navigate('/signup')} />
                    </AnimatedPage>
                  }
                />
                <Route
                  path="/signup"
                  element={
                    <AnimatedPage>
                      <Signup onSignup={() => navigate('/login')} onSwitch={() => navigate('/login')} />
                    </AnimatedPage>
                  }
                />
                <Route
                  path="/session-expired"
                  element={
                    <AnimatedPage>
                      <SessionExpired />
                    </AnimatedPage>
                  }
                />
              </Routes>
            </AnimatePresence>
          </Box>
        ) : (
          <MainLayout onLogout={handleLogout} themeMode={themeMode}>
            <Routes location={location} key={location.pathname}>
              <Route
                path="/"
                element={
                  <ProtectedRoute>
                    <AnimatedPage>
                      <Info
                        accountId={accountId}
                        onStartGame={(deckId, settings) => navigate(`/game/${deckId}`, { state: { settings } })}
                      />
                    </AnimatedPage>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/stats"
                element={
                  <ProtectedRoute>
                    <AnimatedPage>
                      <Stats accountId={accountId} />
                    </AnimatedPage>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/game/:deckId"
                element={
                  <ProtectedRoute>
                    <AnimatedPage>
                      <Game onBackToDecks={() => navigate('/')} />
                    </AnimatedPage>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/settings"
                element={
                  <ProtectedRoute>
                    <AnimatedPage>
                      <Settings
                        currentTheme={themeMode}
                        onThemeChange={handleThemeChange}
                        onMainPage={() => navigate('/')}
                        onLangChange={setLang}
                      />
                    </AnimatedPage>
                  </ProtectedRoute>
                }
              />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </MainLayout>
        )}
      </ThemeProvider>
    </I18nProvider>
  );
};

function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}

export default App;
