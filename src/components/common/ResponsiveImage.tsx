import React, { useState, useEffect, useRef } from 'react';
import { ImageOff, ExternalLink } from 'lucide-react';

interface ResponsiveImageProps {
  src?: string;
  alt: string;
  className?: string;
  compact?: boolean;
}

/**
 * Extracts Google Drive file ID from any Google Drive link or ID
 */
export function extractGoogleDriveId(url: string): string | null {
  if (!url) return null;
  const trimmed = url.trim().replace(/^["']|["']$/g, '');

  // If it's directly a file ID
  if (/^[a-zA-Z0-9_-]{25,55}$/.test(trimmed)) {
    return trimmed;
  }

  if (
    trimmed.includes('drive.google.com') ||
    trimmed.includes('docs.google.com') ||
    trimmed.includes('googleusercontent.com')
  ) {
    const fileDMatch = trimmed.match(/\/file\/d\/([a-zA-Z0-9_-]+)/i);
    if (fileDMatch && fileDMatch[1]) return fileDMatch[1];

    const dMatch = trimmed.match(/\/d\/([a-zA-Z0-9_-]+)/i);
    if (dMatch && dMatch[1]) return dMatch[1];

    const idMatch = trimmed.match(/[?&]id=([a-zA-Z0-9_-]+)/i);
    if (idMatch && idMatch[1]) return idMatch[1];
  }

  return null;
}

/**
 * Builds candidate URLs in priority order for robust image loading.
 */
function getCandidateUrls(rawUrl: string): string[] {
  const trimmed = rawUrl.trim().replace(/^["']|["']$/g, '');
  if (!trimmed) return [];

  const driveId = extractGoogleDriveId(trimmed);
  if (driveId) {
    return [
      `https://drive.google.com/thumbnail?id=${driveId}&sz=w1600`,
      `https://lh3.googleusercontent.com/d/${driveId}`,
      `/api/image-proxy?url=${encodeURIComponent(`https://drive.google.com/thumbnail?id=${driveId}&sz=w1600`)}`,
      `/api/image-proxy?url=${encodeURIComponent(trimmed)}`,
    ];
  }

  // Dropbox
  if (trimmed.includes('dropbox.com') && trimmed.includes('dl=0')) {
    const directDropbox = trimmed.replace('dl=0', 'raw=1');
    return [
      directDropbox,
      `/api/image-proxy?url=${encodeURIComponent(directDropbox)}`,
    ];
  }

  // Standard web URL
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    return [
      trimmed,
      `/api/image-proxy?url=${encodeURIComponent(trimmed)}`,
    ];
  }

  return [trimmed];
}

export const ResponsiveImage: React.FC<ResponsiveImageProps> = ({
  src,
  alt,
  className = '',
  compact = false,
}) => {
  const [candidateIndex, setCandidateIndex] = useState(0);
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const imgRef = useRef<HTMLImageElement>(null);

  const rawUrl = (src || '').trim();
  const isDrive = Boolean(extractGoogleDriveId(rawUrl));
  const candidateUrls = getCandidateUrls(rawUrl);
  const currentSrc = candidateUrls[candidateIndex] || '';

  // Reset when src changes
  useEffect(() => {
    setCandidateIndex(0);
    setHasError(false);
    setIsLoading(true);
  }, [src]);

  // Check if already completed by browser
  useEffect(() => {
    if (imgRef.current && imgRef.current.complete && imgRef.current.naturalWidth > 0) {
      setIsLoading(false);
    }
  }, [currentSrc]);

  if (!rawUrl) {
    return null;
  }

  const handleImageError = () => {
    if (candidateIndex + 1 < candidateUrls.length) {
      // Try next fallback candidate
      setCandidateIndex((prev) => prev + 1);
      setIsLoading(true);
    } else {
      // Exhausted all options
      setIsLoading(false);
      setHasError(true);
    }
  };

  if (hasError) {
    if (compact) {
      return (
        <div
          title={isDrive ? 'Imagem do Drive: confirme se o acesso está "Qualquer pessoa com o link"' : 'Imagem indisponível'}
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-neutral-200 bg-neutral-100 text-neutral-400 dark:border-neutral-700 dark:bg-neutral-800"
        >
          <ImageOff className="h-4 w-4" />
        </div>
      );
    }

    return (
      <div
        id="image-load-error-notice"
        className="my-3 flex flex-col items-center justify-center gap-1.5 rounded-xl border border-neutral-200 bg-neutral-50 p-4 text-center text-xs text-neutral-600 dark:border-neutral-800 dark:bg-neutral-800/60 dark:text-neutral-300"
      >
        <div className="flex items-center gap-1.5 font-semibold text-neutral-700 dark:text-neutral-200">
          <ImageOff className="h-4 w-4 text-neutral-400" />
          <span>Imagem não carregada</span>
        </div>
        {isDrive && (
          <p className="max-w-md text-[11px] text-neutral-500 leading-relaxed dark:text-neutral-400">
            No Google Drive, verifique se o arquivo está compartilhado com{' '}
            <strong className="text-neutral-700 dark:text-neutral-200">"Qualquer pessoa com o link"</strong> como{' '}
            <strong className="text-neutral-700 dark:text-neutral-200">Leitor</strong>.
          </p>
        )}
      </div>
    );
  }

  if (compact) {
    return (
      <div className="relative shrink-0 overflow-hidden rounded-md">
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-neutral-200/80 animate-pulse text-[10px] dark:bg-neutral-700/80" />
        )}
        <img
          ref={imgRef}
          src={currentSrc}
          alt={alt}
          referrerPolicy="no-referrer"
          onLoad={() => setIsLoading(false)}
          onError={handleImageError}
          className={`${className} transition-opacity duration-200 ${
            isLoading ? 'opacity-0' : 'opacity-100'
          }`}
        />
      </div>
    );
  }

  return (
    <div
      id="responsive-image-container"
      className="relative my-3 flex min-h-[140px] sm:min-h-[180px] w-full items-center justify-center overflow-hidden rounded-xl border border-neutral-200 bg-neutral-100/70 p-2 dark:border-neutral-800 dark:bg-neutral-900/60"
    >
      {/* Loading Skeleton */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-neutral-100/90 text-xs font-medium text-neutral-400 animate-pulse dark:bg-neutral-800/80 dark:text-neutral-500">
          Carregando imagem...
        </div>
      )}

      {/* Image */}
      <img
        ref={imgRef}
        src={currentSrc}
        alt={alt}
        referrerPolicy="no-referrer"
        onLoad={() => setIsLoading(false)}
        onError={handleImageError}
        className={`${
          className || 'max-h-60 sm:max-h-80 w-auto max-w-full rounded-lg object-contain'
        } transition-opacity duration-300 ${isLoading ? 'opacity-0' : 'opacity-100'}`}
      />
    </div>
  );
};
