"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.testAuctionStore = testAuctionStore;
const server_1 = require("./__mocks__/@minecraft/server");
const enums_1 = require("../src/auction/types/enums");
const auction_store_1 = require("../src/auction/core/auction_store");
const auction_listing_1 = require("../src/models/auction_listing");
const utils_1 = require("./utils");
function testGetListingFromCategory() {
    const aStore = new auction_store_1.AuctionStore();
    const listingsArmorCat = new auction_listing_1.AuctionListing(new server_1.ItemStack('minecraft:dimand_sword', 0), 0, new Date(), '12', 'MrBreezy', enums_1.Category.Armor);
    aStore.insertListing(listingsArmorCat);
    (0, utils_1.assert)(aStore.getListingByIndex(aStore.getListingFromCategory(enums_1.Category.Armor).pop() ?? -1) ===
        listingsArmorCat, 'Get Listing From Armor Category');
}
function testGetMultipleListingFromCategory() {
    const aStore = new auction_store_1.AuctionStore();
    const listings = new Array();
    for (let i = 0; i < 10; i++) {
        const listing = new auction_listing_1.AuctionListing(new server_1.ItemStack('minecraft:dimand_sword', 0), 0, new Date(), '12', 'MrBreezy', enums_1.Category.Blocks);
        listings.push(listing);
        aStore.insertListing(listing);
    }
    const queryedListingsIndexes = aStore.getListingFromCategory(enums_1.Category.Blocks, 0, listings.length);
    const collectedListings = queryedListingsIndexes
        .map((index) => aStore.getListingByIndex(index))
        .filter((listing) => {
        return listing !== null;
    });
    (0, utils_1.assert)((0, utils_1.compareArrayValues)(listings, collectedListings), 'Get listings from category');
}
function testAuctionStore() {
    testGetListingFromCategory();
    testGetMultipleListingFromCategory();
}
