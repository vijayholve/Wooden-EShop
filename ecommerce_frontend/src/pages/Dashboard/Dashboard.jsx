import React from "react";
import {
  Box,
  Grid,
  Paper,
  List,
  ListItemButton,
  ListItemText,
  ListSubheader,
  Typography,
  Divider,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.jsx";
import UserDetails from "./UserDetails.jsx";

const Sidebar = ({ onNavigate, active }) => (
  <Paper
    elevation={0}
    sx={{
      p: 0,
      border: "1px solid",
      borderColor: "divider",
      borderRadius: 2,
      overflow: "hidden",
    }}
  >
    <List
      component="nav"
      subheader={<ListSubheader component="div">My Account</ListSubheader>}
      sx={{ py: 0 }}
    >
      <ListItemButton
        selected={active === "overview"}
        onClick={() => onNavigate("overview")}
      >
        <ListItemText primary="Overview" secondary="Profile summary" />
      </ListItemButton>
      <ListItemButton onClick={() => onNavigate("/profile")}>
        <ListItemText primary="Edit Profile" secondary="Update your info" />
      </ListItemButton>
      <ListItemButton onClick={() => onNavigate("/cart")}>
        <ListItemText primary="My Cart" secondary="Review items" />
      </ListItemButton>
      <ListItemButton onClick={() => onNavigate("/dashboard/products")}> 
        <ListItemText primary="Products Management" secondary="Manage products" />
      </ListItemButton>
      {/* Extend as needed: orders, addresses, security, etc. */}
    </List>
  </Paper>
);

const Dashboard = () => {
  const navigate = useNavigate();
  const { currentUser: user } = useAuth();

  const handleNavigate = (key) => {
    if (key === "overview") return; // stay on dashboard
    navigate(key);
  };

  return (
    <Box sx={{ p: { xs: 1, md: 2 } }}>
      <Typography variant="h4" sx={{ mb: 2 }}>
        Dashboard
      </Typography>
      <Grid container spacing={2}>
        <Grid item xs={12} md={3}>
          <Sidebar onNavigate={handleNavigate} active={"overview"} />
        </Grid>
        <Grid item xs={12} md={9}>
          <UserDetails user={user} />
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;
