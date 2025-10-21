import React, { useEffect, useState, useCallback } from "react";
import { Box } from "@mui/material";
import { useAuth } from "../../../context/AuthContext.jsx";
import ReusableDataGrid from "../../../ui-component/ReusableDataGrid.jsx";

const UserListPage = () => {
  const { apiFetch } = useAuth();
  const [rows, setRows] = useState([]);

  const load = useCallback(async () => {
    try {
      const res = await apiFetch("/users/", { method: "GET" });
      const text = await res.text();
      const data = text ? JSON.parse(text) : [];
      const list = Array.isArray(data)
        ? data
        : Array.isArray(data?.results)
        ? data.results
        : [];

      const normalized = list.map((u) => ({
        id: u.id,
        username: u.username,
        first_name: u.first_name,
        last_name: u.last_name,
        email: u.email,
        phone_number: u.customer_profile?.phone_number || "",
        city: u.customer_profile?.city || "",
        country: u.customer_profile?.country || "",
      }));
      setRows(normalized);
    } catch (e) {
      console.error("Failed to load users", e);
      setRows([]);
    }
  }, [apiFetch]);

  useEffect(() => {
    load();
  }, [load]);

  const columns = [
    { field: "id", headerName: "ID", width: 80 },
    { field: "username", headerName: "Username", flex: 1, minWidth: 140 },
    { field: "first_name", headerName: "First Name", flex: 1, minWidth: 140 },
    { field: "last_name", headerName: "Last Name", flex: 1, minWidth: 140 },
    { field: "email", headerName: "Email", flex: 1.4, minWidth: 200 },
    { field: "phone_number", headerName: "Phone", flex: 1, minWidth: 140 },
    { field: "city", headerName: "City", flex: 1, minWidth: 120 },
    { field: "country", headerName: "Country", flex: 1, minWidth: 120 },
  ];

  return (
    <Box sx={{ p: 1 }}>
      <ReusableDataGrid
        title="Users"
        columns={columns}
        data={rows}
        searchPlaceholder="Search users..."
        addActionUrl="/register"
        onDataChange={() => {}} 
        editUrl={"/dashboard/users/edit/"}


      />
    </Box>
  );
};

export default UserListPage;
