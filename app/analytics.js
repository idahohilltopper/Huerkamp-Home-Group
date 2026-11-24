// Google Analytics 4 (Join HHG property). Events never include names, emails, phone numbers or answers.
export const GA_ID = 'G-SC4QMRFH60';

export function track(name, params = {}) {
  try {
    if (typeof window !== 'undefined' && typeof window.gtag === 'function') window.gtag('event', name, params);
  } catch (e) { /* analytics must never break the page */ }
}
