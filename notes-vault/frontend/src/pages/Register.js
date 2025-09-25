import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';

const Register = () => {
  const [formData, setFormData] = useState({
    email: '',
    username: '',
    password: '',
    confirmPassword: '',
    first_name: '',
    last_name: '',
    student_id: '',
    college_name: '',
    department: '',
    semester: '',
    phone: ''
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const { register } = useAuth();
  const navigate = useNavigate();

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

    // Required fields
    const requiredFields = ['email', 'username', 'password', 'confirmPassword', 'first_name', 'last_name'];
    requiredFields.forEach(field => {
      if (!formData[field].trim()) {
        newErrors[field] = `${field.replace('_', ' ')} is required`;
      }
    });

    // Email validation
    if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }

    // Password validation
    if (formData.password && formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters long';
    }

    // Password confirmation
    if (formData.password && formData.confirmPassword && formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    // Username validation
    if (formData.username && formData.username.length < 3) {
      newErrors.username = 'Username must be at least 3 characters long';
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
      // Remove confirmPassword from data sent to API
      const { confirmPassword, ...registrationData } = formData;
      
      const result = await register(registrationData);
      
      if (result.success) {
        toast.success('Registration successful! Welcome to Notes Vault!');
        navigate('/dashboard');
      } else {
        toast.error(result.error);
      }
    } catch (error) {
      toast.error('Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <div className="auth-form" style={{ maxWidth: '600px' }}>
        <h2 className="form-title">Join Notes Vault</h2>
        
        <form onSubmit={handleSubmit}>
          <div className="row">
            <div className="col-6">
              <div className="form-group">
                <label htmlFor="first_name" className="form-label">
                  First Name *
                </label>
                <input
                  type="text"
                  id="first_name"
                  name="first_name"
                  value={formData.first_name}
                  onChange={handleChange}
                  className={`form-control ${errors.first_name ? 'error' : ''}`}
                  placeholder="Enter your first name"
                  disabled={loading}
                />
                {errors.first_name && (
                  <div className="error-message">{errors.first_name}</div>
                )}
              </div>
            </div>

            <div className="col-6">
              <div className="form-group">
                <label htmlFor="last_name" className="form-label">
                  Last Name *
                </label>
                <input
                  type="text"
                  id="last_name"
                  name="last_name"
                  value={formData.last_name}
                  onChange={handleChange}
                  className={`form-control ${errors.last_name ? 'error' : ''}`}
                  placeholder="Enter your last name"
                  disabled={loading}
                />
                {errors.last_name && (
                  <div className="error-message">{errors.last_name}</div>
                )}
              </div>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="email" className="form-label">
              Email Address *
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
            <label htmlFor="username" className="form-label">
              Username *
            </label>
            <input
              type="text"
              id="username"
              name="username"
              value={formData.username}
              onChange={handleChange}
              className={`form-control ${errors.username ? 'error' : ''}`}
              placeholder="Choose a username"
              disabled={loading}
            />
            {errors.username && (
              <div className="error-message">{errors.username}</div>
            )}
          </div>

          <div className="row">
            <div className="col-6">
              <div className="form-group">
                <label htmlFor="password" className="form-label">
                  Password *
                </label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className={`form-control ${errors.password ? 'error' : ''}`}
                  placeholder="Create a password"
                  disabled={loading}
                />
                {errors.password && (
                  <div className="error-message">{errors.password}</div>
                )}
              </div>
            </div>

            <div className="col-6">
              <div className="form-group">
                <label htmlFor="confirmPassword" className="form-label">
                  Confirm Password *
                </label>
                <input
                  type="password"
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className={`form-control ${errors.confirmPassword ? 'error' : ''}`}
                  placeholder="Confirm your password"
                  disabled={loading}
                />
                {errors.confirmPassword && (
                  <div className="error-message">{errors.confirmPassword}</div>
                )}
              </div>
            </div>
          </div>

          <div className="row">
            <div className="col-6">
              <div className="form-group">
                <label htmlFor="student_id" className="form-label">
                  Student ID
                </label>
                <input
                  type="text"
                  id="student_id"
                  name="student_id"
                  value={formData.student_id}
                  onChange={handleChange}
                  className="form-control"
                  placeholder="Enter your student ID"
                  disabled={loading}
                />
              </div>
            </div>

            <div className="col-6">
              <div className="form-group">
                <label htmlFor="phone" className="form-label">
                  Phone Number
                </label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="form-control"
                  placeholder="Enter your phone"
                  disabled={loading}
                />
              </div>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="college_name" className="form-label">
              College Name
            </label>
            <input
              type="text"
              id="college_name"
              name="college_name"
              value={formData.college_name}
              onChange={handleChange}
              className="form-control"
              placeholder="Enter your college name"
              disabled={loading}
            />
          </div>

          <div className="row">
            <div className="col-6">
              <div className="form-group">
                <label htmlFor="department" className="form-label">
                  Department
                </label>
                <input
                  type="text"
                  id="department"
                  name="department"
                  value={formData.department}
                  onChange={handleChange}
                  className="form-control"
                  placeholder="e.g., Computer Science"
                  disabled={loading}
                />
              </div>
            </div>

            <div className="col-6">
              <div className="form-group">
                <label htmlFor="semester" className="form-label">
                  Current Semester
                </label>
                <select
                  id="semester"
                  name="semester"
                  value={formData.semester}
                  onChange={handleChange}
                  className="form-control"
                  disabled={loading}
                >
                  <option value="">Select Semester</option>
                  <option value="1st">1st Semester</option>
                  <option value="2nd">2nd Semester</option>
                  <option value="3rd">3rd Semester</option>
                  <option value="4th">4th Semester</option>
                  <option value="5th">5th Semester</option>
                  <option value="6th">6th Semester</option>
                  <option value="7th">7th Semester</option>
                  <option value="8th">8th Semester</option>
                </select>
              </div>
            </div>
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
                Creating Account...
              </>
            ) : (
              'Create Account'
            )}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '30px' }}>
          <p style={{ color: '#666' }}>
            Already have an account?{' '}
            <Link to="/login" style={{ color: '#007bff', textDecoration: 'none' }}>
              Login here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;