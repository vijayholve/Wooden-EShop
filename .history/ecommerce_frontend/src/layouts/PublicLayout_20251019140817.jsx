import React from "react";
import { Outlet } from "react-router-dom";
import { Container, Typography } from "@mui/material";
import Header from "../components/Header";

const PublicLayout = () => {
  return (
    <>
      <Header />
      <Container sx={{ mt: 4 }}>
        <Typography variant="h5" align="center" gutterBottom>
          Welcome to Wooden E-Shop public
        </Typography>
        <Outlet />
      </Container>
    </>
  );
};

export default PublicLayout;
