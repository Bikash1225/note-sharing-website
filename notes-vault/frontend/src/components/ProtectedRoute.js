import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="container" style={{ textAlign: 'center', padding: '60px 0' }}>
        <div className="spinner"></div>
        <p style={{ marginTop: '20px' }}>Loading...</p>
      </div>
    );
  }

  return isAuthenticated() ? children : <Navigate to="/login" replace />;
};

export default ProtectedRoute;