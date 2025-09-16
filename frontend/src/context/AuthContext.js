import React, { createContext, useState, useEffect, useCallback } from 'react';
import { jwtDecode } from 'jwt-decode';

const AuthContext = createContext();

const AuthProvider = ({ children }) => {
    const [auth, setAuth] = useState({
        token: null,
        user: null,
        isAuthenticated: false,
        loading: true,
    });

    const loadUserFromToken = useCallback(() => {
        const token = localStorage.getItem('token');
        if (token) {
            try {
                const decodedUser = jwtDecode(token);
                const currentTime = Date.now() / 1000;

                if (decodedUser.exp < currentTime) {
                    console.log('Token expired, removing from storage');
                    localStorage.removeItem('token');
                    setAuth({ token: null, user: null, isAuthenticated: false, loading: false });
                } else {
                    setAuth({
                        token: token,
                        user: decodedUser.user,
                        isAuthenticated: true,
                        loading: false,
                    });
                }
            } catch (err) {
                console.error('Invalid token:', err);
                localStorage.removeItem('token');
                setAuth({ token: null, user: null, isAuthenticated: false, loading: false });
            }
        } else {
            setAuth({ token: null, user: null, isAuthenticated: false, loading: false });
        }
    }, []);

    useEffect(() => {
        loadUserFromToken();
    }, [loadUserFromToken]);

    const login = (token) => {
        try {
            localStorage.setItem('token', token);
            const decodedUser = jwtDecode(token);
            setAuth({
                token: token,
                user: decodedUser.user,
                isAuthenticated: true,
                loading: false,
            });
        } catch (err) {
            console.error('Error during login:', err);
            logout();
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        setAuth({
            token: null,
            user: null,
            isAuthenticated: false,
            loading: false,
        });
    };

    // Auto-refresh token before expiry (optional enhancement)
    useEffect(() => {
        if (auth.token) {
            try {
                const decodedToken = jwtDecode(auth.token);
                const timeUntilExpiry = (decodedToken.exp * 1000) - Date.now();

                // If token expires in less than 5 minutes, we could refresh it
                if (timeUntilExpiry < 5 * 60 * 1000 && timeUntilExpiry > 0) {
                    console.log('Token expires soon, consider refreshing');
                }
            } catch (err) {
                console.error('Error checking token expiry:', err);
            }
        }
    }, [auth.token]);

    const contextValue = {
        auth,
        login,
        logout,
        isLoading: auth.loading
    };

    return (
        <AuthContext.Provider value={contextValue}>
            {!auth.loading && children}
        </AuthContext.Provider>
    );
};

export { AuthContext, AuthProvider };
