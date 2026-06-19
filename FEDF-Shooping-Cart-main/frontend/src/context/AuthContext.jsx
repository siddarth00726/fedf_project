import { createContext, useContext, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import api, { getMe, loginUser, registerUser } from '../services/api';

const AuthContext = createContext();
const TOKEN_KEY = 'ssc_token';
const USER_KEY = 'ssc_user';

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem(USER_KEY);
    return saved ? JSON.parse(saved) : null;
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) {
      setLoading(false);
      return;
    }
    api.defaults.headers.common.Authorization = `Bearer ${token}`;
    getMe()
      .then(({ data }) => {
        setUser(data);
        localStorage.setItem(USER_KEY, JSON.stringify(data));
      })
      .catch(() => logout())
      .finally(() => setLoading(false));
  }, []);

  const persistSession = (data) => {
    localStorage.setItem(TOKEN_KEY, data.token);
    localStorage.setItem(USER_KEY, JSON.stringify(data.user));
    api.defaults.headers.common.Authorization = `Bearer ${data.token}`;
    setUser(data.user);
  };

  const login = async (email, password) => {
    const { data } = await loginUser({ email, password });
    persistSession(data);
    toast.success(`Welcome back, ${data.user.name}!`);
    return data.user;
  };

  const register = async (name, email, password) => {
    const { data } = await registerUser({ name, email, password });
    persistSession(data);
    toast.success('Account created! You earned 50 loyalty points.');
    return data.user;
  };

  const logout = () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    delete api.defaults.headers.common.Authorization;
    setUser(null);
    toast.success('Logged out');
  };

  const refreshUser = async () => {
    const { data } = await getMe();
    setUser(data);
    localStorage.setItem(USER_KEY, JSON.stringify(data));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAuthenticated: !!user,
        isAdmin: user?.role === 'admin',
        login,
        register,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
