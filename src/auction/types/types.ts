import { Category, SaleStatusCode } from "./enums";

export interface AuctionPlayer{
  sellerName: string;
  sellerId: string;
}

/**
 * Pagination control for listings queries.
 */
export interface PageOptions {
  offset?: number;
  maxListings?: number;
}

/**
 * Represents search filters for querying auction listings.
 */
export interface QueryOptions {
  category?: Category;
  pageOptions?: PageOptions;
  sellerName?: string;
  price?: number;
}

/**
 * Payload passed to purchase or bid operations.
 */
export interface BuyInformation {
  buyer: AuctionPlayer;
  amount: number;
  index: number;
}


export interface SaleResponse {
  success: boolean;
  reason: SaleStatusCode;
}

