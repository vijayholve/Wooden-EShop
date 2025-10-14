import React from "react";
import { Container, Typography, Grid, Paper } from "@mui/material";

const HomePage = () => {
  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom>
        Welcome to Wooden E-Shop
      </Typography>
      <Grid container spacing={3}>
        {/* Featured Categories */}
        <Grid item xs={12} md={6} lg={4}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6">Category 1</Typography>
            <Typography variant="body2">
              Explore our wide range of products.
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} md={6} lg={4}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6">Category 2</Typography>
            <Typography variant="body2">Find the best deals here.</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} md={6} lg={4}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6">Category 3</Typography>
            <Typography variant="body2">Shop the latest trends.</Typography>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default HomePage;
