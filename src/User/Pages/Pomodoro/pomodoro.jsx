import React, { useState, useEffect, useCallback } from "react";
import {
  Box,
  Typography,
  Button,
  Paper,
  Container,
  CssBaseline,
  IconButton,
  TextField,
  Badge,
} from "@mui/material";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import { Settings, PlayArrow, Pause, Replay } from "@mui/icons-material";
import { motion } from "framer-motion";

const theme = createTheme({
  palette: {
    background: { default: "#f5f5f5" },
    primary: { main: "#212121" },
  },
  typography: {
    h1: {
      fontSize: "2.5rem",
      fontWeight: 400,
      paddingBottom: "0.5rem",
      marginBottom: "2rem",
    },
  },
  components: {
    MuiPaper: { styleOverrides: { root: { borderRadius: "20px" } } },
    MuiButton: { styleOverrides: { root: { borderRadius: "12px" } } },
  },
});

const Pomodoro = () => {
  // Timer settings (in seconds)
  const [workDuration, setWorkDuration] = useState(25 * 60);
  const [breakDuration, setBreakDuration] = useState(5 * 60);
  const [timeLeft, setTimeLeft] = useState(workDuration);
  const [isActive, setIsActive] = useState(false);
  const [isWorkTime, setIsWorkTime] = useState(true);
  const [showSettings, setShowSettings] = useState(false);

  // Format time as MM:SS
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60).toString().padStart(2, "0");
    const secs = (seconds % 60).toString().padStart(2, "0");
    return `${mins}:${secs}`;
  };

  // Handle timer completion
  useEffect(() => {
    if (timeLeft === 0) {
      if (isWorkTime) {
        setIsWorkTime(false);
        setTimeLeft(breakDuration);
      } else {
        setIsWorkTime(true);
        setTimeLeft(workDuration);
      }
    }
  }, [timeLeft, isWorkTime, workDuration, breakDuration]);

  // Timer countdown
  useEffect(() => {
    let interval = null;
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prevTime) => prevTime - 1);
      }, 1000);
    } else if (!isActive && timeLeft !== 0) {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isActive, timeLeft]);

  // Control functions
  const toggleTimer = () => setIsActive(!isActive);
  const resetTimer = () => {
    setIsActive(false);
    setIsWorkTime(true);
    setTimeLeft(workDuration);
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Container maxWidth="sm" sx={{ py: 4 }}>
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              borderBottom: "1px solid #e0e0e0",
              pb: "0.5rem",
              mb: "2rem",
            }}
          >
            <Typography variant="h1" component="h1" sx={{ flexGrow: 1 }}>
              Pomodoro Timer
            </Typography>
            <IconButton
              onClick={() => setShowSettings(!showSettings)}
              sx={{
                border: "1px solid #e0e0e0",
                borderRadius: "12px",
                padding: "8px 16px",
              }}
            >
              <Settings sx={{ mr: 1 }} />
              <Typography variant="body1">Settings</Typography>
            </IconButton>
          </Box>

          {showSettings && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
                <Typography variant="h6" sx={{ mb: 2 }}>
                  Timer Settings
                </Typography>
                <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
                  <TextField
                    label="Work (minutes)"
                    type="number"
                    value={Math.floor(workDuration / 60)}
                    onChange={(e) =>
                      setWorkDuration(Math.max(1, e.target.value) * 60)
                    }
                    fullWidth
                  />
                  <TextField
                    label="Break (minutes)"
                    type="number"
                    value={Math.floor(breakDuration / 60)}
                    onChange={(e) =>
                      setBreakDuration(Math.max(1, e.target.value) * 60)
                    }
                    fullWidth
                  />
                </Box>
                <Button
                  variant="contained"
                  onClick={() => {
                    setTimeLeft(workDuration);
                    setIsWorkTime(true);
                    setShowSettings(false);
                  }}
                  fullWidth
                >
                  Apply
                </Button>
              </Paper>
            </motion.div>
          )}

          <Paper
            elevation={2}
            component={motion.div}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            sx={{
              p: 4,
              mb: 3,
              textAlign: "center",
            }}
          >
            <motion.div
              animate={{ scale: isActive ? 1.05 : 1 }}
              transition={{ type: "spring", stiffness: 500 }}
            >
              <Typography
                variant="h2"
                sx={{
                  fontSize: "5rem",
                  fontWeight: "bold",
                  color: isWorkTime ? "text.primary" : "text.secondary",
                }}
              >
                {formatTime(timeLeft)}
              </Typography>
              <motion.div
                key={isWorkTime ? "work" : "break"}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
              >
                <Typography variant="h5" color="text.secondary">
                  {isWorkTime ? "Focus Time" : "Break Time"}
                </Typography>
              </motion.div>
            </motion.div>

            <Box sx={{ display: "flex", justifyContent: "center", gap: 2, mt: 4 }}>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button
                  variant="contained"
                  startIcon={isActive ? <Pause /> : <PlayArrow />}
                  onClick={toggleTimer}
                  sx={{ px: 4, py: 1.5 }}
                >
                  {isActive ? "Pause" : "Start"}
                </Button>
              </motion.div>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button
                  variant="outlined"
                  startIcon={<Replay />}
                  onClick={resetTimer}
                  sx={{ px: 4, py: 1.5 }}
                >
                  Reset
                </Button>
              </motion.div>
            </Box>
          </Paper>
        </motion.div>
      </Container>
    </ThemeProvider>
  );
};

export default Pomodoro;