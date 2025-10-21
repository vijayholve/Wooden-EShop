import React, {
  createContext,
  useState,
  useContext,
  useEffect,
  useCallback,
} from "react";
// API base and token parsing
import { API_BASE_URL, parseJwt } from "../utils/config.js";
// Frontend helper to fetch current user with a token
import { fetchCurrentUser } from "../utils/userApi.js";

// 1. Create the Context
const AuthContext = createContext(null);

// Helper function to get the access token from local storage
const getInitialAccessToken = () => localStorage.getItem("accessToken");
const getInitialRefreshToken = () => localStorage.getItem("refreshToken");
// NEW: Helper function to get initial user data from local storage
const getInitialCurrentUser = () => {
  const user = localStorage.getItem("currentUser");
  return user ? JSON.parse(user) : null;
};

// 2. Create the Provider Component
export const AuthProvider = ({ children, setGlobalMessage }) => {
  // State for JWT tokens
  const [accessToken, setAccessToken] = useState(getInitialAccessToken);
  const [, setRefreshToken] = useState(getInitialRefreshToken);
  const [isAuthenticated, setIsAuthenticated] = useState(
    !!getInitialAccessToken()
  );
  
  // NEW: State for user data
  const [currentUser, setCurrentUser] = useState(getInitialCurrentUser);
  const [isProfileLoading, setIsProfileLoading] = useState(false);

  // --- Helper function for clearing session data ---
  const clearSessionData = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("currentUser"); // NEW: Clear user on logout
    setAccessToken(null);
    setRefreshToken(null);
    setIsAuthenticated(false);
    setCurrentUser(null); // NEW: Clear current user
  };

  // Function to check and refresh token (passed to apiFetch)
  const checkAndRefreshToken = useCallback(async () => {
    const currentRefreshToken = localStorage.getItem("refreshToken");
    if (!currentRefreshToken) {
      console.log("No refresh token available. Logging out.");
      clearSessionData();
      return false;
    }

    const isExpired = Date.now() / 1000 > parseJwt(currentRefreshToken)?.exp;

    if (isExpired) {
      console.log("Refresh token expired. Logging out.");
      clearSessionData();
      return false;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/token/refresh/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refresh: currentRefreshToken }),
      });

      if (!response.ok) {
        throw new Error("Token refresh failed");
      }

      const data = await response.json();

      // Update tokens in state and local storage
      localStorage.setItem("accessToken", data.access);
      setAccessToken(data.access);

      if (data.refresh) {
        localStorage.setItem("refreshToken", data.refresh);
        setRefreshToken(data.refresh);
      }

      return true; // Refresh successful
    } catch (error) {
      console.error("Error refreshing token:", error);
      clearSessionData();
      return false; // Refresh failed
    }
  }, []);

  // NEW: Function to fetch the full user profile
  const fetchUserProfile = useCallback(
    async (token = accessToken) => {
      if (!token) return null;
      setIsProfileLoading(true);
      try {
        const userData = await fetchCurrentUser(token);
        localStorage.setItem("currentUser", JSON.stringify(userData));
        setCurrentUser(userData);
        setIsAuthenticated(true);
        return userData;
      } catch (error) {
        console.error("Failed to fetch user profile:", error);
        if (error.status === 401 || error.status === 403) {
          clearSessionData();
        }
        return null;
      } finally {
        setIsProfileLoading(false);
      }
    },
    [accessToken]
  );

  // Generic function for secure API calls
  const apiFetch = useCallback(
    async (endpoint, options = {}) => {
      let currentAccessToken =
        accessToken || localStorage.getItem("accessToken");
      let refreshAttempted = false;

      const executeFetch = async (token) => {
        // Merge headers, add auth, and set default Content-Type for JSON
        const computedHeaders = {
          ...(options.headers || {}),
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        };

        const isFormData =
          typeof FormData !== "undefined" && options.body instanceof FormData;
        if (!computedHeaders["Content-Type"] && !isFormData) {
          computedHeaders["Content-Type"] = "application/json";
        }

        const method = (options.method || "GET").toUpperCase();
        let body = options.body;
        const isJson =
          computedHeaders["Content-Type"] &&
          String(computedHeaders["Content-Type"]).includes("application/json");
        if (
          body &&
          method !== "GET" &&
          isJson &&
          !isFormData &&
          typeof body !== "string"
        ) {
          body = JSON.stringify(body);
        }

        const finalOptions = {
          ...options,
          method,
          headers: computedHeaders,
          body,
        };

        return fetch(`${API_BASE_URL}${endpoint}`, finalOptions);
      };

      let response = await executeFetch(currentAccessToken);

      // Check if token failed (401 Unauthorized) and attempt refresh once
      if (response.status === 401 && !refreshAttempted) {
        refreshAttempted = true;
        const success = await checkAndRefreshToken();

        if (success) {
          const newAccessToken = localStorage.getItem("accessToken");
          currentAccessToken = newAccessToken;

          // NEW: Fetch user profile after a successful token refresh
          await fetchUserProfile(newAccessToken);

          // Retry the original request
          response = await executeFetch(newAccessToken);
        }
      }

      return response;
    },
    [accessToken, checkAndRefreshToken, fetchUserProfile]
  );

  // Effect to initially load tokens AND user profile on component mount
  useEffect(() => {
    const token = getInitialAccessToken();
    const user = getInitialCurrentUser();

    if (token && !user) {
      // Tokens are present but user profile isn't (e.g., first load after login/refresh)
      fetchUserProfile(token);
    } else if (token && user) {
      // Tokens and user are present, set initial authenticated state
      setIsAuthenticated(true);
      setCurrentUser(user);
    } else {
      // No token, ensure clean state
      clearSessionData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Run only once on mount

  // Login function (takes care of updating state/storage)
  const login = async (access, refresh) => {
    localStorage.setItem("accessToken", access);
    localStorage.setItem("refreshToken", refresh);
    setAccessToken(access);
    setRefreshToken(refresh);
    setIsAuthenticated(true);

    // NEW: Fetch user profile immediately after setting tokens
    const user = await fetchUserProfile(access);

    const username = parseJwt(access)?.username;
    setGlobalMessage({
      message: `Welcome back, ${user?.username || username || "User"}!`,
      severity: "success",
    });
  };

  // Logout function
  const logout = async () => {
    const currentRefreshToken = localStorage.getItem("refreshToken");
    if (currentRefreshToken) {
      try {
        // Invalidate the refresh token on the server side (recommended for security)
        await fetch(`${API_BASE_URL}/token/blacklist/`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ refresh: currentRefreshToken }),
        });
      } catch (error) {
        console.warn(
          "Could not blacklist token, proceeding with client-side logout:",
          error
        );
      }
    }

    clearSessionData();
    setGlobalMessage({
      message: "You have been logged out.",
      severity: "info",
    });
  };

  // Derive username from currentUser for backwards compatibility or display
  const username = currentUser?.username;

  const contextValue = {
    isAuthenticated,
    username, // Provided for convenience (e.g., Header)
    currentUser, // NEW: Provide full user object for Profile/Dashboard
    accessToken,
    login,
    logout,
    apiFetch,
    fetchUserProfile, // Export for manual refresh (e.g., after profile update)
    isProfileLoading,
    setGlobalMessage,
  };

  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  );
};

// 3. Create the Custom Hook
export const useAuth = () => useContext(AuthContext);
