import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Eye, EyeOff, Loader2, Building2, User, Info } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { Checkbox } from '@/shared/components/ui/checkbox';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/components/ui/tabs';
import { AuthLayout } from '../components/AuthLayout';
import { useRegisterMutation } from '../auth.api';
import type { UserType } from '../auth.types';

type AccountType = 'individual' | 'professional';

interface IndividualFormData {
  email: string;
  confirmEmail: string;
  password: string;
  confirmPassword: string;
  firstName: string;
  lastName: string;
}

interface ProfessionalFormData extends IndividualFormData {
  agencyName: string;
  agencyPhone: string;
  agencyEmail: string;
  agencyAddress: string;
  professionalType: 'owner' | 'agent' | 'agency_admin';
}

/**
 * Register Page with Individual/Professional tabs
 * Industry-standard registration flow like immobilier.ch
 */
export function RegisterPage() {
  const { t, i18n } = useTranslation('auth');
  const navigate = useNavigate();
  const lang = i18n.language;

  // Account type state
  const [accountType, setAccountType] = useState<AccountType>('individual');

  // Individual form state
  const [individualData, setIndividualData] = useState<IndividualFormData>({
    email: '',
    confirmEmail: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
  });

  // Professional form state
  const [professionalData, setProfessionalData] = useState<ProfessionalFormData>({
    email: '',
    confirmEmail: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    agencyName: '',
    agencyPhone: '',
    agencyEmail: '',
    agencyAddress: '',
    professionalType: 'agent',
  });

  // UI state
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [newsletter, setNewsletter] = useState(true);
  const [acceptTerms, setAcceptTerms] = useState(false);

  // RTK Query mutation
  const [register, { isLoading, error }] = useRegisterMutation();

  // Validation state
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  const handleIndividualChange =
    (field: keyof IndividualFormData) => (e: React.ChangeEvent<HTMLInputElement>) => {
      setIndividualData((prev) => ({ ...prev, [field]: e.target.value }));
      clearValidationError(field);
    };

  const handleProfessionalChange =
    (field: keyof ProfessionalFormData) => (e: React.ChangeEvent<HTMLInputElement>) => {
      setProfessionalData((prev) => ({ ...prev, [field]: e.target.value }));
      clearValidationError(field);
    };

  const clearValidationError = (field: string) => {
    if (validationErrors[field]) {
      setValidationErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const validateCommonFields = (
    data: IndividualFormData | ProfessionalFormData
  ): Record<string, string> => {
    const errors: Record<string, string> = {};

    if (!data.email.trim()) {
      errors.email = t('validation.emailRequired', 'Email is required');
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
      errors.email = t('validation.emailInvalid', 'Invalid email format');
    }

    if (data.email !== data.confirmEmail) {
      errors.confirmEmail = t('validation.emailMismatch', 'Emails do not match');
    }

    if (!data.password) {
      errors.password = t('validation.passwordRequired', 'Password is required');
    } else if (data.password.length < 8) {
      errors.password = t('validation.passwordLength', 'Password must be at least 8 characters');
    }

    if (data.password !== data.confirmPassword) {
      errors.confirmPassword = t('validation.passwordMismatch', 'Passwords do not match');
    }

    if (!data.firstName.trim()) {
      errors.firstName = t('validation.firstNameRequired', 'First name is required');
    }

    if (!data.lastName.trim()) {
      errors.lastName = t('validation.lastNameRequired', 'Last name is required');
    }

    if (!acceptTerms) {
      errors.terms = t('validation.termsRequired', 'You must accept the terms and conditions');
    }

    return errors;
  };

  const validateProfessionalFields = (data: ProfessionalFormData): Record<string, string> => {
    const errors: Record<string, string> = {};

    if (!data.agencyName.trim()) {
      errors.agencyName = t('validation.agencyNameRequired', 'Agency/Company name is required');
    }

    if (data.agencyEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.agencyEmail)) {
      errors.agencyEmail = t('validation.emailInvalid', 'Invalid email format');
    }

    return errors;
  };

  const validateForm = (): boolean => {
    let errors: Record<string, string> = {};

    if (accountType === 'individual') {
      errors = validateCommonFields(individualData);
    } else {
      errors = {
        ...validateCommonFields(professionalData),
        ...validateProfessionalFields(professionalData),
      };
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      if (accountType === 'individual') {
        await register({
          email: individualData.email,
          password: individualData.password,
          first_name: individualData.firstName,
          last_name: individualData.lastName,
          user_type: 'end_user' as UserType,
          preferred_language: lang as 'en' | 'fr' | 'de' | 'it',
        }).unwrap();

        // Navigate to home after successful registration
        navigate(`/${lang}`, { replace: true });
      } else {
        await register({
          email: professionalData.email,
          password: professionalData.password,
          first_name: professionalData.firstName,
          last_name: professionalData.lastName,
          user_type: professionalData.professionalType as UserType,
          preferred_language: lang as 'en' | 'fr' | 'de' | 'it',
          // Professional fields - backend should handle these
          agency_name: professionalData.agencyName,
          agency_phone: professionalData.agencyPhone,
          agency_email: professionalData.agencyEmail,
          agency_address: professionalData.agencyAddress,
        }).unwrap();

        // Navigate to pending approval page or show success message
        navigate(`/${lang}/registration-pending`, { replace: true });
      }
    } catch {
      // Error is handled by RTK Query
    }
  };

  const getErrorMessage = () => {
    if (!error) return null;
    if ('data' in error) {
      const apiError = error.data as { message?: string };
      return apiError?.message || t('errors.register', 'Registration failed. Please try again.');
    }
    return t('errors.network', 'Network error. Please try again.');
  };

  return (
    <AuthLayout
      title={t('register.title', 'Create an account')}
      subtitle={t('register.subtitle', 'Register to access your services')}
    >
      {/* Account Type Tabs */}
      <Tabs value={accountType} onValueChange={(v) => setAccountType(v as AccountType)}>
        <TabsList className="grid w-full grid-cols-2 mb-6">
          <TabsTrigger value="individual" className="flex items-center gap-2">
            <User className="h-4 w-4" />
            {t('register.individual', 'Individual')}
          </TabsTrigger>
          <TabsTrigger value="professional" className="flex items-center gap-2">
            <Building2 className="h-4 w-4" />
            {t('register.professional', 'Professional')}
          </TabsTrigger>
        </TabsList>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Individual Tab Content */}
          <TabsContent value="individual" className="mt-0 space-y-5">
            {/* Name fields */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName" className="text-sm font-medium">
                  {t('form.firstName', 'First name')} *
                </Label>
                <Input
                  id="firstName"
                  type="text"
                  placeholder={t('form.firstNamePlaceholder', 'John')}
                  value={individualData.firstName}
                  onChange={handleIndividualChange('firstName')}
                  required
                  disabled={isLoading}
                  className={`h-11 ${validationErrors.firstName ? 'border-red-500' : ''}`}
                />
                {validationErrors.firstName && (
                  <p className="text-xs text-red-600">{validationErrors.firstName}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="lastName" className="text-sm font-medium">
                  {t('form.lastName', 'Last name')} *
                </Label>
                <Input
                  id="lastName"
                  type="text"
                  placeholder={t('form.lastNamePlaceholder', 'Doe')}
                  value={individualData.lastName}
                  onChange={handleIndividualChange('lastName')}
                  required
                  disabled={isLoading}
                  className={`h-11 ${validationErrors.lastName ? 'border-red-500' : ''}`}
                />
                {validationErrors.lastName && (
                  <p className="text-xs text-red-600">{validationErrors.lastName}</p>
                )}
              </div>
            </div>

            {/* Email field */}
            <div className="space-y-2">
              <Label htmlFor="email-individual" className="text-sm font-medium">
                {t('form.email', 'Email address')} *
              </Label>
              <Input
                id="email-individual"
                type="email"
                placeholder={t('form.emailPlaceholder', 'Enter your email')}
                value={individualData.email}
                onChange={handleIndividualChange('email')}
                required
                autoComplete="email"
                disabled={isLoading}
                className={`h-11 ${validationErrors.email ? 'border-red-500' : ''}`}
              />
              {validationErrors.email && (
                <p className="text-xs text-red-600">{validationErrors.email}</p>
              )}
            </div>

            {/* Confirm email field */}
            <div className="space-y-2">
              <Label htmlFor="confirmEmail-individual" className="text-sm font-medium">
                {t('form.confirmEmail', 'Confirm email address')} *
              </Label>
              <Input
                id="confirmEmail-individual"
                type="email"
                placeholder={t('form.confirmEmailPlaceholder', 'Confirm your email')}
                value={individualData.confirmEmail}
                onChange={handleIndividualChange('confirmEmail')}
                required
                autoComplete="email"
                disabled={isLoading}
                className={`h-11 ${validationErrors.confirmEmail ? 'border-red-500' : ''}`}
              />
              {validationErrors.confirmEmail && (
                <p className="text-xs text-red-600">{validationErrors.confirmEmail}</p>
              )}
            </div>

            {/* Password fields */}
            <div className="space-y-2">
              <Label htmlFor="password-individual" className="text-sm font-medium">
                {t('form.password', 'Password')} *
              </Label>
              <div className="relative">
                <Input
                  id="password-individual"
                  type={showPassword ? 'text' : 'password'}
                  placeholder={t('form.passwordPlaceholder', 'Enter your password')}
                  value={individualData.password}
                  onChange={handleIndividualChange('password')}
                  required
                  autoComplete="new-password"
                  disabled={isLoading}
                  className={`h-11 pr-10 ${validationErrors.password ? 'border-red-500' : ''}`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              {validationErrors.password && (
                <p className="text-xs text-red-600">{validationErrors.password}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword-individual" className="text-sm font-medium">
                {t('form.confirmPassword', 'Confirm password')} *
              </Label>
              <div className="relative">
                <Input
                  id="confirmPassword-individual"
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder={t('form.confirmPasswordPlaceholder', 'Confirm your password')}
                  value={individualData.confirmPassword}
                  onChange={handleIndividualChange('confirmPassword')}
                  required
                  autoComplete="new-password"
                  disabled={isLoading}
                  className={`h-11 pr-10 ${validationErrors.confirmPassword ? 'border-red-500' : ''}`}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  tabIndex={-1}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
              {validationErrors.confirmPassword && (
                <p className="text-xs text-red-600">{validationErrors.confirmPassword}</p>
              )}
            </div>
          </TabsContent>

          {/* Professional Tab Content */}
          <TabsContent value="professional" className="mt-0 space-y-5">
            {/* Professional Type Selection */}
            <div className="space-y-3">
              <Label className="text-sm font-medium">
                {t('form.professionalType', 'I am a')} *
              </Label>
              <div className="grid grid-cols-3 gap-3">
                <Button
                  type="button"
                  variant={professionalData.professionalType === 'owner' ? 'default' : 'outline'}
                  className="h-auto py-3 flex flex-col items-center gap-1"
                  onClick={() =>
                    setProfessionalData((prev) => ({ ...prev, professionalType: 'owner' }))
                  }
                >
                  <User className="h-5 w-5" />
                  <span className="text-xs">{t('form.owner', 'Property Owner')}</span>
                </Button>
                <Button
                  type="button"
                  variant={professionalData.professionalType === 'agent' ? 'default' : 'outline'}
                  className="h-auto py-3 flex flex-col items-center gap-1"
                  onClick={() =>
                    setProfessionalData((prev) => ({ ...prev, professionalType: 'agent' }))
                  }
                >
                  <Building2 className="h-5 w-5" />
                  <span className="text-xs">{t('form.agent', 'Agent')}</span>
                </Button>
                <Button
                  type="button"
                  variant={
                    professionalData.professionalType === 'agency_admin' ? 'default' : 'outline'
                  }
                  className="h-auto py-3 flex flex-col items-center gap-1"
                  onClick={() =>
                    setProfessionalData((prev) => ({ ...prev, professionalType: 'agency_admin' }))
                  }
                >
                  <Building2 className="h-5 w-5" />
                  <span className="text-xs">{t('form.agencyAdmin', 'Agency Admin')}</span>
                </Button>
              </div>
            </div>

            {/* Agency/Company Information */}
            <div className="p-4 bg-gray-50 rounded-lg space-y-4">
              <h3 className="font-medium text-sm flex items-center gap-2">
                <Building2 className="h-4 w-4" />
                {t('form.companyInfo', 'Company/Agency Information')}
              </h3>

              <div className="space-y-2">
                <Label htmlFor="agencyName" className="text-sm font-medium">
                  {t('form.agencyName', 'Company/Agency Name')} *
                </Label>
                <Input
                  id="agencyName"
                  type="text"
                  placeholder={t('form.agencyNamePlaceholder', 'Enter company name')}
                  value={professionalData.agencyName}
                  onChange={handleProfessionalChange('agencyName')}
                  required
                  disabled={isLoading}
                  className={`h-11 ${validationErrors.agencyName ? 'border-red-500' : ''}`}
                />
                {validationErrors.agencyName && (
                  <p className="text-xs text-red-600">{validationErrors.agencyName}</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="agencyPhone" className="text-sm font-medium">
                    {t('form.agencyPhone', 'Business Phone')}
                  </Label>
                  <Input
                    id="agencyPhone"
                    type="tel"
                    placeholder={t('form.agencyPhonePlaceholder', '+41 XX XXX XX XX')}
                    value={professionalData.agencyPhone}
                    onChange={handleProfessionalChange('agencyPhone')}
                    disabled={isLoading}
                    className="h-11"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="agencyEmail" className="text-sm font-medium">
                    {t('form.agencyEmail', 'Business Email')}
                  </Label>
                  <Input
                    id="agencyEmail"
                    type="email"
                    placeholder={t('form.agencyEmailPlaceholder', 'contact@company.ch')}
                    value={professionalData.agencyEmail}
                    onChange={handleProfessionalChange('agencyEmail')}
                    disabled={isLoading}
                    className={`h-11 ${validationErrors.agencyEmail ? 'border-red-500' : ''}`}
                  />
                  {validationErrors.agencyEmail && (
                    <p className="text-xs text-red-600">{validationErrors.agencyEmail}</p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="agencyAddress" className="text-sm font-medium">
                  {t('form.agencyAddress', 'Business Address')}
                </Label>
                <Input
                  id="agencyAddress"
                  type="text"
                  placeholder={t('form.agencyAddressPlaceholder', 'Street, City, Postal Code')}
                  value={professionalData.agencyAddress}
                  onChange={handleProfessionalChange('agencyAddress')}
                  disabled={isLoading}
                  className="h-11"
                />
              </div>
            </div>

            {/* Professional personal info */}
            <div className="space-y-4">
              <h3 className="font-medium text-sm flex items-center gap-2">
                <User className="h-4 w-4" />
                {t('form.personalInfo', 'Personal Information')}
              </h3>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName-pro" className="text-sm font-medium">
                    {t('form.firstName', 'First name')} *
                  </Label>
                  <Input
                    id="firstName-pro"
                    type="text"
                    placeholder={t('form.firstNamePlaceholder', 'John')}
                    value={professionalData.firstName}
                    onChange={handleProfessionalChange('firstName')}
                    required
                    disabled={isLoading}
                    className={`h-11 ${validationErrors.firstName ? 'border-red-500' : ''}`}
                  />
                  {validationErrors.firstName && (
                    <p className="text-xs text-red-600">{validationErrors.firstName}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="lastName-pro" className="text-sm font-medium">
                    {t('form.lastName', 'Last name')} *
                  </Label>
                  <Input
                    id="lastName-pro"
                    type="text"
                    placeholder={t('form.lastNamePlaceholder', 'Doe')}
                    value={professionalData.lastName}
                    onChange={handleProfessionalChange('lastName')}
                    required
                    disabled={isLoading}
                    className={`h-11 ${validationErrors.lastName ? 'border-red-500' : ''}`}
                  />
                  {validationErrors.lastName && (
                    <p className="text-xs text-red-600">{validationErrors.lastName}</p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email-pro" className="text-sm font-medium">
                  {t('form.email', 'Email address')} *
                </Label>
                <Input
                  id="email-pro"
                  type="email"
                  placeholder={t('form.emailPlaceholder', 'Enter your email')}
                  value={professionalData.email}
                  onChange={handleProfessionalChange('email')}
                  required
                  autoComplete="email"
                  disabled={isLoading}
                  className={`h-11 ${validationErrors.email ? 'border-red-500' : ''}`}
                />
                {validationErrors.email && (
                  <p className="text-xs text-red-600">{validationErrors.email}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmEmail-pro" className="text-sm font-medium">
                  {t('form.confirmEmail', 'Confirm email address')} *
                </Label>
                <Input
                  id="confirmEmail-pro"
                  type="email"
                  placeholder={t('form.confirmEmailPlaceholder', 'Confirm your email')}
                  value={professionalData.confirmEmail}
                  onChange={handleProfessionalChange('confirmEmail')}
                  required
                  autoComplete="email"
                  disabled={isLoading}
                  className={`h-11 ${validationErrors.confirmEmail ? 'border-red-500' : ''}`}
                />
                {validationErrors.confirmEmail && (
                  <p className="text-xs text-red-600">{validationErrors.confirmEmail}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="password-pro" className="text-sm font-medium">
                  {t('form.password', 'Password')} *
                </Label>
                <div className="relative">
                  <Input
                    id="password-pro"
                    type={showPassword ? 'text' : 'password'}
                    placeholder={t('form.passwordPlaceholder', 'Enter your password')}
                    value={professionalData.password}
                    onChange={handleProfessionalChange('password')}
                    required
                    autoComplete="new-password"
                    disabled={isLoading}
                    className={`h-11 pr-10 ${validationErrors.password ? 'border-red-500' : ''}`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
                {validationErrors.password && (
                  <p className="text-xs text-red-600">{validationErrors.password}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword-pro" className="text-sm font-medium">
                  {t('form.confirmPassword', 'Confirm password')} *
                </Label>
                <div className="relative">
                  <Input
                    id="confirmPassword-pro"
                    type={showConfirmPassword ? 'text' : 'password'}
                    placeholder={t('form.confirmPasswordPlaceholder', 'Confirm your password')}
                    value={professionalData.confirmPassword}
                    onChange={handleProfessionalChange('confirmPassword')}
                    required
                    autoComplete="new-password"
                    disabled={isLoading}
                    className={`h-11 pr-10 ${validationErrors.confirmPassword ? 'border-red-500' : ''}`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    tabIndex={-1}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
                {validationErrors.confirmPassword && (
                  <p className="text-xs text-red-600">{validationErrors.confirmPassword}</p>
                )}
              </div>
            </div>

            {/* Professional notice */}
            <div className="flex items-start gap-3 p-4 bg-blue-50 rounded-lg border border-blue-100">
              <Info className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
              <div className="text-sm text-blue-800">
                <p className="font-medium mb-1">
                  {t('register.professionalNotice', 'Professional Account Verification')}
                </p>
                <p className="text-blue-700">
                  {t(
                    'register.professionalNoticeText',
                    'Professional accounts require verification before activation. After registration, our team will review your information and approve your account within 1-2 business days.'
                  )}
                </p>
              </div>
            </div>
          </TabsContent>

          {/* Common fields for both tabs */}
          <div className="space-y-4 pt-2">
            {/* 2FA option */}
            <div className="flex items-start space-x-3">
              <Checkbox
                id="twoFactor"
                checked={twoFactorEnabled}
                onCheckedChange={(checked) => setTwoFactorEnabled(checked === true)}
                disabled={isLoading}
              />
              <label htmlFor="twoFactor" className="text-sm text-gray-700 cursor-pointer leading-5">
                {t(
                  'register.twoFactor',
                  'I want two-factor authentication to connect (recommended)'
                )}
              </label>
            </div>

            {/* Newsletter option */}
            <div className="flex items-start space-x-3">
              <Checkbox
                id="newsletter"
                checked={newsletter}
                onCheckedChange={(checked) => setNewsletter(checked === true)}
                disabled={isLoading}
              />
              <label
                htmlFor="newsletter"
                className="text-sm text-gray-700 cursor-pointer leading-5"
              >
                {t('register.newsletter', 'I agree to receive the newsletter and updates')}
              </label>
            </div>

            {/* Terms acceptance */}
            <div className="flex items-start space-x-3">
              <Checkbox
                id="terms"
                checked={acceptTerms}
                onCheckedChange={(checked) => {
                  setAcceptTerms(checked === true);
                  if (checked && validationErrors.terms) {
                    setValidationErrors((prev) => {
                      const newErrors = { ...prev };
                      delete newErrors.terms;
                      return newErrors;
                    });
                  }
                }}
                disabled={isLoading}
                className={validationErrors.terms ? 'border-red-500' : ''}
              />
              <label htmlFor="terms" className="text-sm text-gray-700 cursor-pointer leading-5">
                {t('register.terms', 'I accept the')}{' '}
                <Link
                  to={`/${lang}/terms`}
                  className="text-primary hover:underline"
                  target="_blank"
                >
                  {t('register.termsLink', 'terms and conditions')}
                </Link>{' '}
                {t('register.termsAnd', 'and the')}{' '}
                <Link
                  to={`/${lang}/privacy`}
                  className="text-primary hover:underline"
                  target="_blank"
                >
                  {t('register.privacyLink', 'privacy policy')}
                </Link>{' '}
                *
              </label>
            </div>
            {validationErrors.terms && (
              <p className="text-xs text-red-600 ml-7">{validationErrors.terms}</p>
            )}
          </div>

          {/* Error message */}
          {error && (
            <div className="p-3 rounded-md bg-red-50 border border-red-200">
              <p className="text-sm text-red-600">{getErrorMessage()}</p>
            </div>
          )}

          {/* Register button */}
          <Button
            type="submit"
            className="w-full h-11 text-base font-semibold"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {t('register.creating', 'Creating account...')}
              </>
            ) : accountType === 'individual' ? (
              t('register.submit', 'Create an account')
            ) : (
              t('register.submitProfessional', 'Register as Professional')
            )}
          </Button>

          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-2 text-gray-500">{t('register.or', 'or')}</span>
            </div>
          </div>

          {/* Login link */}
          <div className="text-center">
            <p className="text-sm text-gray-600 mb-2">
              {t('register.hasAccount', 'Already have an account?')}
            </p>
            <Link
              to={`/${lang}/sign-in`}
              className="text-sm font-semibold text-primary hover:underline"
            >
              {t('register.login', 'Log in')}
            </Link>
          </div>
        </form>
      </Tabs>
    </AuthLayout>
  );
}

export default RegisterPage;
