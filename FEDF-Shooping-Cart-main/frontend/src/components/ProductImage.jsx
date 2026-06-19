import { useState } from 'react';
import { getProductSvg } from '../utils/productSvg';

export default function ProductImage({
  src,
  alt,
  className = '',
  category = '',
}) {
  const [error, setError] = useState(false);

  if (error || !src) {
    return (
      <div className={`${className} bg-gray-900/5 dark:bg-gray-900/20`}>
        {getProductSvg(category, alt)}
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      className={className}
      loading="lazy"
      onError={() => setError(true)}
    />
  );
}