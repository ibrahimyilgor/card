import React, { useContext, useState } from 'react';
import { keyframes } from '@mui/system';
import { AppBar, Toolbar, Typography, Box, IconButton, Popover, Button, useTheme } from '@mui/material';
import SettingsIcon from '@mui/icons-material/Settings';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import BarChartIcon from '@mui/icons-material/BarChart';
import { I18nContext } from './i18n';

export default function Topbar({ onLogout, onSettings, onMainPage= () => {} }) {
  const theme = useTheme();
  const { t } = useContext(I18nContext);
  
  const [anchorEl, setAnchorEl] = useState(null);
  const [clickedIcon, setClickedIcon] = useState(null);

  const handleProfileClick = (event) => {
    setAnchorEl(event.currentTarget);
    setClickedIcon('profile');
    setTimeout(() => setClickedIcon(null), 200);
  };
  const handlePopoverClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    if (onLogout) onLogout();
    setAnchorEl(null);
    setClickedIcon('logout');
    setTimeout(() => setClickedIcon(null), 200);
  };
  const open = Boolean(anchorEl);

  // Animations
  const fadeIn = keyframes`
    from { opacity: 0; transform: translateY(-10px) scale(0.98); }
    to { opacity: 1; transform: translateY(0) scale(1); }
  `;
  const iconClickAnim = keyframes`
    0% { transform: scale(1); }
    50% { transform: scale(1.2); }
    100% { transform: scale(1); }
  `;

  return (
    <AppBar position="static" elevation={0} sx={{ 
      backgroundColor: theme.palette.primary.light,
      color: theme.palette.text.contrastText,
      borderRadius: 3,
      height: '100%',
      // boxShadow: theme.shadows[4],
      border: `1.5px solid ${theme.palette.border.main}`,
      mx: 'auto',

      mb: 1,
      width: { xs: '95%', sm: '90%' },
      // maxWidth: 900,
      minWidth: 'auto',
      boxSizing: 'border-box',
      transition: 'background 0.3s',
      overflow: 'visible',
    }}>
      <Toolbar sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        px: { xs: 2, sm: 3 },
        py: 1,
        minHeight: 56,
        width: '100%',
        boxSizing: 'border-box',
      }}>
        <Typography
          variant="h6"
          sx={{
            fontWeight: 700,
            color: theme.palette.text.primary,
            letterSpacing: 1,
            transition: 'color 0.2s',
            cursor: 'pointer',
          }}
          onClick={onMainPage}
        >
          {t('card')}
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <IconButton
            sx={{
              mx: 1,
              color: theme.palette.text.primary,
              transition: 'color 0.2s, transform 0.2s',
              '&:hover': { color: theme.palette.primary.contrastText, transform: 'scale(1.1)' },
              animation: clickedIcon === 'settings' ? `${iconClickAnim} 0.2s` : undefined,
            }}
            onClick={() => { setClickedIcon('settings'); setTimeout(() => setClickedIcon(null), 200); onSettings(); }}
          >
            <SettingsIcon />
          </IconButton>
          <IconButton
            sx={{
              mx: 1,
              color: theme.palette.text.primary,
              transition: 'color 0.2s, transform 0.2s',
              '&:hover': { color: theme.palette.primary.contrastText, transform: 'scale(1.1)' },
              animation: clickedIcon === 'stats' ? `${iconClickAnim} 0.2s` : undefined,
            }}
            onClick={() => { setClickedIcon('stats'); setTimeout(() => setClickedIcon(null), 200); }}
          >
            <BarChartIcon />
          </IconButton>
          <IconButton
            sx={{
              mx: 1,
              color: theme.palette.text.primary,
              transition: 'color 0.2s, transform 0.2s',
              '&:hover': { color: theme.palette.primary.contrastText, transform: 'scale(1.1)' },
              animation: clickedIcon === 'profile' ? `${iconClickAnim} 0.2s` : undefined,
            }}
            onClick={handleProfileClick}
          >
            <AccountCircleIcon />
          </IconButton>
          <Popover
            open={open}
            anchorEl={anchorEl}
            onClose={handlePopoverClose}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            transformOrigin={{ vertical: 'top', horizontal: 'right' }}
            sx={{ mt: 1 }}
            PaperProps={{
              sx: {
                bgcolor: theme.palette.background.paper ?? theme.palette.primary.main2 ?? theme.palette.primary.main,
                color: theme.palette.text.primary,
                borderRadius: 2,
                boxShadow: '0 4px 16px 0 rgba(0,0,0,0.18)',
                p: 0,
                border: `1px solid ${theme.palette.border?.main ?? '#2e4f88ff'}`,
                animation: `${fadeIn} 0.3s`,
              }
            }}
          >
            <Box sx={{ p: 2, minWidth: 170, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600, color: theme.palette.text.primary, animation: `${fadeIn} 0.4s` }}>{t('profile')}</Typography>
              <Button
                variant="contained"
                sx={{
                  fontWeight: 700,
                  borderRadius: 1,
                  bgcolor: theme.palette.error.main,
                  color: theme.palette.primary.main,
                  boxShadow: '0 2px 8px #8a2c3a22',
                  transition: 'background 0.2s, transform 0.2s',
                  '&:hover': {
                    bgcolor: theme.palette.error.dark ?? '#8a2c3a',
                    transform: 'scale(1.05)',
                  },
                  animation: clickedIcon === 'logout' ? `${iconClickAnim} 0.2s` : undefined,
                }}
                onClick={handleLogout}
                fullWidth
              >
                {t('logout')}
              </Button>
            </Box>
          </Popover>
        </Box>
      </Toolbar>
    </AppBar>
  );
}
