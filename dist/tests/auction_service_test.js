"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.testAuctionService = testAuctionService;
const server_1 = require("./__mocks__/@minecraft/server");
const auction_service_1 = require("../src/auction/core/auction_service");
const auction_listing_1 = require("../src/models/auction_listing");
const enums_1 = require("../src/auction/types/enums");
const utils_1 = require("./utils");
function testAddListing() {
    const aService = new auction_service_1.AuctionService();
    const [sellerID, sellerName] = ['1234', 'Mrbreezy4'];
    const listing = new auction_listing_1.AuctionListing(new server_1.ItemStack('minecraft:dimond_sword', 1), 0, new Date(), sellerID, sellerName, enums_1.Category.Tools);
    aService.addListing(listing);
    (0, utils_1.assert)(aService.queryListing().pop() === listing, 'Auction Service Add Listing');
}
function testAddMultipleListings() {
    const aService = new auction_service_1.AuctionService();
    const [sellerID, sellerName] = ['1234', 'Mrbreezy4'];
    const listings = [];
    const maxListings = 50;
    for (let i = 0; i < maxListings; i++) {
        const listing = new auction_listing_1.AuctionListing(new server_1.ItemStack('minecraft:dimond_sword', 1), i, new Date(), sellerID, sellerName, enums_1.Category.Tools);
        aService.addListing(listing);
        listings.push(listing);
    }
    const query = { pageOptions: { maxListings: maxListings } };
    console.log(aService.queryListing(query).length, listings.length);
    (0, utils_1.assert)((0, utils_1.compareArrayValues)(aService.queryListing(query), listings), 'Auction Service Add Many Listing');
}
function testQueryListing() {
    const aService = new auction_service_1.AuctionService();
    const [sellerID, sellerName] = ['1234', 'Mrbreezy4'];
    const listingExpected = new auction_listing_1.AuctionListing(new server_1.ItemStack('minecraft:dimond_sword', 1), 0, new Date(), sellerID, sellerName, enums_1.Category.Tools);
    const listingBad = new auction_listing_1.AuctionListing(new server_1.ItemStack('minecraft:dimond_sword', 1), 12, new Date(), sellerID, 'bob', enums_1.Category.Tools);
    const listingBad1 = new auction_listing_1.AuctionListing(new server_1.ItemStack('minecraft:dimond_sword', 1), 0, new Date(), sellerID, 'jeff', enums_1.Category.Tools);
    aService.addListing(listingBad1);
    aService.addListing(listingExpected);
    aService.addListing(listingBad);
    const queryName = { sellerName: sellerName };
    const queryPrice = { price: 0 };
    const queryCat = { category: enums_1.Category.Tools };
    (0, utils_1.assert)(aService.queryListing(queryName).pop() === listingExpected, 'Query Name');
    (0, utils_1.assert)(aService.queryListing(queryPrice).pop() === listingExpected, 'Query Price');
    (0, utils_1.assert)(aService.queryListing(queryCat).find((listin) => { return listingExpected.equals(listin); }) !== undefined, 'Query Category');
}
function testAuctionService() {
    testAddListing();
    testAddMultipleListings();
    testQueryListing();
}
