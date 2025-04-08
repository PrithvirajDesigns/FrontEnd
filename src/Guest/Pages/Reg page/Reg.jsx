import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
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
  Alert,
  Card,
  CardContent,
} from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import supabase from "../../../utils/supabase"; // Adjust path as needed

const Register = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    userName: "",
    email: "",
    password: "",
    photo: null,
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

  const handleFileChange = (e) => {
    if (e.target.files.length > 0) {
      setFormData((prev) => ({
        ...prev,
        photo: e.target.files[0],
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (!formData.userName || !formData.email || !formData.password) {
      setSnackbar({
        open: true,
        message: "Please fill in all required fields",
        severity: "error",
      });
      return;
    }

    if (!/^\S+@\S+\.\S+$/.test(formData.email)) {
      setSnackbar({
        open: true,
        message: "Please enter a valid email address",
        severity: "error",
      });
      return;
    }

    if (formData.password.length < 6) {
      setSnackbar({
        open: true,
        message: "Password must be at least 6 characters",
        severity: "error",
      });
      return;
    }

    try {
      // Register user with Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
      });

      if (authError) throw new Error(authError.message);

      let photoUrl = null;
      if (formData.photo) {
        // Upload photo to Supabase storage
        const filePath = `user_photos/${authData.user.id}/${Date.now()}_${formData.photo.name}`;
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from("planahead") // Adjust bucket name as needed
          .upload(filePath, formData.photo);

        if (uploadError) throw new Error("Photo upload failed: " + uploadError.message);

        // Get public URL for the photo
        const { data: urlData } = supabase.storage.from("planahead").getPublicUrl(filePath);
        photoUrl = urlData.publicUrl;
      }

      // Insert additional user data into users table
      const { error: insertError } = await supabase.from("tbl_user").insert({
        user_id: authData.user.id,
        user_name: formData.userName,
        user_email: formData.email,
        user_password: formData.password, // Note: Not recommended in production
        user_photo: photoUrl,
      });

      if (insertError) throw new Error("User data insert failed: " + insertError.message);

      // Store user_id in sessionStorage
      sessionStorage.setItem("uid", authData.user.id);

      // Show success message
      setSnackbar({
        open: true,
        message: "Account created successfully! Redirecting...",
        severity: "success",
      });

      // Reset form
      setFormData({
        userName: "",
        email: "",
        password: "",
        photo: null,
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

    // Navigate to /user after snackbar closes if registration was successful
    if (snackbar.severity === "success") {
      navigate("/user");
    }
  };

  return (
    <Box
      sx={{
        display: "flex",
        minHeight: "100vh",
        alignItems: "center",
        justifyContent: "center",
        bgcolor: "#f8f8f8",
        p: 2,
      }}
    >
      <Box
        sx={{
          maxWidth: 450,
          width: "100%",
          bgcolor: "background.paper",
          boxShadow: "0px 2px 8px rgba(0, 0, 0, 0.1)",
          borderRadius: 10,
          p: 4,
          border: "1px solid #e0e0e0",
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
            color: "text.primary",
            letterSpacing: 0.5,
          }}
        >
          Create Your Account
        </Typography>

        <Typography
          variant="body2"
          align="center"
          sx={{
            mb: 3,
            color: "text.secondary",
          }}
        >
          Already have an account?{" "}
          <Link
            to="/login"
            style={{
              textDecoration: "none",
              color: "#424242",
              fontWeight: 500,
            }}
          >
            Sign in here
          </Link>
        </Typography>

        <Box component="form" onSubmit={handleSubmit}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                name="userName"
                label="Full Name"
                variant="outlined"
                value={formData.userName}
                onChange={handleChange}
                size="small"
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: 4,
                    "& fieldset": {
                      borderColor: "#e0e0e0",
                    },
                  },
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
                  "& .MuiOutlinedInput-root": {
                    borderRadius: 4,
                    "& fieldset": {
                      borderColor: "#e0e0e0",
                    },
                  },
                }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                name="password"
                label="Password"
                type={showPassword ? "text" : "password"}
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
                        sx={{ color: "#757575" }}
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: 4,
                    "& fieldset": {
                      borderColor: "#e0e0e0",
                    },
                  },
                }}
              />
            </Grid>
            <Grid item xs={12}>
              <Card
                sx={{
                  border: "1px solid #e0e0e0",
                  borderRadius: 4,
                  cursor: "pointer",
                  "&:hover": {
                    borderColor: "#bdbdbd",
                    bgcolor: "rgba(0, 0, 0, 0.02)",
                  },
                }}
                onClick={() => document.getElementById("photoInput").click()}
              >
                <CardContent sx={{ textAlign: "center" }}>
                  <Typography variant="body1" sx={{ fontWeight: 500 }}>
                    {formData.photo ? formData.photo.name : "Upload Profile Photo"}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {formData.photo ? "Click to replace" : "Optional: Add a profile picture"}
                  </Typography>
                </CardContent>
              </Card>
              <input
                id="photoInput"
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                style={{ display: "none" }}
              />
            </Grid>
          </Grid>

          <Divider sx={{ my: 3, borderColor: "#eeeeee" }} />

          <Button
            fullWidth
            type="submit"
            variant="contained"
            size="medium"
            sx={{
              mt: 1,
              py: 1,
              borderRadius: 4,
              bgcolor: "#424242",
              color: "#fff",
              textTransform: "none",
              fontSize: "0.875rem",
              "&:hover": {
                bgcolor: "#212121",
              },
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
              borderColor: "#e0e0e0",
              color: "#424242",
              textTransform: "none",
              fontSize: "0.875rem",
              "&:hover": {
                borderColor: "#bdbdbd",
                bgcolor: "rgba(0, 0, 0, 0.02)",
              },
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

export default Register;