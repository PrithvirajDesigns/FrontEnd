import React, { useState } from "react";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import Grid from "@mui/material/Grid";
import Box from "@mui/material/Box";
import { styled } from "@mui/material/styles";
import { useNavigate } from "react-router-dom";
import { Snackbar, Alert } from "@mui/material";
import supabase from "../../../utils/supabase"; // Adjust path as needed

// Define styles for the form
const StyledForm = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(4),
  maxWidth: 600,
  margin: "0 auto",
  boxShadow: "0 8px 24px rgba(0,0,0,0.05)",
  borderRadius: 12,
}));

const Adminreg = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    adminName: "",
    adminEmail: "",
    adminPassword: "",
  });
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (!formData.adminName || !formData.adminEmail || !formData.adminPassword) {
      setSnackbar({
        open: true,
        message: "Please fill in all required fields",
        severity: "error",
      });
      return;
    }

    if (!/^\S+@\S+\.\S+$/.test(formData.adminEmail)) {
      setSnackbar({
        open: true,
        message: "Please enter a valid email address",
        severity: "error",
      });
      return;
    }

    if (formData.adminPassword.length < 6) {
      setSnackbar({
        open: true,
        message: "Password must be at least 6 characters",
        severity: "error",
      });
      return;
    }

    try {
      // Register admin with Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.adminEmail,
        password: formData.adminPassword,
      });

      if (authError) throw new Error(authError.message);

      // Insert admin data into admins table
      const { error: insertError } = await supabase.from("tbl_admin").insert({
        admin_name: formData.adminName,
        admin_email: formData.adminEmail,
        admin_password: formData.adminPassword, // Note: Not recommended in production
      });

      if (insertError) throw new Error("Admin data insert failed: " + insertError.message);

      // Store admin id in sessionStorage
      // Note: Since id is bigint and auto-incremented, we'll fetch it after insertion
      const { data: adminData, error: fetchError } = await supabase
        .from("tbl_admin")
        .select("id")
        .eq("admin_email", formData.adminEmail)
        .single();

      if (fetchError) throw new Error("Failed to fetch admin ID: " + fetchError.message);

      sessionStorage.setItem("uid", adminData.id);

      // Show success message
      setSnackbar({
        open: true,
        message: "Admin account created successfully! Redirecting...",
        severity: "success",
      });

      // Reset form
      setFormData({
        adminName: "",
        adminEmail: "",
        adminPassword: "",
      });
    } catch (error) {
      setSnackbar({
        open: true,
        message: error.message,
        severity: "error",
      });
    }
  };

  const handleCloseSnackbar = (event, reason) => {
    if (reason === "clickaway") return;

    setSnackbar((prev) => ({ ...prev, open: false }));

    // Navigate to /admin after snackbar closes if registration was successful
    if (snackbar.severity === "success") {
      navigate("/admin"); // Adjust to your desired route
    }
  };

  return (
    <Box sx={{ p: 4 }}>
      <StyledForm elevation={0} sx={{ mb: 2 }}>
        <Typography variant="h5" gutterBottom sx={{ fontWeight: 500, mb: 3 }}>
          Admin Registration
        </Typography>

        <Grid container spacing={3}>
          {/* Name Field */}
          <Grid item xs={12}>
            <TextField
              fullWidth
              id="adminName"
              name="adminName"
              label="Admin Name"
              variant="outlined"
              size="small"
              value={formData.adminName}
              onChange={handleChange}
            />
          </Grid>

          {/* Email Field */}
          <Grid item xs={12}>
            <TextField
              fullWidth
              id="adminEmail"
              name="adminEmail"
              label="Admin Email"
              variant="outlined"
              size="small"
              type="email"
              value={formData.adminEmail}
              onChange={handleChange}
            />
          </Grid>

          {/* Password Field */}
          <Grid item xs={12}>
            <TextField
              fullWidth
              id="adminPassword"
              name="adminPassword"
              label="Admin Password"
              variant="outlined"
              size="small"
              type="password"
              value={formData.adminPassword}
              onChange={handleChange}
            />
          </Grid>
        </Grid>

        {/* Submit Button */}
        <Box sx={{ mt: 4, display: "flex", justifyContent: "flex-end" }}>
          <Button
            variant="contained"
            disableElevation
            onClick={handleSubmit}
            sx={{
              borderRadius: 2,
              px: 3,
              backgroundColor: "#333",
              "&:hover": {
                backgroundColor: "#444",
              },
            }}
          >
            Register
          </Button>
        </Box>
      </StyledForm>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          sx={{
            bgcolor: snackbar.severity === "error" ? "#424242" : "#4caf50",
            color: "#fff",
            "& .MuiAlert-icon": {
              color: "#fff",
            },
          }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Adminreg;