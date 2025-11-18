/**
 * Property Form Context
 * Manages state for multi-step property creation form
 */

import { createContext, useContext, useReducer, useCallback, ReactNode } from 'react';
import type { PropertyFormState, PropertyFormErrors } from '../property-management.types';
import { initialPropertyFormState } from '../property-management.types';

// Action types
type PropertyFormAction =
  | {
      type: 'SET_FIELD';
      field: keyof PropertyFormState;
      value: PropertyFormState[keyof PropertyFormState];
    }
  | { type: 'SET_FIELDS'; fields: Partial<PropertyFormState> }
  | { type: 'NEXT_STEP' }
  | { type: 'PREV_STEP' }
  | { type: 'GO_TO_STEP'; step: number }
  | { type: 'ADD_IMAGE'; file: File; preview: string }
  | { type: 'REMOVE_IMAGE'; index: number }
  | { type: 'TOGGLE_AMENITY'; amenityId: string }
  | { type: 'SET_SUBMITTING'; isSubmitting: boolean }
  | { type: 'SET_CREATED_PROPERTY_ID'; id: string }
  | { type: 'RESET' };

// Context type
interface PropertyFormContextType {
  state: PropertyFormState;
  errors: PropertyFormErrors;
  dispatch: React.Dispatch<PropertyFormAction>;
  setField: <K extends keyof PropertyFormState>(field: K, value: PropertyFormState[K]) => void;
  setFields: (fields: Partial<PropertyFormState>) => void;
  nextStep: () => void;
  prevStep: () => void;
  goToStep: (step: number) => void;
  addImage: (file: File, preview: string) => void;
  removeImage: (index: number) => void;
  toggleAmenity: (amenityId: string) => void;
  setSubmitting: (isSubmitting: boolean) => void;
  setCreatedPropertyId: (id: string) => void;
  setErrors: (errors: PropertyFormErrors) => void;
  clearError: (field: string) => void;
  reset: () => void;
  validateStep: (step: number) => boolean;
}

// Reducer
function propertyFormReducer(
  state: PropertyFormState,
  action: PropertyFormAction
): PropertyFormState {
  switch (action.type) {
    case 'SET_FIELD':
      return { ...state, [action.field]: action.value };

    case 'SET_FIELDS':
      return { ...state, ...action.fields };

    case 'NEXT_STEP':
      return { ...state, currentStep: Math.min(state.currentStep + 1, 6) };

    case 'PREV_STEP':
      return { ...state, currentStep: Math.max(state.currentStep - 1, 1) };

    case 'GO_TO_STEP':
      return { ...state, currentStep: Math.max(1, Math.min(action.step, 6)) };

    case 'ADD_IMAGE':
      return {
        ...state,
        imageFiles: [...state.imageFiles, action.file],
        imagePreviews: [...state.imagePreviews, action.preview],
      };

    case 'REMOVE_IMAGE':
      return {
        ...state,
        imageFiles: state.imageFiles.filter((_, i) => i !== action.index),
        imagePreviews: state.imagePreviews.filter((_, i) => i !== action.index),
      };

    case 'TOGGLE_AMENITY':
      return {
        ...state,
        amenities: state.amenities.includes(action.amenityId)
          ? state.amenities.filter((id) => id !== action.amenityId)
          : [...state.amenities, action.amenityId],
      };

    case 'SET_SUBMITTING':
      return { ...state, isSubmitting: action.isSubmitting };

    case 'SET_CREATED_PROPERTY_ID':
      return { ...state, createdPropertyId: action.id };

    case 'RESET':
      return initialPropertyFormState;

    default:
      return state;
  }
}

// Create context
const PropertyFormContext = createContext<PropertyFormContextType | undefined>(undefined);

// Provider component
interface PropertyFormProviderProps {
  children: ReactNode;
  initialState?: Partial<PropertyFormState>;
}

export function PropertyFormProvider({ children, initialState }: PropertyFormProviderProps) {
  const [state, dispatch] = useReducer(
    propertyFormReducer,
    initialState ? { ...initialPropertyFormState, ...initialState } : initialPropertyFormState
  );
  const [errors, setErrorsState] = useReducer(
    (
      state: PropertyFormErrors,
      action: PropertyFormErrors | { clear: keyof PropertyFormErrors } | 'reset'
    ) => {
      if (action === 'reset') return {};
      if ('clear' in action && action.clear) {
        const newState = { ...state };
        delete newState[action.clear];
        return newState;
      }
      return { ...state, ...(action as PropertyFormErrors) };
    },
    {}
  );

  // Helper functions
  const setField = useCallback(
    <K extends keyof PropertyFormState>(field: K, value: PropertyFormState[K]) => {
      dispatch({ type: 'SET_FIELD', field, value });
    },
    []
  );

  const setFields = useCallback((fields: Partial<PropertyFormState>) => {
    dispatch({ type: 'SET_FIELDS', fields });
  }, []);

  const nextStep = useCallback(() => {
    dispatch({ type: 'NEXT_STEP' });
  }, []);

  const prevStep = useCallback(() => {
    dispatch({ type: 'PREV_STEP' });
  }, []);

  const goToStep = useCallback((step: number) => {
    dispatch({ type: 'GO_TO_STEP', step });
  }, []);

  const addImage = useCallback((file: File, preview: string) => {
    dispatch({ type: 'ADD_IMAGE', file, preview });
  }, []);

  const removeImage = useCallback((index: number) => {
    dispatch({ type: 'REMOVE_IMAGE', index });
  }, []);

  const toggleAmenity = useCallback((amenityId: string) => {
    dispatch({ type: 'TOGGLE_AMENITY', amenityId });
  }, []);

  const setSubmitting = useCallback((isSubmitting: boolean) => {
    dispatch({ type: 'SET_SUBMITTING', isSubmitting });
  }, []);

  const setCreatedPropertyId = useCallback((id: string) => {
    dispatch({ type: 'SET_CREATED_PROPERTY_ID', id });
  }, []);

  const setErrors = useCallback((newErrors: PropertyFormErrors) => {
    setErrorsState(newErrors);
  }, []);

  const clearError = useCallback((field: string) => {
    setErrorsState({ clear: field });
  }, []);

  const reset = useCallback(() => {
    dispatch({ type: 'RESET' });
    setErrorsState('reset');
  }, []);

  // Validation function
  const validateStep = useCallback(
    (step: number): boolean => {
      const newErrors: PropertyFormErrors = {};

      switch (step) {
        case 1: // Basic Info
          if (!state.category_id) {
            newErrors.category_id = 'Please select a category';
          }
          if (!state.transaction_type) {
            newErrors.transaction_type = 'Please select transaction type';
          }
          if (!state.price || parseFloat(state.price) <= 0) {
            newErrors.price = 'Please enter a valid price';
          }
          break;

        case 2: // Location
          if (!state.canton_id) {
            newErrors.canton_id = 'Please select a canton';
          }
          if (!state.city_id) {
            newErrors.city_id = 'Please select a city';
          }
          if (!state.address || state.address.length < 3) {
            newErrors.address = 'Please enter a valid address';
          }
          break;

        case 3: // Details
          if (!state.title || state.title.length < 5) {
            newErrors.title = 'Title must be at least 5 characters';
          }
          if (!state.description || state.description.length < 20) {
            newErrors.description = 'Description must be at least 20 characters';
          }
          break;

        case 4: // Amenities - optional, no required validation
          break;

        case 5: // Images
          if (state.imageFiles.length === 0) {
            newErrors.images = 'Please upload at least one image';
          }
          break;

        case 6: // Review - validate all
          // Re-validate all steps
          if (!state.category_id) newErrors.category_id = 'Category is required';
          if (!state.transaction_type) newErrors.transaction_type = 'Transaction type is required';
          if (!state.price) newErrors.price = 'Price is required';
          if (!state.canton_id) newErrors.canton_id = 'Canton is required';
          if (!state.city_id) newErrors.city_id = 'City is required';
          if (!state.address) newErrors.address = 'Address is required';
          if (!state.title) newErrors.title = 'Title is required';
          if (!state.description) newErrors.description = 'Description is required';
          break;
      }

      setErrorsState(newErrors);
      return Object.keys(newErrors).length === 0;
    },
    [state]
  );

  const value: PropertyFormContextType = {
    state,
    errors,
    dispatch,
    setField,
    setFields,
    nextStep,
    prevStep,
    goToStep,
    addImage,
    removeImage,
    toggleAmenity,
    setSubmitting,
    setCreatedPropertyId,
    setErrors,
    clearError,
    reset,
    validateStep,
  };

  return <PropertyFormContext.Provider value={value}>{children}</PropertyFormContext.Provider>;
}

// Hook to use context
export function usePropertyForm() {
  const context = useContext(PropertyFormContext);
  if (context === undefined) {
    throw new Error('usePropertyForm must be used within a PropertyFormProvider');
  }
  return context;
}

export default PropertyFormContext;
