import React from "react";
import useAuthForm from "../hooks/useAuthForm";
import {
  TextField,
  Button,
  Typography,
  Container,
  Card,
  CardContent,
} from "@mui/material";

const Login = () => {
  const { formData, handleChange, handleSubmit, isLoading, error } =
    useAuthForm(true);

  const onSuccess = (data) => {
    console.log("Login successful:", data);
    // Handle login success (e.g., redirect, show message)
  };

  return (
    <Container component="main" maxWidth="xs">
      <Card>
        <CardContent>
          <Typography component="h1" variant="h5" align="center">
            Login
          </Typography>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSubmit(onSuccess);
            }}
          >
            <TextField
              margin="normal"
              required
              fullWidth
              label="Username"
              name="username"
              value={formData.username}
              onChange={handleChange}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              label="Password"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              disabled={isLoading}
            >
              {isLoading ? "Logging in..." : "Login"}
            </Button>
            {error && (
              <Typography color="error" variant="body2">
                {error}
              </Typography>
            )}
          </form>
        </CardContent>
      </Card>
    </Container>
  );
};

export default Login;
