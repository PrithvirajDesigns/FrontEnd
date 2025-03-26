import React, { useState } from "react";
import Sidebar from "../../Components/Sidebar/sidebar";
import Navbar from "../../Components/Navbar/navbar";
import Style from "./home.module.css";
import AdminRouter from "../../../Routers/AdminRouter";

// Dashboard components
const StatCard = ({ title, value, icon }) => (
  <div className={Style.statCard}>
    <div className={Style.statIcon}>{icon}</div>
    <div className={Style.statInfo}>
      <h3 className={Style.statTitle}>{title}</h3>
      <p className={Style.statValue}>{value}</p>
    </div>
  </div>
);

const RecentActivity = () => (
  <div className={Style.activityCard}>
    <h2 className={Style.cardTitle}>Recent Activity</h2>
    <div className={Style.activityList}>
      {[
        { user: "Sarah Johnson", action: "Created new project", time: "10 min ago" },
        { user: "Michael Chen", action: "Updated user settings", time: "1 hour ago" },
        { user: "Emily Davis", action: "Deleted record #1082", time: "3 hours ago" },
        { user: "Robert Wilson", action: "Added new user", time: "Yesterday" }
      ].map((activity, index) => (
        <div key={index} className={Style.activityItem}>
          <p className={Style.activityUser}>{activity.user}</p>
          <p className={Style.activityAction}>{activity.action}</p>
          <p className={Style.activityTime}>{activity.time}</p>
        </div>
      ))}
    </div>
  </div>
);

const TaskProgress = () => (
  <div className={Style.progressCard}>
    <h2 className={Style.cardTitle}>Task Progress</h2>
    <div className={Style.progressList}>
      {[
        { task: "System update", progress: 75 },
        { task: "Database migration", progress: 45 },
        { task: "User onboarding", progress: 90 },
        { task: "Security audit", progress: 30 }
      ].map((item, index) => (
        <div key={index} className={Style.progressItem}>
          <div className={Style.progressInfo}>
            <p className={Style.progressTask}>{item.task}</p>
            <p className={Style.progressPercent}>{item.progress}%</p>
          </div>
          <div className={Style.progressBarWrapper}>
            <div 
              className={Style.progressBar} 
              style={{ width: `${item.progress}%` }}
            ></div>
          </div>
        </div>
      ))}
    </div>
  </div>
);

const AdminDashboard = () => {
  return (
    <div className={Style.dashboardContainer}>
      <div className={Style.statsSection}>
        <StatCard 
          title="Total Users" 
          value="8,249" 
          icon="👥"
        />
        <StatCard 
          title="Active Projects" 
          value="142" 
          icon="📊"
        />
        <StatCard 
          title="Pending Tasks" 
          value="38" 
          icon="📝"
        />
        <StatCard 
          title="System Status" 
          value="Healthy" 
          icon="✅"
        />
      </div>

      <div className={Style.chartsSection}>
        <RecentActivity />
        <TaskProgress />
      </div>
    </div>
  );
};

const Adminhome = () => {
  return (
    <div className={Style.main}>
      <div className={Style.Sb}>
        <Sidebar />
      </div>

      <div className={Style.Nb}>
        <Navbar />
        <div className={Style.MCon}>
          <AdminRouter />
        </div>
      </div>
    </div>
  );
};

export default Adminhome;