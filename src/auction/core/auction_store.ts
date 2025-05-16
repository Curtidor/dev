import { AuctionListing } from "../../models/auction_listing";
import { AuctionDB } from "../../auction/data/auction_db";
import { CategoryTable } from "./category_table";
import { categories, Category } from "../../auction/types/enums";

export class AuctionStore {
  private readonly _auctionDB: AuctionDB;
  private readonly _sellerTable: Map<string, CategoryTable>;
  private readonly _categoryTable: CategoryTable;

  constructor() {
    this._auctionDB = new AuctionDB();
    this._categoryTable = new CategoryTable();
    this._sellerTable = new Map();
  }

  public insertListing(listing: AuctionListing): number {
    const listingIndexInDB = this._auctionDB.add(listing);

    const categoeryTable = this._categoryTable.getIndexArray(listing.category);
    categoeryTable.push(listingIndexInDB);

    const sellerTable = this._getSellerTable(listing.seller.sellerName);
    sellerTable.getIndexArray(listing.category).push(listingIndexInDB);

    return listingIndexInDB;
  }

  public removeListing(listing: AuctionListing) {
    const removedIndex: number = this._auctionDB.remove(listing);
    if (removedIndex === -1) return;

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
  public getSellerListings(sellerName: string, maxListings?: number): number[] {
    const sellerTable = this._getSellerTable(sellerName);
    if (!sellerTable.hasEntries()) return [];

    const listingsIndexes: number[] = []; // maybe pre alloc later since we know the limit
    const totalLimit = maxListings ?? sellerTable.size();

    for (const cat of categories) {
      const sellerIArray = sellerTable.getIndexArray(cat);
      for (const localIndex of sellerIArray.getIndexValues()) {
        if (localIndex === null) continue;
        listingsIndexes.push(localIndex);
        if (listingsIndexes.length >= totalLimit) return listingsIndexes;
      }
    }

    return listingsIndexes;
  }

  public getListingFromCategory(
    category: Category,
    offset: number = 0,
    maxListings?: number
  ): number[] {
    const indexArray = this._categoryTable.getIndexArray(category);
    const allIndexes = indexArray.getIndexValues();

    const listings: number[] = [];

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

  public dbSize(): number {
    return this._auctionDB.length();
  }
  public getListings(start: number, offset: number): AuctionListing[] {
    return this._auctionDB.getListings(start, offset);
  }

  public clear() {
    this._auctionDB.clear();
  }

  public getListingByIndex(index: number): AuctionListing | null {
    return this._auctionDB.getListingFromIndex(index);
  }

  private _getSellerTable(sellerName: string): CategoryTable {
    let sellerMap = this._sellerTable.get(sellerName);

    if (!sellerMap) {
      sellerMap = new CategoryTable();
      this._sellerTable.set(sellerName, sellerMap);
    }

    return sellerMap;
  }
}