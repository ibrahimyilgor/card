import { Box, Typography, Paper, useTheme } from '@mui/material';

export default function Stats() {
  const theme = useTheme();
  return (
    <Box sx={{ height: "98%", width: '95%', bgcolor: theme.palette.background.paper, p: 0, position: 'relative', mx: 'auto', display: 'flex', flexDirection: 'column', borderBottomLeftRadius: 12, borderBottomRightRadius: 12 }}>
      <Box sx={{ height: "92%", flex: 1, width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'auto', py: 4 }}>
        <Box sx={{ width: '95%', mx: 'auto', display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Paper sx={{ p: 3, mb: 2, borderRadius: 2 }}>
            <Typography
              variant="subtitle1"
              color="text.cardTitle"
              sx={{ fontWeight: 600, mb: 0.5, textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap', width: '100%', display: 'block' }}
            >
              Stats Box 1
            </Typography>
            <Typography
              variant="body2"
              color="text.cardSubtitle"
              sx={{ textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap', width: '100%', display: 'block' }}
            >
              Description for stats box 1
            </Typography>
          </Paper>
          <Paper sx={{ p: 3, mb: 2, borderRadius: 2 }}>
            <Typography
              variant="subtitle1"
              color="text.cardTitle"
              sx={{ fontWeight: 600, mb: 0.5, textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap', width: '100%', display: 'block' }}
            >
              Stats Box 2
            </Typography>
            <Typography
              variant="body2"
              color="text.cardSubtitle"
              sx={{ textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap', width: '100%', display: 'block' }}
            >
              Description for stats box 2
            </Typography>
          </Paper>
        </Box>
      </Box>
    </Box>
  );
}
