import React, { useState } from 'react';
import { 
  Box, 
  Grid, 
  TextField, 
  Typography, 
  CircularProgress, 
  FormControlLabel, 
  Checkbox, 
  TextareaAutosize 
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast'; // Assuming you have react-hot-toast imported globally or need to install it.
import MainCard from '../../../ui-component/cards/MainCard';
import BackSaveButton from "../../../layout/MainLayout/Button/BackSaveButton.jsx";
import { useAuth } from '../../../context/AuthContext.jsx';


// Define initial state matching the core Product model fields
const initialFormState = {
  name: '',
  brand: 'Unbranded',
  short_description: '',
  long_description: '',
  price: '0.00',
  discount_percent: '0.00',
  stock_quantity: 0,
  is_available: true,
  // slug will be generated automatically by the backend
};

const ProductCreate = () => {
  const navigate = useNavigate();
  const { apiFetch } = useAuth();
  const [formData, setFormData] = useState(initialFormState);
  const [isLoading, setIsLoading] = useState(false);

  const backUrl = '/dashboard/products';
  
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleCreateProduct = async () => {
    setIsLoading(true);
    
    // Convert string fields back to numbers for the API call
    const payload = {
      ...formData,
      price: parseFloat(formData.price),
      discount_percent: parseFloat(formData.discount_percent),
      stock_quantity: parseInt(formData.stock_quantity, 10),
    };

    try {
      // POST request to the ProductViewSet's base route for creation
      const response = await apiFetch('/products/', {
        method: 'POST',
        body: payload
      });

      const data = await response.json();

      if (response.ok) {
        toast.success(`Product "${data.name}" created successfully!`);
        navigate(backUrl);
      } else {
        // Handle validation errors from the backend
        let errorMessage = "Product creation failed.";
        if (data) {
          errorMessage = Object.entries(data)
            .map(([key, value]) => `${key}: ${Array.isArray(value) ? value.join(", ") : value}`)
            .join(" | ");
        }
        toast.error(errorMessage);
        console.error("Creation Error:", data);
      }
    } catch (error) {
      toast.error('Network error during creation.');
      console.error('Network error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <MainCard title={<Typography variant="h4" sx={{ color: '#8B4513' }}>Create New Product</Typography>}>
      <Box component="form" noValidate autoComplete="off" sx={{ p: 2 }}>
        <Grid container spacing={3}>
          {/* Row 1: Name and Brand */}
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              required
              label="Product Name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              disabled={isLoading}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Brand"
              name="brand"
              value={formData.brand}
              onChange={handleChange}
              disabled={isLoading}
            />
          </Grid>

          {/* Row 2: Price and Discount */}
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              required
              label="Price (Decimal)"
              name="price"
              type="number"
              inputProps={{ step: "0.01", min: "0" }}
              value={formData.price}
              onChange={handleChange}
              disabled={isLoading}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Discount Percent (%)"
              name="discount_percent"
              type="number"
              inputProps={{ step: "0.01", min: "0", max: "100" }}
              value={formData.discount_percent}
              onChange={handleChange}
              disabled={isLoading}
            />
          </Grid>
          
          {/* Row 3: Stock and Availability */}
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              required
              label="Stock Quantity (Integer)"
              name="stock_quantity"
              type="number"
              inputProps={{ min: "0" }}
              value={formData.stock_quantity}
              onChange={handleChange}
              disabled={isLoading}
            />
          </Grid>
          <Grid item xs={12} md={6} sx={{ display: 'flex', alignItems: 'center' }}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={formData.is_available}
                  onChange={handleChange}
                  name="is_available"
                  color="primary"
                />
              }
              label="Is Available Online"
              disabled={isLoading}
            />
          </Grid>
          
          {/* Row 4: Short Description */}
          <Grid item xs={12}>
            <TextField
              fullWidth
              required
              label="Short Description (Max 500 chars)"
              name="short_description"
              value={formData.short_description}
              onChange={handleChange}
              multiline
              rows={2}
              inputProps={{ maxLength: 500 }}
              disabled={isLoading}
            />
          </Grid>

          {/* Row 5: Long Description */}
          <Grid item xs={12}>
            <TextField
              fullWidth
              required
              label="Detailed Description"
              name="long_description"
              value={formData.long_description}
              onChange={handleChange}
              multiline
              rows={4}
              disabled={isLoading}
            />
          </Grid>
          
          {/* Note on complex fields (Features/Images) */}
          <Grid item xs={12}>
            <Typography variant="caption" color="text.secondary">
              Note: Features and Images must be added through separate forms/endpoints after the initial product creation.
            </Typography>
          </Grid>

          {/* Save and Back Buttons */}
          <Grid item xs={12}>
            <BackSaveButton
              title={isLoading ? 'Creating...' : 'Create Product'}
              backUrl={backUrl}
              isSubmitting={isLoading}
              onSaveClick={handleCreateProduct}
            />
          </Grid>
        </Grid>
      </Box>
    </MainCard>
  );
};

export default ProductCreate;