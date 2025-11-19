import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Mail, Phone, MapPin, Send, Loader2, CheckCircle2 } from 'lucide-react';
import { Card, CardContent } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { Textarea } from '@/shared/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select';
import { toast } from 'sonner';

export function ContactPage() {
  const { t } = useTranslation('common');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate form submission
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setIsSubmitting(false);
    setSubmitted(true);
    toast.success(t('contact.successToast', 'Message sent successfully!'));
  };

  const contactInfo = [
    {
      icon: Mail,
      label: t('contact.info.email', 'Email'),
      value: 'support@immobilier.ch',
      href: 'mailto:support@immobilier.ch',
    },
    {
      icon: Phone,
      label: t('contact.info.phone', 'Phone'),
      value: '+41 21 123 45 67',
      href: 'tel:+41211234567',
    },
    {
      icon: MapPin,
      label: t('contact.info.address', 'Address'),
      value: 'Rue du Marché 1, 1204 Genève, Switzerland',
      href: undefined,
    },
  ];

  return (
    <div className="mx-auto max-w-5xl px-4 py-12">
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-3xl font-bold tracking-tight md:text-4xl">
          {t('contact.title', 'Contact Us')}
        </h1>
        <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
          {t('contact.subtitle', "Have a question or need assistance? We're here to help.")}
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Contact information */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">{t('contact.info.title', 'Get in Touch')}</h2>
          <p className="text-sm text-muted-foreground">
            {t(
              'contact.info.description',
              'Our team is available Monday to Friday, 9:00 - 18:00 CET.'
            )}
          </p>

          <div className="space-y-4 pt-4">
            {contactInfo.map((item) => (
              <div key={item.label} className="flex items-start gap-3">
                <div className="shrink-0 h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center">
                  <item.icon className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium">{item.label}</p>
                  {item.href ? (
                    <a href={item.href} className="text-sm text-primary hover:underline">
                      {item.value}
                    </a>
                  ) : (
                    <p className="text-sm text-muted-foreground">{item.value}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Contact form */}
        <Card className="lg:col-span-2">
          <CardContent className="p-6">
            {submitted ? (
              <div className="text-center py-12">
                <CheckCircle2 className="mx-auto h-12 w-12 text-green-500 mb-4" />
                <h3 className="text-lg font-semibold mb-2">
                  {t('contact.success.title', 'Message Sent!')}
                </h3>
                <p className="text-sm text-muted-foreground mb-6">
                  {t(
                    'contact.success.description',
                    'Thank you for reaching out. We will get back to you within 1-2 business days.'
                  )}
                </p>
                <Button variant="outline" onClick={() => setSubmitted(false)}>
                  {t('contact.success.sendAnother', 'Send Another Message')}
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label>{t('contact.form.firstName', 'First Name')} *</Label>
                    <Input required placeholder={t('contact.form.firstNamePlaceholder', 'John')} />
                  </div>
                  <div className="space-y-2">
                    <Label>{t('contact.form.lastName', 'Last Name')} *</Label>
                    <Input required placeholder={t('contact.form.lastNamePlaceholder', 'Doe')} />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>{t('contact.form.email', 'Email')} *</Label>
                  <Input
                    type="email"
                    required
                    placeholder={t('contact.form.emailPlaceholder', 'john@example.com')}
                  />
                </div>

                <div className="space-y-2">
                  <Label>{t('contact.form.subject', 'Subject')} *</Label>
                  <Select required>
                    <SelectTrigger>
                      <SelectValue
                        placeholder={t('contact.form.selectSubject', 'Select a subject')}
                      />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="general">
                        {t('contact.subjects.general', 'General Inquiry')}
                      </SelectItem>
                      <SelectItem value="listing">
                        {t('contact.subjects.listing', 'Property Listing')}
                      </SelectItem>
                      <SelectItem value="account">
                        {t('contact.subjects.account', 'Account Issue')}
                      </SelectItem>
                      <SelectItem value="agency">
                        {t('contact.subjects.agency', 'Agency Partnership')}
                      </SelectItem>
                      <SelectItem value="feedback">
                        {t('contact.subjects.feedback', 'Feedback')}
                      </SelectItem>
                      <SelectItem value="other">{t('contact.subjects.other', 'Other')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>{t('contact.form.message', 'Message')} *</Label>
                  <Textarea
                    required
                    rows={5}
                    placeholder={t('contact.form.messagePlaceholder', 'How can we help you?')}
                  />
                </div>

                <Button type="submit" className="w-full gap-2" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      {t('contact.form.sending', 'Sending...')}
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4" />
                      {t('contact.form.submit', 'Send Message')}
                    </>
                  )}
                </Button>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
