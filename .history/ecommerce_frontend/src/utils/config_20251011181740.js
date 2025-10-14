const API_BASE_URL = 'http://127.0.0.1:8000/api/v1'; 
const PRIMARY_COLOR = '#9e6a3c'; // Warm Amber/Brown for the wooden theme
const HOVER_COLOR = '#b6835a';

const MOCK_PRODUCTS = [
    { id: 1, name: "Luxury Wooden Chess Set", price: 49.99, image: "https://placehold.co/400x300/F0D9B5/5E482D?text=Chess+Set", inStock: 15 },
    { id: 2, name: "Hand-Carved Wooden Box", price: 29.99, image: "https://placehold.co/400x300/B58863/5E482D?text=Wooden+Box", inStock: 5 },
    { id: 3, name: "Wooden Desk Organizer", price: 19.99, image: "https://placehold.co/400x300/D4B89D/5E482D?text=Organizer", inStock: 30 },
];

const parseJwt = (token) => {
    if (!token) return null;
    try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));
        return JSON.parse(jsonPayload);
    } catch (error) {
        console.error("Failed to parse JWT:", error);
        return null;
    }
};
export { API_BASE_URL, PRIMARY_COLOR, HOVER_COLOR, MOCK_PRODUCTS, parseJwt };