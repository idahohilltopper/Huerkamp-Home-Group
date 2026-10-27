// The call/text consent shown on every website form, kept in one place so the form and the consent record
// stored for each lead (src/lib/lead.mjs) always carry the exact same words.
// Change the wording only with the attorney's sign-off, and bump VERSION so old records keep their meaning.
export const CONSENT_VERSION = '2026-10-27';

export const consentText = (brand = 'Huerkamp Home Group') =>
  `Yes, I agree that ${brand} (Keller Williams Preferred Realty) and its agents may call and text me at the phone number I entered ` +
  'about buying or selling a home and my real estate questions, including marketing calls and texts sent with automated technology ' +
  'or an artificial or prerecorded voice. Consent is not required to submit this form or to buy or sell anything. ' +
  'Message frequency varies; message and data rates may apply. Reply STOP to cancel or HELP for help, or tell us any other way. ' +
  'See our SMS Terms and Privacy Policy.';

/** Shown under the box: what submitting does and doesn't mean. */
export const submitNotice =
  'Submitting this form lets us answer your inquiry by email or a personal phone call. It does not sign you up for automated calls or texts unless you check the box above.';
