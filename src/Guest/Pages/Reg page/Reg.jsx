import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Box, 
  Button, 
  Divider, 
  Grid, 
  IconButton, 
  InputAdornment, 
  TextField, 
  Typography,
  Snackbar,
  Alert
} from '@mui/material';
import { 
  Visibility, 
  VisibilityOff
} from '@mui/icons-material';

const Register = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: ''
  });
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validation
    if (!formData.firstName || !formData.lastName || !formData.email || !formData.password) {
      setSnackbar({
        open: true,
        message: 'Please fill in all fields',
        severity: 'error'
      });
      return;
    }

    if (!/^\S+@\S+\.\S+$/.test(formData.email)) {
      setSnackbar({
        open: true,
        message: 'Please enter a valid email address',
        severity: 'error'
      });
      return;
    }

    if (formData.password.length < 6) {
      setSnackbar({
        open: true,
        message: 'Password must be at least 6 characters',
        severity: 'error'
      });
      return;
    }

    // Simulate successful registration
    setSnackbar({
      open: true,
      message: 'Account created successfully! Redirecting...',
      severity: 'success'
    });
    
    // Reset form
    setFormData({
      firstName: '',
      lastName: '',
      email: '',
      password: ''
    });
  };

  const handleCloseSnackbar = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    
    setSnackbar(prev => ({ ...prev, open: false }));
    
    // Navigate after snackbar closes if registration was successful
    if (snackbar.severity === 'success') {
      navigate('/user'); // Change to your desired route
    }
  };

  return (
    <Box
      sx={{
        display: 'flex',
        minHeight: '100vh',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: '#f8f8f8',
        p: 2
      }}
    >
      <Box
        sx={{
          maxWidth: 450,
          width: '100%',
          bgcolor: 'background.paper',
          boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.1)',
          borderRadius: 10,
          p: 4,
          border: '1px solid #e0e0e0'
        }}
      >
        <Typography 
          variant="h5" 
          component="h1" 
          align="center" 
          sx={{ 
            fontWeight: 600,
            fontSize: 30,
            mb: 2,
            color: 'text.primary',
            letterSpacing: 0.5
          }}
        >
          Create Account
        </Typography>
        
        <Typography 
          variant="body2" 
          align="center" 
          sx={{ 
            mb: 3,
            color: 'text.secondary'
          }}
        >
          Already registered?{' '}
          <Link 
            to="/login" 
            style={{ 
              textDecoration: 'none', 
              color: '#424242',
              fontWeight: 500
            }}
          >
            Sign in here
          </Link>
        </Typography>

        <Box component="form" onSubmit={handleSubmit}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                name="firstName"
                label="First Name"
                variant="outlined"
                value={formData.firstName}
                onChange={handleChange}
                size="small"
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 4,
                    '& fieldset': {
                      borderColor: '#e0e0e0'
                    }
                  }
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                name="lastName"
                label="Last Name"
                variant="outlined"
                value={formData.lastName}
                onChange={handleChange}
                size="small"
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 4,
                    '& fieldset': {
                      borderColor: '#e0e0e0'
                    }
                  }
                }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                name="email"
                label="Email"
                type="email"
                variant="outlined"
                value={formData.email}
                onChange={handleChange}
                size="small"
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 4,
                    '& fieldset': {
                      borderColor: '#e0e0e0'
                    }
                  }
                }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                name="password"
                label="Password"
                type={showPassword ? 'text' : 'password'}
                variant="outlined"
                value={formData.password}
                onChange={handleChange}
                size="small"
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowPassword(!showPassword)}
                        edge="end"
                        size="small"
                        sx={{ color: '#757575' }}
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  )
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 4,
                    '& fieldset': {
                      borderColor: '#e0e0e0'
                    }
                  }
                }}
              />
            </Grid>
          </Grid>

          <Divider sx={{ my: 3, borderColor: '#eeeeee' }} />

          <Button
            fullWidth
            type="submit"
            variant="contained"
            size="medium"
            sx={{
              mt: 1,
              py: 1,
              borderRadius: 4,
              bgcolor: '#424242',
              color: '#fff',
              textTransform: 'none',
              fontSize: '0.875rem',
              '&:hover': {
                bgcolor: '#212121'
              }
            }}
          >
            Register
          </Button>

          <Button
            fullWidth
            component={Link}
            to="/login"
            variant="outlined"
            size="medium"
            sx={{
              mt: 2,
              py: 1,
              borderRadius: 4,
              borderColor: '#e0e0e0',
              color: '#424242',
              textTransform: 'none',
              fontSize: '0.875rem',
              '&:hover': {
                borderColor: '#bdbdbd',
                bgcolor: 'rgba(0, 0, 0, 0.02)'
              }
            }}
          >
            Have an Account? Sign In
          </Button>
        </Box>
      </Box>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert 
          onClose={handleCloseSnackbar} 
          severity={snackbar.severity}
          sx={{
            bgcolor: snackbar.severity === 'error' ? '#424242' : '#4caf50',
            color: '#fff',
            '& .MuiAlert-icon': {
              color: '#fff'
            }
          }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Register;