import React, { createContext, useState, useContext, useEffect } from 'react';
import { API_BASE_URL, parseJwt } from '../utils/config';

// 1. Create the Context
const AuthContext = createContext(null);

// Helper function to get the access token from local storage
const getInitialAccessToken = () => localStorage.getItem('accessToken');
const getInitialRefreshToken = () => localStorage.getItem('refreshToken');

// 2. Create the Provider Component
export const AuthProvider = ({ children, setGlobalMessage }) => {
    // State for JWT tokens
    const [accessToken, setAccessToken] = useState(getInitialAccessToken);
    const [refreshToken, setRefreshToken] = useState(getInitialRefreshToken);
    const [isAuthenticated, setIsAuthenticated] = useState(!!getInitialAccessToken());
    const [username, setUsername] = useState(null);

    // Effect to update authentication status and username whenever tokens change
    useEffect(() => {
        const token = localStorage.getItem('accessToken');
        setAccessToken(token);

        if (token) {
            const decoded = parseJwt(token);
            if (decoded && decoded.username) {
                setIsAuthenticated(true);
                setUsername(decoded.username);
            } else {
                // Token exists but is invalid/expired (should be handled by token check, but good defensive check)
                setIsAuthenticated(false);
                setUsername(null);
            }
        } else {
            setIsAuthenticated(false);
            setUsername(null);
        }
    }, []);
    
    // Function to check and refresh token (passed to apiFetch)
    const checkAndRefreshToken = async () => {
        const currentRefreshToken = localStorage.getItem('refreshToken');
        if (!currentRefreshToken) {
            console.log("No refresh token available. Logging out.");
            logout();
            return false;
        }

        const isExpired = Date.now() / 1000 > parseJwt(currentRefreshToken)?.exp;

        if (isExpired) {
            console.log("Refresh token expired. Logging out.");
            logout();
            return false;
        }

        try {
            const response = await fetch(`${API_BASE_URL}/token/refresh/`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ refresh: currentRefreshToken }),
            });

            if (!response.ok) {
                throw new Error("Token refresh failed");
            }

            const data = await response.json();
            
            // Update tokens in state and local storage
            localStorage.setItem('accessToken', data.access);
            setAccessToken(data.access);
            
            // Note: Simple JWT often returns a new refresh token on refresh if ROTATE_REFRESH_TOKENS is True
            if (data.refresh) {
                localStorage.setItem('refreshToken', data.refresh);
                setRefreshToken(data.refresh);
            }
            
            return true; // Refresh successful
        } catch (error) {
            console.error('Error refreshing token:', error);
            logout();
            return false; // Refresh failed
        }
    };

    // Generic function for secure API calls (similar to useApiFetcher, but centralized)
    const apiFetch = async (endpoint, options = {}) => {
        let currentAccessToken = accessToken || localStorage.getItem('accessToken');
        let refreshAttempted = false;

        const executeFetch = async (token) => {
            const headers = {
                ...options.headers,
                'Content-Type': 'application/json',
                ...(token && { 'Authorization': `Bearer ${token}` })
            };

            const finalOptions = {
                ...options,
                headers,
                body: options.body ? JSON.stringify(options.body) : options.body
            };

            return fetch(`${API_BASE_URL}${endpoint}`, finalOptions);
        };

        let response = await executeFetch(currentAccessToken);

        // Check if token failed (401 Unauthorized) and attempt refresh once
        if (response.status === 401 && !refreshAttempted) {
            refreshAttempted = true;
            const success = await checkAndRefreshToken();
            
            if (success) {
                // Get the new token and retry the original request
                const newAccessToken = localStorage.getItem('accessToken');
                currentAccessToken = newAccessToken; // Update local token for retry
                response = await executeFetch(newAccessToken);
            } else {
                // Refresh failed, return the 401 response from initial failure
                return response;
            }
        }

        return response;
    };

    // Login function (takes care of updating state/storage)
    const login = (access, refresh, username) => {
        localStorage.setItem('accessToken', access);
        localStorage.setItem('refreshToken', refresh);
        setAccessToken(access);
        setRefreshToken(refresh);
        setIsAuthenticated(true);
        setUsername(username);
        setGlobalMessage({ message: `Welcome back, ${username}!`, severity: 'success' });
    };

    // Logout function
    const logout = async () => {
        const currentRefreshToken = localStorage.getItem('refreshToken');
        if (currentRefreshToken) {
            try {
                // Invalidate the refresh token on the server side (recommended for security)
                await fetch(`${API_BASE_URL}/token/blacklist/`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ refresh: currentRefreshToken }),
                });
            } catch (error) {
                console.warn("Could not blacklist token, proceeding with client-side logout:", error);
            }
        }

        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        setAccessToken(null);
        setRefreshToken(null);
        setIsAuthenticated(false);
        setUsername(null);
        setGlobalMessage({ message: 'You have been logged out.', severity: 'info' });
        // Optional: Redirect to home or login page if necessary
    };

    const contextValue = {
        isAuthenticated,
        username,
        accessToken,
        login,
        logout,
        apiFetch,
        setGlobalMessage // Pass message setter to be accessible via context
    };

    return (
        <AuthContext.Provider value={contextValue}>
            {children}
        </AuthContext.Provider>
    );
};

// 3. Create the Custom Hook
export const useAuth = () => useContext(AuthContext);

// Note: Removed the custom useApiFetcher.js hook as its logic is now inside AuthContext.
// The component useApiFetcher is deleted from the project.
