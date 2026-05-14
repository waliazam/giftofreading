import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authAPI } from '../utils/api';
import PhotoFrame from './PhotoFrame';
import { saveUserSession } from '../utils/session';

const Registration = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    cnicBform: '',
    firstName: '',
    lastName: '',
    category: '',
    region: '',
    location: '',
    classLevel: 'N/A',
    photo: null
  });

  const regions = ['South', 'RSDU Hunza', 'RSDU Gilgit', 'Central Office', 'South Office'];
  
  const locationsByRegion = {
    'South': ['AKHSS Kharadar', 'Diamond Jubilee High School', 'Sultan Mohamed Shah Aga Khan School'],
    'RSDU Hunza': ['AKESP Hunza Office', 'Aga Khan School Gulmit', 'Aga Khan School Aliabad'],
    'RSDU Gilgit': ['AKESP Gilgit Office', 'Aga Khan School Gilgit', 'Diamond Jubilee School Gilgit'],
    'Central Office': ['AKESP Central Office'],
    'South Office': ['AKESP South Office']
  };

  const classes = ['PPI', 'PPII', 'I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII', 'N/A'];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
      ...(name === 'region' && { location: '' }),
      ...(name === 'category' && value !== 'Student' && { classLevel: 'N/A' })
    }));
    setError('');
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError('Photo size should not exceed 5MB');
        return;
      }
      setFormData(prev => ({ ...prev, photo: file }));
    }
  };

  const validateStep = () => {
    setError('');
    
    switch(step) {
      case 1:
        if (!formData.cnicBform || formData.cnicBform.length !== 13) {
          setError('Please enter a valid 13-digit CNIC/B-Form number');
          return false;
        }
        break;
      case 2:
        if (!formData.firstName || !formData.lastName || !formData.category) {
          setError('Please fill in all required fields');
          return false;
        }
        break;
      case 3:
        if (!formData.region || !formData.location) {
          setError('Please select region and location');
          return false;
        }
        break;
      case 4:
        if (formData.category === 'Student' && formData.classLevel === 'N/A') {
          setError('Please select your class');
          return false;
        }
        break;
      default:
        break;
    }
    return true;
  };

  const handleNext = async () => {
    if (!validateStep()) return;

    if (step === 1) {
      // Check if CNIC already exists
      setLoading(true);
      try {
        const response = await authAPI.checkCNIC(formData.cnicBform);
        if (response.data.exists) {
          setError('This CNIC/B-Form is already registered. Please login instead.');
          setLoading(false);
          return;
        }
      } catch (err) {
        setError('Error checking CNIC. Please try again.');
        setLoading(false);
        return;
      }
      setLoading(false);
    }

    if (step < 5) {
      setStep(step + 1);
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
      setError('');
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError('');

    try {
      const data = new FormData();
      data.append('cnicBform', formData.cnicBform);
      data.append('firstName', formData.firstName);
      data.append('lastName', formData.lastName);
      data.append('category', formData.category);
      data.append('region', formData.region);
      data.append('location', formData.location);
      data.append('classLevel', formData.classLevel);
      if (formData.photo) {
        data.append('photo', formData.photo);
      }

      const response = await authAPI.register(data);
      
      saveUserSession(response.data.user);
      
      // Navigate to dashboard
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const renderStep = () => {
    switch(step) {
      case 1:
        return (
          <div className="auth-content-layout">
            <div className="auth-illustration">
              <div className="illustration-circle">
                <svg width="120" height="120" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="16" rx="2" /><line x1="7" y1="8" x2="17" y2="8" /><line x1="7" y1="12" x2="17" y2="12" /><line x1="7" y1="16" x2="13" y2="16" /></svg>
              </div>
            </div>
            <div className="auth-form-side">
              <h2>Step 1: Create Your ID</h2>
              <p className="subtitle">Enter your 13-digit B-Form or CNIC number to get started.</p>
              <div className="form-group-modern">
                <label>B-Form or CNIC Number *</label>
                <input
                  type="text"
                  name="cnicBform"
                  className="input-modern"
                  value={formData.cnicBform}
                  onChange={handleInputChange}
                  placeholder="Enter 13-digit number"
                  maxLength="13"
                />
                <small style={{ color: '#64748b', fontSize: '0.85rem', marginTop: '8px', display: 'block' }}>
                  Enter your 13-digit B-Form or CNIC number without dashes.
                </small>
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="auth-content-layout">
            <div className="auth-illustration">
              <div className="illustration-circle">
                <svg width="120" height="120" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
              </div>
            </div>
            <div className="auth-form-side">
              <h2>Step 2: Personal Details</h2>
              <p className="subtitle">Please provide your full name and select your category.</p>
              <div className="form-group-modern">
                <label>First Name *</label>
                <input
                  type="text"
                  name="firstName"
                  className="input-modern"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  placeholder="Enter first name"
                />
              </div>
              <div className="form-group-modern" style={{ marginTop: '16px' }}>
                <label>Last Name *</label>
                <input
                  type="text"
                  name="lastName"
                  className="input-modern"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  placeholder="Enter last name"
                />
              </div>
              <div className="form-group-modern" style={{ marginTop: '16px' }}>
                <label>Category *</label>
                <select
                  name="category"
                  className="select-modern"
                  value={formData.category}
                  onChange={handleInputChange}
                >
                  <option value="">Select Category</option>
                  <option value="Student">Student</option>
                  <option value="Staff">Staff</option>
                  <option value="Teacher">Teacher</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="auth-content-layout">
            <div className="auth-illustration">
              <div className="illustration-circle">
                <svg width="120" height="120" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" /></svg>
              </div>
            </div>
            <div className="auth-form-side">
              <h2>Step 3: Contact Information</h2>
              <p className="subtitle">Select your region and specific school or office location.</p>
              <div className="form-group-modern">
                <label>Region *</label>
                <select
                  name="region"
                  className="select-modern"
                  value={formData.region}
                  onChange={handleInputChange}
                >
                  <option value="">Select Region</option>
                  {regions.map(region => (
                    <option key={region} value={region}>{region}</option>
                  ))}
                </select>
              </div>
              <div className="form-group-modern" style={{ marginTop: '16px' }}>
                <label>School/Office *</label>
                <select
                  name="location"
                  className="select-modern"
                  value={formData.location}
                  onChange={handleInputChange}
                  disabled={!formData.region}
                >
                  <option value="">Select Location</option>
                  {formData.region && locationsByRegion[formData.region].map(location => (
                    <option key={location} value={location}>{location}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="auth-content-layout">
            <div className="auth-illustration">
              <div className="illustration-circle">
                <svg width="120" height="120" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></svg>
              </div>
            </div>
            <div className="auth-form-side">
              <h2>Step 4: Review</h2>
              <p className="subtitle">Review your details and select your class if applicable.</p>
              <div className="form-group-modern">
                <label>Class {formData.category === 'Student' ? '*' : '(Optional)'}</label>
                <select
                  name="classLevel"
                  className="select-modern"
                  value={formData.classLevel}
                  onChange={handleInputChange}
                  disabled={formData.category !== 'Student'}
                >
                  <option value="">Select Class</option>
                  {classes.map(cls => (
                    <option key={cls} value={cls}>{cls}</option>
                  ))}
                </select>
              </div>
              <div style={{ background: '#f8fafc', padding: '20px', borderRadius: '16px', marginTop: '24px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', fontSize: '0.9rem' }}>
                  <div><span style={{ color: '#64748b' }}>Name:</span> <br/><strong>{formData.firstName} {formData.lastName}</strong></div>
                  <div><span style={{ color: '#64748b' }}>Category:</span> <br/><strong>{formData.category}</strong></div>
                  <div><span style={{ color: '#64748b' }}>Region:</span> <br/><strong>{formData.region}</strong></div>
                  <div><span style={{ color: '#64748b' }}>Location:</span> <br/><strong>{formData.location}</strong></div>
                </div>
              </div>
            </div>
          </div>
        );

      case 5:
        return (
          <div className="auth-content-layout">
            <div className="auth-illustration">
              <div className="illustration-circle">
                <svg width="120" height="120" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M14 9l-2 2-2-2" /><path d="M3 10a2 2 0 0 1 .709-1.528l7-5.999a2 2 0 0 1 2.582 0l7 5.999A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" /></svg>
              </div>
            </div>
            <div className="auth-form-side">
              <h2>Step 5: Confirmation</h2>
              <p className="subtitle">Optional: Upload a photo for your personalized reading frame.</p>
              <div className="form-group-modern">
                <label>Profile Photo</label>
                <input
                  type="file"
                  className="input-modern"
                  accept="image/jpeg,image/jpg,image/png"
                  onChange={handlePhotoChange}
                />
              </div>
              {formData.photo && (
                <div style={{ marginTop: '20px', transform: 'scale(0.8)', transformOrigin: 'top left' }}>
                  <PhotoFrame 
                    photo={formData.photo}
                    userName={`${formData.firstName} ${formData.lastName}`}
                    location={formData.location}
                  />
                </div>
              )}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-header">
        <div className="auth-header-content">
          <div className="auth-header-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#005a32" strokeWidth="2.5"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>
          </div>
          <h1>Registration</h1>
          <p>Gift of Reading Initiative</p>
        </div>
      </div>

      <div className="auth-container">
        <div className="auth-card">
          <div className="auth-steps">
            {[
              { num: 1, label: 'Create Your ID' },
              { num: 2, label: 'Personal Details' },
              { num: 3, label: 'Contact Information' },
              { num: 4, label: 'Review' },
              { num: 5, label: 'Confirmation' }
            ].map(s => (
              <div key={s.num} className={`auth-step ${step === s.num ? 'active' : step > s.num ? 'completed' : ''}`}>
                <div className="step-circle">{step > s.num ? '✓' : s.num}</div>
                <div className="step-label">{s.label}</div>
              </div>
            ))}
          </div>

          {error && <div className="error" style={{ marginBottom: '24px' }}>{error}</div>}

          {renderStep()}

          <div className="auth-footer">
            <button 
              className="auth-btn-back" 
              onClick={step === 1 ? () => navigate('/') : handleBack}
              disabled={loading}
            >
              {step === 1 ? '← Back to Home' : '← Previous'}
            </button>
            
            {step < 5 ? (
              <button 
                className="auth-btn-next" 
                onClick={handleNext}
                disabled={loading}
              >
                {loading ? 'Processing...' : 'Next →'}
              </button>
            ) : (
              <button 
                className="auth-btn-next" 
                onClick={handleSubmit}
                disabled={loading}
              >
                {loading ? 'Registering...' : 'Complete Registration ✓'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Registration;
