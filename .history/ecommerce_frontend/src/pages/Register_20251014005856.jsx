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

const Register = () => {
  const { formData, handleChange, handleSubmit, isLoading, error } =
    useAuthForm(false);

  const onSuccess = (data) => {
    console.log("Registration successful:", data);
    // Handle registration success (e.g., redirect, show message)
  };

  return (
    <Container component="main" maxWidth="xs">
      <Card>
        <CardContent>
          <Typography component="h1" variant="h5" align="center">
            Register
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
              label="Email"
              name="email"
              value={formData.email}
              onChange={handleChange}
            />
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
            <TextField
              margin="normal"
              required
              fullWidth
              label="Confirm Password"
              name="password2"
              type="password"
              value={formData.password2}
              onChange={handleChange}
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              disabled={isLoading}
            >
              {isLoading ? "Registering..." : "Register"}
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

export default Register;
