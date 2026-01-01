import React, { useState, useContext } from 'react';
import { motion } from 'framer-motion';
import { register } from '../services/authServices';
import { I18nContext } from '../utils/i18n';
import { Box, Typography, Alert, Link } from '@mui/material';
import SchoolIcon from '@mui/icons-material/School';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { StyledButton, StyledTextField, StyledCard } from '../components/ui';

const MotionBox = motion.create(Box);

export default function Signup({ onSignup, onSwitch }) {
  const { t } = useContext(I18nContext);
  const [accountname, setAccountname] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess(false);

    if (password !== confirmPassword) {
      setError(t('passwords_dont_match') || 'Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setError(t('password_too_short') || 'Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    try {
      const res = await register(accountname, password);
      const data = res.data;
      if (res.status === 200) {
        setSuccess(true);
        setTimeout(() => {
          onSignup && onSignup(accountname);
        }, 2000);
      } else {
        setError(data.error || 'Signup failed');
      }
    } catch {
      setError('Network error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        width: '100%',
        background: (theme) => `linear-gradient(135deg, ${theme.palette.background.default} 0%, ${theme.palette.background.paper} 50%, ${theme.palette.background.default} 100%)`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        p: { xs: 2, sm: 4 },
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Background decorative elements */}
      <Box
        sx={{
          position: 'absolute',
          top: '-10%',
          left: '-10%',
          width: '500px',
          height: '500px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(139, 92, 246, 0.08) 0%, transparent 70%)',
          pointerEvents: 'none',
        }}
      />
      <Box
        sx={{
          position: 'absolute',
          bottom: '-20%',
          right: '-10%',
          width: '600px',
          height: '600px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(59, 130, 246, 0.06) 0%, transparent 70%)',
          pointerEvents: 'none',
        }}
      />

      <MotionBox
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        sx={{
          width: '100%',
          maxWidth: 440,
          position: 'relative',
          zIndex: 1,
        }}
      >
        <StyledCard
          variant="elevated"
          hover={false}
          sx={{
            p: { xs: 3, sm: 4 },
          }}
        >
          {/* Logo */}
          <MotionBox
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 2,
              mb: 4,
            }}
          >
            <Box
              sx={{
                width: 52,
                height: 52,
                borderRadius: '14px',
                background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 8px 32px rgba(59, 130, 246, 0.3)',
              }}
            >
              <SchoolIcon sx={{ color: '#fff', fontSize: 26 }} />
            </Box>
            <Typography
              variant="h5"
              sx={{
                fontWeight: 700,
                background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                fontFamily: 'Inter, sans-serif',
              }}
            >
              {t('card') || 'CardMaster'}
            </Typography>
          </MotionBox>

          {success ? (
            <MotionBox
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                textAlign: 'center',
                py: 4,
              }}
            >
              <MotionBox
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.1 }}
                sx={{
                  width: 80,
                  height: 80,
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.2) 0%, rgba(34, 197, 94, 0.05) 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mb: 3,
                }}
              >
                <CheckCircleIcon sx={{ fontSize: 40, color: 'success.main' }} />
              </MotionBox>
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 600,
                  color: 'text.cardTitle',
                  mb: 1,
                  fontFamily: 'Inter, sans-serif',
                }}
              >
                {t('account_created') || 'Account Created!'}
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  color: 'text.cardSubtitle',
                  fontFamily: 'Inter, sans-serif',
                }}
              >
                {t('redirecting_to_login') || 'Redirecting you to login...'}
              </Typography>
            </MotionBox>
          ) : (
            <>
              <Typography
                variant="h5"
                sx={{
                  fontWeight: 700,
                  color: 'text.cardTitle',
                  mb: 1,
                  textAlign: 'center',
                  fontFamily: 'Inter, sans-serif',
                }}
              >
                {t('create_account') || 'Create an account'}
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  color: 'text.cardSubtitle',
                  mb: 4,
                  textAlign: 'center',
                  fontFamily: 'Inter, sans-serif',
                }}
              >
                {t('signup_subtitle') || 'Start mastering anything with flashcards'}
              </Typography>

              <Box
                component="form"
                onSubmit={handleSubmit}
                sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}
              >
                <StyledTextField
                  label={t('email') || 'Email'}
                  variant="outlined"
                  value={accountname}
                  onChange={(e) => setAccountname(e.target.value)}
                  fullWidth
                  autoComplete="email"
                />

                <StyledTextField
                  label={t('password') || 'Password'}
                  type="password"
                  variant="outlined"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  fullWidth
                  autoComplete="new-password"
                />

                <StyledTextField
                  label={t('confirm_password') || 'Confirm Password'}
                  type="password"
                  variant="outlined"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  fullWidth
                  autoComplete="new-password"
                />

                {error && (
                  <MotionBox
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <Alert
                      severity="error"
                      sx={{
                        borderRadius: '12px',
                        fontFamily: 'Inter, sans-serif',
                      }}
                    >
                      {error}
                    </Alert>
                  </MotionBox>
                )}

                <StyledButton
                  type="submit"
                  variant="primary"
                  size="large"
                  fullWidth
                  loading={loading}
                  sx={{ mt: 1 }}
                >
                  {t('signup') || 'Create Account'}
                </StyledButton>
              </Box>

              <Box
                sx={{
                  mt: 4,
                  pt: 3,
                  borderTop: (theme) => `1px solid ${theme.palette.divider}`,
                  textAlign: 'center',
                }}
              >
                <Typography
                  variant="body2"
                  sx={{ color: 'text.cardSubtitle', fontFamily: 'Inter, sans-serif' }}
                >
                  {t('have_account') || 'Already have an account?'}{' '}
                  <Link
                    component="button"
                    variant="body2"
                    onClick={onSwitch}
                    underline="none"
                    sx={{
                      color: 'primary.light',
                      fontWeight: 600,
                      cursor: 'pointer',
                      transition: 'color 0.2s',
                      '&:hover': {
                        color: 'primary.main',
                      },
                    }}
                  >
                    {t('login') || 'Sign in'}
                  </Link>
                </Typography>
              </Box>
            </>
          )}
        </StyledCard>
      </MotionBox>
    </Box>
  );
}
