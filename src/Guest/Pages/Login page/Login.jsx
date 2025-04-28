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
  CircularProgress,
  Fade,
} from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import supabase from "../../../utils/supabase";

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [fadeOut, setFadeOut] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (!email || !password) {
      setSnackbar({
        open: true,
        message: "Please fill in all fields",
        severity: "error",
      });
      setLoading(false);
      return;
    }

    try {
      const { data: authData, error: authError } =
        await supabase.auth.signInWithPassword({
          email,
          password,
        });

      if (authError) throw new Error(authError.message);

      const { data: adminData, error: adminError } = await supabase
        .from("tbl_admin")
        .select("id")
        .eq("admin_email", email)
        .single();

      if (adminError && adminError.code !== "PGRST116") {
        throw new Error("Error checking admin status: " + adminError.message);
      }

      if (adminData) {
        sessionStorage.setItem("aid", adminData.id);
        setSnackbar({
          open: true,
          message: "Admin login successful! Redirecting...",
          severity: "success",
        });
      } else {
        const { data: userData, error: userError } = await supabase
          .from("tbl_user")
          .select("user_id")
          .eq("user_email", email)
          .single();

        if (userError)
          throw new Error("Error fetching user data: " + userError.message);

        sessionStorage.setItem("uid", userData.user_id);
        setSnackbar({
          open: true,
          message: "Login successful! Redirecting...",
          severity: "success",
        });
      }

      setEmail("");
      setPassword("");
    } catch (error) {
      setSnackbar({
        open: true,
        message: error.message,
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCloseSnackbar = (event, reason) => {
    if (reason === "clickaway") return;

    const wasSuccess = snackbar.severity === "success";
    setSnackbar((prev) => ({ ...prev, open: false }));

    if (wasSuccess) {
      setFadeOut(true);
      setTimeout(() => {
        const isAdmin = sessionStorage.getItem("aid") !== null;
        navigate(isAdmin ? "/admin/status/" : "/user/");
      }, 500);
    }
  };

  return (
    <Box
      sx={{
        display: "flex",
        minHeight: "100vh",
        alignItems: "center",
        justifyContent: "center",
        bgcolor: "#ffffff",
        p: 2,
        transition: "opacity 0.5s ease",
        opacity: fadeOut ? 0 : 1,
      }}
    >
      {/* Loading overlay */}
      {loading && (
        <Box
          sx={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0, 0, 0, 0.7)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 9999,
          }}
        >
          <CircularProgress size={60} thickness={5} sx={{ color: "#ffffff" }} />
        </Box>
      )}

      <Fade in={!fadeOut}>
        <Box
          sx={{
            maxWidth: 450,
            width: "100%",
            bgcolor: "#ffffff",
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
              color: "#000000",
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
              color: "#666666",
            }}
          >
            Don't have an account?{" "}
            <Link
              to="/register"
              style={{
                textDecoration: "none",
                color: "#000000",
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
              disabled={loading}
              sx={{
                mb: 2,
                "& .MuiOutlinedInput-root": {
                  borderRadius: 4,
                  "& fieldset": {
                    borderColor: "#e0e0e0",
                  },
                },
                "& .MuiInputLabel-root": {
                  color: "#666666",
                },
                "& .MuiOutlinedInput-input": {
                  color: "#000000",
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
              disabled={loading}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowPassword(!showPassword)}
                      edge="end"
                      size="small"
                      sx={{ color: "#666666" }}
                      disabled={loading}
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
                "& .MuiInputLabel-root": {
                  color: "#666666",
                },
                "& .MuiOutlinedInput-input": {
                  color: "#000000",
                },
              }}
            />

            <Divider sx={{ my: 3, borderColor: "#e0e0e0" }} />

            <Button
              fullWidth
              type="submit"
              variant="contained"
              size="medium"
              disabled={loading}
              sx={{
                py: 1,
                borderRadius: 4,
                bgcolor: "#000000",
                color: "#ffffff",
                textTransform: "none",
                fontSize: "0.875rem",
                "&:hover": {
                  bgcolor: "#333333",
                },
                "&:disabled": {
                  bgcolor: "#999999",
                },
              }}
            >
              {loading ? (
                <CircularProgress size={24} sx={{ color: "#ffffff" }} />
              ) : (
                "Sign In"
              )}
            </Button>
          </Box>
        </Box>
      </Fade>

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
            bgcolor: "#000000",
            color: "#ffffff",
            "& .MuiAlert-icon": {
              color: "#ffffff",
            },
            "& .MuiAlert-message": {
              color: "#ffffff",
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
