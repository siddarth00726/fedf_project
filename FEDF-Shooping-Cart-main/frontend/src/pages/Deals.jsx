import { useEffect, useState } from 'react';
import FlashDeals from '../components/FlashDeals';
import { getCoupons } from '../services/api';
import toast from 'react-hot-toast';

export default function Deals() {
  const [coupons, setCoupons] = useState([]);
  const [loadingCoupons, setLoadingCoupons] = useState(true);

  useEffect(() => {
    getCoupons()
      .then(({ data }) => {
        setCoupons(data);
      })
      .catch(() => {
        toast.error('Failed to load active coupons.');
      })
      .finally(() => {
        setLoadingCoupons(false);
      });
  }, []);

  const handleCopyCode = (code) => {
    navigator.clipboard.writeText(code);
    toast.success(`Coupon "${code}" copied to clipboard!`);
  };

  return (
    <div className="space-y-10 py-4">
      {/* Premium Hero Banner for Deals */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-red-600 to-orange-500 dark:from-red-950 dark:to-orange-950 text-white p-8 md:p-12 shadow-2xl border border-red-500/20">
        <div className="absolute top-0 right-0 -mt-8 -mr-8 w-64 h-64 bg-white/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-0 left-0 -mb-8 -ml-8 w-48 h-48 bg-black/20 rounded-full blur-2xl" />
        
        <div className="relative z-10 max-w-2xl">
          <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold bg-white/20 backdrop-blur-md text-yellow-300 border border-white/10 uppercase tracking-wider animate-bounce">
            ⚡ 2026 Special Drops
          </span>
          <h1 className="text-3xl md:text-5xl font-black mt-4 tracking-tight leading-tight drop-shadow-md">
            Unbeatable Pricing & <br />
            <span className="text-yellow-300 text-shadow-glow">Instant Savings</span>
          </h1>
          <p className="mt-4 text-white/90 text-sm md:text-base max-w-md font-medium">
            Claim coupons, browse limited-time price drops, and get standard free shipping on checkout items today.
          </p>
        </div>
      </section>

      {/* Flash Deals Section (Previously on Home page) */}
      <div className="card p-6 md:p-8 border border-red-200 dark:border-red-900/40 shadow-xl bg-gradient-to-b from-red-50/10 to-transparent dark:from-red-950/10">
        <FlashDeals />
      </div>

      {/* Coupons Section */}
      <section className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            🎟️ Exclusive Promo Coupons
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Click any coupon to copy and apply directly inside the order checkout drawer.
          </p>
        </div>

        {loadingCoupons ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((n) => (
              <div key={n} className="card h-40 animate-pulse bg-gray-100 dark:bg-gray-700" />
            ))}
          </div>
        ) : coupons.length === 0 ? (
          <div className="card p-8 text-center text-gray-500">
            No active coupons found. Check back later!
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {coupons.map((c) => (
              <div
                key={c.code}
                className="relative overflow-hidden group card p-6 border-2 border-dashed border-primary-300 dark:border-primary-800 hover:border-primary-500 transition duration-300 cursor-pointer flex flex-col justify-between"
                onClick={() => handleCopyCode(c.code)}
              >
                {/* Visual side cuts for coupon aesthetics */}
                <div className="absolute top-1/2 -left-3 w-6 h-6 bg-gray-50 dark:bg-gray-900 rounded-full border-r border-gray-200 dark:border-gray-800 -translate-y-1/2" />
                <div className="absolute top-1/2 -right-3 w-6 h-6 bg-gray-50 dark:bg-gray-900 rounded-full border-l border-gray-200 dark:border-gray-800 -translate-y-1/2" />

                <div>
                  <div className="flex justify-between items-start gap-2">
                    <span className="text-xs uppercase tracking-wider font-extrabold text-primary-600 bg-primary-50 dark:bg-primary-950/40 dark:text-primary-400 px-2.5 py-1 rounded-md">
                      SAVE {c.discountPercent}%
                    </span>
                    <span className="text-[10px] text-gray-400 font-semibold uppercase tracking-widest">
                      Active
                    </span>
                  </div>
                  <h3 className="font-mono text-xl font-bold tracking-wider mt-3 select-all text-gray-900 dark:text-white">
                    {c.code}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                    {c.description || `${c.discountPercent}% discount off order total.`}
                  </p>
                </div>

                <div className="mt-5 pt-3 border-t border-gray-200 dark:border-gray-800/80 flex items-center justify-between text-xs text-primary-600 group-hover:text-primary-500 font-bold transition">
                  <span>Click to copy code</span>
                  <span className="group-hover:translate-x-1 transition-transform">📋</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
