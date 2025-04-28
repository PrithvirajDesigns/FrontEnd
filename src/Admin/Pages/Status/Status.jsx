import React, { useState, useEffect } from 'react';
import { Avatar, Snackbar, Alert, Typography, Box } from '@mui/material';
import PeopleIcon from '@mui/icons-material/People';
import BookIcon from '@mui/icons-material/Book';
import supabase from '../../../utils/supabase';

const Status = () => {
  const [totalUsers, setTotalUsers] = useState(0);
  const [totalBooks, setTotalBooks] = useState(0);
  const [userPhoto, setUserPhoto] = useState(null);
  const [userName, setUserName] = useState('');
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success',
  });

 

  // Fetch counts
  const fetchCounts = async () => {
    try {
      // Fetch total users
      const { count: userCount, error: userError } = await supabase
        .from('tbl_user')
        .select('*', { count: 'exact', head: true });
      if (userError) throw userError;
      setTotalUsers(userCount || 0);

      // Fetch total books
      const { count: bookCount, error: bookError } = await supabase
        .from('tbl_book')
        .select('*', { count: 'exact', head: true });
      if (bookError) throw bookError;
      setTotalBooks(bookCount || 0);
    } catch (error) {
      console.error('Error fetching counts:', error.message);
      showSnackbar('Failed to fetch dashboard data', 'error');
    }
  };

  // Snackbar helper
  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  // Fetch data on mount
  useEffect(() => {
    fetchCounts();
  }, []);

  // Get initials for avatar fallback
  const getInitials = (name) => {
    if (!name) return '';
    const names = name.split(' ');
    return names
      .map((n) => n.charAt(0))
      .slice(0, 2)
      .join('')
      .toUpperCase();
  };

  const StatCard = ({ title, value, icon: Icon }) => (
    <div className="statCard">
      <div className="statIcon">
        <Icon />
      </div>
      <div className="statInfo">
        <h3 className="statTitle">{title}</h3>
        <p className="statValue">{value}</p>
      </div>
    </div>
  );

  return (
    <div className="dashboardContainer">
      <style>
        {`
          .dashboardContainer {
            display: flex;
            flex-direction: column;
            gap: 2rem;
            padding: 2rem;
          }

          .header {
            display: flex;
            align-items: center;
            border-bottom: 1px solid #e0e0e0;
            padding-bottom: 0.5rem;
            margin-bottom: 2rem;
          }

          .headerTitle {
            font-family: 'Roboto', 'Arial', sans-serif;
            font-size: 2.5rem;
            font-weight: 400;
            color: #333;
            margin-left: 1rem;
          }

          .statsSection {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 2rem;
          }

          .statCard {
            display: flex;
            align-items: center;
            background: #ffffff;
            border-radius: 12px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
            padding: 5rem;
            min-height: 150px;
            transition: transform 0.2s;
          }

          .statCard:hover {
            transform: translateY(-4px);
          }

          .statIcon {
            font-size: 3rem;
            margin-right: 1.5rem;
            color: rgb(1, 7, 13);
          }

          .statInfo {
            display: flex;
            flex-direction: column;
          }

          .statTitle {
            font-family: 'Roboto', 'Arial', sans-serif;
            font-size: 1.5rem;
            font-weight: 400;
            color: #333;
            margin: 0;
          }

          .statValue {
            font-family: 'Roboto', 'Arial', sans-serif;
            font-size: 2rem;
            font-weight: 500;
            color: rgb(9, 10, 11);
            margin: 0.5rem 0 0;
          }
        `}
      </style>
      <div className="header">
        <Avatar
          alt={userName || 'User'}
          src={userPhoto}
          sx={{
            width: 40,
            height: 40,
            bgcolor: userPhoto ? 'transparent' : '#212121',
          }}
        >
          {!userPhoto && getInitials(userName)}
        </Avatar>
        <Typography className="headerTitle">Dashboard</Typography>
      </div>
      <div className="statsSection">
        <StatCard title="Total Users" value={totalUsers} icon={PeopleIcon} />
        <StatCard title="Total Books" value={totalBooks} icon={BookIcon} />
      </div>
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          variant="filled"
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </div>
  );
};

export default Status;