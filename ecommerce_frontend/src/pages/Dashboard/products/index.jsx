
import React, { useEffect, useState } from 'react';
import ReusableDataGrid from '../../../ui-component/ReusableDataGrid';
import { Box, Typography, Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField, IconButton, Tooltip } from '@mui/material';
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { useAuth } from '../../../context/AuthContext.jsx';

const initialFormState = {
  name: '',
  short_description: '',
  long_description: '',
  price: '',
  stock_quantity: '',
  category: '',
  slug: '',
  is_available: true,
};

const ProductsList = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [form, setForm] = useState(initialFormState);
  const [editMode, setEditMode] = useState(false);
  const [selectedSlug, setSelectedSlug] = useState(null);
  const { apiFetch } = useAuth();

  // Fetch products
  const fetchProducts = async () => {
    setLoading(true);
    try {
      const response = await apiFetch('/products/list/', {
        method: 'POST',
        body: JSON.stringify({ page: 1, size: 10 }),
        headers: { 'Content-Type': 'application/json' },
      });
      setProducts(response?.results || []);
    } catch {
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // Define columns for the grid
  const columns = [
    { field: 'name', headerName: 'Name', width: 200 },
    { field: 'category', headerName: 'Category', width: 150 },
    { field: 'price', headerName: 'Price', width: 120 },
    { field: 'stock_quantity', headerName: 'Stock', width: 100 },
    { field: 'is_available', headerName: 'Available', width: 100, type: 'boolean' },
    

  ];

  return (
    <Box sx={{ p: 1 }}>

      <ReusableDataGrid
        title="Products"
        addctionUrl="/dashboard/products/create"
        
        data={products}
        columns={columns}
        loading={loading}
        // getRowId={(row) => row.slug}
        height={520}
                editUrl={"/dashboard/users/edit/"}

      />

    </Box>
  );
};

export default ProductsList;
