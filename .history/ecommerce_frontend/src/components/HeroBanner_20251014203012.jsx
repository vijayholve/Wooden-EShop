import { Box, Typography, Button, Container } from '@mui/material';
import { ArrowRightAlt as ArrowRightIcon } from '@mui/icons-material';

// Defining a richer, wood-themed color palette
const PRIMARY_COLOR = '#6F4E37'; // Coffee/Walnut Brown - Deep and rich
const SECONDARY_COLOR = '#F0D9B5'; // Light Maple/Wood Grain Beige - Excellent contrast
const HOVER_COLOR = '#A0522D'; // Sienna/Reddish Brown for hover

const HeroBanner = ({ onShopNow }) => {
    return (
        <Box 
            sx={{
                width: '100%', // Ensures full width
                // More impactful responsive height: 45vh on mobile, 70vh on large screens
                height: { xs: '45vh', sm: '55vh', md: '70vh' }, 
                // Using a more realistic wooden background image for better feel
                backgroundImage: 'url(https://placehold.co/1920x800/6F4E37/F0D9B5?text=Artisan+Woodcraft+Showcase)', 
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
            {/* Elegant Gradient Overlay for high contrast text - stronger dark at the bottom */}
            <Box 
                sx={{
                    position: 'absolute',
                    top: 0, left: 0, right: 0, bottom: 0,
                    // Stronger dark gradient from bottom for contrast
                    background: 'linear-gradient(0deg, rgba(0, 0, 0, 0.7) 0%, rgba(0, 0, 0, 0.3) 60%, rgba(0, 0, 0, 0.1) 100%)', 
                }}
            />
            
            {/* Content Container (Constrained in size for readability, centered) */}
            <Container maxWidth="md" sx={{ position: 'relative', zIndex: 2 }}>
                <Typography 
                    variant="h3" 
                    component="h1" 
                    fontWeight={900} // Extra bold for maximum impact
                    sx={{ 
                        color: SECONDARY_COLOR, // Using light wood color for main heading
                        mb: { xs: 1, md: 2 }, 
                        textShadow: '0px 6px 10px rgba(0,0,0,0.9)', // Even stronger shadow for realism
                        // Responsive font scaling
                        fontSize: { xs: '2.2rem', sm: '3.5rem', md: '4.5rem' }, 
                        letterSpacing: { xs: 1, md: 3 }
                    }}
                >
                    Heirloom Quality Woodcraft
                </Typography>
                <Typography 
                    variant="h6" 
                    sx={{ 
                        color: 'white', // White for subtitle for maximum readability
                        mb: { xs: 3, md: 5 }, 
                        maxWidth: 600, 
                        mx: 'auto', 
                        textShadow: '1px 1px 3px rgba(0,0,0,0.7)',
                        fontSize: { xs: '1rem', sm: '1.25rem', md: '1.5rem' }
                    }}
                >
                    Handcrafted pieces built on tradition. Made to last generations.
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
                        boxShadow: `0 8px 20px rgba(0, 0, 0, 0.6)`, 
                        '&:hover': { 
                            bgcolor: HOVER_COLOR, 
                            transform: 'translateY(-3px) scale(1.03)', // More pronounced lift
                            boxShadow: `0 15px 30px rgba(0, 0, 0, 0.8)`,
                        },
                        transition: 'all 0.4s ease-in-out',
                    }}
                >
                    Explore Our Collections
                </Button>
            </Container>
        </Box>
    );
};

export default HeroBanner;
