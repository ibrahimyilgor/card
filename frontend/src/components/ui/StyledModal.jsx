import { Modal, Box, IconButton, Typography } from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import CloseIcon from '@mui/icons-material/Close';

const MotionBox = motion.create(Box);

const StyledModal = ({
  open,
  onClose,
  title,
  icon,
  children,
  actions,
  maxWidth = 500,
  showCloseButton = true,
  sx = {},
}) => {
  const backdropVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
    exit: { opacity: 0 },
  };

  const modalVariants = {
    hidden: { 
      opacity: 0, 
      scale: 0.9,
      y: 20,
    },
    visible: { 
      opacity: 1, 
      scale: 1,
      y: 0,
      transition: {
        type: 'spring',
        stiffness: 300,
        damping: 25,
      },
    },
    exit: { 
      opacity: 0, 
      scale: 0.95,
      y: 10,
      transition: {
        duration: 0.15,
      },
    },
  };

  return (
    <AnimatePresence>
      {open && (
        <Modal
          open={open}
          onClose={onClose}
          closeAfterTransition
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
          slotProps={{
            backdrop: {
              sx: {
                backgroundColor: 'rgba(0, 0, 0, 0.7)',
                backdropFilter: 'blur(8px)',
              },
            },
          }}
        >
          <MotionBox
            variants={modalVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            sx={{
              width: { xs: '90%', sm: maxWidth },
              maxWidth: maxWidth,
              maxHeight: '90vh',
              overflow: 'auto',
              background: (theme) => theme.palette.mode === 'dark'
                ? 'linear-gradient(145deg, #1a1f2e 0%, #111827 100%)'
                : 'linear-gradient(145deg, #ffffff 0%, #f8fafc 100%)',
              borderRadius: '20px',
              border: (theme) => `1px solid ${theme.palette.mode === 'dark'
                ? 'rgba(255, 255, 255, 0.08)'
                : 'rgba(0, 0, 0, 0.08)'}`,
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
              outline: 'none',
              display: 'flex',
              flexDirection: 'column',
              ...sx,
            }}
          >
            {/* Header */}
            {(title || showCloseButton) && (
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '20px 24px',
                  borderBottom: (theme) => `1px solid ${theme.palette.mode === 'dark'
                    ? 'rgba(255, 255, 255, 0.06)'
                    : 'rgba(0, 0, 0, 0.06)'}`,
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  {icon && (
                    <Box
                      sx={{
                        width: 40,
                        height: 40,
                        borderRadius: '10px',
                        background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)',
                      }}
                    >
                      {icon}
                    </Box>
                  )}
                  {title && (
                    <Typography
                      variant="h6"
                      sx={{
                        fontWeight: 600,
                        color: 'text.cardTitle',
                        fontFamily: 'Inter, sans-serif',
                      }}
                    >
                      {title}
                    </Typography>
                  )}
                </Box>
                {showCloseButton && (
                  <IconButton
                    onClick={onClose}
                    sx={{
                      color: 'text.cardSubtitle',
                      padding: 1,
                      '&:hover': {
                        color: 'text.cardTitle',
                        backgroundColor: (theme) => theme.palette.mode === 'dark'
                          ? 'rgba(255, 255, 255, 0.05)'
                          : 'rgba(0, 0, 0, 0.05)',
                      },
                    }}
                  >
                    <CloseIcon />
                  </IconButton>
                )}
              </Box>
            )}
            
            {/* Content */}
            <Box sx={{ padding: '24px', flex: 1 }}>
              {children}
            </Box>

            {/* Actions Footer */}
            {actions && (
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'flex-end',
                  gap: 2,
                  padding: '16px 24px',
                  borderTop: (theme) => `1px solid ${theme.palette.mode === 'dark'
                    ? 'rgba(255, 255, 255, 0.06)'
                    : 'rgba(0, 0, 0, 0.06)'}`,
                }}
              >
                {actions}
              </Box>
            )}
          </MotionBox>
        </Modal>
      )}
    </AnimatePresence>
  );
};

export default StyledModal;
