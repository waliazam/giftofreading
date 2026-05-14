import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminAPI } from '../utils/api';
import { getStoredAdmin, saveAdminSession } from '../utils/session';

const AdminLogin = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (getStoredAdmin()) {
      navigate('/admin', { replace: true });
    }
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!username || !password) {
      setError('Please enter both username and password');
      return;
    }

    setLoading(true);

    try {
      const response = await adminAPI.login(username, password);
      saveAdminSession(response.data);
      navigate('/admin');
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="header">
        <div className="header-content">
          <h1>🛡️ Admin Login</h1>
          <p>Gift of Reading - Control Center</p>
        </div>
      </div>

      <div className="container">
        <div className="card" style={{ maxWidth: '500px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '30px' }}>
            <div style={{ 
              fontSize: '4rem', 
              marginBottom: '15px',
              background: 'var(--gradient-primary)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}>
              ⚙️
            </div>
            <h2 style={{ color: 'var(--color-page-text)', marginBottom: '10px' }}>Administrator Access</h2>
            <p style={{ color: 'var(--color-muted-text)' }}>Enter authorized credentials to access analytics</p>
          </div>

          {error && <div className="error">{error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Username</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter admin username"
                autoFocus
                required
              />
            </div>

            <div className="form-group" style={{ marginTop: '20px' }}>
              <label>Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter admin password"
                required
              />
            </div>

            <button 
              type="submit" 
              className="btn" 
              style={{ width: '100%', marginTop: '30px' }}
              disabled={loading}
            >
              {loading ? 'Authenticating...' : 'Secure Login →'}
            </button>
          </form>

          <div style={{ marginTop: '20px', textAlign: 'center' }}>
            <button
              onClick={() => navigate('/')}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--color-primary)',
                cursor: 'pointer',
                textDecoration: 'underline'
              }}
            >
              ← Back to Home
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
