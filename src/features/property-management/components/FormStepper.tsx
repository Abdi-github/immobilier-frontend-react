/**
 * Form Stepper Component
 * Shows progress through multi-step property creation form
 */

import { useTranslation } from 'react-i18next';
import { Check, Home, MapPin, FileText, Sparkles, Image, Eye } from 'lucide-react';
import { cn } from '@/shared/lib/utils';

interface Step {
  number: number;
  title: string;
  icon: React.ReactNode;
}

interface FormStepperProps {
  currentStep: number;
  onStepClick?: (step: number) => void;
  completedSteps?: number[];
}

export function FormStepper({ currentStep, onStepClick, completedSteps = [] }: FormStepperProps) {
  const { t } = useTranslation('property');

  const steps: Step[] = [
    {
      number: 1,
      title: t('form.steps.basicInfo', 'Basic Info'),
      icon: <Home className="h-4 w-4" />,
    },
    {
      number: 2,
      title: t('form.steps.location', 'Location'),
      icon: <MapPin className="h-4 w-4" />,
    },
    {
      number: 3,
      title: t('form.steps.details', 'Details'),
      icon: <FileText className="h-4 w-4" />,
    },
    {
      number: 4,
      title: t('form.steps.amenities', 'Amenities'),
      icon: <Sparkles className="h-4 w-4" />,
    },
    {
      number: 5,
      title: t('form.steps.images', 'Images'),
      icon: <Image className="h-4 w-4" />,
    },
    {
      number: 6,
      title: t('form.steps.review', 'Review'),
      icon: <Eye className="h-4 w-4" />,
    },
  ];

  const isStepCompleted = (stepNumber: number) => {
    return completedSteps.includes(stepNumber) || stepNumber < currentStep;
  };

  const isStepClickable = (stepNumber: number) => {
    // Can click on completed steps or the next step
    return isStepCompleted(stepNumber) || stepNumber <= currentStep;
  };

  return (
    <div className="w-full">
      {/* Desktop view */}
      <div className="hidden md:flex items-center justify-between">
        {steps.map((step, index) => (
          <div key={step.number} className="flex items-center flex-1">
            {/* Step circle */}
            <button
              type="button"
              onClick={() => isStepClickable(step.number) && onStepClick?.(step.number)}
              disabled={!isStepClickable(step.number)}
              className={cn(
                'flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all',
                'focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary',
                currentStep === step.number
                  ? 'bg-primary border-primary text-white'
                  : isStepCompleted(step.number)
                    ? 'bg-green-500 border-green-500 text-white cursor-pointer hover:bg-green-600'
                    : 'bg-white border-gray-300 text-gray-400',
                !isStepClickable(step.number) && 'cursor-not-allowed'
              )}
            >
              {isStepCompleted(step.number) && currentStep !== step.number ? (
                <Check className="h-5 w-5" />
              ) : (
                step.icon
              )}
            </button>

            {/* Step title */}
            <span
              className={cn(
                'ml-2 text-sm font-medium whitespace-nowrap',
                currentStep === step.number
                  ? 'text-primary'
                  : isStepCompleted(step.number)
                    ? 'text-green-600'
                    : 'text-gray-500'
              )}
            >
              {step.title}
            </span>

            {/* Connector line */}
            {index < steps.length - 1 && (
              <div
                className={cn(
                  'flex-1 h-0.5 mx-4',
                  isStepCompleted(step.number) ? 'bg-green-500' : 'bg-gray-200'
                )}
              />
            )}
          </div>
        ))}
      </div>

      {/* Mobile view */}
      <div className="md:hidden">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">
            {t('form.step', 'Step')} {currentStep} {t('form.of', 'of')} {steps.length}
          </span>
          <span className="text-sm font-medium text-primary">{steps[currentStep - 1]?.title}</span>
        </div>

        {/* Progress bar */}
        <div className="w-full h-2 bg-gray-200 rounded-full">
          <div
            className="h-full bg-primary rounded-full transition-all duration-300"
            style={{ width: `${((currentStep - 1) / (steps.length - 1)) * 100}%` }}
          />
        </div>

        {/* Step indicators */}
        <div className="flex justify-between mt-2">
          {steps.map((step) => (
            <button
              key={step.number}
              type="button"
              onClick={() => isStepClickable(step.number) && onStepClick?.(step.number)}
              disabled={!isStepClickable(step.number)}
              className={cn(
                'w-6 h-6 rounded-full flex items-center justify-center text-xs',
                'focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-primary',
                currentStep === step.number
                  ? 'bg-primary text-white'
                  : isStepCompleted(step.number)
                    ? 'bg-green-500 text-white'
                    : 'bg-gray-200 text-gray-400',
                !isStepClickable(step.number) && 'cursor-not-allowed'
              )}
            >
              {isStepCompleted(step.number) && currentStep !== step.number ? (
                <Check className="h-3 w-3" />
              ) : (
                step.number
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export default FormStepper;
