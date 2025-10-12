import React, { useState } from 'react';
import { Box, Typography, RadioGroup, FormControlLabel, Radio, Button, Paper } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import Topbar from './Topbar';

export default function Settings({  currentTheme, onThemeChange, onLogout, onSettings }) {
  const theme = useTheme();
  const [selectedTheme, setSelectedTheme] = useState(currentTheme || 'dark');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setSelectedTheme(e.target.value);
  };

  const handleSave = async () => {
    setLoading(true);
    setError('');
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(window.location.protocol + '//' + window.location.hostname + ':5000/user/profile/theme', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + token,
        },
        body: JSON.stringify({ theme_preference: selectedTheme })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update theme');
      if (onThemeChange) onThemeChange(selectedTheme);

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: theme.palette.background.default }}>
      <Topbar onLogout={onLogout} onSettings={onSettings} />
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 'calc(100vh - 64px)' }}>
        <Paper sx={{ p: 4, borderRadius: 3, minWidth: 320, bgcolor: theme.palette.background.paper }} elevation={2}>
          <Typography variant="h5" sx={{ mb: 3, fontWeight: 700 }}>Settings</Typography>
          <Typography variant="subtitle1" sx={{ mb: 2 }}>Theme</Typography>
          <RadioGroup value={selectedTheme} onChange={handleChange}>
            <FormControlLabel value="dark" control={<Radio />} label="Dark" />
            <FormControlLabel value="light" control={<Radio />} label="Light" />
          </RadioGroup>
          {error && <Typography color="error" sx={{ mt: 2 }}>{error}</Typography>}
          <Button variant="contained" color="primary" sx={{ mt: 3 }} onClick={handleSave} fullWidth disabled={loading}>{loading ? 'Saving...' : 'Save'}</Button>
        </Paper>
      </Box>
    </Box>
  );
}
