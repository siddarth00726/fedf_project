export default function ProductBadge({ badge }) {
  if (!badge) return null;
  const colors = {
    'Best Seller': 'bg-amber-500',
    'Hot Deal': 'bg-red-500',
    New: 'bg-emerald-500',
  };
  return (
    <span
      className={`absolute top-2 left-2 text-white text-xs font-bold px-2 py-1 rounded-full ${
        colors[badge] || 'bg-primary-600'
      }`}
    >
      {badge}
    </span>
  );
}
