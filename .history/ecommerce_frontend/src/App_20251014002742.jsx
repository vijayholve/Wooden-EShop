import { useState } from 'react';
// Corrected imports to ensure module resolution works by explicitly navigating the relative path.
import ProductList from './pages/Product/ProductList.jsx';
import Header from './components/Header.jsx';
import Footer from './components/Footer.jsx';
import AuthForm from './pages/Auth/Auth.jsx';
import ProfileView from './pages/Profile/ProfileView.jsx';
import CartView from './pages/Profile/CartView.jsx';
import { AuthProvider } from './context/AuthContext.jsx'; // Import AuthProvider
// Assuming the Toast component is inside src/components and named Toast.jsx
import { Toast } from './components/Toast.jsx'; 

// We will keep the message state here to allow AuthProvider to update global messages
const AppContent = ({ setMessage }) => {
    const [page, setPage] = useState('home');
    const [message, setLocalMessage] = useState(null);

    // Merge the global message setting and local message display
    const handleSetMessage = (msg) => {
        setMessage(msg); // Set global message via prop (passed from parent App)
        setLocalMessage(msg); // Also set local state for Toast visibility
    };

    // Render components based on the current page
    const renderPage = () => {
        switch (page) {
            case 'products':
            case 'home':
                return <ProductList setPage={setPage} />;
            case 'login':
            case 'register':
                // Pass the handleSetMessage function to AuthForm
                return <AuthForm type={page} setPage={setPage} setMessage={handleSetMessage} />;
            case 'profile':
                return <ProfileView setPage={setPage} />;
            case 'cart':
                return <CartView setPage={setPage} />;
            default:
                return <ProductList setPage={setPage} />;
        }
    };

    return (
        <div className="flex flex-col min-h-screen">
            <Header setPage={setPage} /> 
            <main className="flex-grow container mx-auto px-4 py-8">
                {renderPage()}
            </main>
            <Footer />
            {message && <Toast message={message.message} severity={message.severity} onClose={() => setLocalMessage(null)} />}
        </div>
    );
};

// Main App component now wraps AppContent with AuthProvider
const App = () => {
    const [message, setMessage] = useState(null); // Keep global message state here

    return (
        // Pass setMessage down to AuthProvider so it can report success/failure
        <AuthProvider setGlobalMessage={setMessage}>
            {/* Pass the message prop to AppContent for local display */}
            <AppContent message={message} setMessage={setMessage} />
        </AuthProvider>
    );
};

export default App;
