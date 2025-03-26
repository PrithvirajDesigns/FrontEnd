import React, { useState } from 'react';
import {
  Avatar,
  IconButton,
  Paper,
  TextField,
  Typography,
  Container,
  CssBaseline,
  Grid,
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  InputAdornment
} from '@mui/material';
import { Check, Edit, Cancel, Visibility, VisibilityOff } from '@mui/icons-material';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { motion, AnimatePresence } from 'framer-motion';

const theme = createTheme({
  palette: {
    background: {
      default: '#f5f5f5',
    },
    primary: {
      main: '#212121',
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
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: '12px',
          textTransform: 'none',
          padding: '8px 20px',
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: '12px',
          },
        },
      },
    },
  },
});

const UserProfile = () => {
  const [user, setUser] = useState({
    name: 'John Doe',
    email: 'john.doe@example.com',
    password: '********',
  });

  const [editField, setEditField] = useState(null);
  const [tempValue, setTempValue] = useState('');
  const [passwordDialogOpen, setPasswordDialogOpen] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);

  const handleEditClick = (field) => {
    if (field === 'password') {
      setPasswordDialogOpen(true);
    } else {
      setEditField(field);
      setTempValue(user[field]);
    }
  };

  const handleSave = () => {
    setUser({ ...user, [editField]: tempValue });
    setEditField(null);
  };

  const handleCancel = () => {
    setEditField(null);
  };

  const handlePasswordSave = () => {
    // Add logic to validate currentPassword if needed
    if (newPassword) {
      setUser({ ...user, password: '********' });
      setPasswordDialogOpen(false);
      setCurrentPassword('');
      setNewPassword('');
    }
  };

  const handleClickShowCurrentPassword = () => {
    setShowCurrentPassword(!showCurrentPassword);
  };

  const handleClickShowNewPassword = () => {
    setShowNewPassword(!showNewPassword);
  };

  const fields = [
    { key: 'name', label: 'Full Name' },
    { key: 'email', label: 'Email' },
    { key: 'password', label: 'Password' },
  ];

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Typography variant="h1" component="h1" color="text.primary">
          Settings
        </Typography>

        <Paper elevation={2}>
          <Grid container spacing={4}>
            <Grid item xs={12} md={4}>
              <Box
                sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}
                component={motion.div}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <Avatar
                  sx={{ width: 150, height: 150, fontSize: 64, bgcolor: 'primary.main', mb: 3 }}
                >
                  {user.name.charAt(0).toUpperCase()}
                </Avatar>
              </Box>
            </Grid>

            <Grid item xs={12} md={8}>
              {fields.map(({ key, label }) => (
                <Box sx={{ mb: 4 }} key={key}>
                  <Box
                    sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}
                  >
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      {label}
                    </Typography>
                    <IconButton
                      onClick={() => handleEditClick(key)}
                      size="medium"
                      color="primary"
                      component={motion.div}
                      whileHover={{ scale: 1.1 }}
                    >
                      <Edit fontSize="medium" />
                    </IconButton>
                  </Box>

                  {key === 'password' ? (
                    <Typography
                      variant="body1"
                      sx={{ p: 2, backgroundColor: 'grey.100', borderRadius: '12px', fontSize: '1.1rem' }}
                      component={motion.div}
                      whileHover={{ backgroundColor: 'rgba(0, 0, 0, 0.08)' }}
                    >
                      ********
                    </Typography>
                  ) : (
                    <TextField
                      value={editField === key ? tempValue : user[key]}
                      onChange={(e) => setTempValue(e.target.value)}
                      fullWidth
                      variant="outlined"
                      size="medium"
                      disabled={editField !== key}
                      sx={{ borderRadius: '12px' }}
                    />
                  )}

                  {editField === key && key !== 'password' && (
                    <Box sx={{ display: 'flex', gap: 2, mt: 1 }}>
                      <IconButton onClick={handleSave} color="primary" size="large">
                        <Check fontSize="medium" />
                      </IconButton>
                      <IconButton onClick={handleCancel} color="error" size="large">
                        <Cancel fontSize="medium" />
                      </IconButton>
                    </Box>
                  )}
                </Box>
              ))}
            </Grid>
          </Grid>
        </Paper>

        <Dialog open={passwordDialogOpen} onClose={() => setPasswordDialogOpen(false)}>
          <DialogTitle>Change Password</DialogTitle>
          <DialogContent>
            <TextField
              label="Current Password"
              type={showCurrentPassword ? 'text' : 'password'}
              fullWidth
              margin="normal"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="toggle password visibility"
                      onClick={handleClickShowCurrentPassword}
                      edge="end"
                    >
                      {showCurrentPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
            <TextField
              label="New Password"
              type={showNewPassword ? 'text' : 'password'}
              fullWidth
              margin="normal"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="toggle password visibility"
                      onClick={handleClickShowNewPassword}
                      edge="end"
                    >
                      {showNewPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setPasswordDialogOpen(false)}>Cancel</Button>
            <Button onClick={handlePasswordSave} variant="contained">
              Save
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </ThemeProvider>
  );
};

export default UserProfile;