import React from 'react';
import { Box, Typography, Button, Container } from '@mui/material';
import { ArrowRightAlt as ArrowRightIcon } from '@mui/icons-material';

// Use constants from your config (assuming they are correctly imported/defined)
const PRIMARY_COLOR = '#9e6a3c'; 
const HOVER_COLOR = '#b6835a';

const HeroBanner = ({ onShopNow }) => {
    return (
        // The outer Box ensures full width (width: '100%') and defines the height/background
        <Box 
            sx={{
                width: '100%',
                height: { xs: '350px', md: '550px' }, // Responsive height
                // Placeholder image for the wooden theme
                backgroundImage: 'url(https://via.placeholder.com/1920x550/A0522D/D2B48C?text=Premium+Wooden+Crafts)', 
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                textAlign: 'center',
                position: 'relative',
                color: 'white',
                // Remove margin if App.jsx handles the main container padding correctly
                mt: 0, mb: 0, 
            }}
        >
            {/* Dark Overlay for better text readability */}
            <Box 
                sx={{
                    position: 'absolute',
                    top: 0, left: 0, right: 0, bottom: 0,
                    backgroundColor: 'rgba(0, 0, 0, 0.4)', 
                }}
            />
            {/* Container keeps the content centered and max-width for good UX */}
            <Container sx={{ position: 'relative', zIndex: 1 }}>
                <Typography 
                    variant="h2" 
                    component="h1" 
                    fontWeight="extrabold" 
                    sx={{ mb: 2, textShadow: '2px 2px 4px rgba(0,0,0,0.7)' }}
                >
                    Timeless Craftsmanship, Handcrafted for You.
                </Typography>
                <Typography variant="h5" sx={{ mb: 4, maxWidth: 600, mx: 'auto', textShadow: '1px 1px 3px rgba(0,0,0,0.5)' }}>
                    Discover our exclusive collection of fine wooden products.
                </Typography>
                <Button 
                    variant="contained"
                    size="large"
                    onClick={onShopNow}
                    endIcon={<ArrowRightIcon />}
                    sx={{ 
                        bgcolor: PRIMARY_COLOR, 
                        fontWeight: 'bold', 
                        fontSize: '1.1rem',
                        py: 1.5,
                        px: 4,
                        '&:hover': { bgcolor: HOVER_COLOR, transform: 'scale(1.05)' },
                        transition: 'transform 0.2s ease-in-out',
                    }}
                >
                    Shop Our Collection
                </Button>
            </Container>
        </Box>
    );
};

export default HeroBanner;  