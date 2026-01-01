import { Box } from '@mui/material';
import { motion } from 'framer-motion';

const MotionBox = motion.create(Box);

const PageContainer = ({
  children,
  maxWidth = '1400px',
  padding = { xs: 2, sm: 3, md: 4 },
  centered = false,
  sx = {},
  animate = true,
  ...props
}) => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.4,
        ease: 'easeOut',
        staggerChildren: 0.1,
      },
    },
    exit: {
      opacity: 0,
      transition: { duration: 0.2 },
    },
  };

  const content = (
    <Box
      sx={{
        width: '100%',
        maxWidth: maxWidth,
        margin: '0 auto',
        padding: padding,
        minHeight: 'calc(100vh - 80px)',
        display: centered ? 'flex' : 'block',
        flexDirection: centered ? 'column' : undefined,
        alignItems: centered ? 'center' : undefined,
        justifyContent: centered ? 'center' : undefined,
        ...sx,
      }}
      {...props}
    >
      {children}
    </Box>
  );

  if (!animate) return content;

  return (
    <MotionBox
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      sx={{
        width: '100%',
        maxWidth: maxWidth,
        margin: '0 auto',
        padding: padding,
        minHeight: 'calc(100vh - 80px)',
        display: centered ? 'flex' : 'block',
        flexDirection: centered ? 'column' : undefined,
        alignItems: centered ? 'center' : undefined,
        justifyContent: centered ? 'center' : undefined,
        ...sx,
      }}
      {...props}
    >
      {children}
    </MotionBox>
  );
};

export default PageContainer;

// Child animation wrapper for staggered animations
export const AnimatedItem = ({ children, delay = 0, sx = {}, ...props }) => {
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.4,
        ease: 'easeOut',
        delay,
      },
    },
  };

  return (
    <MotionBox variants={itemVariants} sx={sx} {...props}>
      {children}
    </MotionBox>
  );
};
