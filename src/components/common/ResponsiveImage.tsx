import React, { useState } from 'react';
import { ImageOff } from 'lucide-react';

interface ResponsiveImageProps {
  src?: string;
  alt: string;
}

export const ResponsiveImage: React.FC<ResponsiveImageProps> = ({ src, alt }) => {
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  if (!src || !src.trim()) {
    return null;
  }

  const cleanSrc = src.trim();

  if (hasError) {
    return (
      <div
        id="image-load-error-notice"
        className="my-3 flex items-center justify-center gap-2 rounded-lg border border-neutral-200 bg-neutral-50 p-2.5 text-xs text-neutral-500 dark:border-neutral-800 dark:bg-neutral-800/60 dark:text-neutral-400"
      >
        <ImageOff className="h-4 w-4 shrink-0 text-neutral-400" />
        <span>Imagem não pôde ser carregada</span>
      </div>
    );
  }

  return (
    <div
      id="responsive-image-container"
      className="my-3 flex w-full items-center justify-center overflow-hidden rounded-xl border border-neutral-200 bg-neutral-900/5 p-1.5 dark:border-neutral-800 dark:bg-neutral-950/40"
    >
      {isLoading && (
        <div className="flex h-36 w-full animate-pulse items-center justify-center rounded-lg bg-neutral-200 text-xs text-neutral-400 dark:bg-neutral-800 dark:text-neutral-500">
          Carregando imagem ilustrativa...
        </div>
      )}
      <img
        src={cleanSrc}
        alt={alt}
        loading="lazy"
        referrerPolicy="no-referrer"
        onLoad={() => setIsLoading(false)}
        onError={() => {
          setIsLoading(false);
          setHasError(true);
        }}
        className={`max-h-56 sm:max-h-72 w-auto max-w-full rounded-lg object-contain transition-opacity duration-300 ${
          isLoading ? 'hidden' : 'block'
        }`}
      />
    </div>
  );
};
