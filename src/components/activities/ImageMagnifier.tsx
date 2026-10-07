import React, { useState, useRef, useEffect, useCallback } from 'react';
import { extractGoogleDriveId } from '../common/ResponsiveImage';
import { ImageOff, Sparkles } from 'lucide-react';

interface ImageMagnifierProps {
  src?: string;
  alt: string;
  className?: string;
  zoomLevel?: number; // Default 2.4x
  lensSize?: number; // Default 140px
}

/**
 * ImageMagnifier:
 * - Desktop: moving magnifier lens centered on cursor
 * - Mobile (Option A): moving magnifier lens positioned above finger touch point
 *   so the finger does not obscure the magnified view.
 */
export const ImageMagnifier: React.FC<ImageMagnifierProps> = ({
  src = '',
  alt,
  className = '',
  zoomLevel = 2.4,
  lensSize = 140,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);

  const [isActive, setIsActive] = useState(false);
  const [isTouch, setIsTouch] = useState(false);
  const [pointer, setPointer] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [imgDimensions, setImgDimensions] = useState<{ width: number; height: number; left: number; top: number }>({
    width: 0,
    height: 0,
    left: 0,
    top: 0,
  });

  // URL fallback management matching ResponsiveImage
  const [currentSrcIndex, setCurrentSrcIndex] = useState(0);
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const candidateUrls = React.useMemo(() => {
    const trimmed = (src || '').trim().replace(/^["']|["']$/g, '');
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

    if (trimmed.startsWith('http')) {
      return [
        trimmed,
        `/api/image-proxy?url=${encodeURIComponent(trimmed)}`,
      ];
    }

    return [trimmed];
  }, [src]);

  const activeSrc = candidateUrls[currentSrcIndex] || src;

  const handleImageError = () => {
    if (currentSrcIndex + 1 < candidateUrls.length) {
      setCurrentSrcIndex((prev) => prev + 1);
    } else {
      setHasError(true);
      setIsLoading(false);
    }
  };

  const handleImageLoad = () => {
    setIsLoading(false);
    setHasError(false);
    updateImgDimensions();
  };

  // Measure rendered image rect relative to container
  const updateImgDimensions = useCallback(() => {
    if (!imgRef.current || !containerRef.current) return;
    const imgRect = imgRef.current.getBoundingClientRect();
    const contRect = containerRef.current.getBoundingClientRect();

    setImgDimensions({
      width: imgRect.width,
      height: imgRect.height,
      left: imgRect.left - contRect.left,
      top: imgRect.top - contRect.top,
    });
  }, []);

  useEffect(() => {
    window.addEventListener('resize', updateImgDimensions);
    return () => window.removeEventListener('resize', updateImgDimensions);
  }, [updateImgDimensions]);

  const calculatePointerCoords = (clientX: number, clientY: number, touchMode: boolean) => {
    if (!imgRef.current) return null;
    const rect = imgRef.current.getBoundingClientRect();

    // Check bounds
    if (
      clientX < rect.left ||
      clientX > rect.right ||
      clientY < rect.top ||
      clientY > rect.bottom
    ) {
      return null;
    }

    const x = clientX - rect.left;
    const y = clientY - rect.top;

    return { x, y, width: rect.width, height: rect.height };
  };

  // Mouse handlers (Desktop)
  const handleMouseEnter = (e: React.MouseEvent) => {
    setIsTouch(false);
    updateImgDimensions();
    const coords = calculatePointerCoords(e.clientX, e.clientY, false);
    if (coords) {
      setPointer({ x: coords.x, y: coords.y });
      setIsActive(true);
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    setIsTouch(false);
    const coords = calculatePointerCoords(e.clientX, e.clientY, false);
    if (coords) {
      setPointer({ x: coords.x, y: coords.y });
      if (!isActive) setIsActive(true);
    } else {
      setIsActive(false);
    }
  };

  const handleMouseLeave = () => {
    setIsActive(false);
  };

  // Touch handlers (Mobile - Option A: lens floating above the finger)
  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length !== 1) return;
    setIsTouch(true);
    updateImgDimensions();
    const touch = e.touches[0];
    const coords = calculatePointerCoords(touch.clientX, touch.clientY, true);
    if (coords) {
      setPointer({ x: coords.x, y: coords.y });
      setIsActive(true);
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length !== 1) return;
    setIsTouch(true);
    const touch = e.touches[0];
    const coords = calculatePointerCoords(touch.clientX, touch.clientY, true);
    if (coords) {
      setPointer({ x: coords.x, y: coords.y });
      if (!isActive) setIsActive(true);
    } else {
      setIsActive(false);
    }
  };

  const handleTouchEnd = () => {
    setIsActive(false);
  };

  // Lens geometry relative to the image
  const { width: imgW, height: imgH, left: imgOffsetX, top: imgOffsetY } = imgDimensions;

  let lensX = pointer.x - lensSize / 2;
  let lensY = pointer.y - lensSize / 2;

  // Option A for Touch: Position lens offset ABOVE finger so finger doesn't block the view!
  if (isTouch) {
    // If there's enough room above the touch point, place lens ~80px above
    if (pointer.y - lensSize - 30 >= 0) {
      lensY = pointer.y - lensSize - 30;
    } else {
      // If near top edge, place lens below finger so it stays visible
      lensY = pointer.y + 45;
    }
  }

  // Constrain lens within image bounds so it stays within visible area
  if (imgW > 0 && imgH > 0) {
    lensX = Math.max(4, Math.min(imgW - lensSize - 4, lensX));
    lensY = Math.max(4, Math.min(imgH - lensSize - 4, lensY));
  }

  // Exact background position formula to magnify the point under (pointer.x, pointer.y)
  const bgPosX = lensSize / 2 - pointer.x * zoomLevel;
  const bgPosY = lensSize / 2 - pointer.y * zoomLevel;

  if (hasError) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center rounded-xl bg-neutral-100 dark:bg-neutral-800 text-neutral-500">
        <ImageOff className="h-8 w-8 mb-2 text-neutral-400" />
        <p className="text-xs font-semibold">Não foi possível carregar a imagem anatômica.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center w-full">
      {/* Outer Container */}
      <div
        ref={containerRef}
        onMouseEnter={handleMouseEnter}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onTouchCancel={handleTouchEnd}
        style={{ touchAction: 'none' }} // Prevents page scrolling while moving the magnifier lens
        className="relative flex items-center justify-center w-full overflow-hidden rounded-xl bg-neutral-50 p-2 sm:p-4 select-none dark:bg-neutral-900/60 cursor-crosshair"
      >
        {/* Loading skeleton */}
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-neutral-100/90 text-xs font-medium text-neutral-400 animate-pulse dark:bg-neutral-800/80 dark:text-neutral-500">
            Carregando imagem anatômica...
          </div>
        )}

        {/* Base Image */}
        <img
          ref={imgRef}
          src={activeSrc}
          alt={alt}
          referrerPolicy="no-referrer"
          onLoad={handleImageLoad}
          onError={handleImageError}
          className={`${className} select-none pointer-events-none transition-opacity duration-200 ${
            isLoading ? 'opacity-0' : 'opacity-100'
          }`}
        />

        {/* Magnifier Lens */}
        {isActive && !isLoading && imgW > 0 && imgH > 0 && (
          <>
            {/* On Touch: Reticle indicator directly under finger */}
            {isTouch && (
              <div
                style={{
                  left: `${imgOffsetX + pointer.x - 12}px`,
                  top: `${imgOffsetY + pointer.y - 12}px`,
                }}
                className="pointer-events-none absolute h-6 w-6 rounded-full border-2 border-emerald-500 bg-emerald-500/20 shadow-md animate-pulse z-20"
              />
            )}

            {/* The Floating Magnifying Glass Lens */}
            <div
              style={{
                width: `${lensSize}px`,
                height: `${lensSize}px`,
                left: `${imgOffsetX + lensX}px`,
                top: `${imgOffsetY + lensY}px`,
                backgroundImage: `url(${activeSrc})`,
                backgroundRepeat: 'no-repeat',
                backgroundSize: `${imgW * zoomLevel}px ${imgH * zoomLevel}px`,
                backgroundPosition: `${bgPosX}px ${bgPosY}px`,
              }}
              className="pointer-events-none absolute z-30 rounded-full border-4 border-white shadow-2xl shadow-black/50 ring-2 ring-emerald-500/80 ring-offset-2 ring-offset-neutral-900/30 overflow-hidden dark:border-neutral-800 transition-opacity duration-150 animate-in fade-in zoom-in-95"
            >
              {/* Subtle glass reflection highlight */}
              <div className="absolute inset-0 bg-radial from-white/20 via-transparent to-black/10 pointer-events-none" />

              {/* Center reticle dot for precision */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="h-1.5 w-1.5 rounded-full bg-emerald-500/80 shadow-xs" />
              </div>
            </div>
          </>
        )}
      </div>

      {/* Helpful Hint Bar below image */}
      <div className="mt-2 flex items-center gap-2 text-[11px] text-neutral-500 dark:text-neutral-400">
        <Sparkles className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
        <span>
          <strong>Lupa de precisão:</strong> Passe o mouse ou deslize o dedo sobre a imagem para ampliar qualquer área e ler os números com nitidez.
        </span>
      </div>
    </div>
  );
};
