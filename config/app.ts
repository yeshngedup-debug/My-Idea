/**
 * App-wide contact config. Set CONTACT_EMAIL in production.
 */
export const APP_CONTACT = {
  email: process.env.CONTACT_EMAIL ?? 'hello@bhutantech.bt',
  name: 'Bhutan Tech Connect',
};
