import React from "react";
import { Box, Grid, Paper, Typography, Divider, Chip } from "@mui/material";

const FieldRow = ({ label, value }) => (
  <Grid container spacing={1} sx={{ py: 1 }}>
    <Grid item xs={5} md={4}>
      <Typography variant="body2" color="text.secondary">
        {label}
      </Typography>
    </Grid>
    <Grid item xs={7} md={8}>
      <Typography variant="body2">{value || "N/A"}</Typography>
    </Grid>
  </Grid>
);

const UserDetails = ({ user }) => {
  const profile = user?.customer_profile || {};

  return (
    <Paper
      elevation={0}
      sx={{
        p: 3,
        border: "1px solid",
        borderColor: "divider",
        borderRadius: 2,
      }}
    >
      <Typography variant="h6" sx={{ mb: 0.5 }}>
        Account Details
      </Typography>
      <Typography variant="caption" color="text.secondary">
        Your personal information
      </Typography>
      <Divider sx={{ my: 2 }} />

      <FieldRow label="Username" value={user?.username} />
      <FieldRow label="First name" value={user?.first_name} />
      <FieldRow label="Last name" value={user?.last_name} />
      <FieldRow label="Email" value={user?.email} />

      <Divider sx={{ my: 2 }} />
      <Typography variant="subtitle1" sx={{ mb: 1 }}>
        Contact
      </Typography>
      <FieldRow label="Phone" value={profile?.phone_number} />
      <FieldRow label="Street" value={profile?.street_address} />
      <FieldRow label="City" value={profile?.city} />
      <FieldRow label="State" value={profile?.state} />
      <FieldRow label="ZIP" value={profile?.zip_code} />
      <FieldRow label="Country" value={profile?.country} />
    </Paper>
  );
};

export default UserDetails;
