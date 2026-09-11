import React, { useState, useEffect, useRef } from 'react';
import { ImageOff } from 'lucide-react';

interface ResponsiveImageProps {
  src?: string;
  alt: string;
}

/**
 * Normalizes image URLs from common hosting services:
 * - Google Drive share links -> direct googleusercontent view
 * - Dropbox share links -> direct raw link
 */
function normalizeImageUrl(url: string): string {
  const trimmed = url.trim();

  // Google Drive: https://drive.google.com/file/d/FILE_ID/view or /open?id=FILE_ID
  if (trimmed.includes('drive.google.com')) {
    const fileIdMatch =
      trimmed.match(/\/file\/d\/([a-zA-Z0-9_-]+)/) ||
      trimmed.match(/[?&]id=([a-zA-Z0-9_-]+)/);
    if (fileIdMatch && fileIdMatch[1]) {
      return `https://lh3.googleusercontent.com/d/${fileIdMatch[1]}`;
    }
  }

  // Dropbox: dl=0 -> raw=1
  if (trimmed.includes('dropbox.com') && trimmed.includes('dl=0')) {
    return trimmed.replace('dl=0', 'raw=1');
  }

  return trimmed;
}

export const ResponsiveImage: React.FC<ResponsiveImageProps> = ({ src, alt }) => {
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [hasTriedProxy, setHasTriedProxy] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  const initialUrl = src ? normalizeImageUrl(src) : '';
  const [currentSrc, setCurrentSrc] = useState(initialUrl);

  // Reset states when src changes
  useEffect(() => {
    if (!src || !src.trim()) {
      return;
    }
    const normalized = normalizeImageUrl(src);
    setCurrentSrc(normalized);
    setIsLoading(true);
    setHasError(false);
    setHasTriedProxy(false);
  }, [src]);

  // Check if image is already cached/completed by browser
  useEffect(() => {
    if (imgRef.current && imgRef.current.complete && imgRef.current.naturalWidth > 0) {
      setIsLoading(false);
    }
  }, [currentSrc]);

  if (!src || !src.trim()) {
    return null;
  }

  const handleImageError = () => {
    // If direct link fails (e.g., hotlinking blocked or CORS issue), try via server-side image proxy
    if (!hasTriedProxy && initialUrl.startsWith('http')) {
      setHasTriedProxy(true);
      setCurrentSrc(`/api/image-proxy?url=${encodeURIComponent(initialUrl)}`);
    } else {
      setIsLoading(false);
      setHasError(true);
    }
  };

  if (hasError) {
    return (
      <div
        id="image-load-error-notice"
        className="my-3.5 flex items-center justify-center gap-2 rounded-xl border border-neutral-200 bg-neutral-50 p-3 text-xs text-neutral-500 dark:border-neutral-800 dark:bg-neutral-800/60 dark:text-neutral-400"
      >
        <ImageOff className="h-4 w-4 shrink-0 text-neutral-400" />
        <span>Imagem não disponível</span>
      </div>
    );
  }

  return (
    <div
      id="responsive-image-container"
      className="relative my-4 flex min-h-[140px] sm:min-h-[200px] w-full items-center justify-center overflow-hidden rounded-xl border border-neutral-200 bg-neutral-100/70 p-2 dark:border-neutral-800 dark:bg-neutral-900/60"
    >
      {/* Loading Skeleton */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-neutral-100/90 text-xs font-medium text-neutral-400 animate-pulse dark:bg-neutral-800/80 dark:text-neutral-500">
          Carregando imagem...
        </div>
      )}

      {/* Image: Stays in DOM with opacity transition, avoiding browser load event suppression */}
      <img
        ref={imgRef}
        src={currentSrc}
        alt={alt}
        referrerPolicy="no-referrer"
        onLoad={() => setIsLoading(false)}
        onError={handleImageError}
        className={`max-h-60 sm:max-h-80 w-auto max-w-full rounded-lg object-contain transition-opacity duration-300 ${
          isLoading ? 'opacity-0' : 'opacity-100'
        }`}
      />
    </div>
  );
};
