import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function HeroSection() {
  const { user, isAuthenticated } = useAuth();

  return (
    <section className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary-600 via-indigo-600 to-purple-700 text-white p-8 md:p-12">
      <div className="absolute inset-0 opacity-20 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC40Ij48cGF0aCBkPSJNMzYgMzRoLTJ2LTRoMnY0em0wLTZoLTJ2LTRoMnY0em0tNiA2aC00di0yaDR2em0tNiAwaC00di0yaDR2em0tNiAwaC00di0yaDR2em02IDZoLTJ2LTRoMnY0em0wLTZoLTJ2LTRoMnY0em0tNiA2aC00di0yaDR2em0tNiAwaC00di0yaDR2em0tNiAwaC00di0yaDR2eiIvPjwvZz48L2c+PC9zdmc+')]" />
      <div className="relative z-10 max-w-2xl">
        <p className="text-primary-100 text-sm font-medium uppercase tracking-wider mb-2">
          AI-Powered Smart Shopping
        </p>
        <h1 className="text-3xl md:text-5xl font-bold leading-tight">
          {isAuthenticated ? `Hey ${user.name.split(' ')[0]}, ready to shop?` : 'Shop smarter. Checkout faster.'}
        </h1>
        <p className="mt-4 text-primary-100 text-lg">
          Flash deals, loyalty rewards, product compare & one-click Buy Now — all in one cart.
        </p>
        <div className="flex flex-wrap gap-3 mt-8">
          <Link to="/shop" className="bg-white text-primary-700 px-6 py-3 rounded-xl font-semibold hover:bg-primary-50 transition">
            Shop 2026 Collection
          </Link>
          {!isAuthenticated && (
            <Link to="/register" className="border-2 border-white/80 px-6 py-3 rounded-xl font-semibold hover:bg-white/10 transition">
              Join Free +50 pts
            </Link>
          )}
          <Link to="/compare" className="border border-white/50 px-6 py-3 rounded-xl font-medium hover:bg-white/10 transition">
            Compare Products
          </Link>
        </div>
        <div className="flex gap-8 mt-10 text-sm">
          <div><p className="text-2xl font-bold">12+</p><p className="text-primary-200">Products</p></div>
          <div><p className="text-2xl font-bold">3</p><p className="text-primary-200">Coupons</p></div>
          <div><p className="text-2xl font-bold">24/7</p><p className="text-primary-200">Tracking</p></div>
        </div>
      </div>
    </section>
  );
}
