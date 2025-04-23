import React from "react";
import Style from "./sidebar.module.css";
import { Link } from "react-router-dom";
import { List, ListItem, ListItemIcon, Typography } from "@mui/material";
import Box from "@mui/material/Box";
import HomeRoundedIcon from "@mui/icons-material/HomeRounded";
import MenuBookRoundedIcon from "@mui/icons-material/MenuBookRounded";
import PersonAddAlt1Icon from "@mui/icons-material/PersonAddAlt1";
import EventRepeatOutlinedIcon from '@mui/icons-material/EventRepeatOutlined';
import PriorityHighOutlinedIcon from '@mui/icons-material/PriorityHighOutlined';

const Sidebar = () => {
  return (
    <div>
      <Box
        sx={{
          width: "auto",
          height: "100%",
          marginTop: "10px",
          marginBottom: "20px",
          marginLeft: "15px",
        }}
      >
        <List className={Style.sbmain}>
          <Link to={"/admin/status"} className={Style.linktext}>
            <ListItem
              className={Style.ListItem}
              sx={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                flexDirection: "column-reverse",
              }}
            >
              <Typography variant="body1" sx={{ color: "rgb(47, 73, 104)",alignItems:"center" }}>
                Home
              </Typography>
              <ListItemIcon>
                <HomeRoundedIcon
                  sx={{ color: "rgb(47, 73, 104)", width: 40, height: 40 }}
                />
              </ListItemIcon>
            </ListItem>
          </Link>

          <Link to={"/admin/adminreg"} className={Style.linktext}>
            {" "}
            <ListItem
              className={Style.ListItem}
              sx={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                flexDirection: "column-reverse",
              }}
            >
              <Typography variant="body1" sx={{ color: "rgb(47, 73, 104)" }}>
                Add Admin
              </Typography>
              <ListItemIcon>
                <PersonAddAlt1Icon
                  sx={{ color: "rgb(47, 73, 104)", width: 40, height: 40 }}
                />
              </ListItemIcon>
            </ListItem>
          </Link>

          <Link to={"/admin/bookadd"} className={Style.linktext}>
            {" "}
            <ListItem
              className={Style.ListItem}
              sx={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                flexDirection: "column-reverse",
              }}
            >
              <Typography variant="body1" sx={{ color: "rgb(47, 73, 104)" }}>
                Add Books
              </Typography>
              <ListItemIcon>
                <MenuBookRoundedIcon
                  sx={{ color: "rgb(47, 73, 104)", width: 40, height: 40 }}
                />
              </ListItemIcon>
            </ListItem>
          </Link>

          <Link to={"/admin/priority"} className={Style.linktext}>
            <ListItem
              className={Style.ListItem}
              sx={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                flexDirection: "column-reverse",
              }}
            >
              <Typography variant="body1" sx={{ color: "rgb(47, 73, 104)" }}>
                Priority
              </Typography>
              <ListItemIcon>
                <PriorityHighOutlinedIcon
                  sx={{ color: "rgb(47, 73, 104)", width: 40, height: 40 }}
                />
              </ListItemIcon>
            </ListItem>
          </Link>

          <Link to={"/admin/Repeating"} className={Style.linktext}>
            <ListItem
              className={Style.ListItem}
              sx={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                flexDirection: "column-reverse",
              }}
            >
              <Typography variant="body1" sx={{ color: "rgb(47, 73, 104)" }}>
                Recurring Task
              </Typography>
              <ListItemIcon>
                <EventRepeatOutlinedIcon
                  sx={{ color: "rgb(47, 73, 104)", width: 40, height: 40 }}
                />
              </ListItemIcon>
            </ListItem>
          </Link>
        </List>
      </Box>
    </div>
  );
};

export default Sidebar;