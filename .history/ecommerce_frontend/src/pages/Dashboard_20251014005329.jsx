import React from 'react';
import { Container, Grid, Paper, Typography, Box } from '@mui/material';

const Dashboard = () => {
    return (
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
            <Typography variant="h4" gutterBottom>
                Dashboard
            </Typography>
            <Grid container spacing={3}>
                {/* User Details */}
                <Grid item xs={12} md={4} lg={3}>
                    <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column' }}>
                        <Typography variant="h6">User Details</Typography>
                        <Typography variant="body1">Name: John Doe</Typography>
                        <Typography variant="body1">Email: john.doe@example.com</Typography>
                    </Paper>
                </Grid>

                {/* Quick Links */}
                <Grid item xs={12} md={8} lg={9}>
                    <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column' }}>
                        <Typography variant="h6">Quick Links</Typography>
                        <Box>
                            <Typography variant="body1">- Orders</Typography>
                            <Typography variant="body1">- Wishlist</Typography>
                            <Typography variant="body1">- Settings</Typography>
                        </Box>
                    </Paper>
                </Grid>

                {/* Statistics */}
                <Grid item xs={12}>
                    <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column' }}>
                        <Typography variant="h6">Statistics</Typography>
                        <Typography variant="body1">- Total Orders: 15</Typography>
                        <Typography variant="body1">- Pending Orders: 3</Typography>
                    </Paper>
                </Grid>
            </Grid>
        </Container>
    );
};

export default Dashboard;