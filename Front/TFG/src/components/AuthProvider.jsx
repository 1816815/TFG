import React, { createContext, useState, useEffect } from 'react';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const API_URL = import.meta.env.VITE_API_URL;
  const [accessToken, setAccessToken] = useState(null);
  const isAuthenticated = !!accessToken;


  // Refresca el token usando la cookie
  const refreshToken = async () => {
    try {
      const res = await fetch(`${API_URL}/nombre-pendiente/token/refresh/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include' // Necesario para que se envíe la cookie
      });
      const data = await res.json();
      if (res.ok) {
        setAccessToken(data.access);
      } else {
        console.warn('Token inválido o expirado');
        setAccessToken(null);
      }
    } catch {
      setAccessToken(null);
    }
  };

  // Refresca el token al cargar
  useEffect(() => {
    const isLoggedIn = localStorage.getItem("isLoggedIn");
    if (!isLoggedIn) return; // No ejecutar si no está logueado
    
    refreshToken();
    const interval = setInterval(refreshToken, 15 * 60 * 1000); // cada 15 min
    return () => clearInterval(interval);
  }, []);

  const logout = async () => {
    await fetch(`${API_URL}nombre-pendiente/logout/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include'
    });
    setAccessToken(null);
  };

  
  return (
    <AuthContext.Provider value={{ accessToken, setAccessToken, logout, API_URL, isAuthenticated }}>
      {children}
    </AuthContext.Provider>
  );
};
