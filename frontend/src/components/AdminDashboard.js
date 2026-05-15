import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminAPI } from '../utils/api';
import { clearAdminSession } from '../utils/session';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [overview, setOverview] = useState(null);
  const [leaderboardTab, setLeaderboardTab] = useState('region');
  const [activeTab, setActiveTab] = useState('dashboard');

  // Filter Modal State
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [exportType, setExportType] = useState('csv'); // 'csv' or 'pdf'
  const [filters, setFilters] = useState({
    region: '',
    school: '',
    language: ''
  });

  const handleLogout = () => {
    clearAdminSession();
    navigate('/admin/login');
  };

  useEffect(() => {
    const load = async () => {
      try {
        const response = await adminAPI.getOverview();
        setOverview(response.data);
      } catch (err) {
        if (err.response?.status === 401) {
          handleLogout();
        } else {
          setError(err.response?.data?.error || 'Failed to load admin analytics.');
        }
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [navigate]);

  const boardData = useMemo(() => {
    if (!overview) return [];
    if (leaderboardTab === 'school') return overview.leaderboards.bySchool;
    if (leaderboardTab === 'readers') return overview.topReaders;
    return overview.leaderboards.byRegion;
  }, [overview, leaderboardTab]);

  const openFilterModal = (type) => {
    setExportType(type);
    setShowFilterModal(true);
  };

  const handleExport = async () => {
    try {
      const adminData = JSON.parse(localStorage.getItem('giftOfReadingAdmin'));
      const queryParams = new URLSearchParams(filters).toString();
      const baseUrl = exportType === 'csv' ? adminAPI.getCsvReportUrl() : adminAPI.getPdfReportUrl();
      const urlWithFilters = `${baseUrl}?${queryParams}`;

      const response = await fetch(urlWithFilters, {
        headers: { 'Authorization': `Bearer ${adminData.token}` }
      });

      if (!response.ok) throw new Error('Export failed');
      
      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = downloadUrl;
      a.download = `report-${new Date().toISOString().slice(0, 10)}.${exportType}`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      setShowFilterModal(false);
    } catch (err) {
      alert(`Failed to export ${exportType.toUpperCase()}: ` + err.message);
    }
  };

  const handleCsvExport = () => openFilterModal('csv');

  const handleCertificate = async (userId) => {
    try {
      const adminData = JSON.parse(localStorage.getItem('giftOfReadingAdmin'));
      const response = await fetch(adminAPI.getCertificateUrl(userId), {
        headers: { 'Authorization': `Bearer ${adminData.token}` }
      });
      if (!response.ok) throw new Error('Certificate download failed');
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `certificate-${userId}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
    } catch (err) {
      alert('Failed to download certificate: ' + err.message);
    }
  };

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
        <p>Loading admin dashboard...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container">
        <div className="error">{error}</div>
      </div>
    );
  }

  const { metrics, byLanguage, recentBooks } = overview;

  const renderDashboard = () => (
    <>
      <section className="admin-hero-banner">
        <div className="admin-hero-content">
          <h2>Gift of Reading Control Center</h2>
          <p>
            Track participation, compare performance across regions and
            schools, and generate certificates plus formal reports.
          </p>
          <button className="btn btn-outline-white" onClick={handleCsvExport}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{marginRight: '8px'}}><path d="M21.21 15.89A10 10 0 1 1 8 2.83"></path><path d="M22 12A10 10 0 0 0 12 2v10z"></path></svg>
            View Reports
          </button>
        </div>
        <div className="admin-hero-illustration">
          {/* <img src="/images/booksgift.png" alt="Hero Illustration" /> */}
        </div>
        <div className="campaign-progress-card">
          <h4>Campaign Progress</h4>
          <strong>{metrics.percentageComplete}%</strong>
          <p>Keep going! Every reader counts.</p>
        </div>
      </section>

      <section className="admin-metrics-grid">
        <div className="admin-metric-card">
          <div className="icon-label">
            <div className="icon-wrapper green">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path></svg>
            </div>
            <div className="label-text">
              <p>Total Books</p>
              <strong>{metrics.totalBooks.toLocaleString()}</strong>
            </div>
          </div>
          <span className="sub-text">toward {metrics.target.toLocaleString()}</span>
          <div className="progress-bar-modern" style={{height: '6px', background: '#f1f5f9', borderRadius: '3px', overflow: 'hidden'}}>
            <div className="fill" style={{width: `${metrics.percentageComplete}%`, height: '100%', background: '#10b981'}}></div>
          </div>
        </div>
        <div className="admin-metric-card">
          <div className="icon-label">
            <div className="icon-wrapper blue">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
            </div>
            <div className="label-text">
              <p>Registered Users</p>
              <strong>{metrics.totalUsers.toLocaleString()}</strong>
            </div>
          </div>
          <span className="sub-text">{metrics.activeReaders.toLocaleString()} active readers</span>
          <div className="mini-chart" style={{height: '30px', marginTop: '10px'}}>
            <svg width="100%" height="100%" viewBox="0 0 100 20" preserveAspectRatio="none">
              <path d="M0,10 Q25,0 50,10 T100,10" fill="none" stroke="#3b82f6" strokeWidth="2" />
            </svg>
          </div>
        </div>
        <div className="admin-metric-card">
          <div className="icon-label">
            <div className="icon-wrapper purple">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><line x1="2" y1="12" x2="22" y2="12"></line><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path></svg>
            </div>
            <div className="label-text">
              <p>Coverage</p>
              <strong>{metrics.totalRegions}</strong>
            </div>
          </div>
          <span className="sub-text">{metrics.totalRegions} regions</span>
          <div className="mini-chart" style={{height: '30px', marginTop: '10px'}}>
            <svg width="100%" height="100%" viewBox="0 0 100 20" preserveAspectRatio="none">
              <path d="M0,10 C20,20 40,0 60,10 S80,0 100,10" fill="none" stroke="#8b5cf6" strokeWidth="2" />
            </svg>
          </div>
        </div>
      </section>

      <div className="admin-content-split">
        <section className="admin-panel">
          <div className="admin-panel-header">
            <h3>
              <div className="icon-wrapper green" style={{width: '32px', height: '32px', borderRadius: '8px'}}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"></path><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"></path><path d="M4 22h16"></path><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"></path><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"></path><path d="M18 2H6v7a6 6 0 0 0 12 0V2z"></path></svg>
              </div>
              Top Readers by Group
            </h3>
            <div className="segmented">
              <button className={leaderboardTab === 'region' ? 'segmented-active' : ''} onClick={() => setLeaderboardTab('region')}>Region</button>
              <button className={leaderboardTab === 'school' ? 'segmented-active' : ''} onClick={() => setLeaderboardTab('school')}>School</button>
              <button className={leaderboardTab === 'readers' ? 'segmented-active' : ''} onClick={() => setLeaderboardTab('readers')}>Readers</button>
            </div>
          </div>

          <div className="table-scroll">
            <table className="table-modern">
              <thead>
                {leaderboardTab === 'readers' ? (
                  <tr>
                    <th>#</th>
                    <th>Name</th>
                    <th>School</th>
                    <th>Region</th>
                    <th>Books</th>
                  </tr>
                ) : (
                  <tr>
                    <th>#</th>
                    <th>{leaderboardTab === 'region' ? 'Region' : 'School'}</th>
                    <th>Readers</th>
                    <th>Books</th>
                  </tr>
                )}
              </thead>
              <tbody>
                {boardData.map((row, index) => (
                  leaderboardTab === 'readers' ? (
                    <tr key={row.id}>
                      <td>{index + 1}</td>
                      <td className="book-title">{row.firstName} {row.lastName}</td>
                      <td>{row.location}</td>
                      <td>{row.region}</td>
                      <td>{row.booksReadCount}</td>
                    </tr>
                  ) : (
                    <tr key={`${row.name}-${index}`}>
                      <td>{index + 1}</td>
                      <td className="book-title">{row.name}</td>
                      <td>{row.totalUsers}</td>
                      <td>{row.totalBooks}</td>
                    </tr>
                  )
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="admin-panel">
          <div className="admin-panel-header">
            <h3>
              <div className="icon-wrapper blue" style={{width: '32px', height: '32px', borderRadius: '8px'}}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21.21 15.89A10 10 0 1 1 8 2.83"></path><path d="M22 12A10 10 0 0 0 12 2v10z"></path></svg>
              </div>
              Exports & Language Analysis
            </h3>
          </div>

          <div className="quick-exports">
            <p style={{fontSize: '0.85rem', color: '#64748b', marginBottom: '16px', fontWeight: 600}}>Quick Exports</p>
            <div className="admin-export-item primary" onClick={handleCsvExport}>
              <span>Export CSV Report</span>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
            </div>
          </div>

          <div className="language-analysis">
            <h4>Language Analysis</h4>
            {byLanguage.map((item) => (
              <div key={item.language} className="lang-bar-row">
                <span className="lang-name">{item.language}</span>
                <div className="lang-progress">
                  <div className="lang-fill" style={{width: `${(item.totalBooks / metrics.totalBooks) * 100}%`}}></div>
                </div>
                <span className="lang-count">{item.totalBooks}</span>
              </div>
            ))}
          </div>
        </section>
      </div>

      <section className="latest-activity-panel">
        <div className="admin-panel-header">
          <h3>
            <div className="icon-wrapper green" style={{width: '32px', height: '32px', borderRadius: '8px', background: '#ecfdf5', color: '#059669'}}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline></svg>
            </div>
            <div>
              Latest Activity
              <p style={{fontSize: '0.75rem', color: '#64748b', fontWeight: 500}}>Recent book entries across the system</p>
            </div>
          </h3>
          <button className="btn btn-outline btn-compact" style={{border: '1.5px solid #f1f5f9'}}>View All Activity</button>
        </div>

        <div className="table-scroll">
          <table className="table-modern">
            <thead>
              <tr>
                <th>Reader</th>
                <th>Book</th>
                <th>Author</th>
                <th>Language</th>
                <th>School</th>
                <th>Region</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {recentBooks.map((book) => (
                <tr key={book.id}>
                  <td className="book-title">{book.User?.firstName} {book.User?.lastName}</td>
                  <td>{book.bookTitle}</td>
                  <td>{book.author}</td>
                  <td>{book.language}</td>
                  <td>{book.User?.location}</td>
                  <td>{book.User?.region}</td>
                  <td>{new Date(book.createdAt).toLocaleDateString('en-US', { month: 'numeric', day: 'numeric', year: 'numeric' })}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div style={{textAlign: 'center', marginTop: '24px', color: '#64748b', fontSize: '0.85rem', fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px'}}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
          Showing latest {recentBooks.length} of entries
        </div>
      </section>
    </>
  );

  const renderReaders = () => (
    <>
      <section className="admin-metrics-grid">
        <div className="admin-metric-card">
          <div className="icon-label">
            <div className="icon-wrapper blue">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
            </div>
            <div className="label-text">
              <p>Total Registered</p>
              <strong>{metrics.totalUsers.toLocaleString()}</strong>
            </div>
          </div>
          <span className="sub-text">Readers across all regions</span>
        </div>
        <div className="admin-metric-card">
          <div className="icon-label">
            <div className="icon-wrapper green">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><polyline points="16 11 18 13 22 9"></polyline></svg>
            </div>
            <div className="label-text">
              <p>Active Readers</p>
              <strong>{metrics.activeReaders.toLocaleString()}</strong>
            </div>
          </div>
          <span className="sub-text">Readers with 1+ books recorded</span>
        </div>
        <div className="admin-metric-card">
          <div className="icon-label">
            <div className="icon-wrapper purple">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"></path></svg>
            </div>
            <div className="label-text">
              <p>Top Reader</p>
              <h2>{overview.topReaders[0]?.firstName} {overview.topReaders[0]?.lastName}</h2>
            </div>
          </div>
          <span className="sub-text">{overview.topReaders[0]?.booksReadCount} books contributed</span>
        </div>
      </section>

      <section className="admin-panel">
        <div className="admin-panel-header">
          <h3>
            <div className="icon-wrapper blue" style={{width: '32px', height: '32px', borderRadius: '8px'}}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
            </div>
            Readers Directory
          </h3>
          <div className="admin-header-actions">
            <button className="btn btn-outline btn-compact">Filter by Region</button>
            <button className="btn btn-primary btn-compact" style={{background: '#005a32'}}>Add New Reader</button>
          </div>
        </div>
        <div className="table-scroll">
          <table className="table-modern">
            <thead>
              <tr>
                <th>#</th>
                <th>Reader Name</th>
                <th>School / Office</th>
                <th>Region</th>
                <th>Books Read</th>
                <th style={{textAlign: 'right'}}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {overview.topReaders.map((reader, index) => (
                <tr key={reader.id}>
                  <td>{index + 1}</td>
                  <td className="book-title">
                    <div style={{display: 'flex', alignItems: 'center', gap: '10px'}}>
                      <div style={{width: '32px', height: '32px', borderRadius: '50%', background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 700, color: '#64748b'}}>
                        {reader.firstName[0]}{reader.lastName[0]}
                      </div>
                      {reader.firstName} {reader.lastName}
                    </div>
                  </td>
                  <td>{reader.location}</td>
                  <td>{reader.region}</td>
                  <td>
                    <span className="badge-modern" style={{background: '#ecfdf5', color: '#059669'}}>
                      {reader.booksReadCount} Books
                    </span>
                  </td>
                  <td style={{textAlign: 'right'}}>
                    <button className="btn btn-outline btn-compact" onClick={() => handleCertificate(reader.id)}>
                      Certificate
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </>
  );

  const renderBooks = () => (
    <>
      <section className="admin-metrics-grid">
        <div className="admin-metric-card">
          <div className="icon-label">
            <div className="icon-wrapper green">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path></svg>
            </div>
            <div className="label-text">
              <p>Total Contributions</p>
              <strong>{metrics.totalBooks.toLocaleString()}</strong>
            </div>
          </div>
          <span className="sub-text">Total books recorded in system</span>
        </div>
        <div className="admin-metric-card">
          <div className="icon-label">
            <div className="icon-wrapper blue">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><path d="M2 12h20"></path><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path></svg>
            </div>
            <div className="label-text">
              <p>Avg per Reader</p>
              <strong>{(metrics.totalBooks / (metrics.activeReaders || 1)).toFixed(1)}</strong>
            </div>
          </div>
          <span className="sub-text">Books per active contributor</span>
        </div>
        <div className="admin-metric-card">
          <div className="icon-label">
            <div className="icon-wrapper purple">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"></path></svg>
            </div>
            <div className="label-text">
              <p>Top Language</p>
              <h2>{byLanguage[0]?.language || 'N/A'}</h2>
            </div>
          </div>
          <span className="sub-text">{byLanguage[0]?.totalBooks || 0} books recorded</span>
        </div>
      </section>

      <section className="admin-panel">
        <div className="admin-panel-header">
          <h3>
            <div className="icon-wrapper green" style={{width: '32px', height: '32px', borderRadius: '8px'}}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path></svg>
            </div>
            Recent Submissions
          </h3>
          <div className="admin-header-actions">
            <button className="btn btn-outline btn-compact">Language Filter</button>
          </div>
        </div>
        <div className="table-scroll">
          <table className="table-modern">
            <thead>
              <tr>
                <th>Book Title</th>
                <th>Author</th>
                <th>Language</th>
                <th>Reader</th>
                <th>School</th>
                <th>Recorded At</th>
              </tr>
            </thead>
            <tbody>
              {recentBooks.map((book) => (
                <tr key={book.id}>
                  <td className="book-title">{book.bookTitle}</td>
                  <td>{book.author}</td>
                  <td>
                    <span className="badge-modern" style={{background: '#f1f5f9', color: '#64748b'}}>
                      {book.language}
                    </span>
                  </td>
                  <td>{book.reader}</td>
                  <td>{book.school}</td>
                  <td>{new Date(book.recordedAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </>
  );

  const renderSchools = () => (
    <>
      <section className="admin-metrics-grid">
        <div className="admin-metric-card">
          <div className="icon-label">
            <div className="icon-wrapper purple">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>
            </div>
            <div className="label-text">
              <p>Participating Schools</p>
              <strong>{metrics.totalSchools}</strong>
            </div>
          </div>
          <span className="sub-text">Across {metrics.totalRegions} regions</span>
        </div>
        <div className="admin-metric-card">
          <div className="icon-label">
            <div className="icon-wrapper green">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
            </div>
            <div className="label-text">
              <p>Top Performing</p>
              <h2>{overview.leaderboards.bySchool[0]?.name || 'N/A'}</h2>
            </div>
          </div>
          <span className="sub-text">{overview.leaderboards.bySchool[0]?.totalBooks || 0} books recorded</span>
        </div>
        <div className="admin-metric-card">
          <div className="icon-label">
            <div className="icon-wrapper blue">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21.21 15.89A10 10 0 1 1 8 2.83"></path><path d="M22 12A10 10 0 0 0 12 2v10z"></path></svg>
            </div>
            <div className="label-text">
              <p>Avg Books/School</p>
              <strong>{(metrics.totalBooks / (metrics.totalSchools || 1)).toFixed(0)}</strong>
            </div>
          </div>
          <span className="sub-text">Contributions per institution</span>
        </div>
      </section>

      <section className="admin-panel">
        <div className="admin-panel-header">
          <h3>
            <div className="icon-wrapper purple" style={{width: '32px', height: '32px', borderRadius: '8px'}}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>
            </div>
            School Performance Leaderboard
          </h3>
        </div>
        <div className="table-scroll">
          <table className="table-modern">
            <thead>
              <tr>
                <th>Rank</th>
                <th>School Name</th>
                <th>Active Readers</th>
                <th>Total Contributions</th>
                <th>Performance Bar</th>
              </tr>
            </thead>
            <tbody>
              {overview.leaderboards.bySchool.map((school, index) => (
                <tr key={index}>
                  <td>
                    <div className={`rank-circle ${index < 3 ? 'top-rank' : ''}`}>
                      {index + 1}
                    </div>
                  </td>
                  <td className="book-title">{school.name}</td>
                  <td>{school.totalUsers} Readers</td>
                  <td>{school.totalBooks} Books</td>
                  <td style={{width: '200px'}}>
                    <div className="progress-bar-mini">
                      <div 
                        className="fill" 
                        style={{
                          width: `${(school.totalBooks / (overview.leaderboards.bySchool[0]?.totalBooks || 1)) * 100}%`,
                          background: index === 0 ? '#10b981' : index === 1 ? '#3b82f6' : '#8b5cf6'
                        }}
                      ></div>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </>
  );

  const renderReports = () => (
    <>
      <section className="admin-metrics-grid">
        <div className="admin-metric-card">
          <div className="icon-label">
            <div className="icon-wrapper green">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 20v-6M6 20V10M18 20V4"></path></svg>
            </div>
            <div className="label-text">
              <p>Current Progress</p>
              <strong>{metrics.percentageComplete}%</strong>
            </div>
          </div>
          <span className="sub-text">Toward 100,000 goal</span>
        </div>
        <div className="admin-metric-card">
          <div className="icon-label">
            <div className="icon-wrapper blue">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline></svg>
            </div>
            <div className="label-text">
              <p>Data Freshness</p>
              <h2>Real-time</h2>
            </div>
          </div>
          <span className="sub-text">Last update: Just now</span>
        </div>
        <div className="admin-metric-card">
          <div className="icon-label">
            <div className="icon-wrapper purple">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
            </div>
            <div className="label-text">
              <p>Reporting Period</p>
              <h2>Lifetime</h2>
            </div>
          </div>
          <span className="sub-text">All recorded history</span>
        </div>
      </section>

      <div className="admin-content-split">
        <section className="admin-panel">
          <div className="admin-panel-header">
            <h3>
              <div className="icon-wrapper green" style={{width: '32px', height: '32px', borderRadius: '8px'}}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
              </div>
              Language Distribution
            </h3>
          </div>
          <div className="language-analysis" style={{padding: '10px 0'}}>
            {byLanguage.map((item) => (
              <div key={item.language} className="lang-bar-row">
                <span className="lang-name">{item.language}</span>
                <div className="lang-progress">
                  <div className="lang-fill" style={{width: `${(item.totalBooks / metrics.totalBooks) * 100}%`}}></div>
                </div>
                <span className="lang-count">{item.totalBooks}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="admin-panel">
          <div className="admin-panel-header">
            <h3>
              <div className="icon-wrapper blue" style={{width: '32px', height: '32px', borderRadius: '8px'}}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline></svg>
              </div>
              Available Reports
            </h3>
          </div>
          <div className="report-list">
            <div className="admin-export-item" onClick={handleCsvExport}>
              <div style={{display: 'flex', alignItems: 'center', gap: '12px'}}>
                <div className="icon-wrapper-small csv">CSV</div>
                <span>Full Raw Data Export</span>
              </div>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M7 10l5 5 5-5M12 15V3"></path></svg>
            </div>
          </div>
        </section>
      </div>
    </>
  );

  const renderExport = () => (
    <div className="admin-centered-content">
      <section className="admin-panel" style={{maxWidth: '700px', width: '100%'}}>
        <div className="admin-panel-header" style={{flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: '16px', padding: '40px 0'}}>
          <div className="icon-wrapper blue" style={{width: '64px', height: '64px', borderRadius: '16px'}}>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
          </div>
          <div>
            <h3 style={{fontSize: '1.5rem', marginBottom: '8px'}}>Export Control Center</h3>
            <p style={{color: '#64748b', fontSize: '1rem'}}>Select your preferred format to download the complete database of the Gift of Reading campaign.</p>
          </div>
        </div>

        <div className="export-options-grid" style={{gridTemplateColumns: '1fr', maxWidth: '400px', margin: '24px auto'}}>
          <div className="export-option-card primary" onClick={handleCsvExport}>
            <div className="export-icon">CSV</div>
            <h4>Comma Separated Values</h4>
            <p>Best for Excel, Google Sheets, or data analysis tools.</p>
            <button className="btn btn-primary btn-full">Download CSV</button>
          </div>
        </div>

        <div className="export-disclaimer" style={{marginTop: '32px', padding: '20px', background: '#f8fafc', borderRadius: '12px', display: 'flex', gap: '12px', alignItems: 'flex-start'}}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2" style={{marginTop: '2px'}}><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>
          <p style={{fontSize: '0.85rem', color: '#64748b', lineHeight: 1.5}}>
            <strong>Note:</strong> Large data exports may take a few seconds to generate. Your download will start automatically once the server processes all records. All exports are secured and logged for audit purposes.
          </p>
        </div>
      </section>
    </div>
  );

  const renderSettings = () => (
    <div className="admin-centered-content">
      <section className="admin-panel" style={{maxWidth: '700px', width: '100%'}}>
        <div className="admin-panel-header">
          <h3>
            <div className="icon-wrapper gray" style={{width: '32px', height: '32px', borderRadius: '8px', background: '#f1f5f9', color: '#475569'}}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>
            </div>
            Campaign Settings
          </h3>
        </div>

        <div className="settings-grid">
          <div className="settings-section">
            <h4>General Configuration</h4>
            <div className="form-group-modern">
              <label>Campaign Goal (Books)</label>
              <input type="number" className="input-modern" defaultValue="100000" />
            </div>
            <div className="form-group-modern">
              <label>Active Status</label>
              <div style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
                <div className="toggle-active"></div>
                <span style={{fontSize: '0.85rem', color: '#059669', fontWeight: 600}}>Campaign is LIVE</span>
              </div>
            </div>
          </div>

          <div className="settings-section">
            <h4>Appearance</h4>
            <div className="form-group-modern">
              <label>System Theme</label>
              <select className="select-modern">
                <option>Modern Light</option>
                <option>Dark Mode (Beta)</option>
                <option>System Default</option>
              </select>
            </div>
          </div>

          <div className="settings-section">
            <h4>Notifications</h4>
            <div className="checkbox-group">
              <label className="checkbox-modern">
                <input type="checkbox" defaultChecked />
                <span>Weekly summary emails</span>
              </label>
              <label className="checkbox-modern">
                <input type="checkbox" defaultChecked />
                <span>New reader alerts</span>
              </label>
            </div>
          </div>
        </div>

        <div style={{marginTop: '40px', paddingTop: '24px', borderTop: '1px solid #f1f5f9', display: 'flex', justifyContent: 'flex-end', gap: '12px'}}>
          <button className="btn btn-outline">Cancel</button>
          <button className="btn btn-primary" style={{background: '#005a32'}}>Save Changes</button>
        </div>
      </section>
    </div>
  );

  const renderActiveTab = () => {
    switch (activeTab) {
      case 'readers': return renderReaders();
      case 'books': return renderBooks();
      case 'schools': return renderSchools();
      case 'reports': return renderReports();
      case 'export': return renderExport();
      case 'settings': return renderSettings();
      default: return renderDashboard();
    }
  };

  return (
    <div className="admin-layout">
      {/* Sidebar */}
      <aside className="admin-sidebar">
        <div className="sidebar-brand">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="#005a32">
            <path d="M21 4H7a2 2 0 00-2 2v12a2 2 0 002 2h14V4zM7 18a2 2 0 01-2-2V6a2 2 0 012-2h12v14H7z" />
          </svg>
          <div>
            <h2>Admin</h2>
            <p>Reading Control Center</p>
          </div>
        </div>

        <nav className="sidebar-nav">
          <div className={`sidebar-link ${activeTab === 'dashboard' ? 'active' : ''}`} onClick={() => setActiveTab('dashboard')}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>
            <span>Dashboard</span>
          </div>
          <div className={`sidebar-link ${activeTab === 'readers' ? 'active' : ''}`} onClick={() => setActiveTab('readers')}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
            <span>Readers</span>
          </div>
          <div className={`sidebar-link ${activeTab === 'books' ? 'active' : ''}`} onClick={() => setActiveTab('books')}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path></svg>
            <span>Books</span>
          </div>
          <div className={`sidebar-link ${activeTab === 'schools' ? 'active' : ''}`} onClick={() => setActiveTab('schools')}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>
            <span>Schools</span>
          </div>
          <div className={`sidebar-link ${activeTab === 'reports' ? 'active' : ''}`} onClick={() => setActiveTab('reports')}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
            <span>Reports</span>
          </div>
          <div className={`sidebar-link ${activeTab === 'export' ? 'active' : ''}`} onClick={() => setActiveTab('export')}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
            <span>Export</span>
          </div>
          <div className={`sidebar-link ${activeTab === 'settings' ? 'active' : ''}`} onClick={() => setActiveTab('settings')}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>
            <span>Settings</span>
          </div>
        </nav>

        <div className="sidebar-promo">
          <h4>Encouraging Reading, Enriching Minds.</h4>
          <img src="/images/books.png" alt="Promo" />
        </div>
      </aside>

      {/* Main Content */}
      <main className="admin-main">
        <header className="admin-header">
          <div className="admin-welcome">
            <h1>Welcome back, Admin 👋</h1>
            <p>Here's what happening in your reading control center today.</p>
          </div>
          <div className="admin-header-actions">
            <button className="btn btn-outline btn-compact" onClick={() => navigate('/')}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{marginRight: '8px'}}><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>
              Home
            </button>
            <button className="btn btn-primary btn-compact" style={{background: '#005a32'}} onClick={() => navigate('/dashboard')}>
              Reader Dashboard
            </button>
            <button className="btn btn-outline btn-compact" style={{borderRadius: '50%', width: '40px', height: '40px', padding: 0, border: 'none', background: '#f1f5f9'}}>
              A
            </button>
            <button className="btn btn-primary btn-compact" style={{background: '#005a32'}} onClick={handleLogout}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{marginRight: '8px'}}><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1-2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
              Logout
            </button>
          </div>
        </header>

        {renderActiveTab()}

        {showFilterModal && (
          <div className="modal-overlay" onClick={() => setShowFilterModal(false)}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
              <button className="close-modal" onClick={() => setShowFilterModal(false)}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
              </button>
              <div className="modal-header">
                <h3>Export Data</h3>
                <p>Configure CSV export parameters</p>
              </div>
              <div className="filter-grid">
                <div className="filter-group">
                  <label>Region</label>
                  <select 
                    className="select-modern" 
                    value={filters.region} 
                    onChange={e => setFilters({...filters, region: e.target.value})}
                  >
                    <option value="">All Regions</option>
                    {overview.leaderboards.byRegion.map(r => (
                      <option key={r.name} value={r.name}>{r.name}</option>
                    ))}
                  </select>
                </div>
                <div className="filter-group">
                  <label>School / Office</label>
                  <select 
                    className="select-modern" 
                    value={filters.school} 
                    onChange={e => setFilters({...filters, school: e.target.value})}
                  >
                    <option value="">All Schools</option>
                    {overview.leaderboards.bySchool.map(s => (
                      <option key={s.name} value={s.name}>{s.name}</option>
                    ))}
                  </select>
                </div>
                <div className="filter-group">
                  <label>Language</label>
                  <select 
                    className="select-modern" 
                    value={filters.language} 
                    onChange={e => setFilters({...filters, language: e.target.value})}
                  >
                    <option value="">All Languages</option>
                    {byLanguage.map(l => (
                      <option key={l.language} value={l.language}>{l.language}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="modal-footer">
                <button className="btn btn-outline" onClick={() => setShowFilterModal(false)}>Cancel</button>
                <button className="btn btn-primary" style={{background: '#005a32'}} onClick={handleExport}>
                  Generate CSV
                </button>
              </div>
            </div>
          </div>
        )}

        <footer style={{marginTop: '60px', padding: '24px 0', borderTop: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', color: '#94a3b8', fontSize: '0.8rem', fontWeight: 600}}>
          <p>© 2026 AKESP. All rights reserved.</p>
          <p style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
            Empowering readers everywhere.
            <span style={{color: '#10b981'}}>❤️</span>
          </p>
        </footer>
      </main>
    </div>
  );
};

export default AdminDashboard;
