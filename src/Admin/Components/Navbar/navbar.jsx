import React, { useState } from "react";
import Style from "./navbar.module.css";
import NotificationsActiveRoundedIcon from "@mui/icons-material/NotificationsActiveRounded";
import Avatar from "@mui/material/Avatar";
import Popover from "@mui/material/Popover";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import LogoutOutlinedIcon from "@mui/icons-material/LogoutOutlined";
import Button from "@mui/material/Button";
import { useNavigate } from "react-router-dom";

const Navbar = () => {
  const [anchorEl, setAnchorEl] = useState(null);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const navigate = useNavigate();
  const handleLogout = () => {
    // Add your logout logic here
    sessionStorage.removeItem("aid");
    navigate("/");
  };

  const open = Boolean(anchorEl);
  const id = open ? "avatar-popover" : undefined;

  return (
    <div className={Style.navm}>
      <div className={Style.navbarcon}>
        
        <Button
          onClick={handleClick}
          sx={{ padding: 0, minWidth: "auto" }}
          aria-describedby={id}
        >
          <Avatar
            alt="Admin Avatar"
            src="/static/images/avatar/1.jpg"
            className={Style.avtricon}
          />
        </Button>

        <Popover
          id={id}
          open={open}
          anchorEl={anchorEl}
          onClose={handleClose}
          anchorOrigin={{
            vertical: "bottom",
            horizontal: "right",
          }}
          transformOrigin={{
            vertical: "top",
            horizontal: "right",
          }}
          PaperProps={{
            sx: {
              marginTop: "8px",
              boxShadow: "0px 4px 20px rgba(0, 0, 0, 0.1)",
              borderRadius: "8px",
              minWidth: "200px",
            },
          }}
        >
          <List>
            <ListItem button onClick={handleLogout}>
              <ListItemIcon>
                <LogoutOutlinedIcon />
              </ListItemIcon>
              <ListItemText primary="Logout" />
            </ListItem>
          </List>
        </Popover>
      </div>
    </div>
  );
};

export default Navbar;