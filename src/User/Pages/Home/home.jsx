import React from "react";
import Sidebar from "../../Components/Sidebar/sidebar";
import Navbar from "../../Components/Navbar/navbar";
import Style from "./home.module.css";
import UserRouter from "../../../Routers/UserRouter";


const Home = () => {
  return (
    <div className={Style.main}>
      <div className={Style.Sb}>
        <Sidebar />
      </div>

      <div className={Style.Nb}>
        <Navbar />
        <div className={Style.MCon}>
          <UserRouter />
        </div>
      </div>
    </div>
  );
};

export default Home;
