import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { usersAPI, notesAPI } from '../services/api';
import { toast } from 'react-toastify';

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    uploaded_notes: 0,
    approved_notes: 0,
    total_downloads: 0
  });
  const [recentNotes, setRecentNotes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch user profile with stats
      const profileResponse = await usersAPI.getProfile();
      if (profileResponse.data.user.stats) {
        setStats(profileResponse.data.user.stats);
      }

      // Fetch user's recent notes
      const notesResponse = await notesAPI.getMyNotes({ per_page: 5 });
      setRecentNotes(notesResponse.data.notes);

    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container" style={{ textAlign: 'center', padding: '60px 0' }}>
        <div className="spinner"></div>
        <p style={{ marginTop: '20px' }}>Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className="dashboard">
      <div className="container">
        <div className="dashboard-header">
          <h1>Welcome back, {user?.first_name}!</h1>
          <p style={{ color: '#666', fontSize: '18px' }}>
            Here's what's happening with your notes
          </p>
        </div>

        {/* Stats Cards */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-number">{stats.uploaded_notes}</div>
            <div className="stat-label">Notes Uploaded</div>
          </div>
          
          <div className="stat-card">
            <div className="stat-number">{stats.approved_notes}</div>
            <div className="stat-label">Notes Approved</div>
          </div>
          
          <div className="stat-card">
            <div className="stat-number">{stats.total_downloads}</div>
            <div className="stat-label">Total Downloads</div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Quick Actions</h3>
          </div>
          <div className="card-body">
            <div className="row">
              <div className="col-3">
                <Link to="/upload" className="btn btn-primary" style={{ width: '100%' }}>
                  📄 Upload Notes
                </Link>
              </div>
              <div className="col-3">
                <Link to="/notes" className="btn btn-secondary" style={{ width: '100%' }}>
                  🔍 Browse Notes
                </Link>
              </div>
              <div className="col-3">
                <Link to="/bookmarks" className="btn btn-warning" style={{ width: '100%' }}>
                  🔖 My Bookmarks
                </Link>
              </div>
              <div className="col-3">
                <Link to="/profile" className="btn btn-success" style={{ width: '100%' }}>
                  👤 My Profile
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Notes */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">My Recent Notes</h3>
          </div>
          <div className="card-body">
            {recentNotes.length > 0 ? (
              <div className="table-responsive">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Title</th>
                      <th>Subject</th>
                      <th>Status</th>
                      <th>Downloads</th>
                      <th>Uploaded</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentNotes.map((note) => (
                      <tr key={note.id}>
                        <td>
                          <Link 
                            to={`/notes/${note.id}`} 
                            style={{ color: '#007bff', textDecoration: 'none' }}
                          >
                            {note.title}
                          </Link>
                        </td>
                        <td>{note.subject?.name || 'No Subject'}</td>
                        <td>
                          <span className={`badge ${note.is_approved ? 'badge-success' : 'badge-warning'}`}>
                            {note.is_approved ? 'Approved' : 'Pending'}
                          </span>
                        </td>
                        <td>{note.download_count}</td>
                        <td>{new Date(note.created_at).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '40px 0', color: '#666' }}>
                <p>You haven't uploaded any notes yet.</p>
                <Link to="/upload" className="btn btn-primary">
                  Upload Your First Note
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Profile Completion */}
        {(!user?.college_name || !user?.department || !user?.semester) && (
          <div className="card" style={{ backgroundColor: '#fff3cd', border: '1px solid #ffeaa7' }}>
            <div className="card-body">
              <h4 style={{ color: '#856404' }}>Complete Your Profile</h4>
              <p style={{ color: '#856404', marginBottom: '15px' }}>
                Complete your profile to help other students find and connect with you.
              </p>
              <Link to="/profile" className="btn btn-warning">
                Update Profile
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;