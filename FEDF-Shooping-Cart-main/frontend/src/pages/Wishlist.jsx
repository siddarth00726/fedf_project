import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import ProductImage from '../components/ProductImage';
import { formatCurrency } from '../utils/formatCurrency';

export default function Wishlist() {
  const {
    wishlist,
    removeFromWishlist,
    activeProfile,
    selectProfile,
    profiles,
    createProfile,
    deleteProfile,
  } = useWishlist();
  const { addToCart } = useCart();

  const [newProfileName, setNewProfileName] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);

  const handleAddProfileSubmit = (e) => {
    e.preventDefault();
    if (!newProfileName.trim()) return;
    createProfile(newProfileName);
    setNewProfileName('');
    setShowAddForm(false);
  };

  // Avatar emoji helper based on profile name
  const getAvatarEmoji = (name) => {
    const n = name.toLowerCase();
    if (n === 'mom' || n === 'mother') return '👩';
    if (n === 'dad' || n === 'father') return '👨';
    if (n === 'kid' || n === 'son' || n === 'daughter' || n === 'child') return '🧒';
    if (n === 'sister' || n === 'girl') return '👧';
    if (n === 'brother' || n === 'boy') return '👦';
    if (n === 'default' || n === 'main') return '👥';
    return '👤';
  };

  return (
    <div className="space-y-8 py-4">
      {/* Header section with description */}
      <div>
        <p className="text-primary-600 font-medium text-sm">Multi-User Share Mode</p>
        <h1 className="text-3xl font-black tracking-tight">Family Wishlists</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">
          Sharing this account? Keep separate lists for different family members under a single log-in.
        </p>
      </div>

      {/* Member Profiles Selector Bar */}
      <section className="card p-6 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800/40 dark:to-gray-800/80 border border-gray-200/80 dark:border-gray-700/50">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-3">
            {profiles.map((profile) => {
              const isActive = profile === activeProfile;
              return (
                <div key={profile} className="relative flex items-center group/profile">
                  <button
                    type="button"
                    onClick={() => selectProfile(profile)}
                    className={`flex items-center gap-2 py-2 rounded-xl text-sm font-semibold transition-all ${
                      profile === 'Default' ? 'px-4' : 'pl-4 pr-8'
                    } ${
                      isActive
                        ? 'bg-primary-600 text-white shadow-lg shadow-primary-500/20 scale-105 border border-primary-600'
                        : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700'
                    }`}
                  >
                    <span className="text-lg">{getAvatarEmoji(profile)}</span>
                    <span>{profile}</span>
                  </button>
                  {profile !== 'Default' && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (confirm(`Are you sure you want to delete ${profile}'s wishlist?`)) {
                          deleteProfile(profile);
                        }
                      }}
                      className={`absolute right-2 text-xs font-bold w-4 h-4 rounded-full flex items-center justify-center transition-all ${
                        isActive
                          ? 'text-white/60 hover:text-white hover:bg-white/20'
                          : 'text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20'
                      }`}
                      title={`Delete ${profile}`}
                    >
                      ×
                    </button>
                  )}
                </div>
              );
            })}

            {/* Inline Add Button */}
            {!showAddForm && (
              <button
                type="button"
                onClick={() => setShowAddForm(true)}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-semibold border-2 border-dashed border-gray-300 dark:border-gray-700 text-gray-500 hover:text-primary-600 dark:hover:text-primary-400 hover:border-primary-500 dark:hover:border-primary-500 transition-all"
              >
                <span>➕ Add Member</span>
              </button>
            )}
          </div>

          {/* Create Profile Form overlay/inline */}
          {showAddForm && (
            <form onSubmit={handleAddProfileSubmit} className="flex items-center gap-2 w-full sm:w-auto mt-2 sm:mt-0">
              <input
                type="text"
                maxLength="12"
                placeholder="Member name..."
                value={newProfileName}
                onChange={(e) => setNewProfileName(e.target.value)}
                className="input-field py-1.5 text-sm w-full sm:w-44"
                autoFocus
              />
              <button type="submit" className="btn-primary py-1.5 px-3 text-sm shrink-0">
                Save
              </button>
              <button
                type="button"
                onClick={() => { setShowAddForm(false); setNewProfileName(''); }}
                className="btn-secondary py-1.5 px-3 text-sm shrink-0"
              >
                Cancel
              </button>
            </form>
          )}
        </div>
      </section>

      {/* Main Wishlist content list */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <span className="text-xl">{getAvatarEmoji(activeProfile)}</span>
          <h2 className="text-xl font-bold">
            {activeProfile === 'Default' ? 'Default Wishlist' : `${activeProfile}'s Wishlist`}
          </h2>
          <span className="text-xs bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 font-bold px-2 py-0.5 rounded-full">
            {wishlist.length} item{wishlist.length !== 1 ? 's' : ''}
          </span>
        </div>

        {wishlist.length === 0 ? (
          <div className="text-center py-20 card border-2 border-dashed border-gray-200 dark:border-gray-800">
            <span className="text-4xl block mb-4">✨</span>
            <p className="text-lg font-semibold text-gray-700 dark:text-gray-300">
              No items in {activeProfile === 'Default' ? 'this' : `${activeProfile}'s`} wishlist
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 max-w-sm mx-auto mb-6">
              Browse the store catalogue and click the heart icon on any product to save it here for later.
            </p>
            <Link to="/shop" className="btn-primary inline-block px-6">
              Browse Products
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
             {wishlist.map((item) => (
              <div key={item._id} className="card p-4 flex flex-col group relative overflow-hidden transition hover:shadow-xl hover:-translate-y-0.5 border border-gray-200 dark:border-gray-800">
                <ProductImage
                  src={item.image}
                  alt={item.name}
                  category={item.category}
                  className="w-full h-44 object-cover rounded-xl mb-4"
                />
                
                <span className="text-[10px] uppercase font-bold tracking-wider text-primary-600 dark:text-primary-400 mb-1.5">
                  {item.category}
                </span>
                <h3 className="font-bold text-gray-900 dark:text-white line-clamp-1 group-hover:text-primary-600 transition-colors">
                  {item.name}
                </h3>
                <p className="text-gray-500 dark:text-gray-400 text-xs mt-1 line-clamp-2">
                  {item.description}
                </p>

                <div className="flex items-center justify-between my-4 pt-3 border-t border-gray-100 dark:border-gray-800">
                  <span className="text-lg font-black text-gray-900 dark:text-white">
                    {formatCurrency(item.price)}
                  </span>
                  {item.stock > 0 ? (
                    <span className="text-[10px] text-green-600 font-bold bg-green-50 dark:bg-green-950/20 px-2 py-0.5 rounded-md">
                      In Stock ({item.stock})
                    </span>
                  ) : (
                    <span className="text-[10px] text-red-600 font-bold bg-red-50 dark:bg-red-950/20 px-2 py-0.5 rounded-md">
                      Out of Stock
                    </span>
                  )}
                </div>

                <div className="flex gap-2 mt-auto">
                  <button
                    className="btn-primary flex-1 py-2 text-xs font-bold"
                    onClick={() => addToCart(item)}
                    disabled={item.stock <= 0}
                  >
                    Move To Cart
                  </button>
                  <button
                    className="btn-secondary py-2 text-xs font-bold border-gray-200 text-gray-500 hover:text-red-600 hover:border-red-300 dark:border-gray-700"
                    onClick={() => removeFromWishlist(item._id)}
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
