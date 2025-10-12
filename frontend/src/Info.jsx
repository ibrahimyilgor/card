
import React, { useState } from 'react';
import { Box, Typography, AppBar, Toolbar, IconButton, useTheme, Popover, Button } from '@mui/material';
import SettingsIcon from '@mui/icons-material/Settings';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import BarChartIcon from '@mui/icons-material/BarChart';

export default function Info({ onLogout }) {
  const theme = useTheme();
  const [anchorEl, setAnchorEl] = useState(null);

  const handleProfileClick = (event) => {
    setAnchorEl(event.currentTarget);
  };
  const handlePopoverClose = () => {
    setAnchorEl(null);
  };
  const handleLogout = () => {
    localStorage.removeItem('token');
    if (onLogout) onLogout();
    setAnchorEl(null);
  };
  const open = Boolean(anchorEl);

  return (
    <Box sx={{ minHeight: '100vh', width: '100vw', bgcolor: theme.palette.background.default, p: 0 }}>
      <AppBar position="static" elevation={1} sx={{ bgcolor: theme.palette.background.default, color: theme.palette.text.primary }}>
        <Toolbar sx={{ display: 'flex', justifyContent: 'space-between' }}>
          <Typography variant="h6" sx={{ fontWeight: 700, color: theme.palette.text.primary }}>
            Card
          </Typography>
          <Box>
            <IconButton sx={{ mx: 1, color: theme.palette.text.primary }}>
              <SettingsIcon />
            </IconButton>
            <IconButton sx={{ mx: 1, color: theme.palette.text.primary }}>
              <BarChartIcon />
            </IconButton>
            <IconButton sx={{ mx: 1, color: theme.palette.text.primary }} onClick={handleProfileClick}>
              <AccountCircleIcon />
            </IconButton>
            <Popover
              open={open}
              anchorEl={anchorEl}
              onClose={handlePopoverClose}
              anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
              transformOrigin={{ vertical: 'top', horizontal: 'right' }}
              PaperProps={{
                sx: {
                  bgcolor: theme.palette.background.paper ?? theme.palette.primary.main2 ?? theme.palette.primary.main,
                  color: theme.palette.text.primary,
                  borderRadius: 2,
                  boxShadow: '0 4px 16px 0 rgba(0,0,0,0.18)',
                  p: 0,
                  border: `1px solid ${theme.palette.border?.main ?? '#2e4f88ff'}`,
                }
              }}
            >
              <Box sx={{ p: 2, minWidth: 170, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600, color: theme.palette.text.primary }}>Profile</Typography>
                <Button
                  variant="contained"
                  sx={{
                    fontWeight: 700,
                    borderRadius: 1,
                    bgcolor: theme.palette.error.main,
                    color: theme.palette.primary.main,
                    '&:hover': {
                      bgcolor: theme.palette.error.dark ?? '#8a2c3a',
                    },
                  }}
                  onClick={handleLogout}
                  fullWidth
                >
                  Logout
                </Button>
              </Box>
            </Popover>
          </Box>
        </Toolbar>
      </AppBar>
    </Box>
  );
}
