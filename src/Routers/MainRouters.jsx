import React from "react";
import Home from "../User/Pages/Home/home";
import { Route, Routes } from "react-router-dom";
import Adminhome from "../Admin/Pages/Home/home";
import Reg from "../Guest/Pages/Reg page/Reg";
import GuestRouter from "./GuestRouter";

const MainRouters = () => {
  return (
    <div>
      <Routes>
        <Route path="/*" element={<GuestRouter />} />
        {/* <Route path="/*" element={<Reg />} /> */}
        <Route path="admin/*" element={<Adminhome />} />
        <Route path="user/*" element={<Home />} />
      </Routes>
    </div>
  );
};

export default MainRouters;
