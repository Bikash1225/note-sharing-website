import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Redirect to intended page after login
  const from = location.state?.from?.pathname || '/dashboard';

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    
    try {
      const result = await login(formData);
      
      if (result.success) {
        toast.success('Login successful!');
        navigate(from, { replace: true });
      } else {
        toast.error(result.error);
      }
    } catch (error) {
      toast.error('Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <div className="auth-form">
        <h2 className="form-title">Login to Notes Vault</h2>
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email" className="form-label">
              Email Address
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className={`form-control ${errors.email ? 'error' : ''}`}
              placeholder="Enter your email"
              disabled={loading}
            />
            {errors.email && (
              <div className="error-message">{errors.email}</div>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="password" className="form-label">
              Password
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className={`form-control ${errors.password ? 'error' : ''}`}
              placeholder="Enter your password"
              disabled={loading}
            />
            {errors.password && (
              <div className="error-message">{errors.password}</div>
            )}
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', marginTop: '20px' }}
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="spinner" style={{ marginRight: '10px' }}></span>
                Logging in...
              </>
            ) : (
              'Login'
            )}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '30px' }}>
          <p style={{ color: '#666' }}>
            Don't have an account?{' '}
            <Link to="/register" style={{ color: '#007bff', textDecoration: 'none' }}>
              Create one here
            </Link>
          </p>
        </div>

        {/* Demo Credentials */}
        <div style={{ 
          marginTop: '30px', 
          padding: '20px', 
          backgroundColor: '#f8f9fa', 
          borderRadius: '8px',
          border: '1px solid #dee2e6'
        }}>
          <h4 style={{ fontSize: '16px', marginBottom: '15px', color: '#333' }}>
            Demo Credentials
          </h4>
          
          <div style={{ marginBottom: '10px' }}>
            <strong>Admin:</strong>
            <br />
            Email: admin@notesvault.com
            <br />
            Password: admin123
          </div>
          
          <div style={{ fontSize: '14px', color: '#666', marginTop: '10px' }}>
            Use these credentials to test the application
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;