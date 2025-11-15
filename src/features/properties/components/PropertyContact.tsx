import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Send, Phone, Mail, Building2 } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { toast } from 'sonner';
import { useAppSelector } from '@/app/hooks';
import { useCreatePublicLeadMutation, useCreateAuthenticatedLeadMutation } from '../leads.api';
import type { Property } from '../properties.types';

const contactSchema = z.object({
  firstName: z.string().min(2, 'First name must be at least 2 characters'),
  lastName: z.string().min(2, 'Last name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  phone: z.string().optional(),
  message: z.string().min(10, 'Message must be at least 10 characters'),
});

type ContactFormData = z.infer<typeof contactSchema>;

interface PropertyContactProps {
  property: Property;
}

export function PropertyContact({ property }: PropertyContactProps) {
  const { t } = useTranslation(['properties', 'common']);
  const user = useAppSelector((state) => state.auth.user);
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);

  const [createPublicLead, { isLoading: isPublicLoading }] = useCreatePublicLeadMutation();
  const [createAuthenticatedLead, { isLoading: isAuthLoading }] =
    useCreateAuthenticatedLeadMutation();
  const isSubmitting = isPublicLoading || isAuthLoading;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      firstName: user?.first_name || '',
      lastName: user?.last_name || '',
      email: user?.email || '',
      message: t('properties:contact.defaultMessage', { title: property.title }),
    },
  });

  const onSubmit = async (data: ContactFormData) => {
    try {
      if (isAuthenticated) {
        await createAuthenticatedLead({
          property_id: property.id || property._id || '',
          contact_name: `${data.firstName} ${data.lastName}`.trim(),
          contact_email: data.email,
          contact_phone: data.phone || undefined,
          inquiry_type: 'general_inquiry',
          message: data.message,
          preferred_contact_method: 'email',
        }).unwrap();
      } else {
        await createPublicLead({
          property_id: property.id || property._id || '',
          contact_name: `${data.firstName} ${data.lastName}`.trim(),
          contact_email: data.email,
          contact_phone: data.phone || undefined,
          inquiry_type: 'general_inquiry',
          message: data.message,
          preferred_contact_method: 'email',
        }).unwrap();
      }
      toast.success(t('properties:contact.success'));
      reset();
    } catch (error: unknown) {
      const err = error as { data?: { message?: string } };
      toast.error(err?.data?.message || t('properties:contact.error'));
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Mail className="h-5 w-5" />
          {t('properties:contact.title')}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Agency info */}
        {property.agency && (
          <div className="flex items-start gap-4 rounded-lg bg-muted p-4">
            {property.agency.logo_url ? (
              <img
                src={property.agency.logo_url}
                alt={property.agency.name}
                className="h-12 w-12 rounded-lg object-contain"
              />
            ) : (
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                <Building2 className="h-6 w-6 text-primary" />
              </div>
            )}
            <div>
              <p className="font-semibold">{property.agency.name}</p>
              <p className="text-sm text-muted-foreground">{t('properties:contact.listedBy')}</p>
            </div>
          </div>
        )}

        {/* Contact form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="firstName">{t('common:form.firstName', 'First Name')} *</Label>
              <Input
                id="firstName"
                {...register('firstName')}
                placeholder={t('common:form.firstNamePlaceholder', 'John')}
              />
              {errors.firstName && (
                <p className="text-sm text-red-500">{errors.firstName.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="lastName">{t('common:form.lastName', 'Last Name')} *</Label>
              <Input
                id="lastName"
                {...register('lastName')}
                placeholder={t('common:form.lastNamePlaceholder', 'Doe')}
              />
              {errors.lastName && <p className="text-sm text-red-500">{errors.lastName.message}</p>}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">{t('common:form.email')} *</Label>
            <Input
              id="email"
              type="email"
              {...register('email')}
              placeholder={t('common:form.emailPlaceholder')}
            />
            {errors.email && <p className="text-sm text-red-500">{errors.email.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">{t('common:form.phone')}</Label>
            <Input
              id="phone"
              type="tel"
              {...register('phone')}
              placeholder={t('common:form.phonePlaceholder')}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="message">{t('common:form.message')} *</Label>
            <textarea
              id="message"
              {...register('message')}
              rows={4}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              placeholder={t('common:form.messagePlaceholder')}
            />
            {errors.message && <p className="text-sm text-red-500">{errors.message.message}</p>}
          </div>

          <Button type="submit" className="w-full gap-2" disabled={isSubmitting}>
            <Send className="h-4 w-4" />
            {isSubmitting ? t('common:actions.sending') : t('common:actions.send')}
          </Button>
        </form>

        {/* Quick contact */}
        <div className="flex gap-2">
          <Button variant="outline" className="flex-1 gap-2">
            <Phone className="h-4 w-4" />
            {t('properties:contact.call')}
          </Button>
          <Button variant="outline" className="flex-1 gap-2">
            <Mail className="h-4 w-4" />
            {t('properties:contact.email')}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
