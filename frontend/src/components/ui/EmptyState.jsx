import { Box, Typography } from '@mui/material';
import { motion } from 'framer-motion';
import StyledButton from './StyledButton';

const MotionBox = motion.create(Box);

const EmptyState = ({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
  secondaryActionLabel,
  onSecondaryAction,
  sx = {},
}) => {
  return (
    <MotionBox
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        padding: { xs: 4, sm: 6, md: 8 },
        minHeight: '400px',
        ...sx,
      }}
    >
      {Icon && (
        <MotionBox
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ 
            type: 'spring', 
            stiffness: 200, 
            damping: 15,
            delay: 0.1 
          }}
          sx={{
            width: 120,
            height: 120,
            borderRadius: '50%',
            background: (theme) => theme.palette.mode === 'dark'
              ? 'linear-gradient(135deg, rgba(59, 130, 246, 0.15) 0%, rgba(59, 130, 246, 0.05) 100%)'
              : 'linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(59, 130, 246, 0.02) 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 3,
          }}
        >
          <Icon 
            sx={{ 
              fontSize: 48, 
              color: 'primary.light',
              opacity: 0.8,
            }} 
          />
        </MotionBox>
      )}
      
      <Typography
        variant="h5"
        sx={{
          fontWeight: 600,
          color: 'text.cardTitle',
          marginBottom: 1.5,
          fontFamily: 'Inter, sans-serif',
        }}
      >
        {title}
      </Typography>
      
      <Typography
        variant="body1"
        sx={{
          color: 'text.cardSubtitle',
          maxWidth: '400px',
          marginBottom: 4,
          lineHeight: 1.6,
          fontFamily: 'Inter, sans-serif',
        }}
      >
        {description}
      </Typography>
      
      <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', justifyContent: 'center' }}>
        {actionLabel && onAction && (
          <StyledButton variant="primary" onClick={onAction}>
            {actionLabel}
          </StyledButton>
        )}
        
        {secondaryActionLabel && onSecondaryAction && (
          <StyledButton variant="secondary" onClick={onSecondaryAction}>
            {secondaryActionLabel}
          </StyledButton>
        )}
      </Box>
    </MotionBox>
  );
};

export default EmptyState;
