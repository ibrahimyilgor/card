
import React, { useState } from 'react';
import { Container, Box, Typography, TextField, Button, Alert, Link, Paper } from '@mui/material';

export default function Signup({ onSignup, onSwitch }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess(false);
    try {
      const backendUrl = window.location.protocol + '//' + window.location.hostname + ':5000/auth/register';
      const res = await fetch(backendUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      const data = await res.json();
      if (res.ok) {
        setSuccess(true);
        onSignup && onSignup(username);
      } else {
        setError(data.error || 'Signup failed');
      }
    } catch {
      setError('Network error');
    }
  };

  return (
  <Container maxWidth={false} sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', px: { xs: 1, sm: 0 }, bgcolor: 'background.default' }}>
           <Box sx={{ padding: 5, flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: 'transparent' }}>
          <Paper elevation={3} sx={{ width: '100%', maxWidth: 400, p: { xs: 2, sm: 4 }, borderRadius: 3, borderColor: 'border.main', borderStyle: 'solid', borderWidth: 0.5, bgcolor: 'background.default', boxShadow: '0 4px 4px 0 rgba(0,0,0,0.25)' }}>
            <Typography variant="h5" sx={{ fontWeight: 700, mb: 3 }} color="text.primary">Sign Up</Typography>
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

              <Button type="submit" variant="contained" color="primary" fullWidth sx={{ fontWeight: 600, fontSize: 16, py: 1.2, textTransform: 'none' }}>Sign up</Button>
            </Box>
            {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
            <Box sx={{ mt: 3, textAlign: 'center', display: 'flex', justifyContent: 'center' }}>
              <Typography variant="body2" color="text.primary">
                Have an account?{' '}
              </Typography>
              <Typography variant="body2" color="text.primary" sx={{ ml: 0.5 }}>
                <Link component="button" variant="body2" onClick={onSwitch} underline="none" color="primary" sx={{ mt: -0.5, fontWeight: 500 }}>
                  Sign in
                </Link>
              </Typography>
            </Box>
          </Paper>
        </Box>
    </Container>
  );
}
