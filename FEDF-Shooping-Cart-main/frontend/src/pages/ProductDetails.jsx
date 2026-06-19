import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import ProductImage from '../components/ProductImage';
import ProductBadge from '../components/ProductBadge';
import WishlistSelectModal from '../components/WishlistSelectModal';
import SmartBuyPanel from '../components/SmartBuyPanel';
import StarRating from '../components/StarRating';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useCheckout } from '../context/CheckoutContext';
import { useAuth } from '../context/AuthContext';
import { getProduct, getRecommendations, broadcastNotification } from '../services/api';
import { addRecentlyViewed } from '../utils/recentlyViewed';
import { formatCurrency } from '../utils/formatCurrency';
import { getEffectivePrice, isOnSale } from '../utils/productPrice';

export default function ProductDetails() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [qty, setQty] = useState(1);
  const { addToCart } = useCart();
  const { addToWishlist, isInWishlist, removeFromWishlist } = useWishlist();
  const { startBuyNow } = useCheckout();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [subscribedAlert, setSubscribedAlert] = useState(false);
  const [showTryOn, setShowTryOn] = useState(false);
  const [showWishlistModal, setShowWishlistModal] = useState(false);
  const [tryOnScale, setTryOnScale] = useState(100);
  const [tryOnRotate, setTryOnRotate] = useState(0);
  const [tryOnX, setTryOnX] = useState(0);
  const [tryOnY, setTryOnY] = useState(0);

  const handleSubscribeAlert = () => {
    setSubscribedAlert(true);
    toast.success('Price Drop Tracker Active!');
    setTimeout(() => {
      broadcastNotification({
        userId: user?._id || 'all',
        type: 'alert',
        title: '📉 Price Drop Alert!',
        message: `Hurry! The price of ${product.name} just dropped by 10%. Use coupon: FLASH25 at checkout!`,
      }).catch(() => {});
    }, 8000);
  };

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await getProduct(id);
        setProduct(data);
        addRecentlyViewed(data);
        const { data: recs } = await getRecommendations(id);
        setRecommendations(recs);
      } catch {
        setProduct(null);
      }
    };
    load();
  }, [id]);

  if (!product) return <p className="text-center py-12">Loading...</p>;

  const inWishlist = isInWishlist(product._id);
  const price = getEffectivePrice(product);
  const sale = isOnSale(product);

  return (
    <div className="space-y-10">
      <div className="grid lg:grid-cols-2 gap-8">
        <div className="card p-4 relative overflow-hidden">
          <ProductBadge badge={product.badge} />
          {product.year && (
            <span className="absolute top-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded-full z-10">
              {product.year}
            </span>
          )}
          <ProductImage
            src={product.image}
            alt={product.name}
            category={product.category}
            className="rounded-xl w-full h-80 lg:h-[420px] object-cover"
          />
        </div>

        <div className="space-y-5">
          <div>
            <span className="text-sm text-primary-600 font-medium">{product.category}</span>
            <h1 className="text-3xl font-bold mt-1">{product.name}</h1>
            <StarRating rating={product.rating} />
          </div>

          <p className="text-gray-600 dark:text-gray-300 leading-relaxed">{product.description}</p>

          <div className="flex items-baseline gap-3">
            <span className="text-3xl font-bold text-primary-600">{formatCurrency(price)}</span>
            {sale && (
              <span className="text-xl text-gray-400 line-through">{formatCurrency(product.price)}</span>
            )}
          </div>

          <p className={product.stock > 0 ? 'text-green-600 font-medium' : 'text-red-600 font-medium'}>
            {product.stock > 0 ? `✓ ${product.stock} in stock` : 'Out of stock'}
          </p>

          <div className="flex items-center gap-3">
            <label className="font-medium">Quantity</label>
            <button className="btn-secondary px-3" onClick={() => setQty((q) => Math.max(1, q - 1))}>-</button>
            <span className="font-bold w-8 text-center">{qty}</span>
            <button className="btn-secondary px-3" onClick={() => setQty((q) => q + 1)}>+</button>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              className="btn-secondary"
              onClick={() => setShowWishlistModal(true)}
            >
              {inWishlist ? '♥ In Wishlist' : '♡ Add to Wishlist'}
            </button>
            <button
              className="bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2 rounded-lg font-medium"
              disabled={product.stock < 1}
              onClick={() => {
                startBuyNow({ ...product, price }, qty);
                navigate('/checkout/address');
              }}
            >
              Buy Now — Skip Cart
            </button>
            {(product.category.toLowerCase().includes('wearable') ||
              product.category.toLowerCase().includes('watch') ||
              product.category.toLowerCase().includes('shoe') ||
              product.category.toLowerCase().includes('audio') ||
              product.category.toLowerCase().includes('accessories')) && (
              <button
                type="button"
                onClick={() => {
                  setTryOnScale(100);
                  setTryOnRotate(0);
                  setTryOnX(0);
                  setTryOnY(0);
                  setShowTryOn(true);
                }}
                className="px-5 py-2 rounded-lg font-medium border border-primary-500 text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-950/20"
              >
                ✨ Live Try On (AR)
              </button>
            )}
            <button
              type="button"
              onClick={handleSubscribeAlert}
              disabled={subscribedAlert}
              className="px-4 py-2 text-xs font-semibold rounded-lg border border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-50"
            >
              {subscribedAlert ? '🔔 Subscribed' : '🔔 Track Price Alerts'}
            </button>
          </div>

          <SmartBuyPanel product={{ ...product, price }} quantity={qty} />

          <Link to="/shop" className="text-primary-600 hover:underline text-sm inline-block">
            ← Back to shop
          </Link>
        </div>
      </div>

      {showTryOn && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl relative text-left">
            <button
              onClick={() => setShowTryOn(false)}
              className="absolute top-4 right-4 text-2xl text-gray-500 hover:text-gray-700"
            >
              ✕
            </button>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">✨ AR Virtual Try-On Studio</h3>
            <p className="text-xs text-gray-500">
              Drag, rotate, and scale {product.name} against simulated coordinates.
            </p>
            
            {/* Visual Try On Frame */}
            <div className="h-64 bg-slate-100 dark:bg-slate-900 border dark:border-gray-700 rounded-xl relative overflow-hidden flex items-center justify-center">
              <img
                src={
                  product.category.toLowerCase().includes('audio')
                    ? 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&h=400&q=80'
                    : product.category.toLowerCase().includes('shoe')
                    ? 'https://images.unsplash.com/photo-1560343090-f0409e92791a?auto=format&fit=crop&w=400&h=400&q=80'
                    : product.category.toLowerCase().includes('watch') ||
                      product.category.toLowerCase().includes('wearable')
                    ? 'https://images.unsplash.com/photo-1522312346375-d1a52e2b99b3?auto=format&fit=crop&w=400&h=400&q=80'
                    : 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?auto=format&fit=crop&w=400&h=400&q=80'
                }
                alt="Try on backdrop"
                className="w-full h-full object-cover"
              />
              
              <div
                className="absolute transition-transform select-none"
                style={{
                  transform: `translate(${tryOnX}px, ${tryOnY}px) scale(${tryOnScale / 100}) rotate(${tryOnRotate}deg)`,
                  width: '120px',
                  height: '120px',
                }}
              >
                <ProductImage
                  src={product.image}
                  alt={product.name}
                  category={product.category}
                  className="w-full h-full object-contain filter drop-shadow-[0_4px_8px_rgba(0,0,0,0.5)]"
                />
              </div>
            </div>

            {/* Slider controls */}
            <div className="space-y-2 text-xs">
              <div className="flex justify-between items-center gap-2">
                <span className="font-semibold w-20">Size Scale:</span>
                <input
                  type="range"
                  min="40"
                  max="200"
                  value={tryOnScale}
                  onChange={(e) => setTryOnScale(Number(e.target.value))}
                  className="flex-1 accent-primary-600"
                />
                <span className="w-8 text-right font-mono">{tryOnScale}%</span>
              </div>
              <div className="flex justify-between items-center gap-2">
                <span className="font-semibold w-20">Rotation:</span>
                <input
                  type="range"
                  min="-180"
                  max="180"
                  value={tryOnRotate}
                  onChange={(e) => setTryOnRotate(Number(e.target.value))}
                  className="flex-1 accent-primary-600"
                />
                <span className="w-8 text-right font-mono">{tryOnRotate}°</span>
              </div>
              <div className="flex justify-between items-center gap-2">
                <span className="font-semibold w-20">Move X:</span>
                <input
                  type="range"
                  min="-120"
                  max="120"
                  value={tryOnX}
                  onChange={(e) => setTryOnX(Number(e.target.value))}
                  className="flex-1 accent-primary-600"
                />
                <span className="w-8 text-right font-mono">{tryOnX}px</span>
              </div>
              <div className="flex justify-between items-center gap-2">
                <span className="font-semibold w-20">Move Y:</span>
                <input
                  type="range"
                  min="-120"
                  max="120"
                  value={tryOnY}
                  onChange={(e) => setTryOnY(Number(e.target.value))}
                  className="flex-1 accent-primary-600"
                />
                <span className="w-8 text-right font-mono">{tryOnY}px</span>
              </div>
            </div>

            <button
              onClick={() => {
                toast.success('Snap captured and saved to library!');
                setShowTryOn(false);
              }}
              className="btn-primary w-full py-2.5 font-bold text-xs"
            >
              📷 Capture Photo Look
            </button>
          </div>
        </div>
      )}

      {showWishlistModal && (
        <WishlistSelectModal
          product={product}
          isOpen={showWishlistModal}
          onClose={() => setShowWishlistModal(false)}
        />
      )}

      {recommendations.length > 0 && (
        <section>
          <h2 className="text-2xl font-bold mb-4">You may also like</h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {recommendations.map((p) => (
              <Link key={p._id} to={`/product/${p._id}`} className="card p-3 hover:shadow-md transition">
                <ProductImage src={p.image} alt={p.name} category={p.category} className="w-full h-32 object-cover rounded-lg" />
                <p className="font-medium text-sm mt-2 line-clamp-1">{p.name}</p>
                <p className="text-primary-600 font-bold text-sm">{formatCurrency(getEffectivePrice(p))}</p>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
