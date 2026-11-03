// Broker Reciprocity logos (NorthstarMLS Rule 12.3(c), (d), (g); BR agreement Appendix A: use only "in the exact form
// authorized by RMLS, without any alteration"). public/mls/br-logo.jpg is RMLS's own logo file, taken byte-for-byte from
// RMLS's "Broker Reciprocity Information & Technical Documentation" (500x108 px); never edit, recolor or crop it.
// If RMLS sends its separate "little black house" thumbnail, save it unaltered as public/mls/br-thumb.png and it is used
// on listing cards; until then the cards carry the full logo, small (the rules accept either one).
// Build-time only (it checks the files exist), so it's kept out of src/data/mls.ts, which browser scripts also import.
import { existsSync } from 'node:fs';
const first = (...files: string[]) => files.find((f) => existsSync(`public${f}`)) ?? null;
export const BR_LOGO = first('/mls/br-logo.png', '/mls/br-logo.jpg');
/** Width and height to show the full logo at (its shape is 500 x 108). */
export const BR_LOGO_SIZE = { w: 162, h: 35 };
export const BR_THUMB = first('/mls/br-thumb.png') ?? BR_LOGO;
/** Listing cards: the little house at 35 x 35, or the full logo 18 px tall. */
export const BR_THUMB_SIZE = first('/mls/br-thumb.png') ? { w: 35, h: 35 } : { w: 83, h: 18 };
