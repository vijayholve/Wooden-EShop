import { useState } from 'react';
import ProductList from './pages/Product/ProductList';
import Header from './components/Header';
import Footer from './components/Footer';
import AuthForm from './pages/Auth/Auth';
import ProfileView from './pages/Profile/ProfileView';
import CartView from './pages/Profile/CartView';
import { AuthProvider } from './context/AuthContext'; // Import AuthProvider
import { Toast } from './components/Toast'; // Assuming you have a Toast component

// We will keep the message state here to allow AuthProvider to update global messages
const AppContent = () => {
    const [page, setPage] = useState('home');
    const [message, setMessage] = useState(null);

    // Render components based on the current page
    const renderPage = () => {
        switch (page) {
            case 'products':
            case 'home':
                return <ProductList setPage={setPage} />;
            case 'login':
            case 'register':
                return <AuthForm type={page} setPage={setPage} setMessage={setMessage} />;
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
            <Header setPage={setPage} setMessage={setMessage} />
            <main className="flex-grow container mx-auto px-4 py-8">
                {renderPage()}
            </main>
            <Footer />
            {message && <Toast message={message.message} severity={message.severity} onClose={() => setMessage(null)} />}
        </div>
    );
};

// Main App component now wraps AppContent with AuthProvider
const App = () => {
    const [message, setMessage] = useState(null); // Keep global message state here

    return (
        // Pass setMessage down to AuthProvider so it can report success/failure
        <AuthProvider setGlobalMessage={setMessage}>
            <AppContent message={message} setMessage={setMessage} />
        </AuthProvider>
    );
};

export default App;
