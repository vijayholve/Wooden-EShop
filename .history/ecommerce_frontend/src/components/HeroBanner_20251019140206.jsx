import React from 'react';
import { Box, Typography, Button, Container } from '@mui/material';
import { ArrowRightAlt as ArrowRightIcon } from '@mui/icons-material';

// Defining a richer, wood-themed color palette
const PRIMARY_COLOR = '#8B4513'; // Richer Brown (Saddle Brown)
const SECONDARY_COLOR = '#D2B48C'; // Lighter, Wood-like Beige
const HOVER_COLOR = '#A0522D'; // Sienna for hover

const HeroBanner = ({ onShopNow }) => {~
    return (
        <Box 
            sx={{
                width: '100%', // Ensures full width
                // More impactful responsive height: 45vh on mobile, 70vh on large screens
                height: { xs: '45vh', sm: '55vh', md: '70vh' }, 
                // Placeholder image URL with a rich wooden theme
                backgroundImage: 'url(https://placehold.co/1920x800/A0522D/F5F5DC?text=Artisan+Wood+Furniture)', 
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                textAlign: 'center',
                position: 'relative',
                color: 'white',
                mt: 0, mb: 0, // Ensure no external margins interfere
            }}
        >
            {/* Elegant Gradient Overlay for high contrast text */}
            <Box 
                sx={{
                    position: 'absolute',
                    top: 0, left: 0, right: 0, bottom: 0,
                    // Subtle dark gradient from bottom for focus on text
                    background: 'linear-gradient(0deg, rgba(0, 0, 0, 0.6) 0%, rgba(0, 0, 0, 0.2) 60%, rgba(0, 0, 0, 0.0) 100%)', 
                }}
            />
            
            {/* Content Container (Constrained in size for readability, centered) */}
            <Container maxWidth="md" sx={{ position: 'relative', zIndex: 2 }}>
                <Typography 
                    variant="h3" 
                    component="h1" 
                    fontWeight={900} // Extra bold for maximum impact
                    sx={{ 
                        color: 'white',
                        mb: { xs: 1, md: 2 }, 
                        textShadow: '0px 4px 8px rgba(0,0,0,0.8)', // Stronger shadow for pop
                        // Responsive font scaling
                        fontSize: { xs: '2.2rem', sm: '3.5rem', md: '4.5rem' }, 
                        letterSpacing: { xs: 1, md: 2 }
                    }}
                >
                    Artisan Woodcraft
                </Typography>
                <Typography 
                    variant="h6" 
                    sx={{ 
                        color: SECONDARY_COLOR, // Using wood beige for a complementary look
                        mb: { xs: 3, md: 5 }, 
                        maxWidth: 600, 
                        mx: 'auto', 
                        textShadow: '1px 1px 3px rgba(0,0,0,0.5)',
                        fontSize: { xs: '1rem', sm: '1.25rem', md: '1.5rem' }
                    }}
                >
                    Discover handcrafted pieces built on tradition and quality.
                </Typography>
                <Button 
                    variant="contained"
                    size="large"
                    onClick={onShopNow}
                    endIcon={<ArrowRightIcon />}
                    sx={{ 
                        bgcolor: PRIMARY_COLOR, 
                        fontWeight: 'bold', 
                        fontSize: { xs: '1rem', md: '1.2rem' },
                        py: { xs: 1.2, md: 1.5 },
                        px: { xs: 3, md: 5 },
                        borderRadius: '8px',
                        // Lifted shadow for premium feel
                        boxShadow: `0 8px 15px rgba(0, 0, 0, 0.4)`, 
                        '&:hover': { 
                            bgcolor: HOVER_COLOR, 
                            transform: 'translateY(-2px) scale(1.02)', // Subtle lift and scale effect
                            boxShadow: `0 12px 20px rgba(0, 0, 0, 0.5)`,
                        },
                        transition: 'all 0.3s ease',
                    }}
                >
                    Start Shopping Now
                </Button>
            </Container>
        </Box>
    );
};

export default HeroBanner;
