
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { 
    Box, Typography, Button, TextField, CircularProgress
} from '@mui/material';

const API_BASE_URL ='http://localhost:8000/api';
const PRIMARY_COLOR = '#9e6a3c';
const HOVER_COLOR = '#b6835a';
const AuthForm = ({ type, onAuthSuccess, setMessage, setPage, apiFetch }) => {
    const isLogin = type === 'login';
    const [formData, setFormData] = useState({
        username: '',
        password: '',
        email: '',
        first_name: '',
        last_name: '',
        customer_profile: {
            phone_number: '',
            street_address: '',
        }
    });
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleChange = (e) => {
        const { name, value } = e.target;
        if (name.startsWith('profile_')) {
            setFormData(prev => ({
                ...prev,
                customer_profile: {
                    ...prev.customer_profile,
                    [name.replace('profile_', '')]: value
                }
            }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };
    
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setIsLoading(true);

        try {
            if (isLogin) {
                // --- Login Logic (JWT Token Endpoint) ---
                const response = await fetch(`${API_BASE_URL}/v1/token/`, { 
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        username: formData.username,
                        password: formData.password
                    }),
                });
                const data = await response.json();

                if (response.ok) {
                    onAuthSuccess({ access: data.access, refresh: data.refresh });
                } else {
                    setError(data.detail || 'Login failed. Check your credentials.');
                }
            } else {
                // --- Registration Logic (User ViewSet Endpoint) ---
                const payload = {
                    ...formData,
                    customer_profile: {
                        ...formData.customer_profile,
                        // Required placeholders for non-essential profile fields during registration
                        city: 'N/A', state: 'N/A', zip_code: 'N/A', country: 'N/A', 
                    }
                };
                
                const response = await apiFetch('/users/', {
                    method: 'POST',
                    body: JSON.stringify(payload)
                });

                const data = await response.json();
                
                if (response.ok) {
                    onAuthSuccess(); // Redirects to login
                } else {
                    // Display specific DRF validation errors
                    const errorMsg = Object.entries(data).map(([key, value]) => 
                        `${key.replace('_', ' ')}: ${Array.isArray(value) ? value.join(', ') : value}`
                    ).join(' | ');
                    setError(errorMsg || 'Registration failed due to server error.');
                }
            }
        } catch (err) {
            setError('Network error. Could not reach the server.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Box 
            component="form"
            onSubmit={handleSubmit}
            sx={{
                maxWidth: 400, mx: 'auto', bgcolor: 'white', p: 4, 
                borderRadius: 3, boxShadow: 6, border: `1px solid ${PRIMARY_COLOR}30`
            }}
        >
            <Typography variant="h4" gutterBottom align="center" sx={{ fontWeight: 'extrabold', color: PRIMARY_COLOR, mb: 3 }}>
                {isLogin ? 'Log In' : 'Register Account'}
            </Typography>
            
            {error && (
                <Alert severity="error" sx={{ mb: 2 }}>
                    <Typography variant="subtitle2" fontWeight="bold">Error:</Typography>
                    <Typography variant="body2">{error}</Typography>
                </Alert>
            )}
            
            <Grid container spacing={2}>
                <Grid item xs={12}><TextField fullWidth label="Username" name="username" value={formData.username} onChange={handleChange} required /></Grid>
                <Grid item xs={12}><TextField fullWidth label="Password" name="password" type="password" value={formData.password} onChange={handleChange} required /></Grid>

                {!isLogin && (
                    <>
                        <Grid item xs={12}><TextField fullWidth label="Email" name="email" type="email" value={formData.email} onChange={handleChange} required /></Grid>
                        <Grid item xs={6}><TextField fullWidth label="First Name" name="first_name" value={formData.first_name} onChange={handleChange} /></Grid>
                        <Grid item xs={6}><TextField fullWidth label="Last Name" name="last_name" value={formData.last_name} onChange={handleChange} /></Grid>
                        <Grid item xs={12}><TextField fullWidth label="Phone Number" name="profile_phone_number" value={formData.customer_profile.phone_number} onChange={handleChange} required /></Grid>
                        <Grid item xs={12}><TextField fullWidth label="Street Address" name="profile_street_address" value={formData.customer_profile.street_address} onChange={handleChange} required multiline rows={2} /></Grid>
                    </>
                )}
            </Grid>

            <Button 
                type="submit" 
                fullWidth 
                variant="contained"
                disabled={isLoading}
                sx={{ mt: 3, py: 1.5, bgcolor: PRIMARY_COLOR, '&:hover': { bgcolor: HOVER_COLOR } }}
                startIcon={isLoading ? <CircularProgress size={20} color="inherit" /> : null}
            >
                {isLogin ? 'Sign In' : 'Sign Up'}
            </Button>
            
            <Typography variant="body2" align="center" sx={{ mt: 3, color: 'text.secondary' }}>
                {isLogin ? "Don't have an account?" : "Already registered?"}{' '}
                <Button 
                    onClick={() => setPage(isLogin ? 'register' : 'login')} 
                    sx={{ color: PRIMARY_COLOR, fontWeight: 'medium', textTransform: 'none', p: 0, minWidth: 0 }}
                >
                    {isLogin ? 'Register here' : 'Log In'}
                </Button>
            </Typography>
        </Box>
    );
};
export default AuthForm;