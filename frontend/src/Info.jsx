
import React from 'react';
import { Box, Typography, useTheme } from '@mui/material';
import Topbar from './Topbar';

export default function Info({ onLogout, onSettings }) {
  const theme = useTheme();
  return (
    <Box sx={{ minHeight: '100vh', width: '100vw', bgcolor: theme.palette.background.default, p: 0 }}>
      <Topbar onLogout={onLogout} onSettings={onSettings} />
    </Box>
  );
}
