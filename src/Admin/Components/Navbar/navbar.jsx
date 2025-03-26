import React from "react";
import Style from "./navbar.module.css";
import NotificationsActiveRoundedIcon from "@mui/icons-material/NotificationsActiveRounded";
import Avatar from "@mui/material/Avatar";

const Navbar = () => {
  return (
    <div className={Style.navm}>
      <div className={Style.navbarcon}>
        <NotificationsActiveRoundedIcon
          className={Style.bellicon}
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            paddingTop: "6px",
          }}
        />
        <Avatar
          alt="Remy Sharp"
          src="/static/images/avatar/1.jpg"
          className={Style.avtricon}
        />
        
        
      </div>
    </div>
  );
};

export default Navbar;
