import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor to include the admin token
api.interceptors.request.use((config) => {
  const adminData = localStorage.getItem('giftOfReadingAdmin');
  if (adminData) {
    try {
      const { token } = JSON.parse(adminData);
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (e) {
      console.error('Error parsing admin session', e);
    }
  }
  return config;
});

export const authAPI = {
  checkCNIC: (cnicBform) => api.post('/auth/check-cnic', { cnicBform }),
  register: (formData) => api.post('/auth/register', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  }),
  login: (cnicBform) => api.post('/auth/login', { cnicBform }),
  getUser: (userId) => api.get(`/auth/user/${userId}`),
};

export const booksAPI = {
  addBook: (userId, book) => api.post('/books/add', { userId, ...book }),
  getUserBooks: (userId) => api.get(`/books/user/${userId}`),
  getGlobalStats: () => api.get('/books/stats/global'),
  getLeaderboard: () => api.get('/books/leaderboard'),
};

export const adminAPI = {
  login: (username, password) => api.post('/admin-auth/login', { username, password }),
  getOverview: () => api.get('/admin/overview'),
  getLeaderboards: (limit = 10) => api.get(`/admin/leaderboards?limit=${limit}`),
  getCsvReportUrl: () => `${API_BASE_URL}/admin/reports.csv`,
  getPdfReportUrl: () => `${API_BASE_URL}/admin/reports.pdf`,
  getCertificateUrl: (userId) => `${API_BASE_URL}/admin/certificates/${userId}.pdf`,
};

export default api;
