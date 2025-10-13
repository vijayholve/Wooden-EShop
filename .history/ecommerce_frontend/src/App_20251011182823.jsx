
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
import CartView from './pages/Profile/CartView';
import ProductList from './pages/Product/ProductList';
import ProfileView from './pages/Profile/ProfileView';
import AuthForm from './pages/Auth/Auth';
import Header from './components/Header';
import Footer from './components/Footer';
import useApiFetcher from './hooks/useApiFetcher';
const PRIMARY_COLOR = '#9e6a3c';
const HOVER_COLOR = '#b6835a';

function App() {
    const [page, setPage] = useState('home');
    const [accessToken, setAccessToken] = useState(localStorage.getItem('accessToken'));
    const [refreshToken, setRefreshToken] = useState(localStorage.getItem('refreshToken'));
    const [user, setUser] = useState(null);
    const [cart, setCart] = useState(null);
    const [message, setMessage] = useState('');

    const apiFetch = useApiFetcher(accessToken, setAccessToken, setRefreshToken);
    const isAuthenticated = !!accessToken;
    
    // Message clear timer
    useEffect(() => {
        if (message) {
            const timer = setTimeout(() => setMessage(''), 5000);
            return () => clearTimeout(timer);
        }
    }, [message]);

    // Initial load and persistence effects for tokens
    useEffect(() => {
        setAccessToken(localStorage.getItem('accessToken'));
        setRefreshToken(localStorage.getItem('refreshToken'));
    }, []);

    useEffect(() => {
        accessToken ? localStorage.setItem('accessToken', accessToken) : localStorage.removeItem('accessToken');
        refreshToken ? localStorage.setItem('refreshToken', refreshToken) : localStorage.removeItem('refreshToken');
    }, [accessToken, refreshToken]);

    // Auth state change handler (fetches user/cart)
    useEffect(() => {
        if (isAuthenticated) {
            fetchUserProfile();
            fetchUserCart();
        } else {
            setUser(null);
            setCart(null);
        }
    }, [isAuthenticated, accessToken]);

    const handleLogout = () => {
        setAccessToken(null);
        setRefreshToken(null);
        setUser(null);
        setCart(null);
        setMessage('Logged out successfully.');
        setPage('home');
    };
    
    const fetchUserProfile = async () => {
        try {
            const response = await apiFetch('/users/me/');
            if (response.ok) {
                const data = await response.json();
                setUser({ id: data.id, username: data.username, email: data.email, firstName: data.first_name, lastName: data.last_name, profile: data.customer_profile });
            } else { handleLogout(); }
        } catch (error) { handleLogout(); }
    };
    
    const fetchUserCart = async () => {
        try {
            const response = await apiFetch('/cart/');
            if (response.ok) {
                const data = await response.json();
                setCart(data);
            } else { setCart({ items: [], total_items: 0, total_price: '0.00' }); }
        } catch (error) { setCart({ items: [], total_items: 0, total_price: '0.00' }); }
    }

    const handleLoginSuccess = ({ access, refresh }) => {
        setAccessToken(access);
        setRefreshToken(refresh);
        setMessage('Login successful! Welcome back.');
        setPage('profile');
    };
    
    const handleRegisterSuccess = () => {
        setMessage('Registration successful! Please log in with your new credentials.');
        setPage('login');
    };


    const renderPage = () => {
        switch (page) {
            case 'home':
                return <ProductList apiFetch={apiFetch} cart={cart} fetchUserCart={fetchUserCart} isAuthenticated={isAuthenticated} setMessage={setMessage} />;
            case 'login':
                return <AuthForm type="login" onAuthSuccess={handleLoginSuccess} setMessage={setMessage} setPage={setPage} apiFetch={apiFetch} />;
            case 'register':
                return <AuthForm type="register" onAuthSuccess={handleRegisterSuccess} setMessage={setMessage} setPage={setPage} apiFetch={apiFetch} />;
            case 'profile':
                return isAuthenticated ? <ProfileView user={user} apiFetch={apiFetch} setMessage={setMessage} fetchUserProfile={fetchUserProfile} /> : <Typography align="center" sx={{ p: 4 }}>Please log in to view your profile.</Typography>;
            case 'cart':
                return <CartView cart={cart} apiFetch={apiFetch} fetchUserCart={fetchUserCart} setMessage={setMessage} />;
            default:
                return <ProductList apiFetch={apiFetch} cart={cart} fetchUserCart={fetchUserCart} isAuthenticated={isAuthenticated} setMessage={setMessage} />;
        }
    };

    return (
        <Box sx={{ minHeight: '100vh', bgcolor: '#f5f5f5', display: 'flex', flexDirection: 'column' }}>
            <Header isAuthenticated={isAuthenticated} user={user} onNavigate={setPage} onLogout={handleLogout} cart={cart}/>
            {message && (
                <Alert severity="success" sx={{ borderRadius: 0, borderTop: '4px solid #4caf50', display: 'flex', justifyContent: 'center' }}>
                    <Typography fontWeight="bold">{message}</Typography>
                </Alert>
            )}
            <Container component="main" sx={{ flexGrow: 1, py: { xs: 4, sm: 8 } }}>
                {renderPage()}
            </Container>
            <Footer />
        </Box>
    );
}
export default App;
