import { useTranslation } from 'react-i18next';

export function TermsPage() {
  const { t } = useTranslation('common');

  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      <h1 className="text-3xl font-bold tracking-tight mb-8">
        {t('terms.title', 'Terms and Conditions')}
      </h1>

      <div className="prose prose-gray max-w-none space-y-8">
        <p className="text-muted-foreground">
          {t('terms.lastUpdated', 'Last updated: January 1, 2026')}
        </p>

        <section>
          <h2 className="text-xl font-semibold">
            {t('terms.sections.acceptance.title', '1. Acceptance of Terms')}
          </h2>
          <p className="text-muted-foreground leading-relaxed">
            {t(
              'terms.sections.acceptance.text',
              'By accessing and using Immobilier.ch, you agree to be bound by these Terms and Conditions. If you do not agree with any part of these terms, you may not use our services.'
            )}
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold">
            {t('terms.sections.services.title', '2. Description of Services')}
          </h2>
          <p className="text-muted-foreground leading-relaxed">
            {t(
              'terms.sections.services.text',
              'Immobilier.ch provides an online platform for real estate listings in Switzerland. We connect property seekers with property owners and real estate agencies. We do not own or manage any properties listed on our platform.'
            )}
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold">
            {t('terms.sections.accounts.title', '3. User Accounts')}
          </h2>
          <p className="text-muted-foreground leading-relaxed">
            {t(
              'terms.sections.accounts.text',
              'You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account. You must notify us immediately of any unauthorized use of your account.'
            )}
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold">
            {t('terms.sections.listings.title', '4. Property Listings')}
          </h2>
          <p className="text-muted-foreground leading-relaxed">
            {t(
              'terms.sections.listings.text',
              'Property listings are provided by third-party agencies and property owners. While we strive to ensure accuracy, Immobilier.ch is not responsible for the accuracy, completeness, or availability of any listing information.'
            )}
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold">
            {t('terms.sections.intellectual.title', '5. Intellectual Property')}
          </h2>
          <p className="text-muted-foreground leading-relaxed">
            {t(
              'terms.sections.intellectual.text',
              'All content on Immobilier.ch, including text, graphics, logos, and software, is the property of Immobilier.ch or its content suppliers and is protected by Swiss and international copyright laws.'
            )}
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold">
            {t('terms.sections.limitation.title', '6. Limitation of Liability')}
          </h2>
          <p className="text-muted-foreground leading-relaxed">
            {t(
              'terms.sections.limitation.text',
              'Immobilier.ch shall not be liable for any direct, indirect, incidental, special, or consequential damages resulting from the use or inability to use our services.'
            )}
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold">
            {t('terms.sections.law.title', '7. Governing Law')}
          </h2>
          <p className="text-muted-foreground leading-relaxed">
            {t(
              'terms.sections.law.text',
              'These terms are governed by the laws of Switzerland. Any disputes arising from these terms shall be subject to the exclusive jurisdiction of the courts of Geneva, Switzerland.'
            )}
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold">
            {t('terms.sections.contact.title', '8. Contact')}
          </h2>
          <p className="text-muted-foreground leading-relaxed">
            {t(
              'terms.sections.contact.text',
              'For questions about these terms, please contact us at legal@immobilier.ch.'
            )}
          </p>
        </section>
      </div>
    </div>
  );
}
