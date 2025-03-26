import React from 'react';
import {
  Paper,
  Typography,
  Container,
  CssBaseline,
  Box,
  TextField,
  Button,
} from '@mui/material';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { motion } from 'framer-motion';

const theme = createTheme({
  palette: {
    background: {
      default: '#f5f5f5',
    },
    primary: {
      main: '#1976d2',
    },
  },
  typography: {
    h1: {
      fontSize: '2.5rem',
      fontWeight: 400,
      borderBottom: '1px solid #e0e0e0',
      paddingBottom: '0.5rem',
      marginBottom: '2rem',
    },
  },
  components: {
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: '20px',
          padding: '32px',
        },
      },
    },
  },
});

const Report = ({ userName }) => {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Container maxWidth="sm" sx={{ py: 4 }}>
        <Typography variant="h1" component="h1" color="text.primary">
          Report
        </Typography>

        <Paper elevation={2}>
          <Box
            component={motion.div}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}
          >
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              Submit Your Complaint
            </Typography>
            <TextField
              label="Your Name"
              variant="outlined"
              fullWidth
              defaultValue={userName || ''}
              disabled={!!userName}
            />
            <TextField
              label="Complaint Details"
              multiline
              rows={6}
              variant="outlined"
              fullWidth
            />
            <Button
              variant="contained"
              color="primary"
              sx={{ alignSelf: 'flex-end', backgroundColor: '#333333', borderRadius:'10px'}}
            >
              Submit
            </Button>
          </Box>
        </Paper>
      </Container>
    </ThemeProvider>
  );
};

export default Report;
