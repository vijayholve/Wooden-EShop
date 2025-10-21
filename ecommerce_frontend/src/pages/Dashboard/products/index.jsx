
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

  // Create product
  const handleCreate = async () => {
    setLoading(true);
    try {
      await apiFetch('/products/', {
        method: 'POST',
        body: JSON.stringify(form),
        headers: { 'Content-Type': 'application/json' },
      });
      setOpenDialog(false);
      setForm(initialFormState);
      fetchProducts();
    } finally {
      setLoading(false);
    }
  };

  // Edit product
  const handleEdit = async () => {
    setLoading(true);
    try {
      await apiFetch(`/products/${selectedSlug}/`, {
        method: 'PATCH',
        body: JSON.stringify(form),
        headers: { 'Content-Type': 'application/json' },
      });
      setOpenDialog(false);
      setForm(initialFormState);
      setEditMode(false);
      setSelectedSlug(null);
      fetchProducts();
    } finally {
      setLoading(false);
    }
  };

  // Delete product
  const handleDelete = async (slug) => {
    if (!window.confirm('Delete this product?')) return;
    setLoading(true);
    try {
      await apiFetch(`/products/${slug}/`, {
        method: 'DELETE',
      });
      fetchProducts();
    } finally {
      setLoading(false);
    }
  };

  // Open dialog for create
  const openCreateDialog = () => {
    setForm(initialFormState);
    setEditMode(false);
    setOpenDialog(true);
  };

  // Open dialog for edit
  const openEditDialog = (product) => {
    setForm({
      name: product.name,
      short_description: product.short_description,
      long_description: product.long_description,
      price: product.price,
      stock_quantity: product.stock_quantity,
      category: product.category,
      slug: product.slug,
      is_available: product.is_available,
    });
    setEditMode(true);
    setSelectedSlug(product.slug);
    setOpenDialog(true);
  };

  // Define columns for the grid
  const columns = [
    { field: 'name', headerName: 'Name', width: 200 },
    { field: 'category', headerName: 'Category', width: 150 },
    { field: 'price', headerName: 'Price', width: 120 },
    { field: 'stock_quantity', headerName: 'Stock', width: 100 },
    { field: 'is_available', headerName: 'Available', width: 100, type: 'boolean' },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 120,
      sortable: false,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Tooltip title="Edit"><span>
            <IconButton size="small" color="primary" onClick={() => openEditDialog(params.row)}>
              <EditIcon />
            </IconButton>
          </span></Tooltip>
          <Tooltip title="Delete"><span>
            <IconButton size="small" color="error" onClick={() => handleDelete(params.row.slug)}>
              <DeleteIcon />
            </IconButton>
          </span></Tooltip>
        </Box>
      ),
    },
  ];

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
        <Typography variant="h4">Products Management</Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={openCreateDialog}>
          Add Product
        </Button>
      </Box>
      <ReusableDataGrid
        data={products}
        columns={columns}
        loading={loading}
        getRowId={(row) => row.slug}
        height={520}
      />

      {/* Product Create/Edit Dialog */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{editMode ? 'Edit Product' : 'Add Product'}</DialogTitle>
        <DialogContent dividers>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <TextField label="Name" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} fullWidth required />
              <TextField label="Short Description" value={form.short_description} onChange={e => setForm(f => ({ ...f, short_description: e.target.value }))} fullWidth multiline minRows={2} required />
              <TextField label="Long Description" value={form.long_description} onChange={e => setForm(f => ({ ...f, long_description: e.target.value }))} fullWidth multiline minRows={3} required />
              <TextField label="Price" type="number" value={form.price} onChange={e => setForm(f => ({ ...f, price: e.target.value }))} fullWidth required />
              <TextField label="Stock Quantity" type="number" value={form.stock_quantity} onChange={e => setForm(f => ({ ...f, stock_quantity: e.target.value }))} fullWidth required />
              <TextField label="Category" value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))} fullWidth required />
              <TextField label="Slug" value={form.slug} onChange={e => setForm(f => ({ ...f, slug: e.target.value }))} fullWidth required disabled={editMode} />
              <TextField label="Available" type="checkbox" checked={form.is_available} onChange={e => setForm(f => ({ ...f, is_available: e.target.checked }))} fullWidth />
            </Box>
          </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button variant="contained" onClick={editMode ? handleEdit : handleCreate}>
            {editMode ? 'Save Changes' : 'Create Product'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ProductsList;
