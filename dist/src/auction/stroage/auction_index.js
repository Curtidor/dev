"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuctionService = exports.AuctionStore = exports.SparseIndexArray = void 0;
const server_1 = require("../../../tests/__mocks__/@minecraft/server");
const auction_listing_1 = require("../../models/auction_listing");
const auction_db_1 = require("./auction_db");
const settings_manager_1 = require("../../admin/settings_manager");
const utils_1 = require("../../utils");
class SparseIndexArray {
    constructor() {
        this._indexes = [];
        this._openIndexes = [];
        this._indexes = new Array();
        this._openIndexes = new Array();
    }
    push(value) {
        const index = this._openIndexes.pop();
        if (index !== undefined) {
            this._indexes[index] = value;
            return index;
        }
        this._indexes.push(value);
        return this._indexes.length - 1;
    }
    removeAtIndex(index) {
        if (index > this._indexes.length || index < 0)
            return;
        this._indexes[index] = null;
        this._openIndexes.push(index);
    }
    removeByValue(value) {
        const index = this._indexes.indexOf(value);
        this.removeAtIndex(index);
        return index;
    }
    getIndexValues() {
        return this._indexes;
    }
    getOpenIndexValues() {
        return this._openIndexes;
    }
    length() {
        return this._indexes.length;
    }
}
exports.SparseIndexArray = SparseIndexArray;
class CategoryTable {
    constructor() {
        this._catergoryTable = CategoryTable._createCategoryMaping();
    }
    hasEntries() {
        for (let cat of auction_listing_1.categories) {
            if (this.getIndexArray(cat).length() !== 0)
                return true;
        }
        return false;
    }
    size() {
        let size = 0;
        for (let cat of auction_listing_1.categories) {
            size += this.getIndexArray(cat).length();
        }
        return size;
    }
    getIndexArray(category) {
        let indexArray = this._catergoryTable.get(category);
        if (indexArray === undefined) {
            indexArray = new SparseIndexArray();
        }
        this._catergoryTable.set(category, indexArray);
        return indexArray;
    }
    static _createCategoryMaping() {
        const map = new Map();
        for (const cat of auction_listing_1.categories) {
            map.set(cat, new SparseIndexArray());
        }
        return map;
    }
}
class AuctionStore {
    constructor() {
        this._auctionDB = new auction_db_1.AuctionDB();
        this._categoryTable = new CategoryTable();
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
        for (const cat of auction_listing_1.categories) {
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
            sellerMap = new CategoryTable();
            this._sellerTable.set(sellerName, sellerMap);
        }
        return sellerMap;
    }
}
exports.AuctionStore = AuctionStore;
var SaleStatusCode;
(function (SaleStatusCode) {
    SaleStatusCode[SaleStatusCode["Sold"] = 0] = "Sold";
    SaleStatusCode[SaleStatusCode["NotEnoughFunds"] = 1] = "NotEnoughFunds";
    SaleStatusCode[SaleStatusCode["AlreadyBought"] = 2] = "AlreadyBought";
    SaleStatusCode[SaleStatusCode["InvalidListing"] = 3] = "InvalidListing";
})(SaleStatusCode || (SaleStatusCode = {}));
class AuctionService {
    constructor() {
        this._auctionStore = new AuctionStore();
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
            return { success: false, reason: SaleStatusCode.InvalidListing };
        else if (listing.sold)
            return { success: false, reason: SaleStatusCode.AlreadyBought };
        else if (buyerInfo.amount < listing.price)
            return { success: false, reason: SaleStatusCode.NotEnoughFunds };
        listing.sold = true;
        return { success: true, reason: SaleStatusCode.Sold };
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
        let listings = this._resolveListings(indexSet);
        listings = this._filterListingsByPrice(listings, options.price);
        return listings;
    }
    loadDumps() {
        const dumps = server_1.world
            .getDimension('overworld')
            .getEntities({ type: 'tm:auction_dump', tags: ['auction-dump'] });
        for (const dump of dumps) {
            const inventory = dump.getComponent('minecraft:inventory').container;
            const tags = dump.getTags();
            const sellerTag = tags.find((tag) => tag.startsWith('seller:'));
            if (!sellerTag)
                continue;
            for (let i = 0; i < inventory.size; i++) {
                const item = inventory.getItem(i);
                if (!item)
                    continue;
                const lore = item.getLore();
                const restored = auction_listing_1.AuctionListing.fromLore(item, lore);
                if (restored) {
                    this.addListing(restored);
                }
            }
        }
    }
    saveDumps() {
        const listings = this._auctionStore.getListings(0, this._auctionStore.dbSize());
        for (const listing of listings) {
            const entity = (0, utils_1.spawnDumpEntity)(listing.seller.sellerName);
            const inventory = entity.getComponent('minecraft:inventory').container;
            console.warn(`Saving ${listings.length} listings for ${listing.seller.sellerName}`);
            for (const listing of listings) {
                console.warn(`Item: ${listing.item.typeId}, Price: ${listing.price}`);
                const item = listing.item.clone();
                item.setLore(listing.toLore());
                inventory.addItem(item);
            }
        }
        this._auctionStore.clear();
    }
    _normalizeQueryOptions(userQueryOptions) {
        const { category, sellerName, price, pageOptions = {} } = userQueryOptions ?? {};
        return {
            category: category ?? auction_listing_1.Category.Default,
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
        if (options.category) {
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
    _resolveListings(indexes) {
        if (indexes.size === 0) {
            return this._auctionStore.getListings(0, (0, settings_manager_1.getSetting)('maxPageListings'));
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
