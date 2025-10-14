

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
 // Function to handle clicking the 'Shop Now' button on the banner
    const handleShopNow = () => {
        // You might smoothly scroll down to the product list here
        const productListSection = document.getElementById('product-list-section');
        if (productListSection) {
            productListSection.scrollIntoView({ behavior: 'smooth' });
        }
    };


    if (isLoading) return <Box sx={{ textAlign: 'center', p: 4 }}><CircularProgress sx={{ color: PRIMARY_COLOR }} size={40} /></Box>;

    return (
        <Box sx={{ minHeight: '80vh' }}>
            
            {/* 1. Full Width Hero Banner Component */}
            <HeroBanner onShopNow={handleShopNow} />

            <Container 
                component="section"
                id="product-list-section" // Anchor point for smooth scroll
                maxWidth="lg" 
                sx={{ py: { xs: 4, sm: 8 } }}
            >
                {/* 2. Main Title for the Product Grid */}
                <Typography variant="h3" align="center" gutterBottom sx={{ fontWeight: 'extrabold', color: '#424242', mb: 5, pt: 3 }}>
                    Our Latest Collection
                </Typography>
                
                {/* 3. Reusable ProductCard Grid */}
                <Grid container spacing={4}>
                    {products.map((product) => (
                        <Grid item xs={12} sm={6} md={4} lg={3} key={product.id}>
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
                
                {/* 4. Login Prompt (Reusable Alert) */}
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
            </Container>
            {/* Note: Header and Footer are handled by App.jsx, ensuring full height layout */}
        </Box>
    );
};
export default ProductList;