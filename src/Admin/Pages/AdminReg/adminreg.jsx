import React from "react";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import Grid from "@mui/material/Grid";
import Box from "@mui/material/Box";
import { styled } from "@mui/material/styles";

// Define styles for the form
const StyledForm = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(4),
  maxWidth: 600,
  margin: "0 auto",
  boxShadow: "0 8px 24px rgba(0,0,0,0.05)",
  borderRadius: 12,
}));

const Adminreg = () => {
  return (
    <StyledForm elevation={0} sx={{ mb: 2 }}>
      <Typography variant="h5" gutterBottom sx={{ fontWeight: 500, mb: 3 }}>
        Admin Registration
      </Typography>

      <Grid container spacing={3}>
        {/* Name Field */}
        <Grid item xs={12}>
          <TextField
            fullWidth
            id="name"
            label="Name"
            variant="outlined"
            size="small"
          />
        </Grid>

        {/* Email Field */}
        <Grid item xs={12}>
          <TextField
            fullWidth
            id="email"
            label="Email"
            variant="outlined"
            size="small"
            type="email"
          />
        </Grid>

        {/* Password Field */}
        <Grid item xs={12}>
          <TextField
            fullWidth
            id="password"
            label="Password"
            variant="outlined"
            size="small"
            type="password"
          />
        </Grid>
      </Grid>

      {/* Submit Button */}
      <Box sx={{ mt: 4, display: "flex", justifyContent: "flex-end" }}>
        <Button
          variant="contained"
          disableElevation
          sx={{
            borderRadius: 2,
            px: 3,
            backgroundColor: "#333", // Off-black color
            "&:hover": {
              backgroundColor: "#444", // Slightly lighter on hover
            },
          }}
        >
          Register
        </Button>
      </Box>
    </StyledForm>
  );
};

export default Adminreg;