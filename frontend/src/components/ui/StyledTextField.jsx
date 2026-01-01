import { TextField } from '@mui/material';
import { styled } from '@mui/material/styles';

const StyledTextField = styled(TextField)(({ theme }) => ({
  '& .MuiOutlinedInput-root': {
    borderRadius: '12px',
    backgroundColor: theme.palette.mode === 'dark' 
      ? 'rgba(255, 255, 255, 0.03)' 
      : 'rgba(0, 0, 0, 0.02)',
    transition: 'all 0.2s ease',
    fontFamily: 'Inter, sans-serif',
    
    '& fieldset': {
      borderColor: theme.palette.mode === 'dark'
        ? 'rgba(255, 255, 255, 0.1)'
        : 'rgba(0, 0, 0, 0.1)',
      borderWidth: '1px',
      transition: 'all 0.2s ease',
    },
    
    '&:hover fieldset': {
      borderColor: theme.palette.primary.light,
    },
    
    '&.Mui-focused': {
      backgroundColor: theme.palette.mode === 'dark'
        ? 'rgba(59, 130, 246, 0.05)'
        : 'rgba(59, 130, 246, 0.02)',
      
      '& fieldset': {
        borderColor: theme.palette.primary.light,
        borderWidth: '2px',
        boxShadow: `0 0 0 3px ${theme.palette.mode === 'dark' 
          ? 'rgba(59, 130, 246, 0.15)' 
          : 'rgba(59, 130, 246, 0.1)'}`,
      },
    },
    
    '&.Mui-error fieldset': {
      borderColor: theme.palette.error.main,
    },
  },
  
  '& .MuiInputLabel-root': {
    fontFamily: 'Inter, sans-serif',
    fontWeight: 500,
    color: theme.palette.text.cardSubtitle,
    
    '&.Mui-focused': {
      color: theme.palette.primary.light,
    },
    
    '&.Mui-error': {
      color: theme.palette.error.main,
    },
  },
  
  '& .MuiOutlinedInput-input': {
    padding: '14px 16px',
    fontSize: '0.938rem',
    color: theme.palette.text.cardTitle,
    
    '&::placeholder': {
      color: theme.palette.text.cardSubtitle,
      opacity: 0.7,
    },
  },
  
  '& .MuiInputAdornment-root': {
    color: theme.palette.text.cardSubtitle,
  },
  
  '& .MuiFormHelperText-root': {
    fontFamily: 'Inter, sans-serif',
    marginLeft: '4px',
    marginTop: '6px',
    fontSize: '0.75rem',
  },
}));

export default StyledTextField;
