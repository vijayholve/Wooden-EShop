import React from "react";
import PropTypes from "prop-types";
import {
  Button,
  Typography,
  Box,
  Card,
  CardContent,
  CardMedia,
} from "@mui/material";
import { ShoppingCart as ShoppingCartIcon } from "@mui/icons-material";

const PRIMARY_COLOR = "#9e6a3c";
const HOVER_COLOR = "#b6835a";

const ProductCard = ({
  product,
  onAddToCart,
  isAuthenticated,
  inCartQuantity,
  isAdding,
}) => {
  if (!product) {
    return (
      <Card elevation={4} sx={{ borderRadius: 3, p: 2, textAlign: "center" }}>
        <Typography variant="h6" color="error">
          Product data is unavailable.
        </Typography>
      </Card>
    );
  }

  return (
    <Card
      elevation={4}
      sx={{
        borderRadius: 3,
        border: `1px solid ${PRIMARY_COLOR}20`,
        transition: "box-shadow 0.3s",
        "&:hover": { boxShadow: 10 },
      }}
    >
      <CardMedia
        component="img"
        height="200"
        image={product.image}
        alt={product.name}
        sx={{ objectFit: "cover" }}
        onError={(e) => {
          e.target.onerror = null;
          e.target.src = `https://placehold.co/400x200/F0D9B5/5E482D?text=${encodeURIComponent(
            product.name
          )}`;
        }}
      />
      <CardContent>
        <Typography
          variant="h5"
          component="div"
          sx={{ fontWeight: "semibold", color: "text.primary", mb: 1 }}
        >
          {product.name}
        </Typography>
        <Typography
          variant="h4"
          sx={{ fontWeight: "bold", color: PRIMARY_COLOR, mb: 2 }}
        >
          ${product.price.toFixed(2)}
        </Typography>
        <Typography
          variant="body2"
          sx={{
            fontWeight: "medium",
            color: product.inStock > 0 ? "success.main" : "error.main",
          }}
        >
          {product.inStock > 0 ? `In Stock: ${product.inStock}` : "Sold Out"}
        </Typography>

        <Box
          sx={{
            mt: 2,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Typography variant="body2" color="text.secondary">
            {inCartQuantity > 0 && `In Cart: ${inCartQuantity}`}
          </Typography>

          <Button
            onClick={() => onAddToCart(product)}
            disabled={!isAuthenticated || product.inStock === 0 || isAdding}
            variant="contained"
            size="medium"
            startIcon={<ShoppingCartIcon />}
            sx={{ bgcolor: PRIMARY_COLOR, "&:hover": { bgcolor: HOVER_COLOR } }}
          >
            Add to Cart
          </Button>
        </Box>
      </CardContent>
    </Card>
  );
};

ProductCard.propTypes = {
  product: PropTypes.shape({
    image: PropTypes.string,
    name: PropTypes.string,
    price: PropTypes.number,
    inStock: PropTypes.number,
  }),
  onAddToCart: PropTypes.func.isRequired,
  isAuthenticated: PropTypes.bool,
  inCartQuantity: PropTypes.number,
  isAdding: PropTypes.bool,
};

ProductCard.defaultProps = {
  product: null,
  isAuthenticated: false,
  inCartQuantity: 0,
  isAdding: false,
};

export default ProductCard;
