import { Link, NavLink } from 'react-router-dom';
import { useEffect, useState, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useCompare } from '../context/CompareContext';
import { useTheme } from '../context/ThemeContext';
import { getNotifications, markNotificationRead } from '../services/api';

export default function Navbar() {
  const { cartCount } = useCart();
  const { wishlist } = useWishlist();
  const { compareList } = useCompare();
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const { darkMode, toggleTheme } = useTheme();

  const [notifications, setNotifications] = useState([]);
  const [showNotifDropdown, setShowNotifDropdown] = useState(false);
  const dropdownRef = useRef(null);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const loadNotifications = () => {
    if (!isAuthenticated || !user?._id) return;
    getNotifications(user._id)
      .then((res) => setNotifications(res.data))
      .catch(() => {});
  };

  useEffect(() => {
    loadNotifications();
    const interval = setInterval(loadNotifications, 5000);
    return () => clearInterval(interval);
  }, [user?._id, isAuthenticated]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowNotifDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleMarkAsRead = async (id) => {
    try {
      await markNotificationRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, read: true } : n))
      );
    } catch {}
  };

  const displayName =
    user?.name?.trim() || user?.email?.split('@')[0] || 'User';

  const linkClass = ({ isActive }) =>
    `px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
      isActive
        ? 'bg-primary-600 text-white'
        : 'text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700'
    }`;

  return (
    <nav className="sticky top-0 z-50 bg-white/90 dark:bg-gray-900/90 backdrop-blur border-b border-gray-200 dark:border-gray-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-2">
          <Link to="/" className="text-xl font-bold text-primary-600 shrink-0">
            🛒 SmartCart
          </Link>
          <div className="hidden lg:flex items-center gap-1 flex-wrap justify-center">
            <NavLink to="/" className={linkClass} end>Home</NavLink>
            <NavLink to="/shop" className={linkClass}>Shop</NavLink>
            <NavLink to="/deals" className={linkClass}>Deals ⚡</NavLink>
            <NavLink to="/cart" className={linkClass}>Cart ({cartCount})</NavLink>
            <NavLink to="/wishlist" className={linkClass}>Wishlist ({wishlist.length})</NavLink>
            <NavLink to="/compare" className={linkClass}>Compare ({compareList.length})</NavLink>
            <NavLink to="/track" className={linkClass}>Track</NavLink>
            {isAuthenticated && (
              <NavLink to="/inbox" className={linkClass}>Inbox 📬</NavLink>
            )}
            {isAdmin && (
              <>
                <NavLink to="/admin" className={linkClass}>Admin</NavLink>
                <NavLink to="/analytics" className={linkClass}>Analytics</NavLink>
              </>
            )}
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {isAuthenticated ? (
              <>
                <div className="relative" ref={dropdownRef}>
                  <button
                    type="button"
                    onClick={() => setShowNotifDropdown(!showNotifDropdown)}
                    className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600 relative"
                    aria-label="Notifications"
                  >
                    🔔
                    {unreadCount > 0 && (
                      <span className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full text-[10px] w-4 h-4 flex items-center justify-center font-bold animate-pulse">
                        {unreadCount}
                      </span>
                    )}
                  </button>
                  {showNotifDropdown && (
                    <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-100 dark:border-gray-700 z-50 overflow-hidden">
                      <div className="p-3 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center bg-gray-50 dark:bg-gray-900/50">
                        <span className="font-bold text-sm">Notifications</span>
                        <Link to="/notifications" className="text-xs text-primary-600 hover:underline" onClick={() => setShowNotifDropdown(false)}>
                          View All
                        </Link>
                      </div>
                      <div className="max-h-64 overflow-y-auto divide-y divide-gray-100 dark:divide-gray-700">
                        {notifications.length === 0 ? (
                          <p className="p-4 text-xs text-gray-500 text-center">No notifications yet</p>
                        ) : (
                          notifications.slice(0, 5).map((n) => (
                            <div
                              key={n._id}
                              onClick={() => {
                                handleMarkAsRead(n._id);
                                if (n.type === 'order') {
                                  setShowNotifDropdown(false);
                                }
                              }}
                              className={`p-3 text-xs cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-left ${
                                !n.read ? 'bg-blue-50/50 dark:bg-blue-900/10 font-medium' : ''
                              }`}
                            >
                              <div className="flex justify-between items-start gap-1">
                                <span className="font-semibold text-gray-950 dark:text-white">{n.title}</span>
                                <span className="text-[10px] text-gray-400 shrink-0">
                                  {new Date(n.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                              </div>
                              <p className="text-gray-600 dark:text-gray-300 mt-1 line-clamp-2">{n.message}</p>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  )}
                </div>

                <Link
                  to="/profile"
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 shadow-sm min-w-0 max-w-[200px]"
                  title={displayName}
                >
                  <span className="w-8 h-8 shrink-0 rounded-full bg-primary-600 text-white flex items-center justify-center text-sm font-bold">
                    {displayName.charAt(0).toUpperCase()}
                  </span>
                  <span className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                    {displayName}
                  </span>
                </Link>
                <button
                  type="button"
                  onClick={logout}
                  className="text-sm text-gray-600 dark:text-gray-300 hover:text-red-600 hidden sm:block"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="text-sm font-medium text-primary-600 hover:underline">
                  Login
                </Link>
                <Link to="/register" className="btn-primary text-sm py-1.5 px-3 hidden sm:inline-block">
                  Sign Up
                </Link>
              </>
            )}
            <button
              type="button"
              onClick={toggleTheme}
              className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700"
              aria-label="Toggle theme"
            >
              {darkMode ? '☀️' : '🌙'}
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
