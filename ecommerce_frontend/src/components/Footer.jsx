

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { 
    Container, Box, Typography, Button, TextField, Grid, Card, CardContent, 
    CardMedia, CircularProgress, IconButton, Alert, AppBar, Toolbar 
} from '@mui/material';
import { 
    Login as LogInIcon, PersonAdd as UserPlusIcon, Logout as LogOutIcon, 
    Home as HomeIcon, Person as UserIcon, ShoppingCart as ShoppingCartIcon, 
    ArrowRight as ArrowRightIcon, Edit as EditIcon, Save as SaveIcon, 
    Cancel as CancelIcon
} from '@mui/icons-material';

const Footer = () => (
    <Box sx={{ bgcolor: '#424242', color: 'white', mt: 'auto' }}>
        <Container sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.6)' }}>
                &copy; {new Date().getFullYear()} Wooden Things E-commerce. Backend: DRF + MySQL. Frontend: React + Material-UI.
            </Typography>
        </Container>
    </Box>
);
export default Footer;
