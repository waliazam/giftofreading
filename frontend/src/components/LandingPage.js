import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { booksAPI } from '../utils/api';
import { clearUserSession, getStoredUser } from '../utils/session';

const LandingPage = () => {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState(null);
  const [stats, setStats] = useState({
    totalBooks: 0,
    totalUsers: 0,
    target: 100000,
    percentageComplete: 0,
    booksByRegion: []
  });
  const [topReaders, setTopReaders] = useState([]);

  useEffect(() => {
    setCurrentUser(getStoredUser());
    fetchGlobalStats();
    fetchTopReaders();

    const interval = setInterval(() => {
      fetchGlobalStats();
      fetchTopReaders();
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchGlobalStats = async () => {
    try {
      const response = await booksAPI.getGlobalStats();
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const fetchTopReaders = async () => {
    try {
      const response = await booksAPI.getLeaderboard();
      setTopReaders(response.data.topReaders || []);
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
    }
  };

  const handleStartJourney = () => {
    navigate(currentUser ? '/dashboard' : '/register');
  };

  const handleLoginOrDashboard = () => {
    navigate(currentUser ? '/dashboard' : '/login');
  };

  const handleLogout = () => {
    clearUserSession();
    setCurrentUser(null);
  };

  const progressWidth = `${Math.min(stats.percentageComplete, 100)}%`;

  return (
    <div className="landing-page">
      <nav className="site-nav">
        <div className="brand-lockup">
          <div className="logo-icon">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor">
              <path d="M21 4H7a2 2 0 00-2 2v12a2 2 0 002 2h14V4zM7 18a2 2 0 01-2-2V6a2 2 0 012-2h12v14H7z" />
              <path d="M7 6v10c1.1 0 2 .9 2 2h10V6H7z" opacity="0.3" />
            </svg>
          </div>
          <div>
            <h1>AKHSS Kharadar</h1>
            <p>100 Years Celebration - Gift of Reading Initiative</p>
          </div>
        </div>

        <div className="nav-links">
          <a href="#about">About</a>
          <a href="#how-it-works">How It Works</a>
          <a href="#tracker">Tracker</a>
        </div>

        <div className="nav-actions">
          {currentUser ? (
            <>
              <span className="nav-user">Hi, {currentUser.firstName}</span>
              <button className="btn btn-outline btn-compact" onClick={() => navigate('/dashboard')}>
                Dashboard
              </button>
              <button className="btn btn-compact" onClick={handleLogout}>
                Logout
              </button>
            </>
          ) : (
            <>
              <button className="btn btn-outline btn-compact btn-login" onClick={() => navigate('/login')}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{marginRight: '8px'}}><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                Login
              </button>
              <button className="btn btn-compact btn-register" onClick={() => navigate('/register')}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{marginRight: '8px'}}><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="8.5" cy="7" r="4"></circle><line x1="20" y1="8" x2="20" y2="14"></line><line x1="17" y1="11" x2="23" y2="11"></line></svg>
                Start Your Journey
              </button>
            </>
          )}
        </div>
      </nav>

      <main>
        <section className="hero-section" id="about">
          <div className="hero-overlay"></div>
          <div className="hero-content">
            <div className="hero-copy">
              <div className="badge">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"></path></svg>
                Celebrating 100 Years of Educational Excellence
              </div>
              <h2>
                Join Our<br />
                <span className="text-green">Reading Journey</span>
              </h2>
              
              <div className="divider-with-icon">
                <div className="line"></div>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M21 4H7a2 2 0 00-2 2v12a2 2 0 002 2h14V4zM7 18a2 2 0 01-2-2V6a2 2 0 012-2h12v14H7z" />
                </svg>
                <div className="line"></div>
              </div>

              <p>
                Help the AKESP community achieve our collective goal of
                <span className="text-highlight"> 100,000 books read</span>. Every completed book becomes
                part of a shared legacy of learning.
              </p>
              
              <div className="hero-actions">
                <button className="btn btn-primary" onClick={handleStartJourney}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{marginRight: '10px'}}><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path></svg>
                  {currentUser ? 'Continue Reading →' : 'Start Your Journey →'}
                </button>
                <button className="btn btn-outline-white" onClick={handleLoginOrDashboard}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{marginRight: '10px'}}><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="8.5" cy="7" r="4"></circle><line x1="20" y1="8" x2="20" y2="14"></line><line x1="17" y1="11" x2="23" y2="11"></line></svg>
                  {currentUser ? 'View Dashboard' : 'Already Registered?'}
                </button>
              </div>
            </div>

            <div className="hero-tracker-container" id="tracker">
              <div className="tracker-card-modern">
                <div className="tracker-header">
                  <h3>Live Pledge Tracker</h3>
                  <div className="live-indicator">
                    <span className="dot"></span>
                    Live
                  </div>
                </div>

                <div className="circular-progress-container">
                  <div className="circular-progress">
                    <div className="inner-circle">
                      <span className="count">{stats.totalBooks.toLocaleString()}</span>
                      <span className="label">of {stats.target.toLocaleString()} books</span>
                    </div>
                    <svg viewBox="0 0 100 100">
                      <circle cx="50" cy="50" r="45" className="bg"></circle>
                      <circle cx="50" cy="50" r="45" className="progress" style={{ strokeDashoffset: 282.7 - (282.7 * Math.min(stats.percentageComplete, 100)) / 100 }}></circle>
                    </svg>
                  </div>
                </div>

                <div className="progress-info">
                  <div className="label-row">
                    <span>Progress</span>
                    <strong>{stats.percentageComplete}%</strong>
                  </div>
                  <div className="progress-bar-modern">
                    <div className="fill" style={{ width: progressWidth }}></div>
                  </div>
                </div>

                <div className="stats-row">
                  <div className="stat-item">
                    <div className="stat-icon green">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
                    </div>
                    <div>
                      <strong>{stats.totalUsers.toLocaleString()}</strong>
                      <span>Readers</span>
                    </div>
                  </div>
                  <div className="stat-item">
                    <div className="stat-icon light-green">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path></svg>
                    </div>
                    <div>
                      <strong>{Math.max(stats.target - stats.totalBooks, 0).toLocaleString()}</strong>
                      <span>Books to go</span>
                    </div>
                  </div>
                </div>

                <div className="tracker-footer">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"></path><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"></path><path d="M4 22h16"></path><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"></path><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"></path><path d="M18 2H6v7a6 6 0 0 0 12 0V2z"></path></svg>
                  Every page counts. Every reader matters.
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="how-it-works-section" id="how-it-works">
          <div className="section-header">
            <div className="badge-small">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>
              How It Works
            </div>
            <h2>Simple, trackable,<br />community-wide reading.</h2>
            <div className="divider-small">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M21 4H7a2 2 0 00-2 2v12a2 2 0 002 2h14V4zM7 18a2 2 0 01-2-2V6a2 2 0 012-2h12v14H7z" />
              </svg>
            </div>
          </div>

          <div className="steps-container">
            <div className="step-card">
              <div className="step-num">1</div>
              <div className="step-icon-bg">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="8.5" cy="7" r="4"></circle><polyline points="17 11 19 13 23 9"></polyline></svg>
              </div>
              <h4>Register</h4>
              <p>Create your profile using your B-Form or CNIC number.</p>
            </div>
            <div className="step-arrow">
              <svg width="40" height="20" viewBox="0 0 40 20" fill="none"><path d="M1 10C10 1 30 1 39 10" stroke="#063" strokeWidth="2" strokeDasharray="4 4" /></svg>
            </div>
            <div className="step-card">
              <div className="step-num">2</div>
              <div className="step-icon-bg">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path></svg>
              </div>
              <h4>Read</h4>
              <p>Complete books in any language that supports your growth.</p>
            </div>
            <div className="step-arrow">
              <svg width="40" height="20" viewBox="0 0 40 20" fill="none"><path d="M1 10C10 1 30 1 39 10" stroke="#063" strokeWidth="2" strokeDasharray="4 4" /></svg>
            </div>
            <div className="step-card">
              <div className="step-num">3</div>
              <div className="step-icon-bg">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
              </div>
              <h4>Record</h4>
              <p>Add the title, author, and language after each book.</p>
            </div>
            <div className="step-arrow">
              <svg width="40" height="20" viewBox="0 0 40 20" fill="none"><path d="M1 10C10 1 30 1 39 10" stroke="#063" strokeWidth="2" strokeDasharray="4 4" /></svg>
            </div>
            <div className="step-card">
              <div className="step-num">4</div>
              <div className="step-icon-bg">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"></path><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"></path><path d="M4 22h16"></path><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"></path><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"></path><path d="M18 2H6v7a6 6 0 0 0 12 0V2z"></path></svg>
              </div>
              <h4>Celebrate</h4>
              <p>Watch the live tracker move toward our goal of 100,000 books!</p>
            </div>
          </div>
        </section>

        {/* Region Table Section */}
        <section className="region-table-section">
          <div className="region-section-header">
            <div className="region-badge">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="white" stroke="white" strokeWidth="1"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3" fill="white"></circle></svg>
              Regional Overview
            </div>
            <h2 className="region-title">Reading Across All Regions</h2>
            <p className="region-subtitle">Explore reading activity and engagement across all regions.</p>
          </div>

          <div className="region-table-container">
            <div className="table-header">
              <div className="col-region">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><circle cx="12" cy="12" r="6"></circle><circle cx="12" cy="12" r="2"></circle></svg>
                REGION
              </div>
              <div className="col-pledges">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path></svg>
                TOTAL BOOKS
              </div>
              <div className="col-users">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
                ACTIVE READERS
              </div>
            </div>
            <div className="table-body">
              {stats.booksByRegion && stats.booksByRegion.length > 0 ? (
                stats.booksByRegion.map((region, idx) => {
                  const getRegionIcon = (regionName) => {
                    if (regionName.toLowerCase().includes('hunza')) {
                      return <svg width="24" height="24" viewBox="0 0 24 24" fill="#059669"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"></path></svg>;
                    }
                    return <svg width="24" height="24" viewBox="0 0 24 24" fill="#059669"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3" fill="white"></circle></svg>;
                  };
                  
                  const getRegionLabel = (regionName) => {
                    if (regionName.toLowerCase().includes('hunza')) return 'Northern Region';
                    if (regionName.toLowerCase().includes('south')) return 'Southern Region';
                    return 'Region';
                  };
                  
                  return (
                    <div key={idx} className="table-row">
                      <div className="col-region">
                        <div className="region-icon-wrapper">
                          {getRegionIcon(region._id)}
                        </div>
                        <div className="region-info">
                          <div className="region-name">{region._id}</div>
                          <div className="region-label">{getRegionLabel(region._id)}</div>
                        </div>
                      </div>
                      <div className="col-pledges">
                        <div className="stat-value">{(region.totalBooks || 0).toLocaleString()}</div>
                        <div className="stat-label">Total Books</div>
                      </div>
                      <div className="col-users">
                        <div className="stat-icon-group">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="#059669"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
                        </div>
                        <div className="user-stat">
                          <div className="stat-value">{(region.totalUsers || 0).toLocaleString()}</div>
                          <div className="stat-label">Active Readers</div>
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="table-row">
                  <div style={{textAlign: 'center', width: '100%'}}>No regional data available</div>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Reading Stats Section */}
        <section className="reading-stats-section">
          <div className="section-header">
            <div className="badge-small">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M21 4H7a2 2 0 00-2 2v12a2 2 0 002 2h14V4zM7 18a2 2 0 01-2-2V6a2 2 0 012-2h12v14H7z" />
              </svg>
              Reading
            </div>
          </div>

          <div className="reading-cards-container">
            {/* Top Regions Card */}
            <div className="reading-card">
              <div className="card-header">
                <div className="card-title-group">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="#2563EB">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"/>
                  </svg>
                  <h3>Top Regions</h3>
                </div>
                <span className="books-label">Books</span>
              </div>
              <div className="card-content">
                {stats.booksByRegion && stats.booksByRegion.length > 0 ? (
                  stats.booksByRegion
                    .sort((a, b) => (b.totalBooks || 0) - (a.totalBooks || 0))
                    .slice(0, 3)
                    .map((region, idx) => (
                      <div key={idx} className="top-item">
                        <div className="rank-badge">{idx + 1}</div>
                        <div className="item-details">
                          <div className="item-name">{region._id}</div>
                          <div className="item-region">Region</div>
                        </div>
                        <div className="item-stat">{(region.totalBooks || 0).toLocaleString()}</div>
                      </div>
                    ))
                ) : (
                  <div className="no-data">No data available</div>
                )}
              </div>
              <div className="card-footer">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3v12m8-8v8a2 2 0 01-2 2H6a2 2 0 01-2-2v-8"></path></svg>
                <span>Total books recorded across all regions</span>
              </div>
            </div>

            {/* Top Readers Card */}
            <div className="reading-card">
              <div className="card-header">
                <div className="card-title-group">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="#9333EA">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle>
                  </svg>
                  <h3>Top Readers</h3>
                </div>
                <span className="books-label">Books</span>
              </div>
              <div className="card-content">
                {topReaders && topReaders.length > 0 ? (
                  topReaders.slice(0, 3).map((reader, idx) => (
                    <div key={idx} className="top-item">
                      <div className="rank-badge">{idx + 1}</div>
                      <div className="item-details">
                        <div className="item-name">{reader.firstName} {reader.lastName}</div>
                        <div className="item-region">{reader.location} • {reader.region}</div>
                      </div>
                      <div className="item-stat">{(reader.booksReadCount || 0)}</div>
                    </div>
                  ))
                ) : (
                  <div className="no-data">No readers yet</div>
                )}
              </div>
              <div className="card-footer">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
                <span>Recognizing top individual contributions</span>
              </div>
            </div>

            {/* Regional Stats Card */}
            <div className="reading-card">
              <div className="card-header">
                <div className="card-title-group">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="#059669">
                    <path d="M12 2L2 7v10c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-10-5z"/>
                  </svg>
                  <h3>Regional Leaders</h3>
                </div>
                <span className="books-label">Performance</span>
              </div>
              <div className="card-content">
                {stats.booksByRegion && stats.booksByRegion.length > 0 ? (
                  stats.booksByRegion
                    .sort((a, b) => {
                      const aPercentage = ((a.totalBooks || 0) / stats.target) * 100;
                      const bPercentage = ((b.totalBooks || 0) / stats.target) * 100;
                      return bPercentage - aPercentage;
                    })
                    .slice(0, 3)
                    .map((region, idx) => {
                      const percentage = Math.round(((region.totalBooks || 0) / stats.target) * 100);
                      return (
                        <div key={idx} className="top-item">
                          <div className="rank-badge">{idx + 1}</div>
                          <div className="item-details">
                            <div className="item-name">{region._id}</div>
                            <div className="progress-mini">
                              <div className="progress-mini-bar" style={{width: `${Math.min(percentage, 100)}%`}}></div>
                            </div>
                          </div>
                          <div className="item-stat">{percentage}%</div>
                        </div>
                      );
                    })
                ) : (
                  <div className="no-data">No data available</div>
                )}
              </div>
              <div className="card-footer">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"></path><polyline points="13 2 13 9 20 9"></polyline></svg>
                <span>Progress toward 100,000 books goal</span>
              </div>
            </div>
          </div>

          <div className="footer-bar">
            <div className="footer-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                <path d="M21 4H7a2 2 0 00-2 2v12a2 2 0 002 2h14V4zM7 18a2 2 0 01-2-2V6a2 2 0 012-2h12v14H7z" />
              </svg>
            </div>
            <p>Together, we're building a legacy of knowledge for generations to come.</p>
            <div className="sparkle-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"></path></svg>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default LandingPage;
