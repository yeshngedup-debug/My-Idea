/**
 * Public site identity. Names, contact details and the public URL come from
 * the existing app config and marketing navigation so metadata, the header
 * and server-generated links stay in sync.
 */
import { APP_CONTACT, APP_URL } from '@/config/app';
import { SITE } from '@/components/marketing/nav';

export const SITE_INFO = {
  name: APP_CONTACT.name,
  tagline: SITE.tagline,
  description:
    'Bhutan Tech Connect connects Bhutanese students and startup founders through focused, paid project work.',
  url: APP_URL,
  locale: 'en_BT',
  homeHref: SITE.homeHref,
  contact: {
    name: APP_CONTACT.name,
    email: APP_CONTACT.email,
  },
} as const;

export const siteName = SITE_INFO.name;
export const contactEmail = SITE_INFO.contact.email;
