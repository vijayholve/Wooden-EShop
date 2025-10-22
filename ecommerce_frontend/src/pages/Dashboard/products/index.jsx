import React, { useState } from "react";
import ReusableDataGrid from "../../../ui-component/ReusableDataGrid";
import {
  Box,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  IconButton,
  Tooltip,
} from "@mui/material";
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
} from "@mui/icons-material";
import { useAuth } from "../../../context/AuthContext.jsx";

const initialFormState = {
  name: "",
  short_description: "",
  long_description: "",
  price: "",
  stock_quantity: "",
  category: "",
  slug: "",
  is_available: true,
};

const ProductsList = () => {
  // server-driven grid; local data state not needed
  const [loading] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [form, setForm] = useState(initialFormState);
  const [editMode, setEditMode] = useState(false);
  const [selectedSlug, setSelectedSlug] = useState(null);
  const { apiFetch } = useAuth();

  // Use reloadKey to force grid refetch when create/edit/delete occur
  const [reloadKey, setReloadKey] = useState(0);

  const handleDelete = async (slug) => {
    if (!window.confirm("Delete this product?")) return;
    try {
      await apiFetch(`/products/${slug}/`, { method: "DELETE" });
      setReloadKey((k) => k + 1);
    } catch (err) {
      console.error("Failed to delete product", err);
      // Optionally show a toast
    }
  };

  // Define columns for the grid
  const columns = [
    { field: "name", headerName: "Name", width: 200 },
    { field: "category", headerName: "Category", width: 150 },
    { field: "price", headerName: "Price", width: 120 },
    { field: "stock_quantity", headerName: "Stock", width: 100 },
    {
      field: "is_available",
      headerName: "Available",
      width: 100,
      type: "boolean",
    },
  ];

  return (
    <Box sx={{ p: 1 }}>
      <ReusableDataGrid
        title="Products"
        fetchUrl="/api/v1/products/list/"
        isPostRequest={true} 
        reloadKey={reloadKey}
        addActionUrl="/dashboard/products/create"
        columns={columns}
        loading={loading}
        getRowId={(row) => row.slug}
        height={520}
        editUrl={"/dashboard/products/edit"}
        onDelete={handleDelete}
      />
    </Box>
  );
};

export default ProductsList;
