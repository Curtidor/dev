import { world, Player } from '@minecraft/server';
import { AuctionListing } from '../models/auction_listing';
import { creditSeller } from './auction_credit';
import { getSetting } from '../admin/settings_manager';
import { AUCTIONSERVICE } from './utils/__globals__';
import { QueryOptions } from './data/auction_index';

export function buyListing(listing: AuctionListing, player: Player): void {
  const scoreboardName = getSetting('currencyScoreboard');
  const scoreboard = scoreboardName ? world.scoreboard.getObjective(scoreboardName) : undefined;

  if (!scoreboard) {
    player.sendMessage('§cCurrency scoreboard not available.');
    return;
  }

  let identity = player.scoreboardIdentity;
  if (!identity) {
    scoreboard.setScore(player, 0);
    identity = player.scoreboardIdentity;
    if (!identity) {
      player.sendMessage('§cCould not register your scoreboard identity.');
      return;
    }
  }

  const current = scoreboard.getScore(identity);
  if (current < listing.price) {
    player.sendMessage('§cNot enough funds.');
    return;
  }

  const inventory = player.getComponent('inventory')?.container;
  if (!inventory) {
    player.sendMessage('§cCould not access your inventory.');
    return;
  }

  const item = listing.item.clone();
  const lore =
    item
      .getLore()
      ?.filter(
        (line) =>
          !line.startsWith('Price:') &&
          !line.startsWith('ExpiresAt:') &&
          !line.startsWith('Seller:') &&
          !line.startsWith('§0SellerID:')
      ) ?? [];
  item.setLore(lore);

  const leftover = inventory.addItem(item);
  if (leftover) {
    player.sendMessage('§cNot enough space in inventory.');
    return;
  }

  scoreboard.setScore(identity, current - listing.price);
  player.sendMessage(`§aPurchased item for §e${listing.price}`);

  const query: QueryOptions = {sellerName: listing.seller.sellerName};
  const sellerListings = AUCTIONSERVICE.queryListing(query);
  
  if (sellerListings) {
    const index = sellerListings.findIndex(
      (l) => l.price === listing.price && l.expiresAt.getTime() === listing.expiresAt.getTime()
    );
    if (index !== -1) sellerListings.splice(index, 1);
  }

  creditSeller(scoreboardName, listing.getSellerName(), listing.price);
  listing.sold = true;
}
