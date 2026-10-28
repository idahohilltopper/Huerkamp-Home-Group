// NorthstarMLS (Regional Multiple Listing Service of Minnesota, "RMLS") Broker Reciprocity (IDX) display rules, in one
// place. Sources, checked 2026-10-28: RMLS Rules and Regulations effective January 1, 2025, Section 12
// (northstarmls.com/wp-content/uploads/2025/01/Rules-and-Regs-Dec-6-2024.pdf) and the Broker Reciprocity Information and
// Technical Agreement, section 6 and Appendix D (northstarmls.com/wp-content/uploads/2023/10/
// Broker-Reciprocity-Information-and-Technical-Agreement-.pdf). Wording marked "exact" must not be changed.
import { site } from './site';

/** The broker Participant whose site this is (Rule 12.2(h)); its own listings may show every field. */
export const BROKER = site.brokerage;
export const LICENSED_IN = 'Minnesota';
export const isOwnBrokerage = (brokerage?: string | null) => /keller williams preferred/i.test(brokerage ?? '');

/** Rule 12.3(f): a thumbnail of another broker's listing may show only address, price, MLS number, photo, listing
 *  broker and the Broker Reciprocity logo. Set true only if NorthstarMLS confirms in writing that more is allowed. */
export const OTHER_THUMB_DETAILS = false;


export const mls = {
  name: 'NorthstarMLS',
  // Section 6.1.1 (data source, shown with the BR logo).
  source: `The data relating to real estate for sale on this web site comes in part from the Broker Reciprocity℠ Program of the Regional Multiple Listing Service of Minnesota, Inc. Real estate listings held by brokerage firms other than ${BROKER} are marked with the Broker Reciprocity℠ logo or the Broker Reciprocity℠ thumbnail logo (little black house) and detailed information about them includes the name of the listing brokers.`,
  // Rule 12.3(i), exact; at least as large as the largest type used for the listing data.
  disclaimer: `${BROKER} is not a Multiple Listing Service (MLS), nor does it offer MLS access. This website is a service of ${BROKER}, a broker Participant of the Regional Multiple Listing Service of Minnesota, Inc. Information Deemed Reliable But Not Guaranteed.`,
  // Section 6.2.1 (recommended): we show only listings in the communities this site covers.
  partial: `${BROKER} participates in Regional MLS’s Broker Reciprocity℠ program, allowing us to display other brokers’ listings on our site. However, ${BROKER} displays only listings located in the Minnesota communities covered on this website.`,
  // Section 6.1.3, option B, exact (on every detailed display of another broker's listing).
  copyright: (year = new Date().getFullYear()) => `© ${year} Regional Multiple Listing Service of Minnesota, Inc. All rights reserved.`,
  // Section 6.2.2 (recommended).
  freshness: 'Some properties which appear for sale on this web site may subsequently have sold and may no longer be available.',
  // Kept for older imports: the short notice under listing groups.
  notice: '',
};
mls.notice = `${mls.source} ${mls.disclaimer}`;

/** Section 10: contingency types and their definitions (shown when a listing's contingency isn't "None"). */
export const CONTINGENCIES: Record<string, string> = {
  'Application Received': 'A rental application has been received. The property is still available for showing and accepting back-up applications.',
  Inspection: 'A purchase agreement has been accepted, but the agreement is contingent on an inspection. The property is still available for showing and accepting back-up offers.',
  Other: 'A purchase agreement has been accepted for this property. The offer has contingencies that must be resolved before the sale is final. The property is still available for showing and accepting back-up offers.',
  'Sale of Another Property': 'A purchase agreement has been accepted for this property, but the sale is contingent on sale of another property. This property is still available for showings and accepting backup offers.',
  'Subject to Statutory Rescission': 'A purchase agreement has been accepted. The buyer is allowed a 10 day period to review the association documents before making the purchase agreement final. The property is still available for showing and accepting back-up offers.',
  'Third Party Approval': 'A purchase agreement has been accepted, but final acceptance is dependent on acceptance by a third party. The property is still available for showings and accepting back-up offers.',
};

export const listingHref = (mlsNumber: string) => `/homes/listing?mls=${encodeURIComponent(mlsNumber)}`;
export const EULA_PATH = '/license-agreement';
