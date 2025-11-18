/**
 * Step 5: Property Images
 * Upload and manage property images
 */

import { useRef, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Camera, Upload, X, Star, GripVertical, AlertCircle } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { cn } from '@/shared/lib/utils';
import { usePropertyForm } from '../context/PropertyFormContext';

// Max file size (5MB)
const MAX_FILE_SIZE = 5 * 1024 * 1024;

// Allowed file types
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

// Max images
const MAX_IMAGES = 20;

// Min recommended images
const MIN_RECOMMENDED_IMAGES = 5;

export function StepImages() {
  const { t } = useTranslation('property');
  const { state, errors, addImage, removeImage, clearError } = usePropertyForm();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Validate file
  const validateFile = useCallback(
    (file: File): string | null => {
      if (!ALLOWED_TYPES.includes(file.type)) {
        return t('form.images.invalidType', 'Invalid file type. Please use JPEG, PNG, or WebP.');
      }
      if (file.size > MAX_FILE_SIZE) {
        return t('form.images.fileTooLarge', 'File is too large. Maximum size is 5MB.');
      }
      return null;
    },
    [t]
  );

  // Handle file selection
  const handleFileSelect = useCallback(
    (files: FileList | null) => {
      if (!files) return;

      // Calculate how many more images can be added
      const remainingSlots = MAX_IMAGES - state.imageFiles.length;
      const filesToAdd = Array.from(files).slice(0, remainingSlots);

      filesToAdd.forEach((file) => {
        const error = validateFile(file);
        if (error) {
          // Show error (could use toast here)
          console.error(error);
          return;
        }

        // Create preview URL
        const preview = URL.createObjectURL(file);
        addImage(file, preview);
        clearError('images');
      });
    },
    [state.imageFiles.length, validateFile, addImage, clearError]
  );

  // Handle drag and drop
  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.stopPropagation();
      handleFileSelect(e.dataTransfer.files);
    },
    [handleFileSelect]
  );

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  // Handle remove image
  const handleRemoveImage = useCallback(
    (index: number) => {
      // Revoke the preview URL to free memory
      const preview = state.imagePreviews[index];
      if (preview) {
        URL.revokeObjectURL(preview);
      }
      removeImage(index);
    },
    [state.imagePreviews, removeImage]
  );

  // Open file picker
  const openFilePicker = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const imageCount = state.imageFiles.length;
  const canAddMore = imageCount < MAX_IMAGES;
  const needsMoreImages = imageCount < MIN_RECOMMENDED_IMAGES;

  return (
    <div className="space-y-8">
      {/* Section Header */}
      <div>
        <h2 className="text-2xl font-semibold text-gray-900 flex items-center gap-2">
          <Camera className="h-6 w-6 text-primary" />
          {t('form.images.title', 'Property Photos')}
        </h2>
        <p className="mt-1 text-sm text-gray-600">
          {t('form.images.subtitle', 'Upload high-quality photos to showcase your property.')}
        </p>
      </div>

      {/* Image requirements */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="font-medium text-blue-900 mb-2">
          {t('form.images.requirements', 'Photo Guidelines')}
        </h4>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• {t('form.images.req1', 'Minimum 5 photos recommended (up to 20)')}</li>
          <li>• {t('form.images.req2', 'Maximum file size: 5MB per image')}</li>
          <li>• {t('form.images.req3', 'Formats: JPEG, PNG, or WebP')}</li>
          <li>• {t('form.images.req4', 'First image will be the main photo')}</li>
        </ul>
      </div>

      {/* Error message */}
      {errors.images && (
        <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
          <AlertCircle className="h-5 w-5 text-red-500" />
          <p className="text-sm text-red-600">{errors.images}</p>
        </div>
      )}

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept={ALLOWED_TYPES.join(',')}
        multiple
        onChange={(e) => handleFileSelect(e.target.files)}
        className="hidden"
      />

      {/* Drop zone */}
      {canAddMore && (
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onClick={openFilePicker}
          className={cn(
            'border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors',
            'hover:border-primary hover:bg-primary/5',
            'focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2',
            errors.images ? 'border-red-300' : 'border-gray-300'
          )}
        >
          <Upload className="h-12 w-12 mx-auto text-gray-400" />
          <p className="mt-4 text-lg font-medium text-gray-900">
            {t('form.images.dropzone', 'Drop your images here')}
          </p>
          <p className="mt-1 text-sm text-gray-600">
            {t('form.images.orClick', 'or click to browse')}
          </p>
          <Button type="button" variant="outline" className="mt-4">
            <Upload className="h-4 w-4 mr-2" />
            {t('form.images.selectFiles', 'Select Files')}
          </Button>
        </div>
      )}

      {/* Image counter */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-600">
          <span className={cn('font-semibold', needsMoreImages && 'text-amber-600')}>
            {imageCount}
          </span>{' '}
          / {MAX_IMAGES} {t('form.images.imagesUploaded', 'images')}
        </p>
        {needsMoreImages && imageCount > 0 && (
          <p className="text-sm text-amber-600">
            {t('form.images.addMore', 'Add at least {{count}} more for best results', {
              count: MIN_RECOMMENDED_IMAGES - imageCount,
            })}
          </p>
        )}
      </div>

      {/* Image preview grid */}
      {imageCount > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {state.imagePreviews.map((preview, index) => (
            <div
              key={preview}
              className={cn(
                'relative group aspect-[4/3] rounded-lg overflow-hidden border-2',
                index === 0 ? 'border-primary ring-2 ring-primary ring-offset-2' : 'border-gray-200'
              )}
            >
              {/* Image */}
              <img
                src={preview}
                alt={`Property image ${index + 1}`}
                className="w-full h-full object-cover"
              />

              {/* Primary badge */}
              {index === 0 && (
                <div className="absolute top-2 left-2 flex items-center gap-1 px-2 py-1 bg-primary text-white text-xs font-medium rounded-full">
                  <Star className="h-3 w-3 fill-current" />
                  {t('form.images.mainPhoto', 'Main')}
                </div>
              )}

              {/* Drag handle (for future reordering) */}
              <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="p-1 bg-white/80 rounded shadow">
                  <GripVertical className="h-4 w-4 text-gray-600" />
                </div>
              </div>

              {/* Remove button */}
              <button
                type="button"
                onClick={() => handleRemoveImage(index)}
                className={cn(
                  'absolute bottom-2 right-2 p-2 rounded-full',
                  'bg-red-500 text-white opacity-0 group-hover:opacity-100',
                  'hover:bg-red-600 transition-all',
                  'focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2'
                )}
              >
                <X className="h-4 w-4" />
              </button>

              {/* Image number */}
              <div className="absolute bottom-2 left-2 px-2 py-0.5 bg-black/50 text-white text-xs rounded">
                {index + 1}
              </div>
            </div>
          ))}

          {/* Add more button */}
          {canAddMore && (
            <button
              type="button"
              onClick={openFilePicker}
              className={cn(
                'aspect-[4/3] rounded-lg border-2 border-dashed border-gray-300',
                'flex flex-col items-center justify-center',
                'hover:border-primary hover:bg-primary/5 transition-colors',
                'focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2'
              )}
            >
              <Upload className="h-6 w-6 text-gray-400" />
              <span className="mt-1 text-sm text-gray-500">
                {t('form.images.addMore2', 'Add more')}
              </span>
            </button>
          )}
        </div>
      )}

      {/* Empty state */}
      {imageCount === 0 && (
        <div className="text-center py-8">
          <Camera className="h-16 w-16 mx-auto text-gray-300" />
          <p className="mt-2 text-gray-500">
            {t('form.images.noImages', 'No images uploaded yet')}
          </p>
        </div>
      )}

      {/* Tips */}
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
        <h4 className="font-medium text-amber-900 mb-2">
          {t('form.images.photoTips', 'Photo Tips')}
        </h4>
        <ul className="text-sm text-amber-800 space-y-1">
          <li>• {t('form.images.tip1', 'Use natural lighting when possible')}</li>
          <li>• {t('form.images.tip2', 'Include photos of all rooms')}</li>
          <li>• {t('form.images.tip3', 'Show exterior and views if applicable')}</li>
          <li>• {t('form.images.tip4', 'Keep spaces tidy and decluttered')}</li>
        </ul>
      </div>
    </div>
  );
}

export default StepImages;
