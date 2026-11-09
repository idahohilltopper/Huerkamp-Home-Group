// MSP Airport and the major Twin Cities sports venues, for "Getting around" on listing pages (NearbyPlaces.astro).
// Points from Overture Maps places (checked Nov 9, 2026). Venue and team names are used only to say what plays where.
// Renamed venues: Xcel Energy Center became Grand Casino Arena on Sept. 3, 2025; TCF Bank Stadium is Huntington Bank Stadium.
export interface Landmark { name: string; what: string; lat: number; lng: number }

export const airport: Landmark = { name: 'MSP Airport', what: 'Terminal 1', lat: 44.88493, lng: -93.21222 };

export const venues: Landmark[] = [
  { name: 'U.S. Bank Stadium', what: 'Vikings', lat: 44.97378, lng: -93.25756 },
  { name: 'Target Field', what: 'Twins', lat: 44.98175, lng: -93.27765 },
  { name: 'Target Center', what: 'Timberwolves and Lynx', lat: 44.97944, lng: -93.27602 },
  { name: 'Grand Casino Arena', what: 'Wild', lat: 44.94481, lng: -93.10112 },
  { name: 'Allianz Field', what: 'Minnesota United', lat: 44.95313, lng: -93.16489 },
  { name: 'CHS Field', what: 'St. Paul Saints', lat: 44.95047, lng: -93.08516 },
  { name: 'Huntington Bank Stadium', what: 'Gophers football', lat: 44.97575, lng: -93.22561 },
];
