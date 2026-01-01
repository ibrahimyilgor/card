import { useState, useEffect, useContext } from 'react';
import { 
  Box,
  Typography,
  FormControlLabel,
  Checkbox,
  FormControl,
  Select,
  MenuItem,
  alpha,
  useTheme
} from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import StyleIcon from '@mui/icons-material/Style';
import TuneIcon from '@mui/icons-material/Tune';
import { I18nContext } from '../../utils/i18n';
import { StyledModal, StyledTextField, StyledButton } from '../ui';

const MotionBox = motion.create(Box);

export default function DeckModal({ 
  open, 
  onClose, 
  onSave, 
  initialTitle = '', 
  initialDesc = '', 
  loading = false, 
  error = '',
  editDeck = null 
}) {
  const theme = useTheme();
  const { t } = useContext(I18nContext);
  
  const [title, setTitle] = useState(initialTitle);
  const [desc, setDesc] = useState(initialDesc);
  const [difficultyEnabled, setDifficultyEnabled] = useState(editDeck?.difficulty_enabled || false);
  const [mode, setMode] = useState(editDeck?.mode || 'standard');

  useEffect(() => {
    setTitle(initialTitle);
    setDesc(initialDesc);
    setDifficultyEnabled(editDeck?.difficulty_enabled || false);
    setMode(editDeck?.mode || 'standard');
  }, [initialTitle, initialDesc, editDeck, open]);

  const handleSave = () => {
    if (title.trim()) {
      onSave(title, desc, { difficulty_enabled: difficultyEnabled, mode });
    }
  };

  return (
    <StyledModal
      open={open}
      onClose={onClose}
      title={editDeck ? t('edit_deck') : t('new_deck')}
      icon={<StyleIcon sx={{ fontSize: 24, color: 'white' }} />}
      maxWidth="sm"
      actions={
        <>
          <StyledButton variant="ghost" onClick={onClose}>
            {t('cancel')}
          </StyledButton>
          <StyledButton
            variant="success"
            onClick={handleSave}
            disabled={loading || !title.trim()}
          >
            {loading 
              ? t('saving') || 'Saving...' 
              : editDeck 
                ? t('edit') || 'Edit' 
                : t('add') || 'Add'}
          </StyledButton>
        </>
      }
    >
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        <StyledTextField
          label={t('deck_title')}
          value={title}
          onChange={e => setTitle(e.target.value)}
          fullWidth
          autoFocus
          placeholder="e.g., Spanish Vocabulary"
        />
        
        <StyledTextField
          label={t('deck_description')}
          value={desc}
          onChange={e => setDesc(e.target.value)}
          fullWidth
          multiline
          minRows={3}
          placeholder="Optional description for your deck..."
        />

        {!editDeck && (
          <MotionBox
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            transition={{ duration: 0.3 }}
          >
            <Box
              sx={{
                p: 2.5,
                borderRadius: 3,
                background: (theme) =>
                  theme.palette.mode === 'dark'
                    ? alpha(theme.palette.primary.main, 0.08)
                    : alpha(theme.palette.primary.main, 0.05),
                border: (theme) =>
                  `1px solid ${alpha(theme.palette.primary.main, 0.15)}`,
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
                <TuneIcon sx={{ fontSize: 20, color: 'primary.main' }} />
                <Typography
                  variant="subtitle2"
                  sx={{
                    fontWeight: 600,
                    color: 'text.cardTitle',
                    fontFamily: 'Inter, sans-serif',
                  }}
                >
                  Game Options
                </Typography>
              </Box>

              <FormControlLabel
                control={
                  <Checkbox
                    checked={difficultyEnabled}
                    onChange={(e) => setDifficultyEnabled(e.target.checked)}
                    sx={{
                      color: 'primary.main',
                      '&.Mui-checked': {
                        color: 'primary.main',
                      },
                    }}
                  />
                }
                label={
                  <Typography
                    variant="body2"
                    sx={{
                      color: 'text.cardTitle',
                      fontFamily: 'Inter, sans-serif',
                    }}
                  >
                    {t('enable_difficulty') || 'Enable Difficulty Tracking'}
                  </Typography>
                }
                sx={{ mb: 2 }}
              />

              <FormControl fullWidth size="small">
                <Select
                  value={mode}
                  onChange={(e) => setMode(e.target.value)}
                  sx={{
                    fontWeight: 500,
                    fontFamily: 'Inter, sans-serif',
                    borderRadius: 2,
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: 'border.main',
                    },
                    '&:hover .MuiOutlinedInput-notchedOutline': {
                      borderColor: 'primary.main',
                    },
                  }}
                >
                  <MenuItem value="standard">{t('mode_standard') || 'Standard Mode'}</MenuItem>
                </Select>
              </FormControl>
            </Box>
          </MotionBox>
        )}

        <AnimatePresence>
          {error && (
            <MotionBox
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              sx={{
                p: 2,
                borderRadius: 2,
                backgroundColor: alpha(theme.palette.error.main, 0.1),
                border: `1px solid ${alpha(theme.palette.error.main, 0.3)}`,
              }}
            >
              <Typography
                variant="body2"
                sx={{
                  color: 'error.main',
                  fontWeight: 500,
                  fontFamily: 'Inter, sans-serif',
                }}
              >
                {error}
              </Typography>
            </MotionBox>
          )}
        </AnimatePresence>
      </Box>
    </StyledModal>
  );
}
