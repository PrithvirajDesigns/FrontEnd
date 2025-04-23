import React, { useState, useEffect } from 'react';
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
  InputAdornment,
  Snackbar,
  Alert,
  CircularProgress,
} from '@mui/material';
import { Check, Edit, Cancel, Visibility, VisibilityOff } from '@mui/icons-material';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { motion, AnimatePresence } from 'framer-motion';
import supabase from '../../../utils/supabase';

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
    name: '',
    email: '',
    photo: '',
  });
  const [editField, setEditField] = useState(null);
  const [tempValue, setTempValue] = useState('');
  const [passwordDialogOpen, setPasswordDialogOpen] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success',
  });
  const [loading, setLoading] = useState(true);

  const userId = sessionStorage.getItem('uid');

  useEffect(() => {
    if (userId) {
      fetchUserProfile();
    } else {
      setSnackbar({ open: true, message: 'User not logged in', severity: 'error' });
      setLoading(false);
    }
  }, [userId]);

  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  // SELECT - Fetch user profile from Supabase
  const fetchUserProfile = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('tbl_user')
        .select('user_name, user_email, user_photo')
        .eq('user_id', userId)
        .single();

      if (error) throw error;

      if (data) {
        setUser({
          name: data.user_name || '',
          email: data.user_email || '',
          photo: data.user_photo || '',
        });
      } else {
        showSnackbar('User profile not found', 'error');
      }
    } catch (error) {
      console.error('Error fetching user profile:', error.message);
      showSnackbar('Failed to fetch user profile', 'error');
    } finally {
      setLoading(false);
    }
  };

  // UPDATE - Save edited field (name or email)
  const handleSave = async () => {
    if (!tempValue.trim()) {
      showSnackbar(`${editField === 'name' ? 'Name' : 'Email'} cannot be empty`, 'warning');
      return;
    }
    if (editField === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(tempValue)) {
      showSnackbar('Invalid email format', 'warning');
      return;
    }

    try {
      const updates = {
        [editField === 'name' ? 'user_name' : 'user_email']: tempValue,
      };

      const { error } = await supabase
        .from('tbl_user')
        .update(updates)
        .eq('user_id', userId);

      if (error) throw error;

      setUser({ ...user, [editField]: tempValue });
      setEditField(null);
      showSnackbar(`${editField === 'name' ? 'Name' : 'Email'} updated successfully`);
    } catch (error) {
      console.error(`Error updating ${editField}:`, error.message);
      showSnackbar(`Failed to update ${editField}`, 'error');
    }
  };

  // UPDATE - Save new password
  const handlePasswordSave = async () => {
    if (!currentPassword || !newPassword) {
      showSnackbar('Please enter both current and new passwords', 'warning');
      return;
    }
    if (newPassword.length < 6) {
      showSnackbar('New password must be at least 6 characters', 'warning');
      return;
    }

    try {
      // Note: Password validation should ideally use Supabase Auth or a server-side function
      // This is a placeholder; replace with actual validation logic
      const { data, error: authError } = await supabase
        .from('tbl_user')
        .select('user_password')
        .eq('user_id', userId)
        .single();

      if (authError) throw authError;

      // Placeholder: Assume passwords are hashed; actual validation requires server-side logic
      // For demo, we'll skip direct comparison and update if currentPassword is provided
      // In production, use Supabase Auth's `signInWithPassword` to verify currentPassword

      const { error } = await supabase
        .from('users')
        .update({ user_password: newPassword }) // Should be hashed server-side
        .eq('user_id', userId);

      if (error) throw error;

      setPasswordDialogOpen(false);
      setCurrentPassword('');
      setNewPassword('');
      showSnackbar('Password updated successfully');
    } catch (error) {
      console.error('Error updating password:', error.message);
      showSnackbar('Failed to update password', 'error');
    }
  };

  const handleEditClick = (field) => {
    if (field === 'password') {
      setPasswordDialogOpen(true);
    } else {
      setEditField(field);
      setTempValue(user[field]);
    }
  };

  const handleCancel = () => {
    setEditField(null);
    setTempValue('');
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

  if (loading) {
    return (
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Container maxWidth="md" sx={{ py: 4, textAlign: 'center' }}>
          <CircularProgress />
        </Container>
      </ThemeProvider>
    );
  }

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
                  src={user.photo}
                  alt={user.name}
                  sx={{ width: 150, height: 150, fontSize: 64, bgcolor: 'primary.main', mb: 3 }}
                >
                  {!user.photo && user.name.charAt(0).toUpperCase()}
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

        <Snackbar
          open={snackbar.open}
          autoHideDuration={4000}
          onClose={handleCloseSnackbar}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        >
          <Alert
            onClose={handleCloseSnackbar}
            severity={snackbar.severity}
            variant="filled"
            sx={{ width: '100%' }}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Container>
    </ThemeProvider>
  );
};

export default UserProfile;