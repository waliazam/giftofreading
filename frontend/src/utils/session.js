const SESSION_KEY = 'giftOfReadingUser';
const ADMIN_SESSION_KEY = 'giftOfReadingAdmin';

export const normalizeUser = (user) => {
  if (!user) {
    return null;
  }

  const id = user.id || user._id;

  if (!id) {
    return null;
  }

  return {
    ...user,
    id
  };
};

export const getStoredUser = () => {
  try {
    const storedUser = localStorage.getItem(SESSION_KEY);
    return normalizeUser(storedUser ? JSON.parse(storedUser) : null);
  } catch (error) {
    localStorage.removeItem(SESSION_KEY);
    return null;
  }
};

export const saveUserSession = (user) => {
  const normalizedUser = normalizeUser(user);

  if (!normalizedUser) {
    localStorage.removeItem(SESSION_KEY);
    return null;
  }

  localStorage.setItem(SESSION_KEY, JSON.stringify(normalizedUser));
  return normalizedUser;
};

export const clearUserSession = () => {
  localStorage.removeItem(SESSION_KEY);
};

export const getStoredAdmin = () => {
  try {
    const storedAdmin = localStorage.getItem(ADMIN_SESSION_KEY);
    return storedAdmin ? JSON.parse(storedAdmin) : null;
  } catch (error) {
    localStorage.removeItem(ADMIN_SESSION_KEY);
    return null;
  }
};

export const saveAdminSession = (adminData) => {
  if (!adminData || !adminData.token) {
    localStorage.removeItem(ADMIN_SESSION_KEY);
    return null;
  }

  localStorage.setItem(ADMIN_SESSION_KEY, JSON.stringify(adminData));
  return adminData;
};

export const clearAdminSession = () => {
  localStorage.removeItem(ADMIN_SESSION_KEY);
};
