import React, { useState } from 'react';
// Corrected path to explicitly include the file extension
import { useAuth } from '../../context/AuthContext.jsx';
// Corrected path to explicitly include the file extension
import { API_BASE_URL, PRIMARY_COLOR, parseJwt } from '../../utils/config.js';
import {
    Card,
    CardContent,
    TextField,
    Button,
    Typography,
    Container,
    Link,
} from '@mui/material';

/**
 * AuthForm Component: Handles Login and Registration forms.
 * It now uses the AuthContext for state management.
 */
const AuthForm = ({ type, setPage, setMessage }) => {
    const { login } = useAuth(); // Get the login function from context
    
    const isLogin = type === 'login';
    const [formData, setFormData] = useState({
        username: '',
        password: '',
        ...(isLogin ? {} : { email: '', password2: '' }), // Include extra fields for register
    });
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setIsLoading(true);

        // The API_BASE_URL already contains /api/v1
        const url = isLogin
            ? `${API_BASE_URL}/token/` // Login URL
            : `${API_BASE_URL}/users/register/`; // Registration URL

        const payload = isLogin
            ? { username: formData.username, password: formData.password }
            : { // Registration payload
                username: formData.username, 
                email: formData.email, 
                password: formData.password, 
                password2: formData.password2 
              };

        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            const data = await response.json();

            if (!response.ok) {
                // Handle non-2xx status codes
                let errorMessage = 'An unexpected error occurred.';
                if (data) {
                    // Extract detailed error messages from Django REST Framework response
                    errorMessage = Object.entries(data)
                        .map(([key, value]) => `${key}: ${Array.isArray(value) ? value.join(', ') : value}`)
                        .join(' | ');
                }
                throw new Error(errorMessage);
            }

            if (isLogin) {
                // On successful login, call the context's login function
                const decoded = parseJwt(data.access);
                login(data.access, data.refresh, decoded?.username || formData.username);
                https://www.myntra.com/casual-shoes/asian/asian-men-colourblocked-sneakers/29270440/buy
                setMessage({ message: 'Login successful!', severity: 'success' });
                setPage('home');
            } else {
                // On successful registration
                setMessage({ message: 'Registration successful! Please log in.', severity: 'success' });
                setPage('login');
            }
        } catch (err) {
            setError(err.message || 'Network error or request failed.');
            setMessage({ message: `Authentication failed: ${err.message}`, severity: 'error' });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Container component="main" maxWidth="xs" className="mt-10">
            <Card sx={{ borderRadius: 2, boxShadow: 6 }}>
                <CardContent className="p-8">
                    <Typography component="h1" variant="h5" align="center" className="mb-4 font-serif" sx={{ color: PRIMARY_COLOR }}>
                        {isLogin ? 'Login' : 'Register'}
                    </Typography>
                    <form onSubmit={handleSubmit} noValidate>
                        {!isLogin && (
                             <TextField
                                margin="normal"
                                required
                                fullWidth
                                label="Email Address"
                                name="email"
                                type="email"
                                autoComplete="email"
                                value={formData.email}
                                onChange={handleChange}
                                autoFocus
                            />
                        )}
                        <TextField
                            margin="normal"
                            required
                            fullWidth
                            label="Username"
                            name="username"
                            autoComplete="username"
                            value={formData.username}
                            onChange={handleChange}
                            {...(isLogin && { autoFocus: true })}
                        />
                        <TextField
                            margin="normal"
                            required
                            fullWidth
                            name="password"
                            label="Password"
                            type="password"
                            autoComplete={isLogin ? "current-password" : "new-password"}
                            value={formData.password}
                            onChange={handleChange}
                        />
                        {!isLogin && (
                            <TextField
                                margin="normal"
                                required
                                fullWidth
                                name="password2"
                                label="Confirm Password"
                                type="password"
                                autoComplete="new-password"
                                value={formData.password2}
                                onChange={handleChange}
                            />
                        )}
                        
                        <Button
                            type="submit"
                            fullWidth
                            variant="contained"
                            disabled={isLoading}
                            sx={{ mt: 3, mb: 2, bgcolor: PRIMARY_COLOR, '&:hover': { bgcolor: '#8b5e3c' } }}
                        >
                            {isLoading ? 'Processing...' : isLogin ? 'Sign In' : 'Register'}
                        </Button>
                        
                        {error && (
                            <Typography color="error" variant="body2" align="center" className="mt-2">
                                Error: {error}
                            </Typography>
                        )}

                        <div className="flex justify-center mt-3">
                            <Link href="#" variant="body2" onClick={() => setPage(isLogin ? 'register' : 'login')} sx={{ color: PRIMARY_COLOR }}>
                                {isLogin ? "Don't have an account? Register" : "Already have an account? Login"}
                            </Link>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </Container>
    );
};

export default AuthForm;
