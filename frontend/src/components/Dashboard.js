import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authAPI, booksAPI } from '../utils/api';
import { clearUserSession, getStoredUser, saveUserSession } from '../utils/session';

const Dashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [bookForm, setBookForm] = useState({
    bookTitle: '',
    author: '',
    language: ''
  });
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    const storedUser = getStoredUser();

    if (!storedUser) {
      navigate('/login', { replace: true });
      return;
    }

    const loadDashboard = async () => {
      try {
        const [userResponse] = await Promise.all([
          authAPI.getUser(storedUser.id),
          fetchUserBooks(storedUser.id)
        ]);

        const currentUser = saveUserSession(userResponse.data.user);
        setUser(currentUser);
      } catch (err) {
        clearUserSession();
        navigate('/login', { replace: true });
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, [navigate]);

  const fetchUserBooks = async (userId) => {
    const response = await booksAPI.getUserBooks(userId);
    setBooks(response.data.books);
  };

  const handleBookFormChange = (e) => {
    const { name, value } = e.target;
    setBookForm(prev => ({
      ...prev,
      [name]: value
    }));
    setError('');
  };

  const handleSubmitBook = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    const bookTitle = bookForm.bookTitle.trim();
    const author = bookForm.author.trim();
    const language = bookForm.language.trim();

    if (!bookTitle || !author || !language) {
      setError('Please enter the book title, author, and language');
      return;
    }

    setSubmitting(true);

    try {
      await booksAPI.addBook(user.id, {
        bookTitle,
        author,
        language
      });

      setBookForm({
        bookTitle: '',
        author: '',
        language: ''
      });
      setSuccess('Book added successfully.');

      await fetchUserBooks(user.id);

      const updatedUser = {
        ...user,
        booksReadCount: (user.booksReadCount || 0) + 1
      };
      setUser(updatedUser);
      saveUserSession(updatedUser);

      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to add book. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleLogout = () => {
    clearUserSession();
    navigate('/');
  };

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
        <p>Loading your dashboard...</p>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="dashboard-page">
      <nav className="dashboard-nav">
        <div className="brand-lockup">
          <div className="logo-icon">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor">
              <path d="M21 4H7a2 2 0 00-2 2v12a2 2 0 002 2h14V4zM7 18a2 2 0 01-2-2V6a2 2 0 012-2h12v14H7z" />
              <path d="M7 6v10c1.1 0 2 .9 2 2h10V6H7z" opacity="0.3" />
            </svg>
          </div>
          <div>
            <h1>Reading Dashboard</h1>
            <p>{user.location}</p>
          </div>
        </div>
        <div className="nav-actions">
          <button className="btn btn-outline btn-compact" onClick={() => navigate('/')}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{marginRight: '8px'}}><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>
            Home
          </button>
         
          <button className="btn btn-primary btn-compact" style={{background: '#005a32'}} onClick={handleLogout}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{marginRight: '8px'}}><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1-2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
            Logout
          </button>
        </div>
      </nav>

      <main>
        <section className="dashboard-hero-modern">
          <div className="hero-text-content">
            <h2>{user.firstName} {user.lastName}</h2>
            <p>
              Keep your reading record complete by adding every finished book
              with its title, author, and language.
            </p>
          </div>
          <div className="hero-illustration">
            <img src="/images/books.png" alt="Reading Illustration" />
          </div>
          <div className="badge-role">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
            {user.category}
          </div>
        </section>

        <section className="metrics-row">
          <div className="metric-card-modern">
            <div className="icon-box green">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path></svg>
            </div>
            <div className="metric-info">
              <p>Total Books Read</p>
              <strong>{user.booksReadCount || 0}</strong>
              <span>Personal contribution</span>
            </div>
          </div>
          <div className="metric-card-modern">
            <div className="icon-box blue">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path><rect x="8" y="2" width="8" height="4" rx="1" ry="1"></rect><path d="M9 14l2 2 4-4"></path></svg>
            </div>
            <div className="metric-info">
              <p>Recorded Entries</p>
              <strong>{books.length}</strong>
              <span>Books in your history</span>
            </div>
          </div>
          <div className="metric-card-modern">
            <div className="icon-box purple">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
            </div>
            <div className="metric-info">
              <p>Region</p>
              <strong>{user.region}</strong>
              <span>{user.location}</span>
            </div>
          </div>
        </section>

        <section className="workspace-modern">
          <aside className="panel-card-modern">
            <div className="badge-small" style={{marginBottom: '20px'}}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{marginRight: '6px'}}><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
              New Entry
            </div>
            <h3>Record a Book</h3>

            <form onSubmit={handleSubmitBook}>
              {error && <div className="error">{error}</div>}
              {success && <div className="success">{success}</div>}

              <div className="form-group-modern">
                <label>Book Title</label>
                <div className="input-with-icon">
                  <div className="icon">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path></svg>
                  </div>
                  <input
                    type="text"
                    name="bookTitle"
                    value={bookForm.bookTitle}
                    onChange={handleBookFormChange}
                    placeholder="Enter the book title"
                    disabled={submitting}
                  />
                </div>
              </div>

              <div className="form-group-modern">
                <label>Author</label>
                <div className="input-with-icon">
                  <div className="icon">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                  </div>
                  <input
                    type="text"
                    name="author"
                    value={bookForm.author}
                    onChange={handleBookFormChange}
                    placeholder="Enter the author's name"
                    disabled={submitting}
                  />
                </div>
              </div>

              <div className="form-group-modern">
                <label>Language</label>
                <div className="input-with-icon">
                  <div className="icon">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="2" y1="12" x2="22" y2="12"></line><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path></svg>
                  </div>
                  <select
                    name="language"
                    value={bookForm.language}
                    onChange={handleBookFormChange}
                    disabled={submitting}
                  >
                    <option value="">Select language</option>
                    <option value="English">English</option>
                    <option value="Urdu">Urdu</option>
                    <option value="Sindhi">Sindhi</option>
                    <option value="Gujarati">Gujarati</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <button type="submit" className="btn-add-book" disabled={submitting}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="16"></line><line x1="8" y1="12" x2="16" y2="12"></line></svg>
                {submitting ? 'Adding...' : 'Add Book'}
              </button>
            </form>
          </aside>

          <section className="panel-card-modern">
            <div className="history-header-modern">
              <div style={{display: 'flex', alignItems: 'center', gap: '20px'}}>
                <div className="badge-history">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                  History
                </div>
                <h3 style={{margin: 0}}>Your Reading Log</h3>
              </div>
              <div className="count-badge">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path></svg>
                {books.length} books
              </div>
            </div>

            <div className="table-scroll">
              {books.length === 0 ? (
                <div className="empty-state">
                  <p>No books recorded yet. Add your first completed book.</p>
                </div>
              ) : (
                <table className="table-modern">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Book Title</th>
                      <th>Author</th>
                      <th>Language</th>
                      <th>Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {books.map((book, index) => (
                      <tr key={book.id}>
                        <td>{books.length - index}</td>
                        <td className="book-title">{book.bookTitle}</td>
                        <td>{book.author}</td>
                        <td>{book.language}</td>
                        <td>{new Date(book.recordedAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
            
            <a href="#" className="view-all-link">
              View all entries
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
            </a>
          </section>
        </section>
      </main>
    </div>
  );
};

export default Dashboard;
