"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const server_1 = require("./__mocks__/@minecraft/server");
const auction_index_1 = require("../src/auction/stroage/auction_index");
const auction_listing_1 = require("../src/models/auction_listing");
function assert(condition, message) {
    if (!condition)
        throw new Error("❌ " + message);
    console.log("✅ " + message);
}
function testAddAndRetrieveListing() {
    const manager = new auction_index_1.AuctionStore();
    const item = new server_1.ItemStack("minecraft:diamond_sword", 1);
    const listing = new auction_listing_1.AuctionListing(item, 500, new Date(), "123", "Curtidor", auction_listing_1.categories[0]);
    manager.insertListing(listing);
    const sellerIndexes = manager.getSellerListings("Curtidor");
    console.log(sellerIndexes.length);
    assert(sellerIndexes.length === 1, "Listing was added and indexed");
    const result = manager.getListingByIndex(sellerIndexes[0]);
    if (result === null) {
        console.error('null result');
        return;
    }
    assert(result !== null, "Listing was retrievable by index");
    assert(result.equals(listing), "Retrieved listing matches original");
}
function testMultipleListingsSameSeller() {
    const manager = new auction_index_1.AuctionStore();
    const seller = "MrBreezy";
    for (let i = 0; i < auction_listing_1.categories.length; i++) {
        const item = new server_1.ItemStack("minecraft:diamond_sword", 1);
        const listing = new auction_listing_1.AuctionListing(item, 100 + i, new Date(), "id-" + i, seller, auction_listing_1.categories[i]);
        manager.insertListing(listing);
    }
    const indexes = manager.getSellerListings(seller);
    assert(indexes.length === auction_listing_1.categories.length, "All 5 listings were indexed for the seller");
    for (let i = 0; i < indexes.length; i++) {
        const listing = manager.getListingByIndex(indexes[i]);
        assert(listing?.seller.sellerName === seller, `Listing ${i} has correct seller`);
    }
}
function testRemoveListing() {
    const manager = new auction_index_1.AuctionStore();
    const item = new server_1.ItemStack("minecraft:diamond_pickaxe", 1);
    const listing = new auction_listing_1.AuctionListing(item, 300, new Date(), "del-1", "Remover", auction_listing_1.categories[1]);
    manager.insertListing(listing);
    const before = manager.getSellerListings("Remover").length;
    manager.removeListing(listing);
    const after = manager.getSellerListings("Remover").length;
    assert(before === 1 && after === 0, "Listing was removed successfully");
}
// Run all tests
testAddAndRetrieveListing();
testMultipleListingsSameSeller();
testRemoveListing();
