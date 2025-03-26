import React from "react";
import { Route, Routes } from "react-router-dom";
import Register from "../Guest/Pages/Reg page/Reg";
import Login from "../Guest/Pages/Login page/Login";

const GuestRouter = () => {
  return (
    <div>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/*" element={<Register />} />
      </Routes>
    </div>
  );
};

export default GuestRouter;
