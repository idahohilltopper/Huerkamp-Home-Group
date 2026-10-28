// Broker Reciprocity logos (NorthstarMLS Rule 12.3(c), (d), (g)): the files RMLS gives Participants, unaltered. Save them
// as public/mls/br-logo.png (at least 95x35 px) and public/mls/br-thumb.png (the "little black house", at least 35x35).
// Build-time only (it checks the files exist), so it's kept out of src/data/mls.ts, which browser scripts also import.
import { existsSync } from 'node:fs';
export const BR_LOGO = existsSync('public/mls/br-logo.png') ? '/mls/br-logo.png' : null;
export const BR_THUMB = existsSync('public/mls/br-thumb.png') ? '/mls/br-thumb.png' : null;
