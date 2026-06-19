export default function StarRating({ rating }) {
  return (
    <div className="flex items-center gap-0.5 text-amber-400 text-sm">
      {[1, 2, 3, 4, 5].map((star) => (
        <span key={star}>{star <= Math.round(rating) ? '★' : '☆'}</span>
      ))}
      <span className="text-gray-500 dark:text-gray-400 ml-1">({rating})</span>
    </div>
  );
}
