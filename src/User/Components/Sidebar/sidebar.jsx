import React from "react";
import Style from "./sidebar.module.css";
import { Link, useLocation } from "react-router-dom";
import {
  IconButton,
  List,
  ListItem,
  ListItemIcon,
  Typography,
} from "@mui/material";
import Box from "@mui/material/Box";
import HomeRoundedIcon from "@mui/icons-material/HomeRounded";
import MenuBookRoundedIcon from "@mui/icons-material/MenuBookRounded";
import HistoryEduRoundedIcon from "@mui/icons-material/HistoryEduRounded";
import SettingsRoundedIcon from "@mui/icons-material/SettingsRounded";
import LogoutRoundedIcon from "@mui/icons-material/LogoutRounded";
import FlagCircleIcon from '@mui/icons-material/FlagCircle';
import TimerIcon from '@mui/icons-material/Timer';
import TaskIcon from '@mui/icons-material/Task';
const Sidebar = () => {
  const location = useLocation();
  const handleLogout = () => {
    // Add your logout logic here
    console.log("User logged out");
  };

  return (
    <div className={Style.sidebarWrapper}>
      <Box className={Style.sidebarBox}>
        <List className={Style.sbmain}>
          <Link
            to={"/user/home"}
            className={`${Style.linktext} ${
              location.pathname === "/user/home" ? Style.active : ""
            }`}
            sx={{ mt: 1 }}
          >
            <ListItem className={Style.ListItem}>
              <ListItemIcon className={Style.iconWrapper}>
                <HomeRoundedIcon />
              </ListItemIcon>
              <Typography variant="body1" sx={{ fontSize: 20 }}>
                Home
              </Typography>
            </ListItem>
          </Link>

          <Link
            to={"/user/booktracker"}
            className={`${Style.linktext} ${
              location.pathname === "/user/booktracker" ? Style.active : ""
            }`}
          >
            <ListItem className={Style.ListItem}>
              <ListItemIcon className={Style.iconWrapper}>
                <MenuBookRoundedIcon />
              </ListItemIcon>
              <Typography variant="body1" sx={{ fontSize: 20 }}>
                Booktracker
              </Typography>
            </ListItem>
          </Link>

          <Link
            to={"/user/diary"}
            className={`${Style.linktext} ${
              location.pathname === "/user/diary" ? Style.active : ""
            }`}
          >
            <ListItem className={Style.ListItem}>
              <ListItemIcon className={Style.iconWrapper}>
                <HistoryEduRoundedIcon />
              </ListItemIcon>
              <Typography variant="body1" sx={{ fontSize: 20 }}>
                Diary
              </Typography>
            </ListItem>
          </Link>

          <Link
            to={"/user/pomodoro"}
            className={`${Style.linktext} ${
              location.pathname === "/user/pomodoro" ? Style.active : ""
            }`}
          >
            <ListItem className={Style.ListItem}>
              <ListItemIcon className={Style.iconWrapper}>
                <TimerIcon />
              </ListItemIcon>
              <Typography variant="body1" sx={{ fontSize: 20 }}>
                Pomodoro
              </Typography>
            </ListItem>
          </Link>

          <Link
            to={"/user/task"}
            className={`${Style.linktext} ${
              location.pathname === "/user/task" ? Style.active : ""
            }`}
          >
            <ListItem className={Style.ListItem}>
              <ListItemIcon className={Style.iconWrapper}>
                <TaskIcon />
              </ListItemIcon>
              <Typography variant="body1" sx={{ fontSize: 20 }}>
                Add Task
              </Typography>
            </ListItem>
          </Link>

          <Link
            to={"/user/settings"}
            className={`${Style.linktext} ${
              location.pathname === "/user/settings" ? Style.active : ""
            }`}
          >
            <ListItem className={Style.ListItem}>
              <ListItemIcon className={Style.iconWrapper}>
                <SettingsRoundedIcon />
              </ListItemIcon>
              <Typography variant="body1" sx={{ fontSize: 20 }}>
                Settings
              </Typography>
            </ListItem>
          </Link>

          <Link
            to={"/user/Report"}
            className={`${Style.linktext} ${
              location.pathname === "/user/report" ? Style.active : ""
            }`}
          >
            <ListItem className={Style.ListItem}>
              <ListItemIcon className={Style.iconWrapper}>
                <FlagCircleIcon />
              </ListItemIcon>
              <Typography variant="body1" sx={{ fontSize: 20 }}>
                Report
              </Typography>
            </ListItem>
          </Link>

          {/* Logout Section */}
          <Box className={Style.logoutContainer}>
            <IconButton onClick={handleLogout} className={Style.logoutButton}>
              <Typography sx={{fontSize: 18, fontWeight:600}} className={Style.logoutLabel}>Logout</Typography>
              <LogoutRoundedIcon sx={{ fontSize: 32 }} />
            </IconButton>
          </Box>
        </List>
      </Box>
    </div>
  );
};

export default Sidebar;
