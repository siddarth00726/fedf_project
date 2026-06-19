import { Link, useNavigate } from 'react-router-dom';
import ProductImage from '../components/ProductImage';
import CartInsightsPanel from '../components/cart/CartInsightsPanel';
import CartTimeline from '../components/cart/CartTimeline';
import RemovedFromCart from '../components/cart/RemovedFromCart';
import RecentlyViewedCart from '../components/cart/RecentlyViewedCart';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useCheckout } from '../context/CheckoutContext';
import { formatCurrency } from '../utils/formatCurrency';
import { daysUntilExpiry, isExpiringSoon } from '../utils/cartExpiry';

export default function Cart() {
  const {
    cart,
    removeFromCart,
    updateQuantity,
    saveForLater,
    savedForLater,
    moveSavedToCart,
    cartTotal,
    expiryNotice,
    cartTtlDays,
    removedHistory,
  } = useCart();
  const { addToWishlist } = useWishlist();
  const { startCartCheckout } = useCheckout();
  const navigate = useNavigate();

  const moveToWishlist = (item) => {
    addToWishlist(item);
    removeFromCart(item._id);
  };

  const handleCheckoutAll = () => {
    if (!cart.length) return;
    startCartCheckout(cart);
    navigate('/checkout/address');
  };

  const handleCheckoutSingle = (item) => {
    startCartCheckout([{ ...item }]);
    navigate('/checkout/address');
  };

  const isEmpty = !cart.length && !savedForLater.length;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Smart Shopping Cart</h1>
        <p className="text-sm text-gray-500 mt-1">
          Budget · Group buy · Price lock · Health score · Timeline · 60-day auto cleanup
        </p>
      </div>

      <CartInsightsPanel />

      {expiryNotice && (
        <div className="card p-4 border-amber-300 dark:border-amber-700 bg-amber-50 dark:bg-amber-900/20 text-amber-800 dark:text-amber-200 text-sm flex gap-2">
          <span>⏳</span>
          <p>{expiryNotice}</p>
        </div>
      )}

      {isEmpty ? (
        <div className="text-center py-12 card">
          <p className="text-xl mb-4">Your active cart is empty</p>
          <Link to="/shop" className="btn-primary inline-block">Browse Shop (70+ products)</Link>
        </div>
      ) : (
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
            {cart.map((item) => (
              <div key={item._id} className="card p-4 flex gap-4 flex-col sm:flex-row">
                <ProductImage src={item.image} alt={item.name} category={item.category} className="w-28 h-28 object-cover rounded-lg shrink-0" />
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold">{item.name}</h3>
                  <p className="text-primary-600 font-bold">{formatCurrency(item.price)}</p>
                  {item.priceLockedUntil > Date.now() && (
                    <p className="text-xs text-blue-600 font-medium">🔒 Price locked 24h</p>
                  )}
                  {item.addedAt && (
                    <p
                      className={`text-xs mt-1 ${
                        isExpiringSoon(item.addedAt) ? 'text-amber-600 font-medium' : 'text-gray-400'
                      }`}
                    >
                      {isExpiringSoon(item.addedAt)
                        ? `⚠ Expires in ${daysUntilExpiry(item.addedAt)} days`
                        : `Removes in ${daysUntilExpiry(item.addedAt)} days (${cartTtlDays}d limit)`}
                    </p>
                  )}
                  <div className="flex items-center gap-2 mt-2">
                    <button type="button" className="btn-secondary px-2 py-1" onClick={() => updateQuantity(item._id, item.quantity - 1)}>-</button>
                    <span className="w-8 text-center">{item.quantity}</span>
                    <button type="button" className="btn-secondary px-2 py-1" onClick={() => updateQuantity(item._id, item.quantity + 1)}>+</button>
                  </div>
                  <p className="mt-2 font-medium">Line total: {formatCurrency(item.price * item.quantity)}</p>
                </div>
                <div className="flex flex-col gap-2 sm:items-end">
                  <button type="button" className="btn-primary text-sm whitespace-nowrap" onClick={() => handleCheckoutSingle(item)}>
                    Checkout This Item
                  </button>
                  <button type="button" className="text-red-600 text-sm" onClick={() => removeFromCart(item._id)}>Remove</button>
                  <button type="button" className="text-sm text-gray-600" onClick={() => saveForLater(item._id)}>Save For Later</button>
                  <button type="button" className="text-sm text-primary-600" onClick={() => moveToWishlist(item)}>Move To Wishlist</button>
                </div>
              </div>
            ))}

            {savedForLater.length > 0 && (
              <div>
                <h2 className="text-xl font-bold mb-3">Saved For Later</h2>
                {savedForLater.map((item) => (
                  <div key={item._id} className="card p-4 flex justify-between items-center mb-2 gap-4">
                    <div className="flex items-center gap-3">
                      <ProductImage src={item.image} alt={item.name} className="w-12 h-12 rounded object-cover" />
                      <span>{item.name}</span>
                    </div>
                    <button type="button" className="btn-primary text-sm" onClick={() => moveSavedToCart(item._id)}>Move To Cart</button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="card p-6 h-fit space-y-4 sticky top-24">
            <h3 className="font-bold text-lg">Order Summary</h3>
            <p className="text-2xl font-bold text-primary-600">{formatCurrency(cartTotal)}</p>
            <p className="text-xs text-gray-500">{cart.length} product line(s)</p>
            <button type="button" className="btn-primary w-full" disabled={!cart.length} onClick={handleCheckoutAll}>
              Checkout All Items
            </button>
            <Link to="/shop" className="block text-center text-sm text-primary-600 hover:underline">Continue Shopping</Link>
          </div>
        </div>
      )}

      <div className="grid lg:grid-cols-2 gap-6">
        <CartTimeline />
        <RecentlyViewedCart />
      </div>

      <RemovedFromCart />

      {!removedHistory.length && isEmpty && (
        <p className="text-center text-sm text-gray-400">
          Removed items and recently viewed products will appear here when you shop.
        </p>
      )}
    </div>
  );
}
