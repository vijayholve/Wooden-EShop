import { useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
// Imports are failing to resolve using './'. We must assume a deeper nesting or a bundler configuration issue requiring explicit relative paths.
// Since App.jsx is inside src, other folders like context, pages, components are siblings.
import { useAuth, AuthProvider } from "./context/AuthContext.jsx";
import ProductList from "./pages/Product/ProductList.jsx";
import Header from "./components/Header.jsx";
import Footer from "./components/Footer.jsx";
import AuthForm from "./pages/Auth/Auth.jsx";
import ProfileView from "./pages/Profile/ProfileView.jsx";
import CartView from "./pages/Profile/CartView.jsx";
import { Toast } from "./components/Toast.jsx";
import Login from "./pages/Login";
import Register from "./pages/Register";
import HomePage from "./pages/HomePage";
import PublicLayout from "./layouts/PublicLayout";
import PrivateLayout from "./layouts/PrivateLayout";

// --- ROUTING CONFIGURATION ---
// Define the routing map outside the components
const ROUTES = {
  home: { component: ProductList, requiresAuth: false, defaultPage: true },
  products: { component: ProductList, requiresAuth: false },
  login: { component: AuthForm, requiresAuth: false, props: { type: "login" } },
  register: {
    component: AuthForm,
    requiresAuth: false,
    props: { type: "register" },
  },
  profile: { component: ProfileView, requiresAuth: true },
  cart: { component: CartView, requiresAuth: true },
};

// Component responsible for rendering the current view based on 'page' state
const RouterComponent = ({ page, setPage, handleSetMessage }) => {
  const { isAuthenticated } = useAuth();

  // Check if the requested route exists
  const route = ROUTES[page] || ROUTES["home"];

  // Check authentication requirements
  if (route.requiresAuth && !isAuthenticated) {
    // Redirect to login if authentication is required but user is logged out
    return (
      <AuthForm type="login" setPage={setPage} setMessage={handleSetMessage} />
    );
  }

  // Get the component and its props
  const CurrentPage = route.component;
  const pageProps = {
    setPage,
    setMessage: handleSetMessage,
    ...(route.props || {}),
  };

  return <CurrentPage {...pageProps} />;
};

// --- MAIN APP CONTENT COMPONENT ---
const AppContent = () => {
  // page state manages which route to display
  const [page, setPage] = useState("home");
  // message state handles the Toast visibility
  const [message, setLocalMessage] = useState(null);
  const { setGlobalMessage } = useAuth(); // Use context function for global updates

  // Function to handle global and local message setting
  const handleSetMessage = (msg) => {
    // Set global message via AuthProvider (for context-driven actions)
    setGlobalMessage(msg);
    // Set local state for Toast visibility
    setLocalMessage(msg);
  };

  return (
    <div className="flex flex-col min-h-screen">
      {/* <Header setPage={setPage} />  */}
      {/* <main className="flex-grow container mx-auto px-4 py-8">
                <RouterComponent 
                    page={page} 
                    setPage={setPage} 
                    handleSetMessage={handleSetMessage} 
                />
            </main> */}
      <Footer />
      {/* Render Toast if a local message is present */}
      {message && (
        <Toast
          message={message.message}
          severity={message.severity}
          onClose={() => setLocalMessage(null)}
        />
      )}
    </div>
  );
};

// --- MAIN APP COMPONENT ---
// Main App component wraps AppContent with AuthProvider
const App = () => {
  // AuthProvider will manage the global message state
  // Note: The variable globalMessage is not used, but kept for clarity in debugging context flow.
  const [globalMessage, setGlobalMessage] = useState(null);

  return (
    // Pass the setter down to AuthProvider so it can report success/failure
    <AuthProvider setGlobalMessage={setGlobalMessage}>
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route element={<PublicLayout />}>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
          </Route>

          {/* Private Routes */}
          <Route element={<PrivateLayout />}>
            <Route path="/" element={<ProductList />} />
          </Route>
        </Routes>
        <AppContent />
      </Router>
    </AuthProvider>
  );
};

export default App;
