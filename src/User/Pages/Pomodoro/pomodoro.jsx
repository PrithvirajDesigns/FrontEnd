import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Button,
  Paper,
  Container,
  CssBaseline,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Divider,
  Slider,
  Stack,
  Collapse
} from "@mui/material";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import { 
  PlayArrow, 
  Pause, 
  Replay, 
  Settings, 
  VolumeOff, 
  VolumeUp, 
  BarChart,
  ExpandMore,
  ExpandLess
} from "@mui/icons-material";
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

const CircularProgressTimer = ({ timeLeft, totalTime, currentPhase, isActive }) => {
  const radius = 90;
  const circumference = 2 * Math.PI * radius;
  const progress = (totalTime - timeLeft) / totalTime;
  const strokeDashoffset = circumference - (circumference * progress);

  return (
    <Box sx={{ position: "relative", width: 200, height: 200, mx: "auto", mb: 3 }}>
      <motion.svg 
        width="100%" 
        height="100%" 
        viewBox="0 0 200 200"
        animate={isActive ? {
          scale: [1, 1.03, 1],
          transition: { 
            repeat: Infinity, 
            duration: 2, 
            ease: "easeInOut" 
          }
        } : {}}
      >
        <circle
          cx="100"
          cy="100"
          r={radius}
          fill="none"
          stroke="#e0e0e0"
          strokeWidth="8"
        />
        
        <motion.circle
          cx="100"
          cy="100"
          r={radius}
          fill="none"
          stroke={currentPhase === "WORK" ? "#212121" : "#757575"}
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          transform="rotate(-90 100 100)"
          initial={{ strokeDashoffset }}
          animate={{ strokeDashoffset }}
          transition={{ duration: 0.5, ease: "linear" }}
        />
      </motion.svg>
      
      <Box sx={{
        position: "absolute",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        textAlign: "center"
      }}>
        <motion.div
          animate={isActive ? {
            opacity: [1, 0.8, 1],
            transition: {
              repeat: Infinity,
              duration: 2,
              ease: "easeInOut"
            }
          } : {}}
        >
          <Typography variant="h3" sx={{ fontWeight: "bold" }}>
            {Math.floor(timeLeft / 60).toString().padStart(2, '0')}:
            {(timeLeft % 60).toString().padStart(2, '0')}
          </Typography>
          <Typography variant="body1" color="text.secondary">
            {currentPhase === "WORK" ? "Focus Time" : 
             currentPhase === "SHORT_BREAK" ? "Short Break" : "Long Break"}
          </Typography>
        </motion.div>
      </Box>
    </Box>
  );
};

const formatTime = (seconds) => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  
  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  } else {
    return `${minutes}m`;
  }
};

const Pomodoro = () => {
  const PHASES = {
    WORK: "WORK",
    SHORT_BREAK: "SHORT_BREAK",
    LONG_BREAK: "LONG_BREAK"
  };

  const DEFAULT_SETTINGS = {
    work: 25,
    shortBreak: 5,
    longBreak: 15,
    pomodorosBeforeLongBreak: 4
  };

  const bellSound = new Audio("/Achievement_bell.wav");
  const breakSound = new Audio("/Short_break.wav");

  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [timeLeft, setTimeLeft] = useState(settings.work * 60);
  const [isActive, setIsActive] = useState(false);
  const [currentPhase, setCurrentPhase] = useState(PHASES.WORK);
  const [pomodorosCompleted, setPomodorosCompleted] = useState(0);
  const [showSettings, setShowSettings] = useState(false);
  const [tempSettings, setTempSettings] = useState(DEFAULT_SETTINGS);
  const [cycleCount, setCycleCount] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  
  // Stats tracking
  const [stats, setStats] = useState({
    totalPomodorosCompleted: 0,
    totalWorkTime: 0,
    totalBreakTime: 0,
    todayPomodorosCompleted: 0,
    todayWorkTime: 0,
    todayBreakTime: 0,
    longestStreak: 0,
    currentStreak: 0
  });
  
  // State for stats expansion
  const [statsExpanded, setStatsExpanded] = useState(false);

  // Track active phase time for stats
  const [activePhaseStartTime, setActivePhaseStartTime] = useState(null);

  const totalPhaseTime = () => {
    switch (currentPhase) {
      case PHASES.WORK:
        return settings.work * 60;
      case PHASES.SHORT_BREAK:
        return settings.shortBreak * 60;
      case PHASES.LONG_BREAK:
        return settings.longBreak * 60;
      default:
        return 0;
    }
  };

  // Update stats when a session completes
  const updateStats = (completedPhase) => {
    setStats(prevStats => {
      const newStats = { ...prevStats };
      
      if (completedPhase === PHASES.WORK) {
        newStats.totalPomodorosCompleted += 1;
        newStats.todayPomodorosCompleted += 1;
        newStats.totalWorkTime += settings.work * 60;
        newStats.todayWorkTime += settings.work * 60;
        
        // Update streak
        newStats.currentStreak += 1;
        if (newStats.currentStreak > newStats.longestStreak) {
          newStats.longestStreak = newStats.currentStreak;
        }
      } else {
        const breakTime = completedPhase === PHASES.SHORT_BREAK 
          ? settings.shortBreak * 60 
          : settings.longBreak * 60;
          
        newStats.totalBreakTime += breakTime;
        newStats.todayBreakTime += breakTime;
      }
      
      return newStats;
    });
  };

  const switchPhase = (nextPhase) => {
    // Update stats for completed phase if timer wasn't manually reset
    if (timeLeft === 0 && currentPhase !== nextPhase) {
      updateStats(currentPhase);
    }
    
    setCurrentPhase(nextPhase);

    switch (nextPhase) {
      case PHASES.WORK:
        setTimeLeft(settings.work * 60);
        break;
      case PHASES.SHORT_BREAK:
        setTimeLeft(settings.shortBreak * 60);
        break;
      case PHASES.LONG_BREAK:
        setTimeLeft(settings.longBreak * 60);
        break;
    }
  };

  const playSound = (sound) => {
    if (!isMuted) {
      sound.currentTime = 0;
      sound.play().catch(e => console.log("Audio play failed:", e));
    }
  };

  useEffect(() => {
    if (timeLeft === 0) {
      if (currentPhase === PHASES.WORK) {
        const newCount = pomodorosCompleted + 1;
        setPomodorosCompleted(newCount);
        playSound(bellSound);
  
        if (newCount % settings.pomodorosBeforeLongBreak === 0) {
          switchPhase(PHASES.LONG_BREAK);
          setCycleCount(cycleCount + 1);
        } else {
          switchPhase(PHASES.SHORT_BREAK);
        }
  
      } else if (currentPhase === PHASES.SHORT_BREAK || currentPhase === PHASES.LONG_BREAK) {
        playSound(breakSound);
        switchPhase(PHASES.WORK);
  
        if (currentPhase === PHASES.LONG_BREAK) {
          setPomodorosCompleted(0);
        }
      }
    }
  }, [timeLeft]);
  
  // Tracking active time
  useEffect(() => {
    if (isActive) {
      setActivePhaseStartTime(Date.now());
    } else if (activePhaseStartTime !== null) {
      // Only track time if we were previously active
      const elapsedSeconds = Math.floor((Date.now() - activePhaseStartTime) / 1000);
      
      if (elapsedSeconds > 0) {
        setStats(prevStats => {
          const newStats = { ...prevStats };
          
          if (currentPhase === PHASES.WORK) {
            newStats.totalWorkTime += elapsedSeconds;
            newStats.todayWorkTime += elapsedSeconds;
          } else {
            newStats.totalBreakTime += elapsedSeconds;
            newStats.todayBreakTime += elapsedSeconds;
          }
          
          return newStats;
        });
      }
      
      setActivePhaseStartTime(null);
    }
  }, [isActive]);

  useEffect(() => {
    let interval = null;
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prevTime) => prevTime - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isActive, timeLeft]);

  // Reset today's stats at midnight
  useEffect(() => {
    const checkDate = () => {
      const now = new Date();
      if (now.getHours() === 0 && now.getMinutes() === 0 && now.getSeconds() === 0) {
        setStats(prevStats => ({
          ...prevStats,
          todayPomodorosCompleted: 0,
          todayWorkTime: 0,
          todayBreakTime: 0
        }));
      }
    };
    
    const interval = setInterval(checkDate, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleOpenSettings = () => {
    setTempSettings(settings);
    setShowSettings(true);
  };

  const handleCloseSettings = () => {
    setShowSettings(false);
  };

  const handleSaveSettings = () => {
    setSettings(tempSettings);
    setShowSettings(false);
    setIsActive(false);
    setPomodorosCompleted(0);
    setCycleCount(0);

    if (currentPhase === PHASES.WORK) {
      setTimeLeft(tempSettings.work * 60);
    } else if (currentPhase === PHASES.SHORT_BREAK) {
      setTimeLeft(tempSettings.shortBreak * 60);
    } else {
      setTimeLeft(tempSettings.longBreak * 60);
    }
  };

  const toggleTimer = () => setIsActive(!isActive);

  const resetTimer = () => {
    setIsActive(false);
    setPomodorosCompleted(0);
    setCycleCount(0);
    
    // Reset current streak when timer is manually reset
    setStats(prevStats => ({
      ...prevStats,
      currentStreak: 0
    }));
    
    switchPhase(PHASES.WORK);
  };

  const resetStats = () => {
    if (window.confirm("Are you sure you want to reset all your stats?")) {
      setStats({
        totalPomodorosCompleted: 0,
        totalWorkTime: 0,
        totalBreakTime: 0,
        todayPomodorosCompleted: 0,
        todayWorkTime: 0,
        todayBreakTime: 0,
        longestStreak: 0,
        currentStreak: 0
      });
    }
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
  };
  
  const toggleStatsExpanded = () => {
    setStatsExpanded(!statsExpanded);
  };

  const handleSliderChange = (name) => (event, newValue) => {
    setTempSettings({ ...tempSettings, [name]: newValue });
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Container maxWidth="md" sx={{ py: 4 }}>
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <Box sx={{ 
            display: "flex", 
            justifyContent: "space-between", 
            alignItems: "center", 
            borderBottom: "1px solid #e0e0e0",
            pb: "0.5rem",
            mb: "2rem"
          }}>
            <Typography variant="h1">Pomodoro Timer</Typography>
            <Box>
              <IconButton 
                onClick={toggleMute} 
                sx={{ 
                  border: "1px solid #e0e0e0", 
                  borderRadius: "12px",
                  padding: "8px",
                  marginRight: "8px"
                }}
              >
                {isMuted ? <VolumeOff /> : <VolumeUp />}
              </IconButton>
              <IconButton 
                onClick={handleOpenSettings} 
                sx={{ 
                  border: "1px solid #e0e0e0", 
                  borderRadius: "12px",
                  padding: "8px 16px"
                }}
              >
                <Settings sx={{ mr: 1 }} />
                <Typography variant="body1">Settings</Typography>
              </IconButton>
            </Box>
          </Box>

          <Box sx={{ display: 'flex', gap: 3, alignItems: 'flex-start' }}>
            {/* Main Timer Container */}
            <Paper elevation={2} sx={{ p: 4, flex: 1, textAlign: "center" }}>
              <motion.div animate={{ scale: isActive ? 1.05 : 1 }}>
                <CircularProgressTimer 
                  timeLeft={timeLeft}
                  totalTime={totalPhaseTime()}
                  currentPhase={currentPhase}
                  isActive={isActive}
                />
                
                <Typography variant="subtitle1" sx={{ mt: 1 }}>
                  Completed: {pomodorosCompleted}/{settings.pomodorosBeforeLongBreak}
                </Typography>
                
                <Typography variant="subtitle2" sx={{ mt: 1, color: "text.secondary" }}>
                  {cycleCount > 0 && `Cycle ${cycleCount}`}
                </Typography>
              </motion.div>

              <Box sx={{ display: "flex", justifyContent: "center", gap: 2, mt: 4 }}>
                <Button
                  variant="contained"
                  startIcon={isActive ? <Pause /> : <PlayArrow />}
                  onClick={toggleTimer}
                  sx={{ px: 4 }}
                >
                  {isActive ? "Pause" : "Start"}
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<Replay />}
                  onClick={resetTimer}
                  sx={{ px: 4 }}
                >
                  Reset
                </Button>
              </Box>
            </Paper>

            {/* Right-side container with information and stats */}
            <Box sx={{ width: 300 }}>
              {/* Pomodoro Technique Info */}
              <Paper 
                elevation={2} 
                sx={{ 
                  p: 3, 
                  width: "100%",
                  textAlign: 'left',
                  mb: 3
                }}
              >
                <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
                  Pomodoro Technique
                </Typography>
                
                <Typography variant="body2" sx={{ mb: 1 }}>
                  1. Work for <strong>{settings.work}</strong> minutes
                </Typography>
                
                <Typography variant="body2" sx={{ mb: 1 }}>
                  2. Take a <strong>{settings.shortBreak}</strong>-minute short break
                </Typography>
                
                <Typography variant="body2" sx={{ mb: 1 }}>
                  3. After <strong>{settings.pomodorosBeforeLongBreak}</strong> work sessions, take a <strong>{settings.longBreak}</strong>-minute long break
                </Typography>
                
                <Typography variant="body2">
                  4. Repeat and stay productive!
                </Typography>
              </Paper>

              {/* Collapsible Productivity Stats */}
              <Paper 
                elevation={2} 
                sx={{ 
                  p: 3, 
                  width: "100%",
                  textAlign: 'left'
                }}
              >
                <Box 
                  sx={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center',
                    cursor: 'pointer'
                  }}
                  onClick={toggleStatsExpanded}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <BarChart sx={{ mr: 1 }} />
                    <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                      Stats
                    </Typography>
                  </Box>
                  <IconButton
                    size="small"
                    edge="end"
                    onClick={toggleStatsExpanded}
                    sx={{ mr: -1 }}
                  >
                    {statsExpanded ? <ExpandLess /> : <ExpandMore />}
                  </IconButton>
                </Box>
                
                {/* Always visible summary stats */}
                <Box sx={{ mt: 2, mb: statsExpanded ? 0 : 0 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2">Today:</Typography>
                    <Typography variant="body2" fontWeight="bold">
                      {stats.todayPomodorosCompleted} pomodoros ({formatTime(stats.todayWorkTime)})
                    </Typography>
                  </Box>
                  
                  <Box sx={{ 
                    bgcolor: 'rgba(33, 33, 33, 0.05)', 
                    p: 1.5, 
                    borderRadius: 2,
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}>
                    <Typography variant="body2">Current streak:</Typography>
                    <Typography variant="body1" fontWeight="bold">{stats.currentStreak}</Typography>
                  </Box>
                </Box>
                
                {/* Expandable detailed stats */}
                <Collapse in={statsExpanded} timeout="auto" unmountOnExit>
                  <Divider sx={{ my: 2 }} />
                  
                  <Typography variant="subtitle2" sx={{ color: 'text.secondary', mb: 1 }}>
                    Daily Details
                  </Typography>
                  
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2">Focus time:</Typography>
                    <Typography variant="body2" fontWeight="bold">{formatTime(stats.todayWorkTime)}</Typography>
                  </Box>
                  
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                    <Typography variant="body2">Break time:</Typography>
                    <Typography variant="body2" fontWeight="bold">{formatTime(stats.todayBreakTime)}</Typography>
                  </Box>
                  
                  <Typography variant="subtitle2" sx={{ color: 'text.secondary', mb: 1 }}>
                    All Time
                  </Typography>
                  
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2">Total pomodoros:</Typography>
                    <Typography variant="body2" fontWeight="bold">{stats.totalPomodorosCompleted}</Typography>
                  </Box>
                  
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2">Total focus time:</Typography>
                    <Typography variant="body2" fontWeight="bold">{formatTime(stats.totalWorkTime)}</Typography>
                  </Box>
                  
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                    <Typography variant="body2">Longest streak:</Typography>
                    <Typography variant="body2" fontWeight="bold">{stats.longestStreak} pomodoros</Typography>
                  </Box>
                  
                  <Button 
                    variant="text" 
                    color="primary" 
                    size="small"
                    onClick={resetStats}
                    sx={{ mt: 1 }}
                  >
                    Reset All Stats
                  </Button>
                </Collapse>
              </Paper>
            </Box>
          </Box>

          <Dialog open={showSettings} onClose={handleCloseSettings} fullWidth maxWidth="xs">
            <DialogTitle>Timer Settings</DialogTitle>
            <DialogContent>
              <Box sx={{ my: 3 }}>
                <Typography variant="subtitle2" sx={{ mb: 2 }}>Durations (minutes)</Typography>
                <Stack spacing={4}>
                  <Box>
                    <Typography gutterBottom>Work: {tempSettings.work} min</Typography>
                    <Slider
                      value={tempSettings.work}
                      onChange={handleSliderChange('work')}
                      min={1}
                      max={60}
                      step={1}
                      valueLabelDisplay="auto"
                    />
                  </Box>
                  <Box>
                    <Typography gutterBottom>Short Break: {tempSettings.shortBreak} min</Typography>
                    <Slider
                      value={tempSettings.shortBreak}
                      onChange={handleSliderChange('shortBreak')}
                      min={1}
                      max={30}
                      step={1}
                      valueLabelDisplay="auto"
                    />
                  </Box>
                  <Box>
                    <Typography gutterBottom>Long Break: {tempSettings.longBreak} min</Typography>
                    <Slider
                      value={tempSettings.longBreak}
                      onChange={handleSliderChange('longBreak')}
                      min={5}
                      max={60}
                      step={1}
                      valueLabelDisplay="auto"
                    />
                  </Box>
                </Stack>
              </Box>
              
              <Divider sx={{ my: 3 }} />
              
              <Box sx={{ my: 2 }}>
                <Typography gutterBottom sx={{ mb: 2 }}>
                  Pomodoros Before Long Break: {tempSettings.pomodorosBeforeLongBreak}
                </Typography>
                <Slider
                  value={tempSettings.pomodorosBeforeLongBreak}
                  onChange={handleSliderChange('pomodorosBeforeLongBreak')}
                  min={1}
                  max={8}
                  step={1}
                  marks
                  valueLabelDisplay="auto"
                />
              </Box>
            </DialogContent>
            <DialogActions>
              <Button onClick={handleCloseSettings}>Cancel</Button>
              <Button onClick={handleSaveSettings} variant="contained">Save</Button>
            </DialogActions>
          </Dialog>
        </motion.div>
      </Container>
    </ThemeProvider>
  );
};

export default Pomodoro;