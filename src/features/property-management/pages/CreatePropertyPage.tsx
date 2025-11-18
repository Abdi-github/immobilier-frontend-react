/**
 * Create Property Page
 * Multi-step form for agents/owners to create a new property listing
 */

import { useEffect, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, ArrowRight, Save, Send, Loader2, X } from 'lucide-react';
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
  useCreatePropertyMutation,
  useUploadMultipleImagesMutation,
  useCreateTranslationMutation,
} from '../property-management.api';

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
 * Form navigation and actions
 */
function FormNavigation() {
  const { t, i18n } = useTranslation('property');
  const navigate = useNavigate();
  const lang = i18n.language;
  const {
    state,
    nextStep,
    prevStep,
    validateStep,
    setSubmitting,
    setCreatedPropertyId,
    setErrors,
  } = usePropertyForm();

  const [createProperty, { isLoading: isCreating }] = useCreatePropertyMutation();
  const [uploadImages, { isLoading: isUploading }] = useUploadMultipleImagesMutation();
  const [createTranslation, { isLoading: isCreatingTranslation }] = useCreateTranslationMutation();

  const isLoading = isCreating || isUploading || isCreatingTranslation || state.isSubmitting;
  const isFirstStep = state.currentStep === 1;
  const isLastStep = state.currentStep === 6;

  // Handle next step
  const handleNext = useCallback(() => {
    if (validateStep(state.currentStep)) {
      nextStep();
      // Scroll to top
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [state.currentStep, validateStep, nextStep]);

  // Handle previous step
  const handlePrev = useCallback(() => {
    prevStep();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [prevStep]);

  // Handle form submission
  const handleSubmit = useCallback(async () => {
    // Validate final step
    if (!validateStep(state.currentStep)) {
      return;
    }

    setSubmitting(true);

    try {
      // 1. Create property
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
        title: state.title,
        description: state.description,
      };

      const createdProperty = await createProperty(propertyData).unwrap();
      const propertyId = createdProperty.id;
      setCreatedPropertyId(propertyId);

      toast.success(t('form.success.propertyCreated', 'Property created successfully!'));

      // 2. Create translation for source language
      await createTranslation({
        property_id: propertyId,
        language: state.source_language,
        title: state.title,
        description: state.description,
        source: 'original',
      }).unwrap();

      // 3. Upload images if any
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

      // Navigate to property management or success page
      toast.success(
        t('form.success.complete', 'Property listing created! You can now submit it for approval.')
      );
      navigate(`/${lang}/dashboard/properties/${propertyId}`);
    } catch (error: any) {
      console.error('Failed to create property:', error);
      const errorMessage =
        error?.data?.message ||
        t('form.errors.createFailed', 'Failed to create property. Please try again.');
      setErrors({ submit: errorMessage });
      toast.error(errorMessage);
    } finally {
      setSubmitting(false);
    }
  }, [
    state,
    validateStep,
    setSubmitting,
    setCreatedPropertyId,
    setErrors,
    createProperty,
    createTranslation,
    uploadImages,
    navigate,
    lang,
    t,
  ]);

  // Handle save draft
  const handleSaveDraft = useCallback(async () => {
    // Minimal validation for draft
    if (!state.category_id || !state.price) {
      toast.error(
        t('form.errors.minimalRequired', 'Please fill in at least the category and price.')
      );
      return;
    }

    setSubmitting(true);

    try {
      const propertyData = {
        source_language: state.source_language,
        category_id: state.category_id,
        transaction_type: state.transaction_type,
        price: Number(state.price),
        additional_costs: state.additional_costs ? Number(state.additional_costs) : undefined,
        canton_id: state.canton_id || undefined,
        city_id: state.city_id || undefined,
        address: state.address || 'Draft - Address pending',
        postal_code: state.postal_code || undefined,
        rooms: state.rooms ? Number(state.rooms) : undefined,
        surface: state.surface ? Number(state.surface) : undefined,
        amenities: state.amenities.length > 0 ? state.amenities : undefined,
        title: state.title || 'Draft Property',
        description: state.description || 'Description pending...',
      };

      const createdProperty = await createProperty(propertyData).unwrap();
      setCreatedPropertyId(createdProperty.id);

      toast.success(t('form.success.draftSaved', 'Draft saved successfully!'));
      navigate(`/${lang}/dashboard/properties`);
    } catch (error: any) {
      console.error('Failed to save draft:', error);
      const errorMessage =
        error?.data?.message || t('form.errors.saveFailed', 'Failed to save draft.');
      toast.error(errorMessage);
    } finally {
      setSubmitting(false);
    }
  }, [state, setSubmitting, setCreatedPropertyId, createProperty, navigate, lang, t]);

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
        {/* Save Draft button - only show on steps 1-5 */}
        {!isLastStep && (
          <Button type="button" variant="outline" onClick={handleSaveDraft} disabled={isLoading}>
            {isLoading ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Save className="h-4 w-4 mr-2" />
            )}
            {t('form.navigation.saveDraft', 'Save Draft')}
          </Button>
        )}

        {/* Next / Submit button */}
        {isLastStep ? (
          <Button
            type="button"
            onClick={handleSubmit}
            disabled={isLoading}
            className="min-w-[150px]"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                {t('form.navigation.creating', 'Creating...')}
              </>
            ) : (
              <>
                <Send className="h-4 w-4 mr-2" />
                {t('form.navigation.createProperty', 'Create Property')}
              </>
            )}
          </Button>
        ) : (
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
 * Main form content with header
 */
function CreatePropertyForm() {
  const { t, i18n } = useTranslation('property');
  const navigate = useNavigate();
  const lang = i18n.language;
  const { state } = usePropertyForm();

  // Warn before leaving if form has data
  useEffect(() => {
    const hasData =
      state.category_id ||
      state.price ||
      state.title ||
      state.description ||
      state.imageFiles.length > 0;

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasData && !state.createdPropertyId) {
        e.preventDefault();
        e.returnValue = '';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [state]);

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
                {t('form.header.title', 'Create New Property')}
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
              <FormNavigation />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

/**
 * Page wrapper with context provider
 */
export function CreatePropertyPage() {
  return (
    <PropertyFormProvider>
      <CreatePropertyForm />
    </PropertyFormProvider>
  );
}

export default CreatePropertyPage;
