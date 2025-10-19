import React from "react";
// Auth state from context
import { useAuth } from "../context/AuthContext.jsx";
import { PRIMARY_COLOR } from "../utils/config.js";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  IconButton,
  Box,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import {
  ShoppingCart as CartIcon,
  ExitToApp as LogoutIcon,
  Login as LoginIcon,
  PersonAdd as RegisterIcon,
  AccountCircle as ProfileIcon,
} from "@mui/icons-material";

/**
 * Header: Top navigation using react-router-dom for navigation.
 * Shows Register/Login when logged out, Logout when logged in.
 */
const Header = () => {
  // Auth state and actions
  const { isAuthenticated, username, logout } = useAuth();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  // Responsive button container styling
  const buttonContainerClass = isMobile
    ? "flex items-center space-x-1"
    : "flex items-center space-x-4";

  return (
    <AppBar position="static" sx={{ bgcolor: PRIMARY_COLOR, boxShadow: 3 }}>
      <Toolbar className="max-w-7xl mx-auto w-full">
        {/* Logo / Home */}
        <Typography
          variant="h6"
          component="div"
          sx={{ flexGrow: 1, cursor: "pointer", fontWeight: 700 }}
          onClick={() => navigate("/")}
        >
          Wooden E-Shop
        </Typography>

        <Box className={buttonContainerClass}>
          {/* Common Navigation */}
          <Button
            color="inherit"
            component={RouterLink}
            to="/"
            sx={{ textTransform: "none" }}
          >
            {isMobile ? "Shop" : "Products"}
          </Button>

          {isAuthenticated ? (
            <>
              {/* Authenticated User Icons */}
              {/* Cart (optional; route may be added later) */}
              <IconButton
                color="inherit"
                component={RouterLink}
                to="/cart"
                aria-label="cart"
              >
                <CartIcon />
              </IconButton>
              {/* Profile (optional; route may be added later) */}
              <Button
                color="inherit"
                component={RouterLink}
                to="/profile"
                startIcon={<ProfileIcon />}
                sx={{ textTransform: "none", fontWeight: 600 }}
              >
                {isMobile ? "Profile" : username || "Profile"}
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
                component={RouterLink}
                to="/register"
                startIcon={<RegisterIcon />}
                sx={{ textTransform: "none" }}
              >
                {isMobile ? "" : "Register"}
              </Button>

              <Button
                color="inherit"
                component={RouterLink}
                to="/login"
                startIcon={<LoginIcon />}
                sx={{ textTransform: "none" }}
              >
                {isMobile ? "" : "Login"}
              </Button>
            </>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Header;
