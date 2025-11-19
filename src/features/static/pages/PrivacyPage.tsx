import { useTranslation } from 'react-i18next';

export function PrivacyPage() {
  const { t } = useTranslation('common');

  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      <h1 className="text-3xl font-bold tracking-tight mb-8">
        {t('privacy.title', 'Privacy Policy')}
      </h1>

      <div className="prose prose-gray max-w-none space-y-8">
        <p className="text-muted-foreground">
          {t('privacy.lastUpdated', 'Last updated: January 1, 2026')}
        </p>

        <section>
          <h2 className="text-xl font-semibold">
            {t('privacy.sections.overview.title', '1. Overview')}
          </h2>
          <p className="text-muted-foreground leading-relaxed">
            {t(
              'privacy.sections.overview.text',
              'Immobilier.ch is committed to protecting your privacy. This policy explains how we collect, use, and safeguard your personal data in accordance with Swiss Federal Act on Data Protection (FADP) and the General Data Protection Regulation (GDPR).'
            )}
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold">
            {t('privacy.sections.collection.title', '2. Data Collection')}
          </h2>
          <p className="text-muted-foreground leading-relaxed">
            {t(
              'privacy.sections.collection.text',
              'We collect personal data that you provide directly (name, email, phone number) when creating an account, submitting inquiries, or using our services. We also collect usage data such as browser type, IP address, and pages visited.'
            )}
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold">
            {t('privacy.sections.usage.title', '3. How We Use Your Data')}
          </h2>
          <p className="text-muted-foreground leading-relaxed">
            {t(
              'privacy.sections.usage.text',
              'Your data is used to provide and improve our services, process property inquiries, send property alerts, communicate with you about your account, and comply with legal obligations.'
            )}
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold">
            {t('privacy.sections.sharing.title', '4. Data Sharing')}
          </h2>
          <p className="text-muted-foreground leading-relaxed">
            {t(
              'privacy.sections.sharing.text',
              'We share your contact information with property owners and agencies only when you submit a property inquiry. We do not sell your personal data to third parties.'
            )}
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold">
            {t('privacy.sections.cookies.title', '5. Cookies')}
          </h2>
          <p className="text-muted-foreground leading-relaxed">
            {t(
              'privacy.sections.cookies.text',
              'We use essential cookies for authentication and session management. Analytics cookies are used to understand how visitors interact with our website. You can manage cookie preferences through your browser settings.'
            )}
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold">
            {t('privacy.sections.rights.title', '6. Your Rights')}
          </h2>
          <p className="text-muted-foreground leading-relaxed">
            {t(
              'privacy.sections.rights.text',
              'You have the right to access, correct, delete, or export your personal data at any time. You can also object to data processing or withdraw consent. To exercise these rights, contact us at privacy@immobilier.ch.'
            )}
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold">
            {t('privacy.sections.security.title', '7. Data Security')}
          </h2>
          <p className="text-muted-foreground leading-relaxed">
            {t(
              'privacy.sections.security.text',
              'We implement industry-standard security measures including encryption, secure servers, and regular security audits to protect your personal data. All data is stored on servers located in Switzerland.'
            )}
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold">
            {t('privacy.sections.retention.title', '8. Data Retention')}
          </h2>
          <p className="text-muted-foreground leading-relaxed">
            {t(
              'privacy.sections.retention.text',
              'We retain your personal data only as long as necessary to fulfill the purposes outlined in this policy. Account data is deleted within 30 days of account closure.'
            )}
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold">
            {t('privacy.sections.contact.title', '9. Contact')}
          </h2>
          <p className="text-muted-foreground leading-relaxed">
            {t(
              'privacy.sections.contact.text',
              'For privacy-related inquiries, contact our Data Protection Officer at privacy@immobilier.ch or write to us at Rue du Marché 1, 1204 Genève, Switzerland.'
            )}
          </p>
        </section>
      </div>
    </div>
  );
}
