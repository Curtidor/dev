import { AuctionStore } from "./auction_store";
import { AuctionListing } from "../../models/auction_listing";
import { Category, SaleStatusCode } from "../../auction/types/enums";
import { BuyInformation, QueryOptions, SaleResponse } from "../../auction/types/types";
import { getSetting } from "../../admin/settings_manager";

export class AuctionService {
  private readonly _auctionStore: AuctionStore;

  constructor() {
    this._auctionStore = new AuctionStore();
  }

  /**
   * Inserts a new auction listing.
   * @param listing The listing to add.
   * @returns The index where the listing is stored in the DB.
   */
  public addListing(listing: AuctionListing): number {
    return this._auctionStore.insertListing(listing);
  }

  /**
   * Attempts to purchase a listing if the buyer meets the conditions.
   *
   * Conditions checked:
   * - Listing must exist.
   * - Listing must not be already sold.
   * - Buyer must meet or exceed the listing price.
   *
   * @param buyerInfo Information about the buyer and the desired purchase.
   * @returns An object indicating whether the sale was successful and the reason.
   */
  public buyListing(buyerInfo: BuyInformation): SaleResponse {
    const listing = this._auctionStore.getListingByIndex(buyerInfo.index);
    if (!listing) return { success: false, reason: SaleStatusCode.InvalidListing };
    else if (listing.sold) return { success: false, reason: SaleStatusCode.AlreadyBought };
    else if (buyerInfo.amount < listing.price)
      return { success: false, reason: SaleStatusCode.NotEnoughFunds };

    listing.sold = true;
    return { success: true, reason: SaleStatusCode.Sold };
  }

  /**
   * Stub for future bidding support.
   */
  public bidOnListing(bidInfo: BuyInformation): void {
    console.log('Not supported yet!');
  }

  /**
   * Returns a list of auction listings based on filters like category, seller, etc.
   * Fallbacks to general listings if no filters match.
   *
   * @param userQueryOptions Optional query filters.
   * @returns A filtered list of AuctionListings.
   */
  public queryListing(userQueryOptions?: QueryOptions): AuctionListing[] {
    const options = this._normalizeQueryOptions(userQueryOptions);

    const indexSet = this._gatherMatchingIndexes(options);

    let listings = this._resolveListings(indexSet, 0, options.pageOptions.maxListings ?? 0); // shouuld never be 0

    listings = this._filterListingsByPrice(listings, options.price);

    return listings;
  }

  public clear(){
    this._auctionStore.clear();
  }

  private _normalizeQueryOptions(userQueryOptions?: QueryOptions): Required<QueryOptions> {
    const { category, sellerName, price, pageOptions = {} } = userQueryOptions ?? {};

    return {
      category: category ?? Category.Default,
      sellerName: sellerName ?? '',
      price: price ?? -1,
      pageOptions: {
        offset: pageOptions.offset ?? 0,
        maxListings: pageOptions.maxListings ?? getSetting('maxPageListings')
      }
    };
  }

  private _gatherMatchingIndexes(options: Required<QueryOptions>): Set<number> {
    const indexes = new Set<number>();

    if (options.category && options.category !== Category.Default) {
      for (const idx of this._auctionStore.getListingFromCategory(
        options.category,
        options.pageOptions.offset,
        options.pageOptions.maxListings
      )) {
        indexes.add(idx);
      }
    }

    if (options.sellerName) {
      for (const idx of this._auctionStore.getSellerListings(options.sellerName)) {
        indexes.add(idx);
      }
    }

    return indexes;
  }

  private _resolveListings(indexes: Set<number>, start: number, offset: number): AuctionListing[] {
    if (indexes.size === 0) {
      return this._auctionStore.getListings(start, offset);
    }

    return Array.from(indexes)
      .map((idx) => this._auctionStore.getListingByIndex(idx))
      .filter((l): l is AuctionListing => !!l); // filters null
  }

  private _filterListingsByPrice(listings: AuctionListing[], maxPrice: number): AuctionListing[] {
    if (maxPrice === -1) return listings;

    return listings.filter((listing) => listing.price <= maxPrice);
  }
}
