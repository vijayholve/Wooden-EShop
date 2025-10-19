import React from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { Box, Container, Typography } from "@mui/material";
import Header from "../components/Header";
import { useAuth } from "../context/AuthContext.jsx"; // Import useAuth

const PrivateLayout = () => {
  const { isAuthenticated } = useAuth(); // Get authentication state
  const navigate = useNavigate();

  // --- Route Guard Logic: Check if user is authenticated ---
  React.useEffect(() => {
    if (!isAuthenticated) {
      // Redirect to login page if not authenticated
      navigate("/login"); 
    }
  }, [isAuthenticated, navigate]);

  if (!isAuthenticated) {
    // Render null or a loading indicator while the useEffect is processing the redirect
    return null; 
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