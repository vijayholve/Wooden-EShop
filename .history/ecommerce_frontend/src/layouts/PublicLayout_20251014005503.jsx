import React from 'react';
import { Outlet } from 'react-router-dom';
import { Container, Typography } from '@mui/material';

const PublicLayout = () => {
    return (
        <Container maxWidth="sm" sx={{ mt: 4 }}>
            <Typography variant="h5" align="center" gutterBottom>
                Welcome to Wooden E-Shop
            </Typography>
            <Outlet />
        </Container>
    );
};

export default PublicLayout;