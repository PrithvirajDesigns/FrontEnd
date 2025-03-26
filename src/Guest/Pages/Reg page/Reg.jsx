import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Box, 
  Button, 
  Checkbox, 
  Divider, 
  FormControlLabel, 
  Grid, 
  IconButton, 
  InputAdornment, 
  TextField, 
  Typography 
} from '@mui/material';
import { 
  Visibility, 
  VisibilityOff,
  GitHub,
  Twitter
} from '@mui/icons-material';

const Register = () => {
  const [showPassword, setShowPassword] = React.useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    // Registration logic here
  };

  return (
    <Box
      sx={{
        display: 'flex',
        minHeight: '100vh',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: 'background.paper',
        p: 3
      }}
    >
      <Box
        sx={{
          maxWidth: 450,
          width: '100%',
          bgcolor: 'background.paper',
          boxShadow: 3,
          borderRadius: 2,
          p: 4
        }}
      >
        <Typography 
          variant="h4" 
          component="h1" 
          align="center" 
          sx={{ 
            fontWeight: 'bold', 
            mb: 1,
            color: 'text.primary'
          }}
        >
          Create an account
        </Typography>
        
        <Typography 
          variant="body2" 
          align="center" 
          sx={{ 
            mb: 3,
            color: 'text.secondary'
          }}
        >
          Already have an account?{' '}
          <Link 
            to="/login" 
            style={{ 
              textDecoration: 'none', 
              color: '#1976d2',
              fontWeight: 500
            }}
          >
            Sign in
          </Link>
        </Typography>

        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="First Name"
                variant="outlined"
                required
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 1
                  }
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Last Name"
                variant="outlined"
                required
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 1
                  }
                }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Email Address"
                type="email"
                variant="outlined"
                required
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 1
                  }
                }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Password"
                type={showPassword ? 'text' : 'password'}
                variant="outlined"
                required
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowPassword(!showPassword)}
                        edge="end"
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  )
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 10
                  }
                }}
              />
            </Grid>
            
          </Grid>

          <Divider sx={{ my: 2 }}>
            
            </Divider>

          <Button
            fullWidth
            type="submit"
            variant="contained"
            size="large"
            sx={{
              mt: 2,
              py: 1.5,
              borderRadius: 5,
              bgcolor: 'primary.main',
              '&:hover': {
                bgcolor: 'primary.dark'
              }
            }}
          >
            Sign Up
          </Button>

          <Button
            fullWidth
            component={Link}
            to="/login"
            variant="outlined"
            size="large"
            sx={{
              mt: 2,
              py: 1.5,
              borderRadius: 5,
              borderColor: 'grey.300',
              color: 'text.primary',
              '&:hover': {
                borderColor: 'grey.400',
                bgcolor: 'action.hover'
              }
            }}
          >
            Already have an account? Sign In
          </Button>
        </Box>
      </Box>
    </Box>
  );
};

export default Register;