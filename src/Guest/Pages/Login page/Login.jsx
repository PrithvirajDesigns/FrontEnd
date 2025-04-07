import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Box, 
  Button, 
  Divider, 
  TextField, 
  Typography,
  Snackbar,
  Alert,
  IconButton,
  InputAdornment
} from '@mui/material';
import { 
  Visibility, 
  VisibilityOff 
} from '@mui/icons-material';

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please fill in all fields');
      setOpenSnackbar(true);
      setIsSuccess(false);
      return;
    }

    // Simulate successful login
    // Replace this with your actual login logic
    console.log('Login attempted with:', { email, password });
    
    // For demo purposes, we'll consider it successful
    setError('Login successful! Redirecting...');
    setOpenSnackbar(true);
    setIsSuccess(true);
  };

  const handleCloseSnackbar = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    
    setOpenSnackbar(false);
    
    // Navigate after snackbar closes if login was successful
    if (isSuccess) {
      navigate('/user/home'); // Change to your desired route
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
          Welcome Back
        </Typography>
        
        <Typography 
          variant="body2" 
          align="center" 
          sx={{ 
            mb: 3,
            color: 'text.secondary'
          }}
        >
          Don't have an account?{' '}
          <Link 
            to="/register" 
            style={{ 
              textDecoration: 'none', 
              color: '#424242',
              fontWeight: 500
            }}
          >
            Register here
          </Link>
        </Typography>

        <Box component="form" onSubmit={handleSubmit}>
          <TextField
            fullWidth
            label="Email"
            variant="outlined"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            size="small"
            sx={{
              mb: 2,
              '& .MuiOutlinedInput-root': {
                borderRadius: 4,
                '& fieldset': {
                  borderColor: '#e0e0e0'
                }
              }
            }}
          />  
          
          <TextField
            fullWidth
            label="Password"
            type={showPassword ? 'text' : 'password'}
            variant="outlined"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
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

          <Divider sx={{ my: 3, borderColor: '#eeeeee' }} />

          <Button
            fullWidth
            type="submit"
            variant="contained"
            size="medium"
            sx={{
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
            Sign In
          </Button>

          <Button
            fullWidth
            component={Link}
            to="/register"
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
            Create New Account
          </Button>
        </Box>
      </Box>

      <Snackbar
        open={openSnackbar}
        autoHideDuration={3000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert 
          onClose={handleCloseSnackbar} 
          severity={isSuccess ? 'success' : 'error'}
          sx={{
            bgcolor: isSuccess ? '#4caf50' : '#424242',
            color: '#fff',
            '& .MuiAlert-icon': {
              color: '#fff'
            }
          }}
        >
          {error}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Login;