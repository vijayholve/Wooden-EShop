// ecommerce_frontend/src/pages/Product/ProductList.jsx

import React, { useState } from "react";
import {
  Container,
  Box,
  Typography,
  Grid,
  CircularProgress,
  Alert,
} from "@mui/material";
import { ArrowRight as ArrowRightIcon } from "@mui/icons-material";
import ProductCard from "./ProductCard";
import HeroBanner from "../../components/HeroBanner"; // <-- Your full-width banner
// Assume constants (PRIMARY_COLOR, HOVER_COLOR, MOCK_PRODUCTS) are imported or defined.
const PRIMARY_COLOR = "#9e6a3c";
const MOCK_PRODUCTS = [
  {
    id: 1,
    name: "Luxury Wooden Chess Set",
    price: 49.99,
    image: "https://placehold.co/400x300/F0D9B5/5E482D?text=Chess+Set",
    inStock: 15,
  },
  {
    id: 2,
    name: "Hand-Carved Wooden Box",
    price: 29.99,
    image: "https://placehold.co/400x300/B58863/5E482D?text=Wooden+Box",
    inStock: 5,
  },
  {
    id: 3,
    name: "Wooden Desk Organizer",
    price: 19.99,
    image: "https://placehold.co/400x300/D4B89D/5E482D?text=Organizer",
    inStock: 30,
  },
];
// ... (rest of imports and component logic for API fetching/cart handling)

const ProductList = ({
  apiFetch,
  cart = {},
  fetchUserCart,
  isAuthenticated = false,
  setMessage,
}) => {
  const [products] = useState(MOCK_PRODUCTS); // Using mock products for display purposes
  const [isLoading] = useState(false);

  // Placeholder function for scrolling down to products
  const handleShopNow = () => {
    const productListSection = document.getElementById("product-list-section");
    if (productListSection) {
      productListSection.scrollIntoView({ behavior: "smooth" });
    }
  };

  if (isLoading)
    return (
      <Box sx={{ textAlign: "center", p: 4 }}>
        <CircularProgress sx={{ color: PRIMARY_COLOR }} size={40} />
      </Box>
    );

  return (
    // Outer Box ensures minimum height
    <Box sx={{ minHeight: "80vh", width: "100%" }}>
      {/* 1. AMAZING FULL-WIDTH HERO BANNER */}
      <HeroBanner onShopNow={handleShopNow} />

      {/* 2. MAIN CONTENT CONTAINER (Constrained for readability on large screens) */}
      <Container
        component="section"
        id="product-list-section" // Anchor for navigation
        maxWidth="lg" // Limits max width to large screen size for readability
        sx={{ py: { xs: 4, sm: 8 } }} // Responsive vertical padding
      >
        <Typography
          variant="h3"
          align="center"
          gutterBottom
          sx={{ fontWeight: "extrabold", color: "#424242", mb: 5, pt: 3 }}
        >
          Our Latest Collection
        </Typography>

        {/* 3. PHONE RESPONSIVE PRODUCT GRID */}
        <Grid container spacing={4}>
          {products.map((product) => (
            <Grid
              item
              xs={12} // Full width on extra small devices (phones)
              sm={6} // 2 columns on small devices (tablets)
              md={4} // 3 columns on medium devices
              lg={3} // 4 columns on large devices
              key={product.id}
            >
              <ProductCard
                product={product}
                onAddToCart={(product) => console.log("Add to cart:", product)}
                isAuthenticated={isAuthenticated}
                inCartQuantity={cart?.[product.id]?.quantity || 0}
                isAdding={false} // Placeholder for adding state
              />
            </Grid>
          ))}
        </Grid>

        {/* 4. Login Prompt */}
        {!isAuthenticated && (
          <Alert
            severity="warning"
            sx={{
              mt: 6,
              borderLeft: `4px solid ${PRIMARY_COLOR}`,
              bgcolor: `${PRIMARY_COLOR}10`,
            }}
          >
            <Typography fontWeight="bold" align="center">
              Log in to add products to your cart and checkout!
            </Typography>
          </Alert>
        )}
      </Container>
    </Box>
  );
};

ProductList.defaultProps = {
  cart: {},
};

export default ProductList;
