import { useWishlist } from '../context/WishlistContext';

export default function WishlistSelectModal({ product, isOpen, onClose }) {
  const { profiles, isInProfileWishlist, toggleProfileWishlist } = useWishlist();

  if (!isOpen || !product) return null;

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
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-sm w-full p-6 space-y-4 shadow-2xl relative text-left">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 text-lg font-bold"
        >
          ✕
        </button>
        <div>
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">Save to Family Wishlist</h3>
          <p className="text-xs text-gray-500 mt-1">Select which family members' list to save this item to.</p>
        </div>

        {/* Product preview */}
        <div className="flex gap-3 items-center p-3 bg-gray-50 dark:bg-gray-900/40 rounded-xl border dark:border-gray-750/50">
          <img src={product.image} alt={product.name} className="w-12 h-12 object-cover rounded-lg border dark:border-gray-800" />
          <div className="min-w-0 flex-1">
            <p className="font-bold text-xs text-gray-900 dark:text-white truncate">{product.name}</p>
            <p className="text-[10px] text-gray-400 mt-0.5">{product.category}</p>
          </div>
        </div>

        {/* Profile lists */}
        <div className="space-y-2 max-h-48 overflow-y-auto">
          {profiles.map((profile) => {
            const inList = isInProfileWishlist(product._id, profile);
            return (
              <label
                key={profile}
                className="flex items-center justify-between p-3 rounded-xl border border-gray-200 dark:border-gray-700/60 hover:bg-gray-50 dark:hover:bg-gray-700/30 cursor-pointer transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <span className="text-lg">{getAvatarEmoji(profile)}</span>
                  <span className="text-xs font-semibold text-gray-800 dark:text-gray-200">{profile}</span>
                </div>
                <input
                  type="checkbox"
                  checked={inList}
                  onChange={() => toggleProfileWishlist(product, profile)}
                  className="w-4 h-4 text-primary-600 rounded border-gray-300 focus:ring-primary-500 cursor-pointer"
                />
              </label>
            );
          })}
        </div>

        <button
          onClick={onClose}
          className="btn-primary w-full py-2.5 text-xs font-bold uppercase tracking-wider mt-2"
        >
          Done
        </button>
      </div>
    </div>
  );
}
