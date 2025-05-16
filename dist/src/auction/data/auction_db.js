"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuctionDB = void 0;
const event_1 = require("../../event");
class AuctionDB {
    constructor() {
        this._listings = [];
        this.itemListed = new event_1.Event();
    }
    length() {
        return this._listings.length;
    }
    add(listing) {
        const index = this._listings.length;
        this._listings.push(listing);
        this.itemListed.invoke(listing);
        return index;
    }
    remove(listing) {
        const index = this._listings.indexOf(listing);
        if (index !== -1)
            this._listings.splice(index, 1);
        return index;
    }
    getAll() {
        return this._listings.entries();
    }
    getListingIndex(listing) {
        const index = this._listings.indexOf(listing);
        return index !== -1 ? index : null;
    }
    getListingFromIndex(index) {
        if (index < 0 || index > this._listings.length)
            return null;
        return this._listings[index];
    }
    getListings(start, offset) {
        if (start < 0 || offset <= 0 || start >= this._listings.length) {
            return [];
        }
        return this._listings.slice(start, start + offset);
    }
    clear() {
        this._listings = [];
    }
}
exports.AuctionDB = AuctionDB;
