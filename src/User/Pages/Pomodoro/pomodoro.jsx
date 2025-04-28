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
  Collapse,
  Avatar,
  Snackbar,
  Alert,
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
  ExpandLess,
  Fullscreen,
  FullscreenExit,
  SkipNext,
  SkipPrevious,
  VolumeDown,
} from "@mui/icons-material";
import { motion } from "framer-motion";
import supabase from "../../../utils/supabase";

// Theme configuration
const appTheme = createTheme({
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
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: "20px",
          boxShadow: "0px 2px 8px rgba(0,0,0,0.1)",
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: "12px",
          textTransform: "none",
          fontWeight: 500,
        },
      },
    },
  },
});

// Timer phases
const TIMER_PHASES = {
  WORK: "WORK",
  SHORT_BREAK: "SHORT_BREAK",
  LONG_BREAK: "LONG_BREAK",
};

// Default settings
const DEFAULT_TIMER_SETTINGS = {
  work: 25,
  shortBreak: 5,
  longBreak: 15,
  pomodorosBeforeLongBreak: 4,
};

// Initial stats
const INITIAL_STATS = {
  totalPomodorosCompleted: 0,
  totalWorkTime: 0,
  totalBreakTime: 0,
  todayPomodorosCompleted: 0,
  todayWorkTime: 0,
  todayBreakTime: 0,
  longestStreak: 0,
  currentStreak: 0,
};

// TimerCircle component
const TimerCircle = ({
  timeLeft,
  totalTime,
  currentPhase,
  isActive,
  isFullscreen = false,
}) => {
  const size = isFullscreen ? 350 : 200;
  const radius = isFullscreen ? 150 : 90;
  const circumference = 2 * Math.PI * radius;
  const progress = (totalTime - timeLeft) / totalTime;
  const strokeDashoffset = circumference - (circumference * progress);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60).toString().padStart(2, "0");
    const secs = (seconds % 60).toString().padStart(2, "0");
    return `${mins}:${secs}`;
  };

  const getPhaseLabel = () => {
    switch (currentPhase) {
      case TIMER_PHASES.WORK:
        return "Focus Time";
      case TIMER_PHASES.SHORT_BREAK:
        return "Short Break";
      case TIMER_PHASES.LONG_BREAK:
        return "Long Break";
      default:
        return "";
    }
  };

  return (
    <Box
      sx={{
        position: "relative",
        width: size,
        height: size,
        mx: "auto",
        mb: isFullscreen ? 4 : 3,
      }}
    >
      <motion.svg
        width="100%"
        height="100%"
        viewBox={`0 0 ${size} ${size}`}
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ 
          scale: 1, 
          opacity: 1,
          ...(isActive ? {
            scale: [1, 1.03, 1],
          } : {})
        }}
        transition={{ 
          duration: 0.8, 
          delay: 0.2,
          ...(isActive ? {
            repeat: Infinity,
            duration: 2,
            ease: "easeInOut",
          } : {})
        }}
      >
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#e0e0e0"
          strokeWidth="8"
        />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={currentPhase === TIMER_PHASES.WORK ? "#212121" : "#757575"}
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
          initial={{ strokeDashoffset }}
          animate={{ strokeDashoffset }}
          transition={{ duration: 0.5, ease: "linear" }}
        />
      </motion.svg>
      <Box
        sx={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          textAlign: "center",
        }}
      >
        <motion.div
          animate={
            isActive
              ? {
                  opacity: [1, 0.8, 1],
                  transition: {
                    repeat: Infinity,
                    duration: 2,
                    ease: "easeInOut",
                  },
                }
              : {}
          }
        >
          <Typography
            variant={isFullscreen ? "h1" : "h3"}
            sx={{ fontWeight: "bold" }}
          >
            {formatTime(timeLeft)}
          </Typography>
          <Typography
            variant={isFullscreen ? "h5" : "body1"}
            color="text.secondary"
          >
            {getPhaseLabel()}
          </Typography>
        </motion.div>
      </Box>
    </Box>
  );
};

// FullscreenTimerView component
const FullscreenTimerView = ({ timerState, onClose, toggleTimer, toggleMute }) => {
  const { timeLeft, totalTime, currentPhase, isActive, isMuted } = timerState;

  return (
    <Box
      sx={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        backgroundColor: "#f5f5f5",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 9999,
      }}
    >
      <Box sx={{ position: "absolute", top: 16, right: 16 }}>
        <IconButton
          onClick={toggleMute}
          sx={{
            border: "1px solid #e0e0e0",
            borderRadius: "12px",
            padding: "8px",
            backgroundColor: "rgba(255, 255, 255, 0.8)",
          }}
        >
          {isMuted ? <VolumeOff /> : <VolumeUp />}
        </IconButton>
      </Box>
      <TimerCircle
        timeLeft={timeLeft}
        totalTime={totalTime}
        currentPhase={currentPhase}
        isActive={isActive}
        isFullscreen={true}
      />
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          gap: 2,
          mt: 4,
          position: "absolute",
          bottom: 40,
        }}
      >
        <Button
          variant="contained"
          size="large"
          startIcon={isActive ? <Pause /> : <PlayArrow />}
          onClick={toggleTimer}
          sx={{ px: 4, py: 1.5 }}
        >
          {isActive ? "Pause" : "Start"}
        </Button>
        <Button
          variant="outlined"
          size="large"
          startIcon={<FullscreenExit />}
          onClick={onClose}
          sx={{ px: 4, py: 1.5 }}
        >
          Exit Fullscreen
        </Button>
      </Box>
    </Box>
  );
};

// MusicPlayer component
const MusicPlayer = ({
  songs,
  currentSongIndex,
  setCurrentSongIndex,
  isMusicPlaying,
  setIsMusicPlaying,
  isMuted,
  backgroundAudio,
  volume,
  setVolume,
}) => {
  const currentSong = songs[currentSongIndex];

  const togglePlay = () => {
    setIsMusicPlaying(!isMusicPlaying);
  };

  const playNext = () => {
    setCurrentSongIndex((prev) => (prev + 1) % songs.length);
    setIsMusicPlaying(true);
  };

  const playPrevious = () => {
    setCurrentSongIndex((prev) => (prev - 1 + songs.length) % songs.length);
    setIsMusicPlaying(true);
  };

  const handleVolumeChange = (event, newValue) => {
    setVolume(newValue / 100);
    if (backgroundAudio) {
      backgroundAudio.volume = newValue / 100;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.4 }}
    >
      <Paper elevation={2} sx={{ p: 3, width: "100%", mb: 3 }}>
        <Typography
          variant="body1"
          sx={{ mb: 2, fontWeight: "medium", textAlign: "center" }}
        >
          {currentSong.name}
        </Typography>
        <Box sx={{ display: "flex", justifyContent: "center", gap: 1, mb: 2 }}>
          <IconButton onClick={playPrevious} disabled={songs.length <= 1}>
            <SkipPrevious />
          </IconButton>
          <IconButton onClick={togglePlay}>
            {isMusicPlaying && !isMuted ? <Pause /> : <PlayArrow />}
          </IconButton>
          <IconButton onClick={playNext} disabled={songs.length <= 1}>
            <SkipNext />
          </IconButton>
        </Box>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <VolumeDown />
          <Slider
            value={volume * 100}
            onChange={handleVolumeChange}
            min={0}
            max={100}
            sx={{ width: "100%" }}
          />
          <VolumeUp />
        </Box>
      </Paper>
    </motion.div>
  );
};

// Main PomodoroTimer component
const PomodoroTimer = () => {
  const [bellSound] = useState(new Audio("/Achievement_bell.wav"));
  const [breakSound] = useState(new Audio("/Short_break.wav"));
  const [songs] = useState([
    { name: "as the light fades", src: "/public/as the light fades.mp3" },
    { name: "Carousel", src: "/public/Carousel.mp3" },
    { name: "Cotton Cloud", src: "/public/Cotton Cloud.mp3" },
    { name: "Down the Line", src: "/public/Down the Line.mp3" },
    { name: "Everything (You Are)", src: "/public/Everything (You Are).mp3" },
    { name: "Lonely", src: "/public/Lonely.mp3" },
    { name: "Lunar Drive", src: "/public/Lunar Drive.mp3" },
    { name: "Moonlight", src: "/public/Moonlight.mp3" },
    { name: "Nautilus", src: "/public/Nautilus.mp3" },
    { name: "Snowman", src: "/public/Snowman.mp3" },
    { name: "Someday", src: "/public/Someday.mp3" },
    { name: "Spanish Castle", src: "/public/Spanish Castle.mp3" },
    { name: "The Places We Used to Walk", src: "/public/The Places We Used to Walk.mp3" },
    { name: "To Be Continued", src: "/public/To Be Continued.mp3" },
    { name: "To The Euphrates", src: "/public/To The Euphrates.mp3" },
    { name: "Vhs", src: "/public/Vhs.mp3" },
  ]);
  const [currentSongIndex, setCurrentSongIndex] = useState(0);
  const [isMusicPlaying, setIsMusicPlaying] = useState(false);
  const [backgroundAudio, setBackgroundAudio] = useState(null);
  const [volume, setVolume] = useState(0.5);
  const [settings, setSettings] = useState(DEFAULT_TIMER_SETTINGS);
  const [tempSettings, setTempSettings] = useState(DEFAULT_TIMER_SETTINGS);
  const [timeLeft, setTimeLeft] = useState(DEFAULT_TIMER_SETTINGS.work * 60);
  const [isActive, setIsActive] = useState(false);
  const [currentPhase, setCurrentPhase] = useState(TIMER_PHASES.WORK);
  const [pomodorosCompleted, setPomodorosCompleted] = useState(0);
  const [cycleCount, setCycleCount] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [stats, setStats] = useState(INITIAL_STATS);
  const [statsExpanded, setStatsExpanded] = useState(false);
  const [activePhaseStartTime, setActivePhaseStartTime] = useState(null);
  const [showSettings, setShowSettings] = useState(false);
  const [userPhoto, setUserPhoto] = useState(null);
  const [userName, setUserName] = useState("");
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  const userId = sessionStorage.getItem("uid");

  // Background audio initialization
  useEffect(() => {
    const audio = new Audio(songs[currentSongIndex].src);
    audio.loop = false; // Disable loop to allow 'ended' event
    audio.volume = volume;
    setBackgroundAudio(audio);

    // Handle song end
    const handleSongEnd = () => {
      setCurrentSongIndex((prev) => (prev + 1) % songs.length);
      setIsMusicPlaying(true);
    };
    audio.addEventListener("ended", handleSongEnd);

    if (isMusicPlaying && !isMuted && isActive) {
      audio.play().catch((e) => console.log("Audio play failed:", e));
    }

    return () => {
      audio.removeEventListener("ended", handleSongEnd);
      audio.pause();
      setBackgroundAudio(null);
    };
  }, [currentSongIndex, songs]);

  // Control background audio playback
  useEffect(() => {
    if (backgroundAudio) {
      if (isMusicPlaying && !isMuted && isActive) {
        backgroundAudio.play().catch((e) => console.log("Audio play failed:", e));
      } else {
        backgroundAudio.pause();
      }
    }
  }, [isMusicPlaying, isMuted, isActive, backgroundAudio]);

  // Cleanup audio on unmount
  useEffect(() => {
    return () => {
      if (backgroundAudio) {
        backgroundAudio.pause();
        setBackgroundAudio(null);
      }
    };
  }, []);

  // Fetch user data
  const fetchUserData = async () => {
    if (!userId) {
      showSnackbar("User not logged in", "error");
      return;
    }
    try {
      const { data, error } = await supabase
        .from("tbl_user")
        .select("user_photo, user_name")
        .eq("user_id", userId)
        .single();
      if (error) throw error;
      if (data) {
        setUserName(data.user_name || "");
        if (data.user_photo) {
          const { data: urlData } = supabase.storage
            .from("users")
            .getPublicUrl(data.user_photo);
          setUserPhoto(urlData.publicUrl);
        }
      }
    } catch (error) {
      console.error("Error fetching user data:", error.message);
      showSnackbar("Failed to fetch user data", "error");
    }
  };

  // Fetch Pomodoro stats
  const fetchPomodoroStats = async () => {
    if (!userId) {
      showSnackbar("User not logged in", "error");
      return;
    }
    try {
      const today = new Date().toISOString().split("T")[0];
      const { data, error } = await supabase
        .from("tbl_pomodoro")
        .select("pomodoro_timer, pomodoro_status, pomodoro_date")
        .eq("user_id", userId);
      if (error) throw error;

      let totalPomodoros = 0;
      let totalWorkTime = 0;
      let totalBreakTime = 0;
      let todayPomodoros = 0;
      let todayWorkTime = 0;
      let todayBreakTime = 0;

      data.forEach((record) => {
        const timeParts = record.pomodoro_timer.split(":");
        const minutes = parseInt(timeParts[0]) || 0;
        const seconds = parseInt(timeParts[1]) || 0;
        const totalSeconds = minutes * 60 + seconds;

        if (record.pomodoro_status === "WORK") {
          totalPomodoros += 1;
          totalWorkTime += totalSeconds;
          if (record.pomodoro_date === today) {
            todayPomodoros += 1;
            todayWorkTime += totalSeconds;
          }
        } else {
          totalBreakTime += totalSeconds;
          if (record.pomodoro_date === today) {
            todayBreakTime += totalSeconds;
          }
        }
      });

      setStats((prev) => ({
        ...prev,
        totalPomodorosCompleted: totalPomodoros,
        totalWorkTime,
        totalBreakTime,
        todayPomodorosCompleted: todayPomodoros,
        todayWorkTime,
        todayBreakTime,
      }));
    } catch (error) {
      console.error("Error fetching Pomodoro stats:", error.message);
      showSnackbar("Failed to fetch Pomodoro stats", "error");
    }
  };

  // Insert Pomodoro record
  const insertPomodoroRecord = async (completedPhase) => {
    if (!userId) {
      showSnackbar("User not logged in", "error");
      return;
    }
    try {
      const now = new Date();
      const pomodoroDate = now.toISOString().split("T")[0];
      const pomodoroTime = now.toTimeString().split(" ")[0];
      let pomodoroTimer;
      let longBreak = `${settings.longBreak}:00`;
      let shortBreak = `${settings.shortBreak}:00`;

      switch (completedPhase) {
        case TIMER_PHASES.WORK:
          pomodoroTimer = `${settings.work}:00`;
          break;
        case TIMER_PHASES.SHORT_BREAK:
          pomodoroTimer = `${settings.shortBreak}:00`;
          break;
        case TIMER_PHASES.LONG_BREAK:
          pomodoroTimer = `${settings.longBreak}:00`;
          break;
        default:
          return;
      }

      const { error } = await supabase.from("tbl_pomodoro").insert({
        pomodoro_date: pomodoroDate,
        pomodoro_time: pomodoroTime,
        pomodoro_timer: pomodoroTimer,
        user_id: userId,
        pomodoro_longbreak: longBreak,
        pomodoro_shortbreak: shortBreak,
        pomodoro_status: completedPhase,
      });
      if (error) throw error;
      showSnackbar("Pomodoro session saved");
    } catch (error) {
      console.error("Error inserting Pomodoro record:", error.message);
      showSnackbar("Failed to save Pomodoro session", "error");
    }
  };

  // Snackbar helper
  const showSnackbar = (message, severity = "success") => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  // Get total phase time
  const getTotalPhaseTime = () => {
    switch (currentPhase) {
      case TIMER_PHASES.WORK:
        return settings.work * 60;
      case TIMER_PHASES.SHORT_BREAK:
        return settings.shortBreak * 60;
      case TIMER_PHASES.LONG_BREAK:
        return settings.longBreak * 60;
      default:
        return 0;
    }
  };

  // Format stats time
  const formatStatsTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
  };

  // Update stats
  const updateStatsOnPhaseComplete = (completedPhase) => {
    setStats((prev) => {
      const newStats = { ...prev };
      if (completedPhase === TIMER_PHASES.WORK) {
        newStats.totalPomodorosCompleted += 1;
        newStats.todayPomodorosCompleted += 1;
        newStats.totalWorkTime += settings.work * 60;
        newStats.todayWorkTime += settings.work * 60;
        newStats.currentStreak += 1;
        if (newStats.currentStreak > newStats.longestStreak) {
          newStats.longestStreak = newStats.currentStreak;
        }
      } else {
        const breakTime =
          completedPhase === TIMER_PHASES.SHORT_BREAK
            ? settings.shortBreak * 60
            : settings.longBreak * 60;
        newStats.totalBreakTime += breakTime;
        newStats.todayBreakTime += breakTime;
      }
      return newStats;
    });
    insertPomodoroRecord(completedPhase);
  };

  // Switch phase
  const switchToPhase = (nextPhase) => {
    if (timeLeft === 0 && currentPhase !== nextPhase) {
      updateStatsOnPhaseComplete(currentPhase);
    }
    setCurrentPhase(nextPhase);
    switch (nextPhase) {
      case TIMER_PHASES.WORK:
        setTimeLeft(settings.work * 60);
        break;
      case TIMER_PHASES.SHORT_BREAK:
        setTimeLeft(settings.shortBreak * 60);
        break;
      case TIMER_PHASES.LONG_BREAK:
        setTimeLeft(settings.longBreak * 60);
        break;
    }
  };

  // Play sound
  const playSound = (sound) => {
    if (!isMuted) {
      sound.currentTime = 0;
      sound.play().catch((e) => console.log("Audio play failed:", e));
    }
  };

  // Toggle mute
  const toggleMuteSound = () => {
    setIsMuted((prev) => {
      if (backgroundAudio) {
        if (!prev) {
          backgroundAudio.pause();
        } else if (isMusicPlaying && isActive) {
          backgroundAudio.play().catch((e) => console.log("Audio play failed:", e));
        }
      }
      return !prev;
    });
  };

  // Toggle fullscreen
  const toggleFullscreenMode = () => {
    if (!isFullscreen) {
      document.documentElement.requestFullscreen().catch((e) => {
        console.log("Fullscreen error:", e);
      });
    } else {
      if (document.fullscreenElement) {
        document.exitFullscreen();
      }
    }
    setIsFullscreen(!isFullscreen);
  };

  // Handle fullscreen change
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () =>
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  // Handle timer completion
  useEffect(() => {
    if (timeLeft === 0) {
      if (currentPhase === TIMER_PHASES.WORK) {
        const newCount = pomodorosCompleted + 1;
        setPomodorosCompleted(newCount);
        playSound(bellSound);
        if (newCount % settings.pomodorosBeforeLongBreak === 0) {
          switchToPhase(TIMER_PHASES.LONG_BREAK);
          setCycleCount(cycleCount + 1);
        } else {
          switchToPhase(TIMER_PHASES.SHORT_BREAK);
        }
      } else {
        playSound(breakSound);
        switchToPhase(TIMER_PHASES.WORK);
        if (currentPhase === TIMER_PHASES.LONG_BREAK) {
          setPomodorosCompleted(0);
        }
      }
    }
  }, [timeLeft]);

  // Track active phase time
  useEffect(() => {
    if (isActive) {
      setActivePhaseStartTime(Date.now());
    } else if (activePhaseStartTime !== null) {
      const elapsedSeconds = Math.floor(
        (Date.now() - activePhaseStartTime) / 1000
      );
      if (elapsedSeconds > 0) {
        setStats((prev) => {
          const newStats = { ...prev };
          if (currentPhase === TIMER_PHASES.WORK) {
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

  // Timer countdown
  useEffect(() => {
    let interval = null;
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isActive, timeLeft]);

  // Reset daily stats
  useEffect(() => {
    const checkForMidnight = () => {
      const now = new Date();
      if (
        now.getHours() === 0 &&
        now.getMinutes() === 0 &&
        now.getSeconds() === 0
      ) {
        setStats((prev) => ({
          ...prev,
          todayPomodorosCompleted: 0,
          todayWorkTime: 0,
          todayBreakTime: 0,
        }));
      }
    };
    const interval = setInterval(checkForMidnight, 1000);
    return () => clearInterval(interval);
  }, []);

  // Fetch data on mount
  useEffect(() => {
    fetchUserData();
    fetchPomodoroStats();
  }, [userId]);

  // Timer controls
  const toggleTimerState = () => setIsActive(!isActive);

  const resetTimer = () => {
    setIsActive(false);
    setPomodorosCompleted(0);
    setCycleCount(0);
    setStats((prev) => ({ ...prev, currentStreak: 0 }));
    switchToPhase(TIMER_PHASES.WORK);
  };

  // Settings dialog
  const openSettingsDialog = () => {
    setTempSettings(settings);
    setShowSettings(true);
  };

  const closeSettingsDialog = () => {
    setShowSettings(false);
  };

  const saveSettings = () => {
    setSettings(tempSettings);
    setShowSettings(false);
    setIsActive(false);
    setPomodorosCompleted(0);
    setCycleCount(0);
    if (currentPhase === TIMER_PHASES.WORK) {
      setTimeLeft(tempSettings.work * 60);
    } else if (currentPhase === TIMER_PHASES.SHORT_BREAK) {
      setTimeLeft(tempSettings.shortBreak * 60);
    } else {
      setTimeLeft(tempSettings.longBreak * 60);
    }
  };

  const handleSliderChange = (settingName) => (_, newValue) => {
    setTempSettings((prev) => ({ ...prev, [settingName]: newValue }));
  };

  // Stats functions
  const toggleStatsPanel = () => setStatsExpanded(!statsExpanded);

  const resetAllStats = async () => {
    if (window.confirm("Are you sure you want to reset all your stats?")) {
      try {
        const { error } = await supabase
          .from("tbl_pomodoro")
          .delete()
          .eq("user_id", userId);
        if (error) throw error;
        setStats(INITIAL_STATS);
        showSnackbar("Stats reset successfully");
      } catch (error) {
        console.error("Error resetting stats:", error.message);
        showSnackbar("Failed to reset stats", "error");
      }
    }
  };

  // Get initials
  const getInitials = (name) => {
    if (!name) return "";
    const names = name.split(" ");
    return names
      .map((n) => n.charAt(0))
      .slice(0, 2)
      .join("")
      .toUpperCase();
  };

  const timerState = {
    timeLeft,
    totalTime: getTotalPhaseTime(),
    currentPhase,
    isActive,
    isMuted,
  };

  return (
    <ThemeProvider theme={appTheme}>
      <CssBaseline />
      <Container
        maxWidth="md"
        sx={{ py: 4, display: isFullscreen ? "none" : "block" }}
      >
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        >
          {/* Header with user photo */}
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
            <Box sx={{ display: "flex", alignItems: "center" }}>
              <Typography variant="h1">Pomodoro Timer</Typography>
            </Box>
            <Box>
              <IconButton
                onClick={toggleMuteSound}
                sx={{
                  border: "1px solid #e0e0e0",
                  borderRadius: "12px",
                  padding: "8px",
                  marginRight: "8px",
                }}
              >
                {isMuted ? <VolumeOff /> : <VolumeUp />}
              </IconButton>
              <IconButton
                onClick={toggleFullscreenMode}
                sx={{
                  border: "1px solid #e0e0e0",
                  borderRadius: "12px",
                  padding: "8px",
                  marginRight: "8px",
                }}
              >
                {isFullscreen ? <FullscreenExit /> : <Fullscreen />}
              </IconButton>
              <IconButton
                onClick={openSettingsDialog}
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
          </Box>

          {/* Main content */}
          <Box sx={{ display: "flex", gap: 3, alignItems: "flex-start" }}>
            <Paper elevation={2} sx={{ p: 4, flex: 1, textAlign: "center" }}>
              <motion.div animate={{ scale: isActive ? 1.05 : 1 }}>
                <TimerCircle
                  timeLeft={timeLeft}
                  totalTime={getTotalPhaseTime()}
                  currentPhase={currentPhase}
                  isActive={isActive}
                />
                <Typography variant="subtitle1" sx={{ mt: 1 }}>
                  Completed: {pomodorosCompleted}/
                  {settings.pomodorosBeforeLongBreak}
                </Typography>
                {cycleCount > 0 && (
                  <Typography
                    variant="subtitle2"
                    sx={{ mt: 1, color: "text.secondary" }}
                  >
                    Cycle {cycleCount}
                  </Typography>
                )}
              </motion.div>
              <Box
                sx={{ display: "flex", justifyContent: "center", gap: 2, mt: 4 }}
              >
                <Button
                  variant="contained"
                  startIcon={isActive ? <Pause /> : <PlayArrow />}
                  onClick={toggleTimerState}
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

            <Box sx={{ width: 300 }}>
              <MusicPlayer
                songs={songs}
                currentSongIndex={currentSongIndex}
                setCurrentSongIndex={setCurrentSongIndex}
                isMusicPlaying={isMusicPlaying}
                setIsMusicPlaying={setIsMusicPlaying}
                isMuted={isMuted}
                backgroundAudio={backgroundAudio}
                volume={volume}
                setVolume={setVolume}
              />
              
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.6 }}
              >
                <Paper elevation={2} sx={{ p: 3, width: "100%", mb: 3 }}>
                  <Typography variant="h6" sx={{ mb: 2, fontWeight: "bold" }}>
                    Pomodoro Technique
                  </Typography>
                  <Typography variant="body2" sx={{ mb: 1 }}>
                    1. Work for <strong>{settings.work}</strong> minutes
                  </Typography>
                  <Typography variant="body2" sx={{ mb: 1 }}>
                    2. Take a <strong>{settings.shortBreak}</strong>-minute short
                    break
                  </Typography>
                  <Typography variant="body2" sx={{ mb: 1 }}>
                    3. After <strong>{settings.pomodorosBeforeLongBreak}</strong>{" "}
                    work sessions, take a <strong>{settings.longBreak}</strong>
                    -minute long break
                  </Typography>
                  <Typography variant="body2">
                    4. Repeat and stay productive!
                  </Typography>
                </Paper>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.8 }}
              >
                <Paper elevation={2} sx={{ p: 3, width: "100%" }}>
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      cursor: "pointer",
                    }}
                    onClick={toggleStatsPanel}
                  >
                    <Box sx={{ display: "flex", alignItems: "center" }}>
                      <BarChart sx={{ mr: 1 }} />
                      <Typography variant="h6" sx={{ fontWeight: "bold" }}>
                        Stats
                      </Typography>
                    </Box>
                    <IconButton
                      size="small"
                      edge="end"
                      onClick={toggleStatsPanel}
                      sx={{ mr: -1 }}
                    >
                      {statsExpanded ? <ExpandLess /> : <ExpandMore />}
                    </IconButton>
                  </Box>
                  <Box sx={{ mt: 2, mb: statsExpanded ? 0 : 0 }}>
                    <Box
                      sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}
                    >
                      <Typography variant="body2">Today:</Typography>
                      <Typography variant="body2" fontWeight="bold">
                        {stats.todayPomodorosCompleted} pomodoros ||{" "}
                        {formatStatsTime(stats.todayWorkTime)}
                      </Typography>
                    </Box>
                    <Box
                      sx={{
                        bgcolor: "rgba(33, 33, 33, 0.05)",
                        p: 1.5,
                        borderRadius: 2,
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <Typography variant="body2">Current streak:</Typography>
                      <Typography variant="body1" fontWeight="bold">
                        {stats.currentStreak}
                      </Typography>
                    </Box>
                  </Box>
                  <Collapse in={statsExpanded} timeout="auto" unmountOnExit>
                    <Divider sx={{ my: 2 }} />
                    <Typography
                      variant="subtitle2"
                      sx={{ color: "text.secondary", mb: 1 }}
                    >
                      Daily Details
                    </Typography>
                    <Box
                      sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}
                    >
                      <Typography variant="body2">Focus time:</Typography>
                      <Typography variant="body2" fontWeight="bold">
                        {formatStatsTime(stats.todayWorkTime)}
                      </Typography>
                    </Box>
                    <Box
                      sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}
                    >
                      <Typography variant="body2">Break time:</Typography>
                      <Typography variant="body2" fontWeight="bold">
                        {formatStatsTime(stats.todayBreakTime)}
                      </Typography>
                    </Box>
                    <Typography
                      variant="subtitle2"
                      sx={{ color: "text.secondary", mb: 1 }}
                    >
                      All Time
                    </Typography>
                    <Box
                      sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}
                    >
                      <Typography variant="body2">Total pomodoros:</Typography>
                      <Typography variant="body2" fontWeight="bold">
                        {stats.totalPomodorosCompleted} ||{" "}
                        {formatStatsTime(stats.totalWorkTime)}
                      </Typography>
                    </Box>
                    <Box
                      sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}
                    >
                      <Typography variant="body2">Total focus time:</Typography>
                      <Typography variant="body2" fontWeight="bold">
                        {formatStatsTime(stats.totalWorkTime)}
                      </Typography>
                    </Box>
                    <Box
                      sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}
                    >
                      <Typography variant="body2">Longest streak:</Typography>
                      <Typography variant="body2" fontWeight="bold">
                        {stats.longestStreak} pomodoros
                      </Typography>
                    </Box>
                    <Button
                      variant="text"
                      color="primary"
                      size="small"
                      onClick={resetAllStats}
                      sx={{ mt: 1 }}
                    >
                      Reset All Stats
                    </Button>
                  </Collapse>
                </Paper>
              </motion.div>
            </Box>
          </Box>

          {/* Settings dialog */}
          <Dialog
            open={showSettings}
            onClose={closeSettingsDialog}
            fullWidth
            maxWidth="xs"
          >
            <DialogTitle>Timer Settings</DialogTitle>
            <DialogContent>
              <Box sx={{ my: 3 }}>
                <Typography variant="subtitle2" sx={{ mb: 2 }}>
                  Durations (minutes)
                </Typography>
                <Stack spacing={4}>
                  <Box>
                    <Typography gutterBottom>
                      Work: {tempSettings.work} min
                    </Typography>
                    <Slider
                      value={tempSettings.work}
                      onChange={handleSliderChange("work")}
                      min={1}
                      max={60}
                      step={1}
                      valueLabelDisplay="auto"
                    />
                  </Box>
                  <Box>
                    <Typography gutterBottom>
                      Short Break: {tempSettings.shortBreak} min
                    </Typography>
                    <Slider
                      value={tempSettings.shortBreak}
                      onChange={handleSliderChange("shortBreak")}
                      min={1}
                      max={30}
                      step={1}
                      valueLabelDisplay="auto"
                    />
                  </Box>
                  <Box>
                    <Typography gutterBottom>
                      Long Break: {tempSettings.longBreak} min
                    </Typography>
                    <Slider
                      value={tempSettings.longBreak}
                      onChange={handleSliderChange("longBreak")}
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
                  Pomodoros Before Long Break:{" "}
                  {tempSettings.pomodorosBeforeLongBreak}
                </Typography>
                <Slider
                  value={tempSettings.pomodorosBeforeLongBreak}
                  onChange={handleSliderChange("pomodorosBeforeLongBreak")}
                  min={1}
                  max={8}
                  step={1}
                  marks
                  valueLabelDisplay="auto"
                />
              </Box>
            </DialogContent>
            <DialogActions>
              <Button onClick={closeSettingsDialog}>Cancel</Button>
              <Button onClick={saveSettings} variant="contained">
                Save
              </Button>
            </DialogActions>
          </Dialog>

          {/* Snackbar */}
          <Snackbar
            open={snackbar.open}
            autoHideDuration={4000}
            onClose={handleCloseSnackbar}
            anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
          >
            <Alert
              onClose={handleCloseSnackbar}
              severity={snackbar.severity}
              variant="filled"
              sx={{ width: "100%" }}
            >
              {snackbar.message}
            </Alert>
          </Snackbar>
        </motion.div>
      </Container>

      {isFullscreen && (
        <FullscreenTimerView
          timerState={timerState}
          onClose={toggleFullscreenMode}
          toggleTimer={toggleTimerState}
          toggleMute={toggleMuteSound}
        />
      )}
    </ThemeProvider>
  );
};

export default PomodoroTimer;