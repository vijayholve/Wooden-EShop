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

const PRIMARY_COLOR = '#9e6a3c'; // Warm Amber/Brown for the wooden theme
const HOVER_COLOR = '#b6835a';

const Header = ({ isAuthenticated, user, onNavigate, onLogout, cart }) => {
    const totalCartItems = useMemo(() => {
        if (!cart || !cart.items) return 0;
        return cart.items.reduce((total, item) => total + item.quantity, 0);
    }, [cart]);
    
    return (
        <AppBar position="sticky" sx={{ bgcolor: 'white', boxShadow: 3 }}>
            <Toolbar sx={{ justifyContent: 'space-between', color: '#333' }}>
                <Typography 
                    variant="h6" 
                    noWrap
                    component="div"
                    onClick={() => onNavigate('home')}
                    sx={{ 
                        fontWeight: 'bold', 
                        color: PRIMARY_COLOR, 
                        cursor: 'pointer',
                        transition: 'transform 0.3s',
                        '&:hover': { transform: 'scale(1.05)' }
                    }}
                >
                    Wooden Things API Store
                </Typography>
                
                <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 1, sm: 2 } }}>
                    <IconButton 
                        onClick={() => onNavigate('home')}
                        title="Home"
                        sx={{ color: 'text.secondary', '&:hover': { bgcolor: '#ffe0b230' } }}
                    >
                        <HomeIcon />
                    </IconButton>
                    
                    {isAuthenticated ? (
                        <>
                            {/* Shopping Cart Button */}
                            <Box 
                                onClick={() => onNavigate('cart')}
                                sx={{ position: 'relative', cursor: 'pointer', display: 'flex' }}
                                title="Shopping Cart"
                            >
                                <IconButton sx={{ color: 'text.secondary', '&:hover': { bgcolor: '#ffe0b230' } }}>
                                    <ShoppingCartIcon />
                                </IconButton>
                                {totalCartItems > 0 && (
                                    <Box
                                        sx={{
                                            position: 'absolute', top: 0, right: 0, 
                                            bgcolor: 'red', color: 'white', borderRadius: '50%', 
                                            height: 20, width: 20, fontSize: '0.75rem', 
                                            display: 'flex', alignItems: 'center', justifyContent: 'center', 
                                            fontWeight: 'bold'
                                        }}
                                    >
                                        {totalCartItems}
                                    </Box>
                                )}
                            </Box>
                            
                            {/* Profile Button */}
                            <Button 
                                variant="contained" 
                                onClick={() => onNavigate('profile')}
                                title="Profile"
                                startIcon={<UserIcon />}
                                sx={{ bgcolor: PRIMARY_COLOR, '&:hover': { bgcolor: HOVER_COLOR }, display: { xs: 'none', sm: 'flex' } }}
                            >
                                {user?.username || 'Profile'}
                            </Button>
                             <IconButton onClick={() => onNavigate('profile')} title="Profile" sx={{ color: PRIMARY_COLOR, display: { xs: 'flex', sm: 'none' } }}>
                                <UserIcon />
                            </IconButton>
                            
                            {/* Logout Button */}
                            <IconButton onClick={onLogout} title="Logout" sx={{ color: 'red', '&:hover': { bgcolor: '#ffcdd2' } }}>
                                <LogOutIcon />
                            </IconButton>
                        </>
                    ) : (
                        <>
                            <Button 
                                onClick={() => onNavigate('register')}
                                startIcon={<UserPlusIcon />}
                                sx={{ color: 'text.secondary', '&:hover': { color: PRIMARY_COLOR } }}
                            >
                                Register
                            </Button>
                            <Button 
                                variant="contained" 
                                onClick={() => onNavigate('login')}
                                startIcon={<LogInIcon />}
                                sx={{ bgcolor: PRIMARY_COLOR, '&:hover': { bgcolor: HOVER_COLOR } }}
                            >
                                Login
                            </Button>
                        </>
                    )}
                </Box>
            </Toolbar>
        </AppBar>
    );
};

export default Header;