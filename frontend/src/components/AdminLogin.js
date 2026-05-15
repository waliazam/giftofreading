// AdminLogin.js
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminAPI } from '../utils/api';
import { getStoredAdmin, saveAdminSession } from '../utils/session';

// ============================================================
// DESIGN TOKENS & ASSETS
// ============================================================
const THEME = {
  colors: {
    primary: '#0d5d36',
    primaryDark: '#08442a',
    accent: '#c9a24a',
    text: '#1a1a1a',
    textLight: '#666666',
    bg: '#f4f6f8',
    white: '#ffffff',
    error: '#dc3545',
  },
  shadows: {
    card: '0 20px 40px -10px rgba(13, 93, 54, 0.15)',
    input: '0 2px 4px rgba(0,0,0,0.05)',
  },
  radius: {
    card: '16px',
    input: '8px',
    button: '50px',
  },
};

const Icons = {
  Shield: () => (
    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke={THEME.colors.primary} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  ),
  User: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  ),
  Lock: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  ),
  ArrowRight: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="5" y1="12" x2="19" y2="12" />
      <polyline points="12 5 19 12 12 19" />
    </svg>
  ),
};

// ============================================================
// STYLES OBJECT
// ============================================================
const styles = {
  page: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: `linear-gradient(135deg, #f0f4f1 0%, #e6ebe9 100%)`,
    fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    padding: '20px',
  },
  card: {
    background: THEME.colors.white,
    borderRadius: THEME.radius.card,
    boxShadow: THEME.shadows.card,
    width: '100%',
    maxWidth: '440px',
    padding: '48px 40px',
    position: 'relative',
    overflow: 'hidden',
  },
  header: {
    textAlign: 'center',
    marginBottom: '32px',
  },
  iconWrapper: {
    width: '80px',
    height: '80px',
    background: 'rgba(13, 93, 54, 0.05)',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '0 auto 20px',
  },
  title: {
    fontSize: '24px',
    fontWeight: '700',
    color: THEME.colors.text,
    margin: '0 0 8px 0',
    letterSpacing: '-0.5px',
  },
  subtitle: {
    fontSize: '14px',
    color: THEME.colors.textLight,
    margin: 0,
  },
  formGroup: {
    marginBottom: '20px',
    position: 'relative',
  },
  label: {
    display: 'block',
    fontSize: '13px',
    fontWeight: '600',
    color: THEME.colors.text,
    marginBottom: '8px',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  inputWrapper: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
  },
  inputIcon: {
    position: 'absolute',
    left: '14px',
    color: THEME.colors.textLight,
    zIndex: 1,
  },
  input: {
    width: '100%',
    padding: '14px 14px 14px 44px',
    fontSize: '15px',
    border: '1px solid #e2e8f0',
    borderRadius: THEME.radius.input,
    background: '#fafafa',
    transition: 'all 0.2s',
    outline: 'none',
    boxSizing: 'border-box',
    color: THEME.colors.text,
  },
  inputFocus: {
    borderColor: THEME.colors.primary,
    background: THEME.colors.white,
    boxShadow: `0 0 0 3px rgba(13, 93, 54, 0.1)`,
  },
  error: {
    background: 'rgba(220, 53, 69, 0.08)',
    color: THEME.colors.error,
    padding: '12px',
    borderRadius: THEME.radius.input,
    fontSize: '13px',
    marginBottom: '20px',
    textAlign: 'center',
    border: '1px solid rgba(220, 53, 69, 0.1)',
  },
  button: {
    width: '100%',
    padding: '14px',
    background: `linear-gradient(135deg, ${THEME.colors.primary} 0%, ${THEME.colors.primaryDark} 100%)`,
    color: THEME.colors.white,
    border: 'none',
    borderRadius: THEME.radius.button,
    fontSize: '15px',
    fontWeight: '600',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    transition: 'transform 0.2s, box-shadow 0.2s',
    marginTop: '10px',
  },
  buttonDisabled: {
    opacity: 0.7,
    cursor: 'not-allowed',
    transform: 'none',
  },
  footer: {
    marginTop: '24px',
    textAlign: 'center',
    borderTop: '1px solid #f0f0f0',
    paddingTop: '20px',
  },
  link: {
    background: 'none',
    border: 'none',
    color: THEME.colors.textLight,
    fontSize: '13px',
    cursor: 'pointer',
    textDecoration: 'none',
    transition: 'color 0.2s',
  },
};

// ============================================================
// COMPONENT
// ============================================================
const AdminLogin = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [focusedField, setFocusedField] = useState(null);

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
      setError(err.response?.data?.error || 'Invalid credentials. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getInputStyle = (fieldName) => ({
    ...styles.input,
    ...(focusedField === fieldName ? styles.inputFocus : {}),
  });

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        {/* Header Section */}
        <div style={styles.header}>
          <div style={styles.iconWrapper}>
            <Icons.Shield />
          </div>
          <h1 style={styles.title}>Admin Access</h1>
          <p style={styles.subtitle}>Gift of Reading Control Center</p>
        </div>

        {/* Error Message */}
        {error && <div style={styles.error}>{error}</div>}

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <div style={styles.formGroup}>
            <label style={styles.label}>Username</label>
            <div style={styles.inputWrapper}>
              <span style={styles.inputIcon}>
                <Icons.User />
              </span>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                onFocus={() => setFocusedField('username')}
                onBlur={() => setFocusedField(null)}
                placeholder="Enter your username"
                style={getInputStyle('username')}
                autoFocus
                required
              />
            </div>
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Password</label>
            <div style={styles.inputWrapper}>
              <span style={styles.inputIcon}>
                <Icons.Lock />
              </span>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onFocus={() => setFocusedField('password')}
                onBlur={() => setFocusedField(null)}
                placeholder="Enter your password"
                style={getInputStyle('password')}
                required
              />
            </div>
          </div>

          <button
            type="submit"
            style={{
              ...styles.button,
              ...(loading ? styles.buttonDisabled : {}),
            }}
            disabled={loading}
            onMouseEnter={(e) => {
              if (!loading) e.currentTarget.style.transform = 'translateY(-2px)';
            }}
            onMouseLeave={(e) => {
              if (!loading) e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            {loading ? (
              <span>Authenticating...</span>
            ) : (
              <>
                Secure Login <Icons.ArrowRight />
              </>
            )}
          </button>
        </form>

        {/* Footer */}
        <div style={styles.footer}>
          <button
            onClick={() => navigate('/')}
            style={styles.link}
            onMouseEnter={(e) => (e.currentTarget.style.color = THEME.colors.primary)}
            onMouseLeave={(e) => (e.currentTarget.style.color = THEME.colors.textLight)}
          >
            ← Back to Public Site
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;