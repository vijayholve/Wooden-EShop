import React from "react";
import { Outlet, Navigate } from "react-router-dom";
import { Box, Container, Typography } from "@mui/material";
import Header from "../components/Header";
import { useAuth } from "../context/AuthContext.jsx";

const PrivateLayout = () => {
  const { isAuthenticated } = useAuth();

  // Guard unauthenticated users
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  // --------------------------------------------------------

  return (
    <Box sx={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      <Header />
      <Container sx={{ flexGrow: 1, mt: 4 }}>
        {/* Only renders Outlet (ProductList, ProfileView, CartView) if authenticated */}
        <Outlet />
      </Container>
      <Box
        component="footer"
        sx={{ py: 2, textAlign: "center", mt: "auto", bgcolor: "#f5f5f5" }}
      >
        <Typography variant="body2">
          &copy; 2025 Wooden E-Shop. All rights reserved.
        </Typography>
      </Box>
    </Box>
  );
};

export default PrivateLayout;
