import React, { useState } from "react";
import ReusableDataGrid from "../../../ui-component/ReusableDataGrid";
import { Box } from "@mui/material";
import { useAuth } from "../../../context/AuthContext.jsx";

const UserList = () => {
  const { apiFetch } = useAuth();
  // State for forcing reload, typically incremented after a successful action (like delete)
  const [reloadKey, setReloadKey] = useState(0); 

  const handleDelete = async (id) => {
    // Note: User deletion typically requires an 'id' or 'pk', not a 'slug'.
    if (!window.confirm("Are you sure you want to delete this user?")) return;
    try {
      // Assuming DELETE request targets: /api/v1/users/{id}/
      await apiFetch(`/users/${id}/`, { method: "DELETE" });
      setReloadKey((k) => k + 1);
    } catch (err) {
      console.error("Failed to delete user", err);
      // toast.error("Failed to delete user.");
    }
  };

  // Define columns based on the fields exposed in backend/users/serializers.py
  const columns = [
    { field: "email", headerName: "Email", width: 250 },
    { field: "first_name", headerName: "First Name", width: 150 },
    { field: "last_name", headerName: "Last Name", width: 150 },
    {
      field: "is_staff",
      headerName: "Admin",
      width: 100,
      type: "boolean",
    },
    {
      field: "is_active",
      headerName: "Active",
      width: 100,
      type: "boolean",
    },
    // {
    //     field: "date_joined",
    //     headerName: "Joined",
    //     width: 180,
    //     type: "dateTime",
    //     // Simple value getter/formatter to display date only
    //     valueFormatter: (params) => {
    //         if (params.value) {
    //             return new Date(params.value).toLocaleDateString();
    //         }
    //         return '';
    //     }
    // },
  ];

  // The fetchUrl is set to the endpoint that is now correctly mapped
  const FETCH_URL = "/users/"; 
  
  return (
    <Box sx={{ p: 1 }}>
      <ReusableDataGrid
        title="User Management"
        fetchUrl={FETCH_URL}
        // fetchUrl will perform a GET request with query params by default (isPostRequest=false)
        isPostRequest={false} 
        reloadKey={reloadKey}
        columns={columns}
        getRowId={(row) => row.id} // Use 'id' for users
        height={520}
        // editUrl={"/dashboard/users/edit"} // Uncomment if you create the edit page
        // viewUrl={"/dashboard/users/view"} // Uncomment if you create the view page
        onDelete={handleDelete}
      />
    </Box>
  );
};

export default UserList;
