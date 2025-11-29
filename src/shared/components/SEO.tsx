/**
 * SEO Component using React Helmet Async
 * Manages document head for each page — title, description, og tags.
 */

import { Helmet } from 'react-helmet-async';
import { useTranslation } from 'react-i18next';

interface SEOProps {
  /** Page title — appended to site name */
  title?: string;
  /** Full title override (no site name appended) */
  titleFull?: string;
  /** Meta description */
  description?: string;
  /** Canonical URL */
  canonical?: string;
  /** Open Graph image */
  image?: string;
  /** Open Graph type */
  type?: 'website' | 'article';
  /** Prevent indexing */
  noindex?: boolean;
}

const SITE_NAME = 'Immobilier.ch';
const DEFAULT_DESCRIPTION =
  'Find your dream property in Switzerland. Browse apartments, houses, and commercial spaces for rent and sale.';

export function SEO({
  title,
  titleFull,
  description = DEFAULT_DESCRIPTION,
  canonical,
  image,
  type = 'website',
  noindex = false,
}: SEOProps) {
  const { i18n } = useTranslation();
  const pageTitle = titleFull || (title ? `${title} | ${SITE_NAME}` : SITE_NAME);

  return (
    <Helmet>
      <html lang={i18n.language} />
      <title>{pageTitle}</title>
      <meta name="description" content={description} />

      {/* Open Graph */}
      <meta property="og:title" content={pageTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:type" content={type} />
      <meta property="og:site_name" content={SITE_NAME} />
      {image && <meta property="og:image" content={image} />}
      {canonical && <meta property="og:url" content={canonical} />}

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={pageTitle} />
      <meta name="twitter:description" content={description} />
      {image && <meta name="twitter:image" content={image} />}

      {/* Canonical */}
      {canonical && <link rel="canonical" href={canonical} />}

      {/* Robots */}
      {noindex && <meta name="robots" content="noindex, nofollow" />}

      {/* Language alternate links */}
      {canonical && (
        <>
          <link
            rel="alternate"
            hrefLang="en"
            href={canonical.replace(/\/(en|fr|de|it)\//, '/en/')}
          />
          <link
            rel="alternate"
            hrefLang="fr"
            href={canonical.replace(/\/(en|fr|de|it)\//, '/fr/')}
          />
          <link
            rel="alternate"
            hrefLang="de"
            href={canonical.replace(/\/(en|fr|de|it)\//, '/de/')}
          />
          <link
            rel="alternate"
            hrefLang="it"
            href={canonical.replace(/\/(en|fr|de|it)\//, '/it/')}
          />
        </>
      )}
    </Helmet>
  );
}
