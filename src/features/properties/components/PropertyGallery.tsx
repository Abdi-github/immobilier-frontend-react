import { useState } from 'react';
import { ChevronLeft, ChevronRight, X, ZoomIn, ImageIcon } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { cn } from '@/shared/lib/utils';
import type { PropertyImage } from '../properties.types';

interface PropertyGalleryProps {
  images: PropertyImage[];
  title: string;
}

export function PropertyGallery({ images, title }: PropertyGalleryProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

  const sortedImages = [...images].sort((a, b) => {
    if (a.is_primary && !b.is_primary) return -1;
    if (!a.is_primary && b.is_primary) return 1;
    return a.order - b.order;
  });

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev === 0 ? sortedImages.length - 1 : prev - 1));
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev === sortedImages.length - 1 ? 0 : prev + 1));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowLeft') goToPrevious();
    if (e.key === 'ArrowRight') goToNext();
    if (e.key === 'Escape') setIsLightboxOpen(false);
  };

  if (!sortedImages.length) {
    return (
      <div className="flex aspect-video items-center justify-center rounded-xl bg-muted">
        <p className="text-muted-foreground">No images available</p>
      </div>
    );
  }

  const currentImage = sortedImages[currentIndex];

  if (!currentImage) {
    return (
      <div className="flex aspect-video items-center justify-center rounded-xl bg-muted">
        <ImageIcon className="h-16 w-16 text-muted-foreground" />
      </div>
    );
  }

  return (
    <>
      {/* Main gallery */}
      <div className="space-y-4">
        {/* Main image */}
        <div className="group relative overflow-hidden rounded-xl bg-muted">
          <img
            src={currentImage.url}
            alt={currentImage.alt_text || `${title} - Image ${currentIndex + 1}`}
            className="aspect-video w-full cursor-pointer object-cover transition-transform duration-300 group-hover:scale-105"
            onClick={() => setIsLightboxOpen(true)}
          />

          {/* Navigation arrows */}
          {sortedImages.length > 1 && (
            <>
              <Button
                variant="ghost"
                size="icon"
                className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/80 backdrop-blur-sm hover:bg-white"
                onClick={goToPrevious}
              >
                <ChevronLeft className="h-6 w-6" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/80 backdrop-blur-sm hover:bg-white"
                onClick={goToNext}
              >
                <ChevronRight className="h-6 w-6" />
              </Button>
            </>
          )}

          {/* Zoom button */}
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-4 top-4 bg-white/80 backdrop-blur-sm hover:bg-white"
            onClick={() => setIsLightboxOpen(true)}
          >
            <ZoomIn className="h-5 w-5" />
          </Button>

          {/* Image counter */}
          <div className="absolute bottom-4 left-4 rounded-full bg-black/60 px-3 py-1 text-sm text-white">
            {currentIndex + 1} / {sortedImages.length}
          </div>
        </div>

        {/* Thumbnails */}
        {sortedImages.length > 1 && (
          <div className="flex gap-2 overflow-x-auto pb-2">
            {sortedImages.map((image, index) => (
              <button
                key={image.id}
                onClick={() => setCurrentIndex(index)}
                className={cn(
                  'relative h-20 w-28 shrink-0 overflow-hidden rounded-lg transition-all',
                  index === currentIndex
                    ? 'ring-2 ring-primary ring-offset-2'
                    : 'opacity-70 hover:opacity-100'
                )}
              >
                <img
                  src={image.url}
                  alt={image.alt_text || `Thumbnail ${index + 1}`}
                  className="h-full w-full object-cover"
                />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Lightbox */}
      {isLightboxOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90"
          onClick={() => setIsLightboxOpen(false)}
          onKeyDown={handleKeyDown}
          tabIndex={0}
        >
          {/* Close button */}
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-4 top-4 text-white hover:bg-white/20"
            onClick={() => setIsLightboxOpen(false)}
          >
            <X className="h-6 w-6" />
          </Button>

          {/* Navigation */}
          {sortedImages.length > 1 && (
            <>
              <Button
                variant="ghost"
                size="icon"
                className="absolute left-4 top-1/2 -translate-y-1/2 text-white hover:bg-white/20"
                onClick={(e) => {
                  e.stopPropagation();
                  goToPrevious();
                }}
              >
                <ChevronLeft className="h-8 w-8" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-4 top-1/2 -translate-y-1/2 text-white hover:bg-white/20"
                onClick={(e) => {
                  e.stopPropagation();
                  goToNext();
                }}
              >
                <ChevronRight className="h-8 w-8" />
              </Button>
            </>
          )}

          {/* Image */}
          <img
            src={currentImage.url}
            alt={currentImage.alt_text || `${title} - Image ${currentIndex + 1}`}
            className="max-h-[90vh] max-w-[90vw] object-contain"
            onClick={(e) => e.stopPropagation()}
          />

          {/* Counter */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full bg-black/60 px-4 py-2 text-white">
            {currentIndex + 1} / {sortedImages.length}
          </div>
        </div>
      )}
    </>
  );
}
