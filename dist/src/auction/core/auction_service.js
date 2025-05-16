"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuctionService = void 0;
const auction_store_1 = require("./auction_store");
const enums_1 = require("../../auction/types/enums");
const settings_manager_1 = require("../../admin/settings_manager");
class AuctionService {
    constructor() {
        this._auctionStore = new auction_store_1.AuctionStore();
    }
    /**
     * Inserts a new auction listing.
     * @param listing The listing to add.
     * @returns The index where the listing is stored in the DB.
     */
    addListing(listing) {
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
    buyListing(buyerInfo) {
        const listing = this._auctionStore.getListingByIndex(buyerInfo.index);
        if (!listing)
            return { success: false, reason: enums_1.SaleStatusCode.InvalidListing };
        else if (listing.sold)
            return { success: false, reason: enums_1.SaleStatusCode.AlreadyBought };
        else if (buyerInfo.amount < listing.price)
            return { success: false, reason: enums_1.SaleStatusCode.NotEnoughFunds };
        listing.sold = true;
        return { success: true, reason: enums_1.SaleStatusCode.Sold };
    }
    /**
     * Stub for future bidding support.
     */
    bidOnListing(bidInfo) {
        console.log('Not supported yet!');
    }
    /**
     * Returns a list of auction listings based on filters like category, seller, etc.
     * Fallbacks to general listings if no filters match.
     *
     * @param userQueryOptions Optional query filters.
     * @returns A filtered list of AuctionListings.
     */
    queryListing(userQueryOptions) {
        const options = this._normalizeQueryOptions(userQueryOptions);
        const indexSet = this._gatherMatchingIndexes(options);
        let listings = this._resolveListings(indexSet, 0, options.pageOptions.maxListings ?? 0); // shouuld never be 0
        listings = this._filterListingsByPrice(listings, options.price);
        return listings;
    }
    clear() {
        this._auctionStore.clear();
    }
    _normalizeQueryOptions(userQueryOptions) {
        const { category, sellerName, price, pageOptions = {} } = userQueryOptions ?? {};
        return {
            category: category ?? enums_1.Category.Default,
            sellerName: sellerName ?? '',
            price: price ?? -1,
            pageOptions: {
                offset: pageOptions.offset ?? 0,
                maxListings: pageOptions.maxListings ?? (0, settings_manager_1.getSetting)('maxPageListings')
            }
        };
    }
    _gatherMatchingIndexes(options) {
        const indexes = new Set();
        if (options.category && options.category !== enums_1.Category.Default) {
            for (const idx of this._auctionStore.getListingFromCategory(options.category, options.pageOptions.offset, options.pageOptions.maxListings)) {
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
    _resolveListings(indexes, start, offset) {
        if (indexes.size === 0) {
            return this._auctionStore.getListings(start, offset);
        }
        return Array.from(indexes)
            .map((idx) => this._auctionStore.getListingByIndex(idx))
            .filter((l) => !!l); // filters null
    }
    _filterListingsByPrice(listings, maxPrice) {
        if (maxPrice === -1)
            return listings;
        return listings.filter((listing) => listing.price <= maxPrice);
    }
}
exports.AuctionService = AuctionService;
