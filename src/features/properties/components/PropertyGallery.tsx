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

  const previewImages = sortedImages
    .slice(1, Math.min(sortedImages.length, 3))
    .map((image, previewOffset) => {
      const index = (currentIndex + previewOffset + 1) % sortedImages.length;
      return { image: sortedImages[index], index };
    });
  const hiddenImagesCount = Math.max(0, sortedImages.length - 1 - previewImages.length);

  if (!currentImage) {
    return (
      <div className="flex aspect-video items-center justify-center rounded-xl bg-muted">
        <ImageIcon className="h-16 w-16 text-muted-foreground" />
      </div>
    );
  }

  return (
    <>
      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
        <div className="relative md:hidden">
          <div className="aspect-[16/11] overflow-hidden bg-gray-100">
            <img
              src={currentImage.url}
              alt={currentImage.alt_text || `${title} - Image ${currentIndex + 1}`}
              className="h-full w-full cursor-pointer object-cover"
              onClick={() => setIsLightboxOpen(true)}
            />
          </div>

          {sortedImages.length > 1 && (
            <>
              <div className="absolute inset-x-0 top-3 flex items-center justify-between px-3">
                <div className="rounded-full bg-black/55 px-2.5 py-1 text-xs font-medium text-white">
                  {currentIndex + 1} / {sortedImages.length}
                </div>
              </div>

              <Button
                variant="ghost"
                size="icon"
                className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-black/45 text-white hover:bg-black/60 hover:text-white"
                onClick={goToPrevious}
              >
                <ChevronLeft className="h-5 w-5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-black/45 text-white hover:bg-black/60 hover:text-white"
                onClick={goToNext}
              >
                <ChevronRight className="h-5 w-5" />
              </Button>

              <div className="absolute inset-x-0 bottom-3 flex justify-center gap-1.5 px-3">
                {sortedImages.map((image, index) => (
                  <button
                    key={image.id}
                    type="button"
                    className={cn(
                      'h-1.5 rounded-full transition-all',
                      index === currentIndex ? 'w-6 bg-white' : 'w-2 bg-white/45'
                    )}
                    onClick={() => setCurrentIndex(index)}
                  />
                ))}
              </div>
            </>
          )}
        </div>

        <div className="hidden gap-1 md:grid md:grid-cols-[minmax(0,2.1fr)_minmax(260px,1fr)]">
          <div className="relative min-h-[430px] overflow-hidden bg-gray-100">
            <img
              src={currentImage.url}
              alt={currentImage.alt_text || `${title} - Image ${currentIndex + 1}`}
              className="h-full w-full cursor-pointer object-cover"
              onClick={() => setIsLightboxOpen(true)}
            />

            {sortedImages.length > 1 && (
              <div className="absolute inset-x-0 top-0 flex items-center justify-between p-4">
                <div className="rounded-full bg-black/55 px-3 py-1.5 text-sm font-medium text-white">
                  {currentIndex + 1} / {sortedImages.length}
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="rounded-full bg-black/45 text-white hover:bg-black/60 hover:text-white"
                    onClick={goToPrevious}
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="rounded-full bg-black/45 text-white hover:bg-black/60 hover:text-white"
                    onClick={goToNext}
                  >
                    <ChevronRight className="h-5 w-5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="rounded-full bg-black/45 text-white hover:bg-black/60 hover:text-white"
                    onClick={() => setIsLightboxOpen(true)}
                  >
                    <ZoomIn className="h-5 w-5" />
                  </Button>
                </div>
              </div>
            )}
          </div>

          <div
            className={cn(
              'grid gap-1',
              previewImages.length > 1 ? 'grid-rows-2' : 'grid-rows-1'
            )}
          >
            {previewImages.map((preview, index) => (
              <button
                key={preview.image.id}
                type="button"
                className="group relative overflow-hidden bg-gray-100 text-left"
                onClick={() => setCurrentIndex(preview.index)}
              >
                <img
                  src={preview.image.url}
                  alt={preview.image.alt_text || `Preview ${index + 1}`}
                  className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                />

                {index === previewImages.length - 1 && hiddenImagesCount > 0 && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/45 text-2xl font-semibold text-white">
                    +{hiddenImagesCount}
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* {sortedImages.length > 1 && (
          <div className="flex gap-2 overflow-x-auto border-t border-gray-100 px-3 py-3">
            {sortedImages.map((image, index) => (
              <button
                key={image.id}
                type="button"
                onClick={() => setCurrentIndex(index)}
                className={cn(
                  'h-16 w-24 shrink-0 overflow-hidden rounded-xl border-2 transition-colors',
                  index === currentIndex ? 'border-primary' : 'border-transparent'
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
        )} */}
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
