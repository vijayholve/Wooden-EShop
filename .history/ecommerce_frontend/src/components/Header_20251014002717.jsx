import React from 'react';
// Corrected paths from '../context/AuthContext' to '../context/AuthContext.jsx'
import { useAuth } from '../context/AuthContext.jsx';
import { PRIMARY_COLOR } from '../utils/config.js';
import {
    AppBar,
    Toolbar,
    Typography,
    Button,
    IconButton,
    Box,
    useMediaQuery,
    useTheme
} from '@mui/material';
import { 
    ShoppingCart as CartIcon,
    ExitToApp as LogoutIcon,
    Login as LoginIcon,
    PersonAdd as RegisterIcon,
    AccountCircle as ProfileIcon
} from '@mui/icons-material';

/**
 * Header Component: Displays navigation links and authentication status.
 * Now consumes AuthContext to determine logged-in state.
 */
const Header = ({ setPage }) => {
    // Note: useAuth provides isAuthenticated, username, and logout function
    const { isAuthenticated, username, logout } = useAuth();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

    const handleLogout = () => {
        logout();
        setPage('home'); // Redirect to home after logout
    };

    // Responsive button container styling
    const buttonContainerClass = isMobile ? "flex items-center space-x-1" : "flex items-center space-x-4";

    return (
        <AppBar position="static" sx={{ bgcolor: PRIMARY_COLOR, boxShadow: 3 }}>
            <Toolbar className="max-w-7xl mx-auto w-full">
                {/* Logo / Home */}
                <Typography 
                    variant="h6" 
                    component="div" 
                    sx={{ flexGrow: 1, cursor: 'pointer', fontWeight: 700 }}
                    onClick={() => setPage('home')}
                >
                    Wooden E-Shop
                </Typography>

                <Box className={buttonContainerClass}>
                    {/* Common Navigation */}
                    <Button 
                        color="inherit" 
                        onClick={() => setPage('products')}
                        sx={{ textTransform: 'none' }}
                    >
                        {isMobile ? 'Shop' : 'Products'}
                    </Button>

                    {isAuthenticated ? (
                        <>
                            {/* Authenticated User Icons */}
                            
                            {/* Cart Icon */}
                            <IconButton 
                                color="inherit" 
                                onClick={() => setPage('cart')}
                            >
                                <CartIcon />
                            </IconButton>
                            
                            {/* Profile Button */}
                            <Button
                                color="inherit"
                                onClick={() => setPage('profile')}
                                startIcon={<ProfileIcon />}
                                sx={{ textTransform: 'none', fontWeight: 600 }}
                            >
                                {isMobile ? 'Profile' : (username || 'Profile')}
                            </Button>

                            {/* Logout Icon */}
                            <IconButton 
                                color="inherit" 
                                onClick={handleLogout}
                                aria-label="logout"
                            >
                                <LogoutIcon />
                            </IconButton>
                        </>
                    ) : (
                        <>
                            {/* Unauthenticated User Buttons */}
                            <Button 
                                color="inherit" 
                                onClick={() => setPage('register')}
                                startIcon={<RegisterIcon />}
                                sx={{ textTransform: 'none' }}
                            >
                                {isMobile ? '' : 'Register'}
                            </Button>
                            
                            <Button 
                                color="inherit" 
                                onClick={() => setPage('login')}
                                startIcon={<LoginIcon />}
                                sx={{ textTransform: 'none' }}
                            >
                                {isMobile ? '' : 'Login'}
                            </Button>
                        </>
                    )}
                </Box>
            </Toolbar>
        </AppBar>
    );
};

export default Header;
