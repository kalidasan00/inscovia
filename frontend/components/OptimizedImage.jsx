// frontend/components/OptimizedImage.jsx - FAST IMAGE COMPONENT
"use client";
import { useState } from 'react';
import Image from 'next/image';

export default function OptimizedImage({
  src,
  alt,
  width,
  height,
  className = '',
  priority = false,
  fill = false,
  objectFit = 'cover',
  sizes,
  onLoad,
}) {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  // Fallback image for errors
  const fallbackImage = '/placeholder-image.png';

  const handleLoad = (e) => {
    setIsLoading(false);
    if (onLoad) onLoad(e);
  };

  const handleError = () => {
    setHasError(true);
    setIsLoading(false);
  };

  // If regular img tag needed (external URLs)
  if (src?.includes('cloudinary.com') || !src?.startsWith('/')) {
    return (
      <div className={`relative overflow-hidden ${className}`}>
        {isLoading && (
          <div className="absolute inset-0 bg-gray-200 animate-pulse" />
        )}
        <img
          src={hasError ? fallbackImage : src}
          alt={alt}
          loading={priority ? 'eager' : 'lazy'}
          className={`${className} ${isLoading ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300`}
          onLoad={handleLoad}
          onError={handleError}
          style={{ objectFit }}
        />
      </div>
    );
  }

  // Use Next.js Image for local images
  if (fill) {
    return (
      <div className={`relative ${className}`}>
        {isLoading && (
          <div className="absolute inset-0 bg-gray-200 animate-pulse" />
        )}
        <Image
          src={hasError ? fallbackImage : src}
          alt={alt}
          fill
          priority={priority}
          sizes={sizes || '100vw'}
          className={`${isLoading ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300`}
          style={{ objectFit }}
          onLoad={handleLoad}
          onError={handleError}
        />
      </div>
    );
  }

  return (
    <div className={`relative ${className}`}>
      {isLoading && (
        <div
          className="absolute inset-0 bg-gray-200 animate-pulse"
          style={{ width, height }}
        />
      )}
      <Image
        src={hasError ? fallbackImage : src}
        alt={alt}
        width={width}
        height={height}
        priority={priority}
        sizes={sizes}
        className={`${isLoading ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300`}
        onLoad={handleLoad}
        onError={handleError}
      />
    </div>
  );
}

// ✅ USAGE EXAMPLES:

// 1. Center Logo (priority load)
// <OptimizedImage
//   src={center.logo}
//   alt={center.name}
//   width={96}
//   height={96}
//   priority={true}
// />

// 2. Cover Image (lazy load)
// <OptimizedImage
//   src={center.image}
//   alt={center.name}
//   fill={true}
//   sizes="(max-width: 768px) 100vw, 50vw"
// />

// 3. Gallery Images (lazy load)
// <OptimizedImage
//   src={img}
//   alt="Gallery"
//   width={300}
//   height={300}
// />