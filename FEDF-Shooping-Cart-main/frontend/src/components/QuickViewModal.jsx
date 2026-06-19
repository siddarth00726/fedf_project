import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useCheckout } from '../context/CheckoutContext';
import ProductImage from './ProductImage';
import StarRating from './StarRating';
import { formatCurrency } from '../utils/formatCurrency';
import { getEffectivePrice, isOnSale } from '../utils/productPrice';

export default function QuickViewModal({ product, onClose }) {
  const { addToCart } = useCart();
  const { startBuyNow } = useCheckout();
  const navigate = useNavigate();
  if (!product) return null;

  const price = getEffectivePrice(product);
  const sale = isOnSale(product);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50" onClick={onClose}>
      <div className="card max-w-lg w-full p-6 relative" onClick={(e) => e.stopPropagation()}>
        <button onClick={onClose} className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 text-xl">
          ×
        </button>
        <ProductImage src={product.image} alt={product.name} className="w-full h-48 object-cover rounded-lg mb-4" />
        <h2 className="text-xl font-bold">{product.name}</h2>
        <StarRating rating={product.rating} />
        <p className="text-sm text-gray-500 mt-2 line-clamp-3">{product.description}</p>
        <div className="flex items-center gap-2 mt-3">
          <span className="text-2xl font-bold text-primary-600">{formatCurrency(price)}</span>
          {sale && (
            <span className="text-gray-400 line-through text-sm">{formatCurrency(product.price)}</span>
          )}
        </div>
        <div className="flex gap-2 mt-4">
          <button
            className="btn-primary flex-1"
            onClick={() => {
              addToCart({ ...product, price });
              onClose();
            }}
          >
            Add to Cart
          </button>
          <button
            className="bg-emerald-600 hover:bg-emerald-700 text-white flex-1 py-2 rounded-lg font-medium"
            onClick={() => {
              startBuyNow({ ...product, price }, 1);
              onClose();
              navigate('/checkout/address');
            }}
          >
            Buy Now
          </button>
        </div>
      </div>
    </div>
  );
}
