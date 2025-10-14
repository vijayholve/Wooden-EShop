import React from "react";
import { Outlet } from "react-router-dom";
import { AppBar, Toolbar, Typography, Box, Container } from "@mui/material";
import Header from "../components/Header";

const PrivateLayout = () => {
  return (
    <Box sx={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      <Header />
      <Container sx={{ flexGrow: 1, mt: 4 }}>
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
