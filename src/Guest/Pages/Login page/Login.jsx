import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Box,
  Button,
  Divider,
  TextField,
  Typography,
  Snackbar,
  Alert,
  IconButton,
  InputAdornment,
} from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import supabase from "../../../utils/supabase"; // Adjust path as needed

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email || !password) {
      setSnackbar({
        open: true,
        message: "Please fill in all fields",
        severity: "error",
      });
      return;
    }

    try {
      // Authenticate with Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) throw new Error(authError.message);

      // Check if the user is an admin
      const { data: adminData, error: adminError } = await supabase
        .from("tbl_admin")
        .select("id")
        .eq("admin_email", email)
        .single();

      if (adminError && adminError.code !== "PGRST116") {
        // PGRST116 means no rows returned, which is fine (not an admin)
        throw new Error("Error checking admin status: " + adminError.message);
      }

      if (adminData) {
        // User is an admin
        sessionStorage.setItem("aid", adminData.id);
        setSnackbar({
          open: true,
          message: "Admin login successful! Redirecting...",
          severity: "success",
        });
      } else {
        // User is a regular user
        const { data: userData, error: userError } = await supabase
          .from("tbl_user")
          .select("user_id")
          .eq("user_email", email)
          .single();

        if (userError) throw new Error("Error fetching user data: " + userError.message);

        sessionStorage.setItem("uid", userData.user_id);
        setSnackbar({
          open: true,
          message: "Login successful! Redirecting...",
          severity: "success",
        });
      }

      // Reset form
      setEmail("");
      setPassword("");
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

    const wasSuccess = snackbar.severity === "success";
    setSnackbar((prev) => ({ ...prev, open: false }));

    // Navigate after snackbar closes if login was successful
    if (wasSuccess) {
      const isAdmin = sessionStorage.getItem("aid") !== null;
      navigate(isAdmin ? "/admin" : "/user/home");
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
          Welcome Back
        </Typography>

        <Typography
          variant="body2"
          align="center"
          sx={{
            mb: 3,
            color: "text.secondary",
          }}
        >
          Don’t have an account?{" "}
          <Link
            to="/register"
            style={{
              textDecoration: "none",
              color: "#424242",
              fontWeight: 500,
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
              "& .MuiOutlinedInput-root": {
                borderRadius: 4,
                "& fieldset": {
                  borderColor: "#e0e0e0",
                },
              },
            }}
          />

          <TextField
            fullWidth
            label="Password"
            type={showPassword ? "text" : "password"}
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

          <Divider sx={{ my: 3, borderColor: "#eeeeee" }} />

          <Button
            fullWidth
            type="submit"
            variant="contained"
            size="medium"
            sx={{
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
            Sign In
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
            bgcolor: snackbar.severity === "success" ? "#4caf50" : "#424242",
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

export default Login;