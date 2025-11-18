/**
 * Edit Property Page
 * Multi-step form for agents/owners to edit an existing property listing
 */

import { useEffect, useCallback, useMemo } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, ArrowRight, Save, Loader2, X } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { toast } from 'sonner';

// Form context and provider
import { PropertyFormProvider, usePropertyForm } from '../context/PropertyFormContext';

// Step components
import { FormStepper } from '../components/FormStepper';
import { StepBasicInfo } from '../components/StepBasicInfo';
import { StepLocation } from '../components/StepLocation';
import { StepDetails } from '../components/StepDetails';
import { StepAmenities } from '../components/StepAmenities';
import { StepImages } from '../components/StepImages';
import { StepReview } from '../components/StepReview';

// API hooks
import {
  useGetMyPropertyQuery,
  useUpdatePropertyMutation,
  useUploadMultipleImagesMutation,
} from '../property-management.api';

import type { PropertyFormState } from '../property-management.types';

/**
 * Step content renderer
 */
function StepContent() {
  const { state } = usePropertyForm();

  switch (state.currentStep) {
    case 1:
      return <StepBasicInfo />;
    case 2:
      return <StepLocation />;
    case 3:
      return <StepDetails />;
    case 4:
      return <StepAmenities />;
    case 5:
      return <StepImages />;
    case 6:
      return <StepReview />;
    default:
      return <StepBasicInfo />;
  }
}

/**
 * Form navigation and actions for editing
 */
function EditFormNavigation({ propertyId }: { propertyId: string }) {
  const { t, i18n } = useTranslation('property');
  const navigate = useNavigate();
  const lang = i18n.language;
  const { state, nextStep, prevStep, validateStep, setSubmitting, setErrors } = usePropertyForm();

  const [updateProperty, { isLoading: isUpdating }] = useUpdatePropertyMutation();
  const [uploadImages, { isLoading: isUploading }] = useUploadMultipleImagesMutation();

  const isLoading = isUpdating || isUploading || state.isSubmitting;
  const isFirstStep = state.currentStep === 1;
  const isLastStep = state.currentStep === 6;

  // Handle next step
  const handleNext = useCallback(() => {
    if (validateStep(state.currentStep)) {
      nextStep();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [state.currentStep, validateStep, nextStep]);

  // Handle previous step
  const handlePrev = useCallback(() => {
    prevStep();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [prevStep]);

  // Handle save changes
  const handleSave = useCallback(async () => {
    setSubmitting(true);

    try {
      const propertyData = {
        source_language: state.source_language,
        category_id: state.category_id,
        transaction_type: state.transaction_type,
        price: Number(state.price),
        additional_costs: state.additional_costs ? Number(state.additional_costs) : undefined,
        canton_id: state.canton_id,
        city_id: state.city_id,
        address: state.address,
        postal_code: state.postal_code || undefined,
        rooms: state.rooms ? Number(state.rooms) : undefined,
        surface: state.surface ? Number(state.surface) : undefined,
        amenities: state.amenities.length > 0 ? state.amenities : undefined,
      };

      await updateProperty({ id: propertyId, data: propertyData }).unwrap();
      toast.success(t('form.success.propertyUpdated', 'Property updated successfully!'));

      // Upload new images if any
      if (state.imageFiles.length > 0) {
        const formData = new FormData();
        state.imageFiles.forEach((file) => {
          formData.append('images', file);
        });

        await uploadImages({
          propertyId,
          files: formData,
        }).unwrap();

        toast.success(
          t('form.success.imagesUploaded', '{{count}} images uploaded successfully!', {
            count: state.imageFiles.length,
          })
        );
      }

      navigate(`/${lang}/dashboard/properties`);
    } catch (error: any) {
      console.error('Failed to update property:', error);
      const errorMessage =
        error?.data?.message ||
        t('form.errors.updateFailed', 'Failed to update property. Please try again.');
      setErrors({ submit: errorMessage });
      toast.error(errorMessage);
    } finally {
      setSubmitting(false);
    }
  }, [
    state,
    setSubmitting,
    setErrors,
    updateProperty,
    uploadImages,
    propertyId,
    navigate,
    lang,
    t,
  ]);

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t">
      {/* Left side buttons */}
      <div className="flex items-center gap-2">
        {!isFirstStep && (
          <Button type="button" variant="outline" onClick={handlePrev} disabled={isLoading}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            {t('form.navigation.previous', 'Previous')}
          </Button>
        )}
      </div>

      {/* Right side buttons */}
      <div className="flex items-center gap-2">
        {/* Save button - available on any step */}
        <Button type="button" variant="outline" onClick={handleSave} disabled={isLoading}>
          {isLoading ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Save className="h-4 w-4 mr-2" />
          )}
          {t('form.navigation.saveChanges', 'Save Changes')}
        </Button>

        {/* Next button (not on last step) */}
        {!isLastStep && (
          <Button type="button" onClick={handleNext} disabled={isLoading}>
            {t('form.navigation.next', 'Next')}
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        )}
      </div>
    </div>
  );
}

/**
 * Loading skeleton
 */
function EditPropertySkeleton() {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="h-6 w-48 bg-gray-200 rounded animate-pulse" />
            <div className="h-8 w-8 bg-gray-200 rounded animate-pulse" />
          </div>
        </div>
      </header>
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <aside className="lg:col-span-1">
            <div className="space-y-4">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="h-10 bg-gray-200 rounded animate-pulse" />
              ))}
            </div>
          </aside>
          <div className="lg:col-span-3">
            <div className="bg-white rounded-xl shadow-sm border p-6 sm:p-8 space-y-6">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-12 bg-gray-200 rounded animate-pulse" />
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

/**
 * Main edit form content with header
 */
function EditPropertyForm({ propertyId }: { propertyId: string }) {
  const { t, i18n } = useTranslation('property');
  const navigate = useNavigate();
  const lang = i18n.language;
  const { state } = usePropertyForm();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo / Back */}
            <div className="flex items-center gap-4">
              <Link
                to={`/${lang}/dashboard/properties`}
                className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
              >
                <ArrowLeft className="h-5 w-5" />
                <span className="hidden sm:inline">{t('form.header.back', 'Back')}</span>
              </Link>
              <div className="h-6 w-px bg-gray-200" />
              <h1 className="text-lg font-semibold text-gray-900">
                {t('form.header.editTitle', 'Edit Property')}
              </h1>
            </div>

            {/* Close button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate(`/${lang}/dashboard/properties`)}
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Stepper sidebar */}
          <aside className="lg:col-span-1">
            <div className="lg:sticky lg:top-24">
              <FormStepper currentStep={state.currentStep} />
            </div>
          </aside>

          {/* Form content */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-xl shadow-sm border p-6 sm:p-8">
              <StepContent />
              <EditFormNavigation propertyId={propertyId} />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

/**
 * Page wrapper that fetches property and provides form context
 */
export function EditPropertyPage() {
  const { id } = useParams<{ id: string }>();
  const { t, i18n } = useTranslation('property');
  const navigate = useNavigate();
  const lang = i18n.language;

  const { data: property, isLoading, isError, error } = useGetMyPropertyQuery(id!, { skip: !id });

  // Map property data to form state
  const initialFormState = useMemo<Partial<PropertyFormState> | undefined>(() => {
    if (!property) return undefined;

    return {
      source_language: property.source_language || 'en',
      category_id: property.category_id || '',
      transaction_type: property.transaction_type || 'rent',
      price: property.price?.toString() || '',
      additional_costs: property.additional_costs?.toString() || '',
      canton_id: property.canton_id || '',
      city_id: property.city_id || '',
      address: property.address || '',
      postal_code: property.postal_code || '',
      rooms: property.rooms?.toString() || '',
      surface: property.surface?.toString() || '',
      title: property.title || '',
      description: property.description || '',
      amenities: property.amenities || [],
      // Images are managed separately; new uploads only
      imageFiles: [],
      imagePreviews: [],
    };
  }, [property]);

  if (isLoading) {
    return <EditPropertySkeleton />;
  }

  if (isError || !property) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center space-y-4">
          <h2 className="text-2xl font-bold text-gray-900">
            {t('edit.error.title', 'Property not found')}
          </h2>
          <p className="text-gray-600">
            {t(
              'edit.error.description',
              'The property you are looking for does not exist or you do not have access.'
            )}
          </p>
          <Button onClick={() => navigate(`/${lang}/dashboard/properties`)}>
            {t('edit.error.backToProperties', 'Back to My Properties')}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <PropertyFormProvider initialState={initialFormState}>
      <EditPropertyForm propertyId={id!} />
    </PropertyFormProvider>
  );
}

export default EditPropertyPage;
