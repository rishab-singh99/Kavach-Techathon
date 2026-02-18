import { useState, useEffect } from 'react';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import { speakWelcomeMessage } from './utils/speech';

export default function App() {
    // Optimization: Initialize state directly to prevent login flash
    const [isLoggedIn, setIsLoggedIn] = useState(() => !!localStorage.getItem('token'));

    useEffect(() => {
        // Play welcome audio on reload
        speakWelcomeMessage(isLoggedIn);
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setIsLoggedIn(false);
    };

    if (!isLoggedIn) {
        return <Login onLoginSuccess={() => setIsLoggedIn(true)} />;
    }

    return <Dashboard onLogout={handleLogout} />;
}
