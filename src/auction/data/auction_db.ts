import { AuctionListing } from '../../models/auction_listing';
import { Event } from '../../event';

export class AuctionDB {
  private _listings: AuctionListing[] = [];
  public readonly itemListed = new Event<AuctionListing>();

  public length(): number {
    return this._listings.length;
  }

  add(listing: AuctionListing): number {
    const index = this._listings.length;

    this._listings.push(listing);
    this.itemListed.invoke(listing);

    return index;
  }

  remove(listing: AuctionListing): number {
    const index: number = this._listings.indexOf(listing);
    if (index !== -1) this._listings.splice(index, 1);

    return index;
  }

  getAll(): ArrayIterator<[number, AuctionListing]> {
    return this._listings.entries();
  }

  getListingIndex(listing: AuctionListing): number | null {
    const index = this._listings.indexOf(listing);
    return index !== -1 ? index : null;
  }

  getListingFromIndex(index: number): AuctionListing | null {
    if (index < 0 || index > this._listings.length) return null;

    return this._listings[index];
  }

 public getListings(start: number, offset: number): AuctionListing[] {
  if (start < 0 || offset <= 0 || start >= this._listings.length) {
    return [];
  }

  return this._listings.slice(start, start + offset);
}

  clear(): void {
    this._listings = [];
  }
}