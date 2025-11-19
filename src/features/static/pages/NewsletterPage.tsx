/**
 * Newsletter Page
 * Allows users to subscribe to email updates about new listings.
 */

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Mail, Bell, Building2, TrendingUp, CheckCircle } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { Card, CardContent } from '@/shared/components/ui/card';
import { SEO } from '@/shared/components/SEO';
import { toast } from 'sonner';

const newsletterSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
});

type NewsletterFormData = z.infer<typeof newsletterSchema>;

export function NewsletterPage() {
  const { t } = useTranslation('common');
  const [isSubmitted, setIsSubmitted] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<NewsletterFormData>({
    resolver: zodResolver(newsletterSchema),
  });

  const onSubmit = async (data: NewsletterFormData) => {
    try {
      // In production, this would call a newsletter subscription API
      await new Promise((resolve) => setTimeout(resolve, 800));
      console.log('Newsletter subscription:', data.email);
      setIsSubmitted(true);
      toast.success(t('newsletter.success', 'Successfully subscribed!'));
    } catch {
      toast.error(t('newsletter.error', 'Subscription failed. Please try again.'));
    }
  };

  const features = [
    {
      icon: Building2,
      title: t('newsletter.features.newListings', 'New Property Listings'),
      description: t(
        'newsletter.features.newListingsDesc',
        'Be the first to know about new properties matching your criteria.'
      ),
    },
    {
      icon: TrendingUp,
      title: t('newsletter.features.marketInsights', 'Market Insights'),
      description: t(
        'newsletter.features.marketInsightsDesc',
        'Stay informed about Swiss real estate market trends and prices.'
      ),
    },
    {
      icon: Bell,
      title: t('newsletter.features.priceAlerts', 'Price Change Alerts'),
      description: t(
        'newsletter.features.priceAlertsDesc',
        'Get notified when property prices change in your areas of interest.'
      ),
    },
  ];

  return (
    <>
      <SEO
        title={t('newsletter.title', 'Newsletter')}
        description="Subscribe to Immobilier.ch newsletter for the latest Swiss real estate listings and market insights."
      />

      <div className="mx-auto max-w-4xl px-4 py-16">
        {/* Header */}
        <div className="mb-12 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
            <Mail className="h-8 w-8 text-primary" />
          </div>
          <h1 className="mb-4 text-3xl font-bold tracking-tight">
            {t('newsletter.heading', 'Stay Updated on Swiss Real Estate')}
          </h1>
          <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
            {t(
              'newsletter.subtitle',
              'Subscribe to our newsletter and never miss a new listing or market update.'
            )}
          </p>
        </div>

        {/* Subscription form */}
        {!isSubmitted ? (
          <Card className="mx-auto mb-12 max-w-md">
            <CardContent className="pt-6">
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">{t('form.email', 'Email address')}</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder={t('form.emailPlaceholder', 'your.email@example.com')}
                    {...register('email')}
                  />
                  {errors.email && <p className="text-sm text-red-500">{errors.email.message}</p>}
                </div>
                <Button type="submit" className="w-full gap-2" disabled={isSubmitting}>
                  <Mail className="h-4 w-4" />
                  {isSubmitting
                    ? t('actions.subscribing', 'Subscribing...')
                    : t('actions.subscribe', 'Subscribe')}
                </Button>
                <p className="text-center text-xs text-muted-foreground">
                  {t('newsletter.privacy', 'We respect your privacy. Unsubscribe at any time.')}
                </p>
              </form>
            </CardContent>
          </Card>
        ) : (
          <Card className="mx-auto mb-12 max-w-md">
            <CardContent className="py-8 text-center">
              <CheckCircle className="mx-auto mb-4 h-12 w-12 text-green-500" />
              <h2 className="mb-2 text-xl font-semibold">
                {t('newsletter.confirmed', "You're subscribed!")}
              </h2>
              <p className="text-muted-foreground">
                {t(
                  'newsletter.confirmedDesc',
                  "Check your inbox for a confirmation email. We'll keep you updated on the latest listings."
                )}
              </p>
            </CardContent>
          </Card>
        )}

        {/* Features */}
        <div className="grid gap-8 md:grid-cols-3">
          {features.map(({ icon: Icon, title, description }) => (
            <div key={title} className="text-center">
              <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                <Icon className="h-6 w-6 text-primary" />
              </div>
              <h3 className="mb-1 font-semibold">{title}</h3>
              <p className="text-sm text-muted-foreground">{description}</p>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
