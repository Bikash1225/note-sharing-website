import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Home = () => {
  const { isAuthenticated } = useAuth();

  return (
    <div>
      {/* Hero Section */}
      <section className="hero-section">
        <div className="container">
          <h1 className="hero-title">Notes Vault</h1>
          <p className="hero-subtitle">
            Your centralized platform for sharing and accessing college notes
          </p>
          <div style={{ marginTop: '40px' }}>
            {isAuthenticated() ? (
              <Link to="/dashboard" className="btn btn-lg" style={{ backgroundColor: 'white', color: '#007bff', marginRight: '20px' }}>
                Go to Dashboard
              </Link>
            ) : (
              <>
                <Link to="/register" className="btn btn-lg" style={{ backgroundColor: 'white', color: '#007bff', marginRight: '20px' }}>
                  Get Started
                </Link>
                <Link to="/login" className="btn btn-lg btn-outline" style={{ borderColor: 'white', color: 'white' }}>
                  Login
                </Link>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section">
        <div className="container">
          <div className="text-center">
            <h2 style={{ fontSize: '36px', marginBottom: '20px', color: '#333' }}>
              Why Choose Notes Vault?
            </h2>
            <p style={{ fontSize: '18px', color: '#666', maxWidth: '600px', margin: '0 auto' }}>
              Designed specifically for college students to enhance collaborative learning
              and improve academic performance through easy access to quality notes.
            </p>
          </div>

          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">📚</div>
              <h3 className="feature-title">Easy Upload & Download</h3>
              <p className="feature-description">
                Upload your notes in multiple formats (PDF, DOCX, PPT) and download others' 
                notes with a single click. Simple and intuitive interface for all users.
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">🔒</div>
              <h3 className="feature-title">Secure & Reliable</h3>
              <p className="feature-description">
                Your notes are stored securely with proper authentication and access controls. 
                Admin moderation ensures quality and authenticity of all content.
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">🎯</div>
              <h3 className="feature-title">Subject Organization</h3>
              <p className="feature-description">
                Notes are organized by subjects, semesters, and departments making it easy 
                to find exactly what you need for your studies.
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">👥</div>
              <h3 className="feature-title">Collaborative Learning</h3>
              <p className="feature-description">
                Share knowledge with your peers, bookmark useful notes, and build a 
                collaborative learning community within your college.
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">📱</div>
              <h3 className="feature-title">Mobile Friendly</h3>
              <p className="feature-description">
                Access your notes anytime, anywhere with our responsive design that works 
                perfectly on all devices - desktop, tablet, and mobile.
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">⚡</div>
              <h3 className="feature-title">Fast & Efficient</h3>
              <p className="feature-description">
                Quick search functionality, fast downloads, and efficient browsing make 
                studying more productive and less time-consuming.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section style={{ padding: '80px 0', backgroundColor: '#f8f9fa' }}>
        <div className="container text-center">
          <h2 style={{ fontSize: '32px', marginBottom: '20px', color: '#333' }}>
            Ready to Get Started?
          </h2>
          <p style={{ fontSize: '18px', color: '#666', marginBottom: '40px', maxWidth: '500px', margin: '0 auto 40px' }}>
            Join thousands of students who are already using Notes Vault to enhance their learning experience.
          </p>
          {!isAuthenticated() && (
            <div>
              <Link to="/register" className="btn btn-primary btn-lg" style={{ marginRight: '20px' }}>
                Create Account
              </Link>
              <Link to="/notes" className="btn btn-outline btn-lg">
                Browse Notes
              </Link>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default Home;