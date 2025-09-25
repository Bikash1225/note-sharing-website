import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <nav className="navbar">
      <div className="navbar-content">
        <Link to="/" className="navbar-brand">
          Notes Vault
        </Link>
        
        <div className="navbar-nav">
          <Link 
            to="/notes" 
            className={`nav-link ${isActive('/notes') ? 'active' : ''}`}
          >
            Browse Notes
          </Link>
          
          {isAuthenticated() ? (
            <>
              <Link 
                to="/dashboard" 
                className={`nav-link ${isActive('/dashboard') ? 'active' : ''}`}
              >
                Dashboard
              </Link>
              
              <Link 
                to="/upload" 
                className={`nav-link ${isActive('/upload') ? 'active' : ''}`}
              >
                Upload
              </Link>
              
              <Link 
                to="/bookmarks" 
                className={`nav-link ${isActive('/bookmarks') ? 'active' : ''}`}
              >
                Bookmarks
              </Link>
              
              {isAdmin() && (
                <Link 
                  to="/admin" 
                  className={`nav-link ${location.pathname.startsWith('/admin') ? 'active' : ''}`}
                >
                  Admin
                </Link>
              )}
              
              <div className="nav-dropdown">
                <span className="nav-link">
                  Welcome, {user?.first_name}
                </span>
                <div className="nav-dropdown-content">
                  <Link to="/profile" className="nav-link">Profile</Link>
                  <button onClick={handleLogout} className="nav-link" style={{background: 'none', border: 'none', color: 'white', cursor: 'pointer'}}>
                    Logout
                  </button>
                </div>
              </div>
            </>
          ) : (
            <>
              <Link 
                to="/login" 
                className={`nav-link ${isActive('/login') ? 'active' : ''}`}
              >
                Login
              </Link>
              
              <Link 
                to="/register" 
                className={`nav-link ${isActive('/register') ? 'active' : ''}`}
              >
                Register
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;