/**
 * Property Management Feature
 * Module for agents/owners to create and manage property listings
 */

// Pages
export { CreatePropertyPage } from './pages/CreatePropertyPage';
export { EditPropertyPage } from './pages/EditPropertyPage';
export { MyPropertiesPage } from './pages/MyPropertiesPage';

// Components
export { FormStepper } from './components/FormStepper';
export { StepBasicInfo } from './components/StepBasicInfo';
export { StepLocation } from './components/StepLocation';
export { StepDetails } from './components/StepDetails';
export { StepAmenities } from './components/StepAmenities';
export { StepImages } from './components/StepImages';
export { StepReview } from './components/StepReview';
export { PropertyStatusBadge } from './components/PropertyStatusBadge';
export { PropertyListItem } from './components/PropertyListItem';
export { PropertyStatsCards } from './components/PropertyStatsCards';

// Context
export { PropertyFormProvider, usePropertyForm } from './context/PropertyFormContext';

// API hooks
export {
  // My Properties
  useGetMyPropertiesQuery,
  useGetMyPropertyQuery,
  useGetPropertyStatsQuery,
  // Property CRUD
  useCreatePropertyMutation,
  useUpdatePropertyMutation,
  useDeletePropertyMutation,
  useSubmitForApprovalMutation,
  useArchivePropertyMutation,
  // Images
  useGetPropertyImagesQuery,
  useUploadImageMutation,
  useUploadMultipleImagesMutation,
  useDeleteImageMutation,
  useSetPrimaryImageMutation,
  useReorderImagesMutation,
  // Translations
  useCreateTranslationMutation,
  useRequestAutoTranslationMutation,
} from './property-management.api';

// Types
export type {
  PropertyStatus,
  TransactionType,
  CategorySection,
  Category,
  Amenity,
  Canton,
  City,
  PropertyImage,
  PropertyTranslation,
  CreatePropertyRequest,
  UpdatePropertyRequest,
  PropertyResponse,
  MyPropertiesResponse,
  PropertyFormState,
  PropertyFormErrors,
  UploadImageResponse,
  CreateTranslationRequest,
  PropertyStats,
} from './property-management.types';

export { initialPropertyFormState } from './property-management.types';
