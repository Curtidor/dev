import { AuctionListing } from "./auction_listing";
import { AuctionPlayer } from "../auction/types/types";

export class AuctionBidable extends AuctionListing{
    highestBid: number;
    highestBidder: AuctionPlayer;
}