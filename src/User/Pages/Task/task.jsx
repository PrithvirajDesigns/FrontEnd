import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  Container,
  CssBaseline,
  List,
  ListItem,
  ListItemText,
  Checkbox,
  IconButton,
  Snackbar,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Divider,
  Menu,
  MenuItem,
  InputAdornment,
  Stack,
  Chip,
  FormControl,
  InputLabel,
  Select,
} from "@mui/material";
import NotificationsIcon from "@mui/icons-material/Notifications";
import {
  Add as AddIcon,
  MoreVert as MoreVertIcon,
  Delete as DeleteIcon,
  AccessTime as AccessTimeIcon,
  Flag as FlagIcon,
  LocalOffer as LocalOfferIcon,
  Check as CheckIcon,
  CalendarToday as CalendarIcon,
  GroupAdd as GroupAddIcon,
} from "@mui/icons-material";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import { motion, AnimatePresence } from "framer-motion";
import dayjs from "dayjs";
import supabase from "../../../utils/supabase";

// Custom debounce hook
const useDebounce = (value, delay) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

const theme = createTheme({
  palette: {
    background: {
      default: "#f5f5f5",
    },
    primary: {
      main: "#212121",
    },
  },
  typography: {
    h1: {
      fontSize: "2.5rem",
      fontWeight: 400,
      borderBottom: "1px solid #e0e0e0",
      paddingBottom: "0.5rem",
      marginBottom: "2rem",
    },
  },
  components: {
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: "20px",
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: "12px",
          textTransform: "none",
        },
      },
    },
    MuiMenuItem: {
      styleOverrides: {
        root: {
          minHeight: "auto",
          padding: "8px 16px",
        },
      },
    },
  },
});

const MinimalTaskPage = () => {
  const [tasks, setTasks] = useState([]);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });
  const [anchorEl, setAnchorEl] = useState(null);
  const [currentTask, setCurrentTask] = useState(null);
  const [openReminderModal, setOpenReminderModal] = useState(false);
  const [reminderDateTime, setReminderDateTime] = useState(null);
  const [openPriorityModal, setOpenPriorityModal] = useState(false);
  const [selectedPriority, setSelectedPriority] = useState("");
  const [openRecurModal, setOpenRecurModal] = useState(false);
  const [selectedRecur, setSelectedRecur] = useState("");
  const [openCollabModal, setOpenCollabModal] = useState(false);
  const [collaborators, setCollaborators] = useState([]);
  const [searchEmail, setSearchEmail] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [openNotificationsModal, setOpenNotificationsModal] = useState(false);
  const [priorities, setPriorities] = useState([]);
  const [recurs, setRecurs] = useState([]);
  const [users, setUsers] = useState([]);
  const [notifications, setNotifications] = useState([]);

  const userId = sessionStorage.getItem("uid");
  const debouncedSearchEmail = useDebounce(searchEmail, 300);

  useEffect(() => {
    if (!userId) {
      showSnackbar("User not logged in", "error");
      return;
    }
    fetchData();
  }, []);

  const showSnackbar = (message, severity = "success") => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  // Search users by email when debounced value changes
  useEffect(() => {
    const searchUsersByEmail = async () => {
      if (!debouncedSearchEmail.trim()) {
        setSearchResults([]);
        return;
      }
      try {
        const { data, error } = await supabase
          .from("tbl_user")
          .select("user_id, user_name, user_email")
          .ilike("user_email", `%${debouncedSearchEmail}%`)
          .neq("user_id", userId);
        if (error) throw error;
        setSearchResults(data || []);
      } catch (error) {
        console.error("Error searching users:", error.message);
        showSnackbar("Failed to search users", "error");
        setSearchResults([]);
      }
    };

    searchUsersByEmail();
  }, [debouncedSearchEmail, userId]);

  const fetchData = async () => {
    try {
      // Fetch priorities
      const { data: prioritiesData, error: prioritiesError } = await supabase
        .from("tbl_priority")
        .select("id, priority_name, priority_color");
      if (prioritiesError) throw prioritiesError;
      console.log("prioritiesData:", prioritiesData);
      setPriorities(prioritiesData || []);

      // Fetch recurrence options
      const { data: recursData, error: recursError } = await supabase
        .from("tbl_recur")
        .select("id, recur_name");
      if (recursError) throw recursError;
      console.log("recursData:", recursData);
      setRecurs(recursData || []);

      // Fetch users (for collaborators)
      const { data: usersData, error: usersError } = await supabase
        .from("tbl_user")
        .select("user_id, user_name")
        .neq("user_id", userId);
      if (usersError) throw usersError;
      console.log("usersData:", usersData);
      setUsers(usersData || []);

      // Fetch tasks: owned by user
      const { data: ownedTasks, error: ownedTasksError } = await supabase
        .from("tbl_task")
        .select(
          `
          id, task_title, task_content, task_duedate, task_time, task_status, priority_id, recur_id, user_id,
          tbl_priority (priority_name, priority_color),
          tbl_recur (recur_name),
          tbl_task_collaborators (user_id, status, tbl_user!tbl_task_collaborators_user_id_fkey (user_name))
        `
        )
        .eq("user_id", userId);
      if (ownedTasksError) throw ownedTasksError;

      // Fetch tasks: user is a collaborator
      const { data: collabTasks, error: collabTasksError } = await supabase
        .from("tbl_task")
        .select(
          `
          id, task_title, task_content, task_duedate, task_time, task_status, priority_id, recur_id, user_id,
          tbl_priority (priority_name, priority_color),
          tbl_recur (recur_name),
          tbl_task_collaborators (user_id, status, tbl_user!tbl_task_collaborators_user_id_fkey (user_name))
        `
        )
        .in(
          "id",
          (
            await supabase
              .from("tbl_task_collaborators")
              .select("task_id")
              .eq("user_id", userId)
          ).data?.map((t) => t.task_id) || []
        );
      if (collabTasksError) throw collabTasksError;

      // Combine and deduplicate tasks
      const tasksData = [...(ownedTasks || []), ...(collabTasks || [])].reduce(
        (unique, task) => {
          return unique.some((t) => t.id === task.id)
            ? unique
            : [...unique, task];
        },
        []
      );
      console.log("tasksData:", tasksData);

      const mappedTasks = tasksData.map((task) => {
        // Combine task_duedate and task_time into dueDateTime
        let dueDateTime = null;
        if (task.task_duedate && task.task_time) {
          const dateTimeString = `${task.task_duedate} ${task.task_time}`;
          if (dayjs(dateTimeString, "YYYY-MM-DD HH:mm").isValid()) {
            dueDateTime = dateTimeString;
          }
        }
        return {
          id: task.id,
          title: task.task_title,
          content: task.task_content || "",
          dueDateTime,
          completed: task.task_status === "completed",
          priorityId: task.priority_id,
          recurId: task.recur_id,
          priority: task.tbl_priority || null,
          recurrence: task.tbl_recur || null,
          collaborators: task.tbl_task_collaborators || [],
        };
      });
      console.log("mappedTasks:", mappedTasks);
      setTasks(mappedTasks);

      // Fetch notifications
      const { data: notificationsData, error: notificationsError } =
        await supabase
          .from("tbl_notifications")
          .select("id, message, status, task_id, tbl_task (task_title)")
          .eq("user_id", userId)
          .order("created_at", { ascending: false });
      if (notificationsError) throw notificationsError;
      console.log("notificationsData:", notificationsData);
      setNotifications(notificationsData || []);
    } catch (error) {
      console.error("Error fetching data:", error);
      showSnackbar(`Failed to fetch data: ${error.message}`, "error");
      setTasks([]);
      setNotifications([]);
    }
  };

  const addTask = async () => {
    if (!newTaskTitle.trim()) {
      showSnackbar("Task title cannot be empty", "warning");
      return;
    }
    if (!userId) {
      showSnackbar("User not logged in", "error");
      return;
    }

    try {
      const { data, error } = await supabase
        .from("tbl_task")
        .insert({
          user_id: userId,
          task_title: newTaskTitle,
          task_status: "pending",
        })
        .select("id")
        .single();

      if (error) throw error;

      setNewTaskTitle("");
      showSnackbar("Task added successfully");
      fetchData();
    } catch (error) {
      console.error("Error adding task:", error.message);
      showSnackbar("Failed to add task", "error");
    }
  };

  const toggleComplete = async (id) => {
    if (!userId) {
      showSnackbar("User not logged in", "error");
      return;
    }

    try {
      const task = tasks.find((t) => t.id === id);
      const newStatus = task.completed ? "pending" : "completed";

      const { error } = await supabase
        .from("tbl_task")
        .update({ task_status: newStatus })
        .eq("id", id)
        .eq("user_id", userId);

      if (error) throw error;

      setTasks(
        tasks.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t))
      );
      showSnackbar(`Task marked as ${newStatus}`);
      fetchData();
    } catch (error) {
      console.error("Error toggling task completion:", error.message);
      showSnackbar("Failed to update task", "error");
    }
  };

  const updateReminder = async () => {
    if (!currentTask || !userId) {
      showSnackbar("No task selected or user not logged in", "error");
      return;
    }

    try {
      const updates = {
        task_duedate: reminderDateTime
          ? reminderDateTime.format("YYYY-MM-DD")
          : null,
        task_time: reminderDateTime ? reminderDateTime.format("HH:mm") : null,
      };

      const { error } = await supabase
        .from("tbl_task")
        .update(updates)
        .eq("id", currentTask.id)
        .eq("user_id", userId);

      if (error) throw error;

      setTasks(
        tasks.map((task) =>
          task.id === currentTask.id
            ? {
                ...task,
                dueDateTime: reminderDateTime
                  ? reminderDateTime.format("YYYY-MM-DD HH:mm")
                  : null,
              }
            : task
        )
      );
      showSnackbar("Reminder updated successfully");
      setOpenReminderModal(false);
      setReminderDateTime(null);
      fetchData();
    } catch (error) {
      console.error("Error updating reminder:", error.message);
      showSnackbar("Failed to update reminder", "error");
    }
  };

  const updatePriority = async () => {
    if (!currentTask || !userId) {
      showSnackbar("No task selected or user not logged in", "error");
      return;
    }

    if (!selectedPriority) {
      showSnackbar("Please select a priority", "warning");
      return;
    }

    try {
      const { error } = await supabase
        .from("tbl_task")
        .update({ priority_id: selectedPriority })
        .eq("id", currentTask.id)
        .eq("user_id", userId);

      if (error) throw error;

      setTasks(
        tasks.map((task) =>
          task.id === currentTask.id
            ? { ...task, priorityId: selectedPriority }
            : task
        )
      );
      showSnackbar("Priority updated successfully");
      setOpenPriorityModal(false);
      setSelectedPriority("");
      fetchData();
    } catch (error) {
      console.error("Error updating priority:", error.message);
      showSnackbar("Failed to update priority", "error");
    }
  };

  const updateRecurrence = async () => {
    if (!currentTask || !userId) {
      showSnackbar("No task selected or user not logged in", "error");
      return;
    }

    try {
      const { error } = await supabase
        .from("tbl_task")
        .update({ recur_id: selectedRecur || null })
        .eq("id", currentTask.id)
        .eq("user_id", userId);

      if (error) throw error;

      setTasks(
        tasks.map((task) =>
          task.id === currentTask.id
            ? { ...task, recurId: selectedRecur }
            : task
        )
      );
      showSnackbar("Recurrence updated successfully");
      setOpenRecurModal(false);
      setSelectedRecur("");
      fetchData();
    } catch (error) {
      console.error("Error updating recurrence:", error.message);
      showSnackbar("Failed to update recurrence", "error");
    }
  };

  const addCollaborators = async () => {
    if (!currentTask || !userId) {
      showSnackbar("No task selected or user not logged in", "error");
      return;
    }

    if (collaborators.length === 0) {
      showSnackbar("Please select at least one collaborator", "warning");
      return;
    }

    try {
      const collaboratorInserts = collaborators.map((user_id) => ({
        task_id: currentTask.id,
        user_id,
        status: "Invited",
      }));

      const { error: collabError } = await supabase
        .from("tbl_task_collaborators")
        .insert(collaboratorInserts);

      if (collabError) throw collabError;

      const notificationInserts = collaborators.map((user_id) => ({
        user_id,
        task_id: currentTask.id,
        message: `You've been added to task: ${currentTask.title}`,
        status: "Unread",
      }));

      const { error: notifError } = await supabase
        .from("tbl_notifications")
        .insert(notificationInserts);

      if (notifError) throw notifError;

      showSnackbar("Collaborators added successfully");
      setOpenCollabModal(false);
      setCollaborators([]);
      setSearchEmail("");
      setSearchResults([]);
      fetchData();
    } catch (error) {
      console.error("Error adding collaborators:", error.message);
      showSnackbar("Failed to add collaborators", "error");
    }
  };

  const handleAcceptCollaboration = async (taskId) => {
    try {
      const { error } = await supabase
        .from("tbl_task_collaborators")
        .update({ status: "Accepted" })
        .eq("task_id", taskId)
        .eq("user_id", userId);

      if (error) throw error;
      showSnackbar("Collaboration accepted");
      fetchData();
    } catch (error) {
      console.error("Error accepting collaboration:", error.message);
      showSnackbar("Failed to accept collaboration", "error");
    }
  };

  const handleDeclineCollaboration = async (taskId) => {
    try {
      const { error } = await supabase
        .from("tbl_task_collaborators")
        .update({ status: "Declined" })
        .eq("task_id", taskId)
        .eq("user_id", userId);

      if (error) throw error;
      showSnackbar("Collaboration declined");
      fetchData();
    } catch (error) {
      console.error("Error declining collaboration:", error.message);
      showSnackbar("Failed to decline collaboration", "error");
    }
  };

  const markNotificationAsRead = async (notificationId) => {
    try {
      const { error } = await supabase
        .from("tbl_notifications")
        .update({ status: "Read" })
        .eq("id", notificationId);

      if (error) throw error;
      setNotifications((prev) =>
        prev.map((n) =>
          n.id === notificationId ? { ...n, status: "Read" } : n
        )
      );
      fetchData();
    } catch (error) {
      console.error("Error marking notification as read:", error.message);
      showSnackbar("Failed to mark notification as read", "error");
    }
  };

  const deleteTask = async (id) => {
    if (!userId) {
      showSnackbar("User not logged in", "error");
      return;
    }

    try {
      const { error } = await supabase
        .from("tbl_task")
        .delete()
        .eq("id", id)
        .eq("user_id", userId);

      if (error) throw error;

      setTasks(tasks.filter((task) => task.id !== id));
      showSnackbar("Task deleted successfully");
      handleMenuClose();
      fetchData();
    } catch (error) {
      console.error("Error deleting task:", error.message);
      showSnackbar("Failed to delete task", "error");
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      addTask();
    }
  };

  const handleMenuOpen = (event, task) => {
    setAnchorEl(event.currentTarget);
    setCurrentTask(task);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleOpenReminderModal = () => {
    if (!currentTask) {
      showSnackbar("No task selected", "error");
      return;
    }
    setReminderDateTime(
      currentTask.dueDateTime ? dayjs(currentTask.dueDateTime) : null
    );
    setOpenReminderModal(true);
    handleMenuClose();
  };

  const handleOpenPriorityModal = () => {
    if (!currentTask) {
      showSnackbar("No task selected", "error");
      return;
    }
    setSelectedPriority(currentTask.priorityId || "");
    setOpenPriorityModal(true);
    handleMenuClose();
  };

  const handleOpenRecurModal = () => {
    if (!currentTask) {
      showSnackbar("No task selected", "error");
      return;
    }
    setSelectedRecur(currentTask.recurId || "");
    setOpenRecurModal(true);
    handleMenuClose();
  };

  const handleOpenCollabModal = () => {
    if (!currentTask) {
      showSnackbar("No task selected", "error");
      return;
    }
    setCollaborators([]);
    setSearchEmail("");
    setSearchResults([]);
    setOpenCollabModal(true);
    handleMenuClose();
  };

  const handleOpenNotificationsModal = () => {
    setOpenNotificationsModal(true);
    fetchData();
  };

  const handleAddCollaborator = (user_id) => {
    if (user_id && !collaborators.includes(user_id) && user_id !== userId) {
      setCollaborators([...collaborators, user_id]);
      setSearchEmail("");
      setSearchResults([]);
    }
  };

  const handleRemoveCollaborator = (user_id) => {
    setCollaborators(collaborators.filter((id) => id !== user_id));
  };

  const open = Boolean(anchorEl);
  const id = open ? "task-options-menu" : undefined;

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          <Container maxWidth="md" sx={{ py: 4 }}>
            <Box
              display="flex"
              justifyContent="space-between"
              alignItems="center"
              mb={2}
            >
              <Typography variant="h1" component="h1" color="text.primary">
                Tasks
              </Typography>
              <IconButton onClick={handleOpenNotificationsModal}>
                <NotificationsIcon />
                {notifications.some((n) => n.status === "Unread") && (
                  <Box
                    sx={{
                      position: "absolute",
                      top: 8,
                      right: 8,
                      width: 8,
                      height: 8,
                      borderRadius: "50%",
                      backgroundColor: "error.main",
                    }}
                  />
                )}
              </IconButton>
            </Box>

            {/* Task Input Section */}
            <Paper elevation={2} sx={{ p: 3, mb: 4 }}>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Add New Task
              </Typography>
              <Box display="flex" gap={2}>
                <TextField
                  fullWidth
                  variant="outlined"
                  placeholder="Type a new task..."
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  onKeyDown={handleKeyDown}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <AddIcon color="action" />
                      </InputAdornment>
                    ),
                  }}
                />
                <Button
                  variant="contained"
                  onClick={addTask}
                  sx={{ px: 4 }}
                  component={motion.div}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Add
                </Button>
              </Box>
            </Paper>

            {/* Task List */}
            {/* Task List */}
            <Paper elevation={2} sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Your Tasks
              </Typography>
              <List>
                <AnimatePresence>
                  {tasks.map((task) => {
                    // Count completed collaborators
                    const completedCollaborators =
                      task.collaborators?.filter(
                        (c) => c.status === "Completed"
                      ) || [];

                    return (
                      <motion.div
                        key={task.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.3 }}
                      >
                        <ListItem
                          sx={{
                            borderRadius: "12px",
                            mb: 1,
                            backgroundColor:
                              completedCollaborators.length > 0
                                ? "rgba(76, 175, 80, 0.08)"
                                : "inherit",
                            "&:hover": {
                              backgroundColor:
                                completedCollaborators.length > 0
                                  ? "rgba(76, 175, 80, 0.12)"
                                  : "rgba(0, 0, 0, 0.04)",
                            },
                          }}
                          component={motion.div}
                          whileHover={{ scale: 1.01 }}
                          secondaryAction={
                            <IconButton
                              edge="end"
                              aria-label="options"
                              onClick={(e) => handleMenuOpen(e, task)}
                            >
                              <MoreVertIcon />
                            </IconButton>
                          }
                        >
                          <Checkbox
                            checked={task.completed}
                            onChange={() => toggleComplete(task.id)}
                            icon={
                              <Box
                                sx={{
                                  width: 20,
                                  height: 20,
                                  border: "2px solid #cfcfcf",
                                  borderRadius: "6px",
                                }}
                              />
                            }
                            checkedIcon={
                              <CheckIcon
                                sx={{
                                  backgroundColor: "#212121",
                                  color: "#ffffff",
                                  borderRadius: "6px",
                                  fontSize: 20,
                                  p: "2px",
                                }}
                              />
                            }
                            sx={{ mr: 2 }}
                          />
                          <ListItemText
                            primary={
                              <Box display="flex" alignItems="center" gap={1}>
                                <Typography
                                  sx={{
                                    textDecoration: task.completed
                                      ? "line-through"
                                      : "none",
                                    color: task.completed
                                      ? "#9e9e9e"
                                      : "inherit",
                                  }}
                                >
                                  {task.title}
                                </Typography>
                                {task.priority && (
                                  <Box
                                    sx={{
                                      width: 12,
                                      height: 12,
                                      borderRadius: "50%",
                                      backgroundColor:
                                        task.priority.priority_color,
                                    }}
                                  />
                                )}
                              </Box>
                            }
                            secondary={
                              <Box>
                                {task.dueDateTime && (
                                  <Box
                                    display="flex"
                                    alignItems="center"
                                    gap={0.5}
                                    mt={0.5}
                                  >
                                    <CalendarIcon
                                      fontSize="small"
                                      sx={{ fontSize: 16 }}
                                    />
                                    <Typography
                                      variant="body2"
                                      component="span"
                                    >
                                      {dayjs(task.dueDateTime).format(
                                        "YYYY-MM-DD HH:mm"
                                      )}
                                    </Typography>
                                  </Box>
                                )}
                                {task.recurrence && (
                                  <Typography variant="body2" mt={0.5}>
                                    Recurs: {task.recurrence.recur_name}
                                  </Typography>
                                )}
                                {task.collaborators?.length > 0 && (
                                  <Box mt={1}>
                                    <Typography
                                      variant="body2"
                                      sx={{ mb: 0.5 }}
                                    >
                                      Collaborators ({task.collaborators.length}
                                      ):
                                    </Typography>
                                    <Box display="flex" flexWrap="wrap" gap={1}>
                                      {task.collaborators.map(
                                        (collaborator) => (
                                          <Box
                                            key={collaborator.user_id}
                                            display="flex"
                                            alignItems="center"
                                            gap={0.5}
                                            sx={{
                                              p: 0.5,
                                              borderRadius: 1,
                                              backgroundColor:
                                                collaborator.status ===
                                                "Completed"
                                                  ? "rgba(76, 175, 80, 0.2)"
                                                  : "transparent",
                                            }}
                                          >
                                            <Box
                                              sx={{
                                                width: 8,
                                                height: 8,
                                                borderRadius: "50%",
                                                backgroundColor:
                                                  collaborator.status ===
                                                  "Completed"
                                                    ? "success.main"
                                                    : "grey.500",
                                              }}
                                            />
                                            <Typography variant="body2">
                                              {collaborator.tbl_user
                                                ?.user_name || "Unknown"}
                                              {collaborator.user_id ===
                                                userId && " (You)"}
                                            </Typography>
                                          </Box>
                                        )
                                      )}
                                    </Box>
                                    {completedCollaborators.length > 0 && (
                                      <Typography
                                        variant="body2"
                                        sx={{ mt: 1, color: "success.main" }}
                                      >
                                        {completedCollaborators.length} of{" "}
                                        {task.collaborators.length}{" "}
                                        collaborators completed
                                      </Typography>
                                    )}
                                  </Box>
                                )}
                                {task.collaborators?.some(
                                  (c) =>
                                    c.user_id === userId &&
                                    c.status === "Invited"
                                ) && (
                                  <Box display="flex" gap={1} mt={1}>
                                    <Button
                                      variant="outlined"
                                      size="small"
                                      onClick={() =>
                                        handleAcceptCollaboration(task.id)
                                      }
                                    >
                                      Accept
                                    </Button>
                                    <Button
                                      variant="outlined"
                                      size="small"
                                      color="error"
                                      onClick={() =>
                                        handleDeclineCollaboration(task.id)
                                      }
                                    >
                                      Decline
                                    </Button>
                                  </Box>
                                )}
                              </Box>
                            }
                          />
                        </ListItem>
                        <Divider component="li" />
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
                {tasks.length === 0 && (
                  <Typography
                    variant="body1"
                    sx={{ py: 4, textAlign: "center", color: "text.secondary" }}
                  >
                    No tasks yet. Add your first task above!
                  </Typography>
                )}
              </List>
            </Paper>
          </Container>
        </motion.div>

        {/* Task Options Menu */}
        <Menu
          id={id}
          open={open}
          anchorEl={anchorEl}
          onClose={handleMenuClose}
          anchorOrigin={{
            vertical: "bottom",
            horizontal: "right",
          }}
          transformOrigin={{
            vertical: "top",
            horizontal: "right",
          }}
          PaperProps={{
            elevation: 3,
            sx: {
              borderRadius: "12px",
              minWidth: "200px",
            },
          }}
        >
          <MenuItem onClick={handleOpenReminderModal}>
            <AccessTimeIcon sx={{ mr: 2, fontSize: 20 }} />
            Set Reminder
          </MenuItem>
          <MenuItem onClick={handleOpenPriorityModal}>
            <FlagIcon sx={{ mr: 2, fontSize: 20 }} />
            Set Priority
          </MenuItem>
          <MenuItem onClick={handleOpenRecurModal}>
            <LocalOfferIcon sx={{ mr: 2, fontSize: 20 }} />
            Set Recurrence
          </MenuItem>
          <MenuItem onClick={handleOpenCollabModal}>
            <GroupAddIcon sx={{ mr: 2, fontSize: 20 }} />
            Add Collaborators
          </MenuItem>
          <Divider />
          <MenuItem
            onClick={() => {
              if (currentTask) deleteTask(currentTask.id);
            }}
            sx={{ color: "error.main" }}
          >
            <DeleteIcon sx={{ mr: 2, fontSize: 20 }} />
            Delete Task
          </MenuItem>
        </Menu>

        {/* Reminder Dialog */}
        <Dialog
          open={openReminderModal}
          onClose={() => setOpenReminderModal(false)}
          PaperProps={{
            sx: { borderRadius: "16px", width: "100%", maxWidth: "400px" },
          }}
        >
          <DialogTitle>
            Set Reminder for "{currentTask?.title || "Task"}"
          </DialogTitle>
          <DialogContent>
            <Stack spacing={3} sx={{ mt: 1 }}>
              <DatePicker
                label="Due Date & Time"
                value={reminderDateTime}
                onChange={(newValue) => setReminderDateTime(newValue)}
                slots={{
                  openPickerIcon: CalendarIcon,
                }}
                slotProps={{
                  textField: {
                    fullWidth: true,
                    InputProps: {
                      startAdornment: (
                        <InputAdornment position="start">
                          <CalendarIcon />
                        </InputAdornment>
                      ),
                    },
                  },
                }}
              />
            </Stack>
          </DialogContent>
          <DialogActions sx={{ p: 2 }}>
            <Button onClick={() => setOpenReminderModal(false)} color="inherit">
              Cancel
            </Button>
            <Button
              onClick={updateReminder}
              variant="contained"
              disabled={!currentTask}
              component={motion.div}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Save Reminder
            </Button>
          </DialogActions>
        </Dialog>

        {/* Priority Dialog */}
        <Dialog
          open={openPriorityModal}
          onClose={() => setOpenPriorityModal(false)}
          PaperProps={{
            sx: { borderRadius: "16px", width: "100%", maxWidth: "400px" },
          }}
        >
          <DialogTitle>
            Set Priority for "{currentTask?.title || "Task"}"
          </DialogTitle>
          <DialogContent>
            <FormControl fullWidth sx={{ mt: 2 }}>
              <InputLabel id="priority-select-label">Priority</InputLabel>
              <Select
                labelId="priority-select-label"
                value={selectedPriority}
                label="Priority"
                onChange={(e) => setSelectedPriority(e.target.value)}
              >
                <MenuItem value="">
                  <em>None</em>
                </MenuItem>
                {priorities.map((priority) => (
                  <MenuItem key={priority.id} value={priority.id}>
                    <Box display="flex" alignItems="center" gap={1}>
                      <Box
                        sx={{
                          width: 12,
                          height: 12,
                          borderRadius: "50%",
                          backgroundColor: priority.priority_color,
                        }}
                      />
                      {priority.priority_name}
                    </Box>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </DialogContent>
          <DialogActions sx={{ p: 2 }}>
            <Button onClick={() => setOpenPriorityModal(false)} color="inherit">
              Cancel
            </Button>
            <Button
              onClick={updatePriority}
              variant="contained"
              disabled={!currentTask || !selectedPriority}
              component={motion.div}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Save Priority
            </Button>
          </DialogActions>
        </Dialog>

        {/* Recurrence Dialog */}
        <Dialog
          open={openRecurModal}
          onClose={() => setOpenRecurModal(false)}
          PaperProps={{
            sx: { borderRadius: "16px", width: "100%", maxWidth: "400px" },
          }}
        >
          <DialogTitle>
            Set Recurrence for "{currentTask?.title || "Task"}"
          </DialogTitle>
          <DialogContent>
            <FormControl fullWidth sx={{ mt: 2 }}>
              <InputLabel id="recur-select-label">Recurrence</InputLabel>
              <Select
                labelId="recur-select-label"
                value={selectedRecur}
                label="Recurrence"
                onChange={(e) => setSelectedRecur(e.target.value)}
              >
                <MenuItem value="">
                  <em>None</em>
                </MenuItem>
                {recurs.map((recur) => (
                  <MenuItem key={recur.id} value={recur.id}>
                    {recur.recur_name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </DialogContent>
          <DialogActions sx={{ p: 2 }}>
            <Button onClick={() => setOpenRecurModal(false)} color="inherit">
              Cancel
            </Button>
            <Button
              onClick={updateRecurrence}
              variant="contained"
              disabled={!currentTask}
              component={motion.div}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Save Recurrence
            </Button>
          </DialogActions>
        </Dialog>

        {/* Collaborators Dialog */}
        <Dialog
          open={openCollabModal}
          onClose={() => setOpenCollabModal(false)}
          PaperProps={{
            sx: { borderRadius: "16px", width: "100%", maxWidth: "400px" },
          }}
        >
          <DialogTitle>
            Add Collaborators to "{currentTask?.title || "Task"}"
          </DialogTitle>
          <DialogContent>
            <TextField
              fullWidth
              variant="outlined"
              label="Search by Email"
              value={searchEmail}
              onChange={(e) => setSearchEmail(e.target.value)}
              sx={{ mt: 2 }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <AddIcon color="action" />
                  </InputAdornment>
                ),
              }}
            />
            {searchResults.length > 0 && (
              <Paper
                elevation={1}
                sx={{
                  mt: 1,
                  maxHeight: 200,
                  overflowY: "auto",
                  borderRadius: "8px",
                }}
              >
                <List dense>
                  {searchResults.map((user) => (
                    <ListItem
                      key={user.user_id}
                      button
                      onClick={() => handleAddCollaborator(user.user_id)}
                      sx={{
                        "&:hover": { backgroundColor: "action.hover" },
                      }}
                      disabled={collaborators.includes(user.user_id)}
                    >
                      <ListItemText
                        primary={user.user_name}
                        secondary={user.user_email}
                      />
                    </ListItem>
                  ))}
                </List>
              </Paper>
            )}
            {searchEmail && searchResults.length === 0 && (
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                No users found
              </Typography>
            )}
            <Box sx={{ mt: 2, display: "flex", flexWrap: "wrap", gap: 1 }}>
              {collaborators.map((collab) => {
                const user = users.find((u) => u.user_id === collab) || {
                  user_name: "Unknown",
                };
                return (
                  <Chip
                    key={collab}
                    label={user.user_name}
                    onDelete={() => handleRemoveCollaborator(collab)}
                    sx={{ mb: 1 }}
                  />
                );
              })}
            </Box>
          </DialogContent>
          <DialogActions sx={{ p: 2 }}>
            <Button onClick={() => setOpenCollabModal(false)} color="inherit">
              Cancel
            </Button>
            <Button
              onClick={addCollaborators}
              variant="contained"
              disabled={collaborators.length === 0}
              component={motion.div}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Save Collaborators
            </Button>
          </DialogActions>
        </Dialog>

        {/* Notifications Dialog */}
        <Dialog
          open={openNotificationsModal}
          onClose={() => setOpenNotificationsModal(false)}
          PaperProps={{
            sx: { borderRadius: "16px", width: "100%", maxWidth: "400px" },
          }}
        >
          <DialogTitle>Notifications</DialogTitle>
          <DialogContent>
            <List>
              {notifications.length === 0 && (
                <Typography variant="body2" color="text.secondary">
                  No notifications
                </Typography>
              )}
              {notifications.map((notification) => (
                <ListItem
                  key={notification.id}
                  onClick={() => markNotificationAsRead(notification.id)}
                  sx={{
                    backgroundColor:
                      notification.status === "Unread"
                        ? "action.hover"
                        : "transparent",
                    borderRadius: "8px",
                    mb: 1,
                    cursor: "pointer",
                  }}
                >
                  <ListItemText
                    primary={notification.message}
                    secondary={`Task: ${
                      notification.tbl_task?.task_title || "Unknown"
                    } - ${notification.status}`}
                  />
                </ListItem>
              ))}
            </List>
          </DialogContent>
          <DialogActions sx={{ p: 2 }}>
            <Button
              onClick={() => setOpenNotificationsModal(false)}
              color="inherit"
            >
              Close
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
      </LocalizationProvider>
    </ThemeProvider>
  );
};

export default MinimalTaskPage;
