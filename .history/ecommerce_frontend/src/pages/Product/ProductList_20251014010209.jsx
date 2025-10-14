// ecommerce_frontend/src/pages/Product/ProductList.jsx (Updated)

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { 
    Container, Box, Typography, Button, Grid, CircularProgress, Alert, 
} from '@mui/material';
import { ArrowRight as ArrowRightIcon } from '@mui/icons-material';
import ProductCard from './ProductCard';
import HeroBanner from '../../components/HeroBanner'; // <-- NEW IMPORT

const PRIMARY_COLOR = '#9e6a3c';
// ... MOCK_PRODUCTS and other imports remain the same

const ProductList = ({ apiFetch, cart, fetchUserCart, isAuthenticated, setMessage }) => {
    const [products, setProducts] = useState(MOCK_PRODUCTS);
    const [isLoading, setIsLoading] = useState(false);
    
    // ... handleAddToCart and getItemQuantity functions remain the same
    // (I'll keep them as placeholders below to show full context)
    
    const handleAddToCart = async (product) => { /* ... existing logic ... */ };
    const getItemQuantity = (productId) => { /* ... existing logic ... */ };


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