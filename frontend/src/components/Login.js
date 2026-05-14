import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authAPI } from '../utils/api';
import { getStoredUser, saveUserSession } from '../utils/session';

const Login = () => {
  const navigate = useNavigate();
  const [cnicBform, setCnicBform] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (getStoredUser()) {
      navigate('/dashboard', { replace: true });
    }
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!cnicBform || cnicBform.length !== 13) {
      setError('Please enter a valid 13-digit CNIC/B-Form number');
      return;
    }

    setLoading(true);

    try {
      const response = await authAPI.login(cnicBform);
      
      saveUserSession(response.data.user);
      
      // Navigate to dashboard
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed. Please check your CNIC/B-Form number.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-header">
        <div className="auth-header-content">
          <div className="auth-header-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#005a32" strokeWidth="2.5"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" /><polyline points="10 17 15 12 10 7" /><line x1="15" y1="12" x2="3" y2="12" /></svg>
          </div>
          <h1>Reader Login</h1>
          <p>Gift of Reading Initiative</p>
        </div>
      </div>

      <div className="auth-container">
        <div className="auth-card login-card">
          <div className="login-center-layout">
            <div className="login-icon-box">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" /><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" /></svg>
            </div>
            <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0f172a', marginBottom: '8px' }}>Welcome Back!</h2>
            <p style={{ color: '#64748b', marginBottom: '32px' }}>Enter your details to continue your reading journey</p>
          </div>

          {error && <div className="error" style={{ marginBottom: '24px' }}>{error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="form-group-modern">
              <label>B-Form or CNIC Number</label>
              <input
                type="text"
                className="input-modern"
                value={cnicBform}
                onChange={(e) => setCnicBform(e.target.value)}
                placeholder="Enter 13-digit number"
                maxLength="13"
                autoFocus
              />
              <small style={{ color: '#64748b', fontSize: '0.85rem', marginTop: '8px', display: 'block' }}>
                Enter the same number you used during registration.
              </small>
            </div>

            <button 
              type="submit" 
              className="auth-btn-next" 
              style={{ width: '100%', marginTop: '32px', justifyContent: 'center' }}
              disabled={loading}
            >
              {loading ? 'Logging in...' : 'Login →'}
            </button>
          </form>

          <div style={{ 
            marginTop: '40px', 
            padding: '24px',
            background: '#f8fafc',
            borderRadius: '20px',
            textAlign: 'center'
          }}>
            <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '16px' }}>
              Don't have an account yet?
            </p>
            <button
              onClick={() => navigate('/register')}
              className="auth-btn-back"
              style={{ width: '100%', justifyContent: 'center' }}
            >
              Register Now
            </button>
          </div>

          <div style={{ marginTop: '32px', textAlign: 'center' }}>
            <button
              onClick={() => navigate('/')}
              style={{
                background: 'none',
                border: 'none',
                color: '#64748b',
                cursor: 'pointer',
                fontSize: '0.9rem',
                fontWeight: 600,
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

export default Login;
