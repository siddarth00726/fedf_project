import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { CheckoutProvider } from './context/CheckoutContext';
import { CompareProvider } from './context/CompareContext';
import { ThemeProvider } from './context/ThemeContext';
import { WishlistProvider } from './context/WishlistContext';
import AdminDashboard from './pages/AdminDashboard';
import AnalyticsDashboard from './pages/AnalyticsDashboard';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import Compare from './pages/Compare';
import Home from './pages/Home';
import Shop from './pages/Shop';
import Login from './pages/Login';
import OrderTracking from './pages/OrderTracking';
import ProductDetails from './pages/ProductDetails';
import Profile from './pages/Profile';
import Register from './pages/Register';
import Wishlist from './pages/Wishlist';
import Address from './pages/checkout/Address';
import OrderSummary from './pages/checkout/OrderSummary';
import Payment from './pages/checkout/Payment';
import Success from './pages/checkout/Success';
import Inbox from './pages/Inbox';
import NotificationsPage from './pages/NotificationsPage';
import Deals from './pages/Deals';

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <CartProvider>
          <WishlistProvider>
            <CompareProvider>
              <CheckoutProvider>
                <BrowserRouter>
                  <Toaster position="top-right" />
                  <Routes>
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                    <Route
                      path="/*"
                      element={
                        <Layout>
                          <Routes>
                            <Route path="/" element={<Home />} />
                            <Route path="/shop" element={<Shop />} />
                            <Route path="/product/:id" element={<ProductDetails />} />
                            <Route path="/cart" element={<Cart />} />
                            <Route path="/wishlist" element={<Wishlist />} />
                            <Route path="/compare" element={<Compare />} />
                            <Route path="/checkout" element={<Checkout />} />
                            <Route path="/checkout/address" element={<Address />} />
                            <Route path="/checkout/payment" element={<Payment />} />
                            <Route path="/checkout/summary" element={<OrderSummary />} />
                            <Route path="/checkout/success" element={<Success />} />
                            <Route path="/track" element={<OrderTracking />} />
                            <Route path="/inbox" element={<Inbox />} />
                            <Route path="/notifications" element={<NotificationsPage />} />
                            <Route path="/deals" element={<Deals />} />
                            <Route
                              path="/profile"
                              element={
                                <ProtectedRoute>
                                  <Profile />
                                </ProtectedRoute>
                              }
                            />
                            <Route
                              path="/admin"
                              element={
                                <ProtectedRoute adminOnly>
                                  <AdminDashboard />
                                </ProtectedRoute>
                              }
                            />
                            <Route
                              path="/analytics"
                              element={
                                <ProtectedRoute adminOnly>
                                  <AnalyticsDashboard />
                                </ProtectedRoute>
                              }
                            />
                          </Routes>
                        </Layout>
                      }
                    />
                  </Routes>
                </BrowserRouter>
              </CheckoutProvider>
            </CompareProvider>
          </WishlistProvider>
        </CartProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
