import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useCheckout } from '../context/CheckoutContext';
import { useCompare } from '../context/CompareContext';
import StarRating from './StarRating';
import ProductBadge from './ProductBadge';
import ProductImage from './ProductImage';
import QuickViewModal from './QuickViewModal';
import WishlistSelectModal from './WishlistSelectModal';
import { formatCurrency } from '../utils/formatCurrency';
import { getEffectivePrice, isOnSale } from '../utils/productPrice';

export default function ProductCard({ product }) {
  const { addToCart } = useCart();
  const { addToWishlist, isInWishlist, removeFromWishlist } = useWishlist();
  const { startBuyNow } = useCheckout();
  const { addToCompare } = useCompare();
  const navigate = useNavigate();

  const [quickView, setQuickView] = useState(false);
  const [showWishlistModal, setShowWishlistModal] = useState(false);

  const inWishlist = isInWishlist(product._id);
  const price = getEffectivePrice(product);
  const sale = isOnSale(product);

  const handleBuyNow = () => {
    startBuyNow({ ...product, price }, 1);
    navigate('/checkout/address');
  };

  const imageSrc =
    product.image ||
    'https://via.placeholder.com/600x400?text=No+Image';

  return (
    <>
      <div className="card overflow-hidden flex flex-col rounded-xl bg-white dark:bg-gray-900 shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1 group">

        {/* Product Image */}
        <div className="relative overflow-hidden">
          <ProductBadge badge={product.badge} />

          <Link to={`/product/${product._id}`}>
            <ProductImage
              src={imageSrc}
              alt={product.name}
              category={product.category}
              className="w-full h-56 object-cover transition-transform duration-500 group-hover:scale-105"
            />
          </Link>

          <button
            onClick={() => setQuickView(true)}
            className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition-all bg-white dark:bg-gray-800 text-sm px-3 py-1 rounded-lg shadow-lg font-medium"
          >
            Quick View
          </button>
        </div>

        {/* Product Details */}
        <div className="p-4 flex flex-col flex-1">

          <Link to={`/product/${product._id}`}>
            <h3 className="font-semibold text-lg line-clamp-1 hover:text-primary-600 transition">
              {product.name}
            </h3>
          </Link>

          <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2 mt-1 flex-1">
            {product.description}
          </p>

          <div className="mt-2">
            <StarRating rating={product.rating || 4.5} />
          </div>

          <p className="text-xs text-gray-400 mt-1">
            {product.category}
          </p>

          {/* Price */}
          <div className="flex items-center justify-between mt-3">
            <div>
              <span className="text-xl font-bold text-primary-600">
                {formatCurrency(price)}
              </span>

              {sale && (
                <span className="text-sm text-gray-400 line-through ml-2">
                  {formatCurrency(product.price)}
                </span>
              )}
            </div>

            <span
              className={`text-xs px-2 py-1 rounded-full ${
                product.stock > 0
                  ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
                  : 'bg-red-100 text-red-700'
              }`}
            >
              {product.stock > 0 ? 'In Stock' : 'Out of Stock'}
            </span>
          </div>

          {/* Buttons */}
          <div className="grid grid-cols-2 gap-2 mt-4">

            <Link
              to={`/product/${product._id}`}
              className="btn-secondary text-center text-sm py-2"
            >
              Details
            </Link>

            <button
              onClick={() => addToCart({ ...product, price })}
              disabled={product.stock < 1}
              className="btn-primary text-sm py-2"
            >
              Add To Cart
            </button>

            <button
              onClick={() => setShowWishlistModal(true)}
              className="btn-secondary text-sm py-2"
            >
              {inWishlist ? '♥ Saved' : '♡ Wishlist'}
            </button>

            <button
              onClick={handleBuyNow}
              disabled={product.stock < 1}
              className="bg-emerald-600 hover:bg-emerald-700 text-white text-sm py-2 rounded-lg font-medium transition"
            >
              Buy Now
            </button>
          </div>

          <button
            onClick={() => addToCompare(product)}
            className="mt-3 text-xs text-center text-primary-600 hover:underline"
          >
            + Add to Compare
          </button>
        </div>
      </div>

      {quickView && (
        <QuickViewModal
          product={product}
          onClose={() => setQuickView(false)}
        />
      )}

      {showWishlistModal && (
        <WishlistSelectModal
          product={product}
          isOpen={showWishlistModal}
          onClose={() => setShowWishlistModal(false)}
        />
      )}
    </>
  );
}