import { Link } from 'react-router-dom';
import HeroSection from '../components/HeroSection';
import { useAuth } from '../context/AuthContext';

const highlights = [
  { icon: '🛍️', title: 'Browse Shop', desc: '20+ 2026 tech products', to: '/shop' },
  { icon: '⚡', title: 'Flash Deals', desc: 'Limited-time price drops', to: '/deals' },
  { icon: '🎟️', title: 'Smart Buy', desc: 'Pick coupons on product pages', to: '/shop' },
  { icon: '📦', title: 'Track Orders', desc: 'Live delivery timeline', to: '/track' },
];

export default function Home() {
  const { isAuthenticated } = useAuth();

  return (
    <div className="space-y-12">
      <HeroSection />

      <section className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {highlights.map((h) => (
          <Link
            key={h.title}
            to={h.to}
            className="card p-6 hover:shadow-lg hover:border-primary-300 dark:hover:border-primary-700 border-2 border-transparent transition group"
          >
            <span className="text-3xl">{h.icon}</span>
            <h3 className="font-bold mt-3 group-hover:text-primary-600">{h.title}</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{h.desc}</p>
          </Link>
        ))}
      </section>

      <section className="card p-8 md:p-12 bg-gradient-to-r from-indigo-50 to-primary-50 dark:from-gray-800 dark:to-gray-800 text-center">
        <h2 className="text-2xl md:text-3xl font-bold mb-3">Ready to explore 2026 tech?</h2>
        <p className="text-gray-600 dark:text-gray-400 max-w-xl mx-auto mb-6">
          Products live on our dedicated shop page. Open any item for full specs, Smart Buy coupons,
          and one-click checkout.
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          <Link to="/shop" className="btn-primary px-8 py-3 text-lg">
            Go to Shop →
          </Link>
          {!isAuthenticated && (
            <Link to="/register" className="btn-secondary px-8 py-3 text-lg">
              Join + 50 pts
            </Link>
          )}
        </div>
      </section>

      <section className="grid md:grid-cols-3 gap-6 text-sm">
        <div className="card p-5">
          <p className="font-bold text-primary-600 mb-1">Cart auto-cleanup</p>
          <p className="text-gray-500">Items expire after 60 days with reminders before removal.</p>
        </div>
        <div className="card p-5">
          <p className="font-bold text-primary-600 mb-1">5 active coupons</p>
          <p className="text-gray-500">SAVE10, SAVE20, FIRSTORDER30, TECH2026, FLASH25</p>
        </div>
        <div className="card p-5">
          <p className="font-bold text-primary-600 mb-1">Single-item checkout</p>
          <p className="text-gray-500">Checkout one product directly from your cart list.</p>
        </div>
      </section>
    </div>
  );
}
