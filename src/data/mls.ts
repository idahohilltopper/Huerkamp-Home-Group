// MLS listing display: who the data comes from and the notice shown with every listing.
// The exact wording and logo the NorthstarMLS IDX license requires must be confirmed with the broker;
// change it here and every listing on the site follows.
import { site } from './site';

export const mls = {
  name: 'NorthstarMLS',
  notice: `Listing information comes in part from the Broker Reciprocity (IDX) program of NorthstarMLS. Listings held by brokerages other than ${site.brokerage} show the listing brokerage's name. Information is deemed reliable but not guaranteed and should be checked independently.`,
};

export const listingHref = (mlsNumber: string) => `/homes/listing?mls=${encodeURIComponent(mlsNumber)}`;
