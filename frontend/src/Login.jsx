import React, { useState } from 'react';
import { Box, Typography, TextField, Button, Alert, Link, Paper, Checkbox, FormControlLabel } from '@mui/material';
import InfoOutlineIcon from '@mui/icons-material/InfoOutline';
import ThumbUpAltIcon from '@mui/icons-material/ThumbUpAlt';
import BuildIcon from '@mui/icons-material/Build';
import BoltIcon from '@mui/icons-material/Bolt';

export default function Login({ onLogin, onSwitch }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [remember, setRemember] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const backendUrl = window.location.protocol + '//' + window.location.hostname + ':5000/auth/login';
      const res = await fetch(backendUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      const data = await res.json();
      if (res.ok && data.token) {
        localStorage.setItem('token', data.token);
        onLogin();
      } else {
        setError(data.error || 'Login failed');
      }
    } catch {
      setError('Network error');
    }
  };

  return (
  <Box sx={{ minHeight: '100vh', width: '100vw', bgcolor: 'background.default', display: 'flex', alignItems: 'center', justifyContent: 'center', p: 0 }}>
  <Box sx={{ display: 'flex', width: '100%', maxWidth: 1200, mx: 'auto', boxSizing: 'border-box', height: { xs: 'auto', md: 600 }, boxShadow: 0 }}>
        {/* Left Info Panel */}
  <Box sx={{ padding: 5, flex: 1, display: { xs: 'none', sm: 'none', md: 'flex' }, flexDirection: 'column', justifyContent: 'center', alignItems: 'flex-end', pr: 8, bgcolor: 'transparent' }}>
          <Box>
            <Typography variant="h5" color="primary" sx={{ fontWeight: 700, mb: 3 }}>
              Sitemark
            </Typography>
            <Box sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
              <BoltIcon color="primary" sx={{ mr: 2 }} />
              <Box>
                <Typography variant="subtitle1" sx={{ fontWeight: 600 }} color="text.primary">Adaptable performance</Typography>
                <Typography variant="body2" color="text.gray">Our product effortlessly adjusts to your needs, boosting efficiency and simplifying your tasks.</Typography>
              </Box>
            </Box>
            <Box sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
              <BuildIcon color="primary" sx={{ mr: 2 }} />
              <Box>
                <Typography variant="subtitle1" sx={{ fontWeight: 600 }} color="text.primary">Built to last</Typography>
                <Typography variant="body2" color="text.gray">Experience unmatched durability that goes above and beyond with lasting investment.</Typography>
              </Box>
            </Box>
            <Box sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
              <ThumbUpAltIcon color="primary" sx={{ mr: 2 }} />
              <Box>
                <Typography variant="subtitle1" sx={{ fontWeight: 600 }} color="text.primary">Great user experience</Typography>
                <Typography variant="body2" color="text.gray">Integrate our product into your routine with an intuitive and easy-to-use interface.</Typography>
              </Box>
            </Box>
            <Box sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
              <InfoOutlineIcon color="primary" sx={{ mr: 2 }} />
              <Box>
                <Typography variant="subtitle1" sx={{ fontWeight: 600 }} color="text.primary">Innovative functionality</Typography>
                <Typography variant="body2" color="text.gray">Stay ahead with features that set new standards, addressing your evolving needs better than the rest.</Typography>
              </Box>
            </Box>
          </Box>
        </Box>
        {/* Right Login Form */}
        <Box sx={{ padding: 5, flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: 'transparent' }}>
          <Paper elevation={3} sx={{ width: '100%', maxWidth: 400, p: { xs: 2, sm: 4 }, borderRadius: 3, borderColor: 'border.main', borderStyle: 'solid', borderWidth: 0.5, bgcolor: 'background.default', boxShadow: '0 4px 4px 0 rgba(0,0,0,0.25)' }}>
            <Typography variant="h5" sx={{ fontWeight: 700, mb: 3 }} color="text.primary">Sign in</Typography>
            <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <TextField
                label="Email"
                variant="outlined"
                value={username}
                onChange={e => setUsername(e.target.value)}
                fullWidth
                InputLabelProps={{ sx: { color: 'primary.main' } }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    '& fieldset': {
                      borderColor: 'border.main',
                    },
                    '&:hover fieldset': {
                      borderColor: 'border.main',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: 'border.main',
                    },
                  },
                }}
              />
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <TextField
                  label="Password"
                  type="password"
                  variant="outlined"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  fullWidth
                  InputLabelProps={{ sx: { color: 'primary.main' } }}
                        sx={{
                  '& .MuiOutlinedInput-root': {
                    '& fieldset': {
                      borderColor: 'border.main',
                    },
                    '&:hover fieldset': {
                      borderColor: 'border.main',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: 'border.main',
                    },
                  },
                }}
                />
              </Box>

              <Button type="submit" variant="contained" color="primary" fullWidth sx={{ fontWeight: 600, fontSize: 16, py: 1.2, textTransform: 'none' }}>Sign in</Button>
            </Box>
            {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
            <Box sx={{ mt: 3, textAlign: 'center', display: 'flex', justifyContent: 'center' }}>
              <Typography variant="body2" color="text.primary">
                Don't have an account?{' '}
              </Typography>
              <Typography variant="body2" color="text.primary" sx={{ ml: 0.5 }}>
                <Link component="button" variant="body2" onClick={onSwitch} underline="none" color="primary" sx={{ mt: -0.5, fontWeight: 500 }}>
                  Sign up
                </Link>
              </Typography>
            </Box>
          </Paper>
        </Box>
      </Box>
    </Box>
  );
}
