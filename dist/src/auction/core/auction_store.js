"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuctionStore = void 0;
const auction_db_1 = require("../../auction/data/auction_db");
const category_table_1 = require("./category_table");
const enums_1 = require("../../auction/types/enums");
class AuctionStore {
    constructor() {
        this._auctionDB = new auction_db_1.AuctionDB();
        this._categoryTable = new category_table_1.CategoryTable();
        this._sellerTable = new Map();
    }
    insertListing(listing) {
        const listingIndexInDB = this._auctionDB.add(listing);
        const categoeryTable = this._categoryTable.getIndexArray(listing.category);
        categoeryTable.push(listingIndexInDB);
        const sellerTable = this._getSellerTable(listing.seller.sellerName);
        sellerTable.getIndexArray(listing.category).push(listingIndexInDB);
        return listingIndexInDB;
    }
    removeListing(listing) {
        const removedIndex = this._auctionDB.remove(listing);
        if (removedIndex === -1)
            return;
        this._categoryTable.getIndexArray(listing.category).removeByValue(removedIndex);
        this._getSellerTable(listing.seller.sellerName)
            .getIndexArray(listing.category)
            .removeByValue(removedIndex);
    }
    /**
     * Retrieves a list of listing indexes from the global auction database
     * for a specific seller. The indexes returned can be used to access
     * the actual `AuctionListing` instances in the AuctionDB.
     *
     * The lookup is done by resolving seller-level category indexes into
     * the global category table, which in turn maps to DB indexes.
     *
     * @param sellerName - The name of the seller whose listings to retrieve.
     * @param maxListings - Optional maximum number of listings to return. If not provided, all listings will be returned.
     * @returns An array of numeric indexes corresponding to positions in the AuctionDB.
     *
     * @remarks
     * The indexes returned here are not necessarily contiguous or sorted.
     * They are resolved through the category mapping structure to preserve
     * memory layout and performance characteristics.
     *
     * Example usage:
     * ```ts
     * const indexes = auctionStore.getSellerListings("Curtidor", 10);
     * const listings = indexes.map(i => auctionDB.get(i));
     * ```
     */
    getSellerListings(sellerName, maxListings) {
        const sellerTable = this._getSellerTable(sellerName);
        if (!sellerTable.hasEntries())
            return [];
        const listingsIndexes = []; // maybe pre alloc later since we know the limit
        const totalLimit = maxListings ?? sellerTable.size();
        for (const cat of enums_1.categories) {
            const sellerIArray = sellerTable.getIndexArray(cat);
            for (const localIndex of sellerIArray.getIndexValues()) {
                if (localIndex === null)
                    continue;
                listingsIndexes.push(localIndex);
                if (listingsIndexes.length >= totalLimit)
                    return listingsIndexes;
            }
        }
        return listingsIndexes;
    }
    getListingFromCategory(category, offset = 0, maxListings) {
        const indexArray = this._categoryTable.getIndexArray(category);
        const allIndexes = indexArray.getIndexValues();
        const listings = [];
        for (let i = offset; i < allIndexes.length; i++) {
            const value = allIndexes[i];
            if (value !== null) {
                listings.push(value);
            }
            if (maxListings !== undefined && listings.length >= maxListings) {
                break;
            }
        }
        return listings;
    }
    dbSize() {
        return this._auctionDB.length();
    }
    getListings(start, offset) {
        return this._auctionDB.getListings(start, offset);
    }
    clear() {
        this._auctionDB.clear();
    }
    getListingByIndex(index) {
        return this._auctionDB.getListingFromIndex(index);
    }
    _getSellerTable(sellerName) {
        let sellerMap = this._sellerTable.get(sellerName);
        if (!sellerMap) {
            sellerMap = new category_table_1.CategoryTable();
            this._sellerTable.set(sellerName, sellerMap);
        }
        return sellerMap;
    }
}
exports.AuctionStore = AuctionStore;
