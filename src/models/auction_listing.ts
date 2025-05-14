import { ItemStack } from '@minecraft/server';
import { Category } from '../auction/types/enums';
import { AuctionPlayer } from '../auction/types/types';

/**
 * @class AuctionListing
 * Represents a listing in the auction house, including the item being sold,
 * the price, expiration time, and seller metadata (ID and name).
 */
export class AuctionListing {
  item: ItemStack;
  price: number;
  expiresAt: Date;
  seller: AuctionPlayer
  category: Category;
  sold: boolean;

  /**
   * Creates a new AuctionListing.
   *
   * @param item - The item being auctioned.
   * @param price - The sale price of the item.
   * @param expiresAt - The time at which this listing expires.
   * @param sellerId - The unique ID of the seller (invisible in lore).
   * @param sellerName - The display name of the seller (visible in lore).
   */
  constructor(
    item: ItemStack,
    price: number,
    expiresAt: Date,
    sellerId: string,
    sellerName: string,
    category: Category
  ) {
    this.item = item;
    this.price = price;
    this.expiresAt = expiresAt;
    this.seller = {sellerName, sellerId};
    this.category = category;
    this.sold = false;
  }

  /**
   * Creates an AuctionListing from a relative duration (e.g., 1h 30m).
   *
   * @param item - The item being auctioned.
   * @param price - The listing price.
   * @param duration - The duration until expiration.
   * @param sellerId - The seller's unique ID.
   * @param sellerName - The seller's name.
   * @returns An instance of AuctionListing.
   */
  static fromDuration(
    item: ItemStack,
    price: number,
    duration: { days?: number; hours?: number; minutes?: number; seconds?: number },
    sellerId: string,
    sellerName: string,
    category: Category
  ): AuctionListing {
    const now = new Date();
    const ms =
      (duration.days ?? 0) * 86_400_000 +
      (duration.hours ?? 0) * 3_600_000 +
      (duration.minutes ?? 0) * 60_000 +
      (duration.seconds ?? 0) * 1000;

    return new AuctionListing(
      item,
      price,
      new Date(now.getTime() + ms),
      sellerId,
      sellerName,
      category
    );
  }

  /**
   * Parses an AuctionListing from an item's lore.
   *
   * @param item - The item to reconstruct.
   * @param lore - The lore lines to parse.
   * @returns An AuctionListing or null if parsing fails.
   */
  static fromLore(item: ItemStack, lore: string[]): AuctionListing | null {
    const priceLine = lore.find((line) => line.startsWith('Price:'));
    const expiresAtLine = lore.find((line) => line.startsWith('ExpiresAt:'));
    const sellerNameLine = lore.find((line) => line.startsWith('Seller:'));
    const sellerIdLine = lore.find((line) => line.startsWith('§0SellerID:'));
    const category = lore.find((line) => line.startsWith('Category'));

    if (!priceLine || !expiresAtLine || !sellerNameLine || !sellerIdLine || category) return null;

    const price = parseInt(priceLine.split(':')[1]);
    const expiresAtMs = parseInt(expiresAtLine.split(':')[1]);
    const sellerName = sellerNameLine.slice('Seller:'.length);
    const sellerId = sellerIdLine.slice('§0SellerID:'.length);

    if (isNaN(price) || isNaN(expiresAtMs)) return null;

    return new AuctionListing(item, price, new Date(expiresAtMs), sellerId, sellerName, Object.keys(Category).find((c) => c === category) as Category | Category.Default);
  }

  /**
   * Serializes the auction listing into lore lines.
   * Includes visible seller name and hidden seller ID.
   *
   * @returns A string array representing lore.
   */
  toLore(): string[] {
    return [
      '[AUCTION]',
      `Price:${this.price}`,
      `ExpiresAt:${this.expiresAt.getTime()}`,
      `Seller:${this.seller.sellerName}`,
      `§0SellerID:${this.seller.sellerId}` // Hidden in-game but retrievable
    ];
  }

  /**
   * Checks if the auction listing has expired.
   *
   * @returns True if expired, otherwise false.
   */
  isExpired(): boolean {
    return new Date() > this.expiresAt;
  }

  /**
   * Returns the remaining time in a human-readable format.
   *
   * @returns A string like "0d 1h 23m 5s".
   */
  timeRemaining(): string {
    const msLeft = Math.max(this.expiresAt.getTime() - Date.now(), 0);

    const d = Math.floor(msLeft / 86_400_000);
    const h = Math.floor((msLeft % 86_400_000) / 3_600_000);
    const m = Math.floor((msLeft % 3_600_000) / 60_000);
    const s = Math.floor((msLeft % 60_000) / 1000);

    return `${d}d ${h}h ${m}m ${s}s`;
  }

  /**
   * Gets the seller's display name.
   *
   * @returns The seller name string.
   */
  getSellerName(): string {
    return this.seller.sellerName;
  }

  /**
   * Gets the seller's ID
   *
   * @returns The seller id string.
   */
  getSellerID(): string {
    return this.seller.sellerId;
  }

  equals(other: AuctionListing): boolean {
    return (
      this.category === other.category &&
        this.price === other.price &&
        this.seller.sellerId === other.seller.sellerId &&
        this.seller.sellerName === other.seller.sellerName,
      this.sold === other.sold &&
        this.expiresAt === other.expiresAt &&
        this.item.typeId === other.item.typeId
    );
  }
}
