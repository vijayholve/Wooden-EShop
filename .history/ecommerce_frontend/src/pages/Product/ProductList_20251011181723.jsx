

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { 
    Container, Box, Typography, Button, TextField, Grid, Card, CardContent, 
    CardMedia, CircularProgress, IconButton, Alert, AppBar, Toolbar 
} from '@mui/material';
import { 
    Login as LogInIcon, PersonAdd as UserPlusIcon, Logout as LogOutIcon, 
    Home as HomeIcon, Person as UserIcon, ShoppingCart as ShoppingCartIcon, 
    ArrowRight as ArrowRightIcon, Edit as EditIcon, Save as SaveIcon, 
    Cancel as CancelIcon
} from '@mui/icons-material';
import ProductCard from './ProductCard';
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8000/api';
const PRIMARY_COLOR = '#9e6a3c';
const HOVER_COLOR = '#b6835a';
const MOCK_PRODUCTS = [
    { id: 1, name: "Luxury Wooden Chess Set", price: 49.99, image: "https://placehold.co/400x300/F0D9B5/5E482D?text=Chess+Set", inStock: 15 },
    { id: 2, name: "Hand-Carved Wooden Box", price: 29.99, image: "https://placehold.co/400x300/B58863/5E482D?text=Wooden+Box", inStock: 5 },
    { id: 3, name: "Wooden Desk Organizer", price: 19.99, image: "https://placehold.co/400x300/D4B89D/5E482D?text=Organizer", inStock: 30 },
];

const ProductList = ({ apiFetch, cart, fetchUserCart, isAuthenticated, setMessage }) => {
    const [products, setProducts] = useState(MOCK_PRODUCTS);
    const [isLoading, setIsLoading] = useState(false);
    
    // NOTE: In a production app, you would fetch products from your DRF endpoint here
    
    const handleAddToCart = async (product) => {
        if (!isAuthenticated) {
            setMessage("Please log in to add items to your cart.");
            return;
        }
        
        setIsLoading(true);
        try {
            // Note: product.id is used because MOCK_PRODUCTS IDs match backend
            const response = await apiFetch('/cart/items/add/', { 
                method: 'POST', 
                body: JSON.stringify({ product_id: product.id, quantity: 1 }), 
            });

            if (response.ok || response.status === 201) {
                setMessage(`Added 1 x ${product.name} to cart.`);
                fetchUserCart(); 
            } else {
                const errorData = await response.json();
                const errorMessage = errorData.quantity ? errorData.quantity[0] : 'Failed to add item to cart.';
                setMessage(`Error: ${errorMessage}`);
            }
        } catch (error) {
            setMessage('Network error while adding to cart.');
        } finally {
            setIsLoading(false);
        }
    };
    
    const getItemQuantity = (productId) => {
        if (!cart || !cart.items) return 0;
        const item = cart.items.find(item => item.product?.id === productId);
        return item ? item.quantity : 0;
    };


    if (isLoading) return <Box sx={{ textAlign: 'center', p: 4 }}><CircularProgress sx={{ color: PRIMARY_COLOR }} size={40} /></Box>;

    return (
        <Box sx={{ py: 4 }}>
            <Typography variant="h3" align="center" gutterBottom sx={{ fontWeight: 'extrabold', color: '#424242', mb: 5 }}>
                Our Handcrafted Wooden Collection
            </Typography>
            <Grid container spacing={4}>
                {products.map((product) => (
                    <Grid item xs={12} sm={6} lg={4} key={product.id}>
                        <ProductCard
                            product={product} 
                            onAddToCart={handleAddToCart} 
                            isAuthenticated={isAuthenticated} 
                            inCartQuantity={getItemQuantity(product.id)}
                            isAdding={isLoading}
                        />
                    </Grid>
                ))}
            </Grid>
            
            {!isAuthenticated && (
                <Alert 
                    severity="warning" 
                    iconMapping={{ warning: <ArrowRightIcon /> }}
                    sx={{ mt: 6, borderLeft: `4px solid ${PRIMARY_COLOR}`, bgcolor: `${PRIMARY_COLOR}10` }}
                >
                    <Typography fontWeight="bold" align="center">
                        Log in to add products to your cart and checkout!
                    </Typography>
                </Alert>
            )}
        </Box>
    );
};
export default ProductList;