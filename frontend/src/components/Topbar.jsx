import React, { useContext, useState } from 'react';
import { keyframes } from '@mui/system';
import { AppBar, Toolbar, Typography, Box, IconButton, Popover, Button, useTheme } from '@mui/material';
import SettingsIcon from '@mui/icons-material/Settings';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import BarChartIcon from '@mui/icons-material/BarChart';
import { I18nContext } from '../utils/i18n';

export default function Topbar({ onLogout, onSettings, onMainPage= () => {}, onStats }) {
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
      backgroundColor: theme.palette.primary.paper ?? theme.palette.primary.main,
      color: theme.palette.text.contrastText,
      borderTopLeftRadius: 12,
      borderTopRightRadius: 12,
      borderBottomLeftRadius: 0,
      borderBottomRightRadius: 0,
      height: '100%',
      // boxShadow: theme.shadows[4],
      // border: `1.5px solid ${theme.palette.border.main}`,
      mx: 'auto',

      mb: 1,
      width: '95%',
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
            color: theme.palette.primary.contrastText,
            letterSpacing: 1,
            transition: 'color 0.2s',
            cursor: 'pointer',
            fontFamily: theme.typography.fontFamily
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
            onClick={() => { setClickedIcon('stats'); setTimeout(() => setClickedIcon(null), 200); if (onStats) onStats(); }}
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
                bgcolor: theme.palette.background.paper,
                color: theme.palette.text.cardTitle,
                borderRadius: 2.5,
                boxShadow: theme.shadows[2],
                p: 0,
                border: `1.5px solid ${theme.palette.border.main}`,
                animation: `${fadeIn} 0.3s`,
                minWidth: 200,
              }
            }}
          >
            <Box sx={{ p: 3, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
              <Typography
                variant="subtitle1"
                sx={{
                  mb: 1,
                  fontWeight: 700,
                  color: theme.palette.text.cardTitle,
                  fontSize: 18,
                  letterSpacing: 0.3,
                  animation: `${fadeIn} 0.4s`,
                }}
              >
                {t('profile')}
              </Typography>
              <Button
                variant="contained"
                sx={{
                  fontWeight: 700,
                  borderRadius: 2,
                  bgcolor: theme.palette.error.main,
                  color: theme.palette.secondary.contrastText,
                  boxShadow: theme.shadows[1],
                  fontSize: 15,
                  py: 1.2,
                  px: 2,
                  letterSpacing: 0.2,
                  transition: 'background 0.2s, transform 0.2s',
                  '&:hover': {
                    bgcolor: theme.palette.error.dark,
                    color: theme.palette.secondary.contrastText,
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
