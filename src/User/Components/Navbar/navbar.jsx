import React, { useState, useEffect } from "react";
import Style from "./navbar.module.css";
import NotificationsActiveRoundedIcon from "@mui/icons-material/NotificationsActiveRounded";
import Avatar from "@mui/material/Avatar";
import {
  Badge,
  Popover,
  List,
  ListItem,
  ListItemText,
  Typography,
  Snackbar,
  Alert,
  Box,
} from "@mui/material";
import supabase from "../../../utils/supabase";

const Navbar = () => {
  const [notifications, setNotifications] = useState([]);
  const [anchorEl, setAnchorEl] = useState(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });
  const [userPhoto, setUserPhoto] = useState(null);
  const [userName, setUserName] = useState("");

  const userId = sessionStorage.getItem("uid");
  const open = Boolean(anchorEl);

  // Fetch user data (photo and name)
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
         
          setUserPhoto(data.user_photo);
        } else {
          setUserPhoto(null);
        }
      }
    } catch (error) {
      console.error("Error fetching user data:", error.message);
      showSnackbar("Failed to fetch user data", "error");
      setUserPhoto(null);
      setUserName("");
    }
  };

  // Fetch notifications
  const fetchNotifications = async () => {
    if (!userId) {
      showSnackbar("User not logged in", "error");
      return;
    }
    try {
      const { data, error } = await supabase
        .from("tbl_notifications")
        .select("id, message, status, task_id, tbl_task (task_title)")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });
      if (error) throw error;
      setNotifications(data || []);
    } catch (error) {
      console.error("Error fetching notifications:", error.message);
      showSnackbar("Failed to fetch notifications", "error");
      setNotifications([]);
    }
  };

  // Mark notification as read
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
      showSnackbar("Notification marked as read");
    } catch (error) {
      console.error("Error marking notification as read:", error.message);
      showSnackbar("Failed to mark notification as read", "error");
    }
  };

  // Snackbar helper
  const showSnackbar = (message, severity = "success") => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  // Handle bell icon click
  const handleBellClick = (event) => {
    setAnchorEl(event.currentTarget);
    fetchNotifications(); // Refresh notifications on open
  };

  // Handle popover close
  const handlePopoverClose = () => {
    setAnchorEl(null);
  };

  // Fetch user data and notifications on mount
  useEffect(() => {
    fetchUserData();
    fetchNotifications();
  }, [userId]);

  // Get initials for fallback
  const getInitials = (name) => {
    if (!name) return "";
    const names = name.split(" ");
    return names
      .map((n) => n.charAt(0))
      .slice(0, 2)
      .join("")
      .toUpperCase();
  };

  return (
    <div className={Style.navm}>
      <div className={Style.navbarcon}>
        <Badge
          variant="dot"
          color="error"
          invisible={!notifications.some((n) => n.status === "Unread")}
          sx={{ "& .MuiBadge-dot": { width: 8, height: 8, top: 6, right: 6 } }}
        >
          <NotificationsActiveRoundedIcon
            className={Style.bellicon}
            onClick={handleBellClick}
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              paddingTop: "6px",
              fontSize: "32px",
              color: "#333333",
              cursor: "pointer",
            }}
          />
        </Badge>
        {
          console.log(userPhoto)
          
        }
        <Avatar
          alt={userName || "User"}
          src={userPhoto}
          className={Style.avtricon}
          sx={{ bgcolor: userPhoto ? "transparent" : "#212121" }}
        >
          {!userPhoto && getInitials(userName)}
        </Avatar>

        {/* Notifications Popover */}
        <Popover
          open={open}
          anchorEl={anchorEl}
          onClose={handlePopoverClose}
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
              width: "300px",
              maxHeight: "400px",
              overflowY: "auto",
            },
          }}
        >
          <Box sx={{ p: 2 }}>
            <Typography variant="h6" sx={{ mb: 1 }}>
              Notifications
            </Typography>
            {notifications.length === 0 ? (
              <Typography variant="body2" color="text.secondary" sx={{ p: 2 }}>
                No notifications
              </Typography>
            ) : (
              <List dense>
                {notifications.map((notification) => (
                  <ListItem
                    key={notification.id}
                    button
                    onClick={() => markNotificationAsRead(notification.id)}
                    sx={{
                      borderRadius: "8px",
                      mb: 0.5,
                      backgroundColor:
                        notification.status === "Unread"
                          ? "action.hover"
                          : "transparent",
                      "&:hover": {
                        backgroundColor: "action.hover",
                      },
                    }}
                  >
                    <ListItemText
                      primary={notification.message}
                      secondary={`Task: ${
                        notification.tbl_task?.task_title || "Unknown"
                      } - ${notification.status}`}
                      primaryTypographyProps={{
                        variant: "body2",
                        fontWeight:
                          notification.status === "Unread" ? "bold" : "normal",
                      }}
                      secondaryTypographyProps={{
                        variant: "caption",
                      }}
                    />
                  </ListItem>
                ))}
              </List>
            )}
          </Box>
        </Popover>

        {/* Snackbar for feedback */}
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
      </div>
    </div>
  );
};

export default Navbar