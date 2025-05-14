import { Player, ItemDurabilityComponent, ItemEnchantableComponent } from '@minecraft/server';
import { ChestFormData } from '../../ui/forms';
import { getSetting } from '../../admin/settings_manager';
import { AuctionListing } from '../../models/auction_listing';
import { buyListing } from './../auction_buy';
import { getEnchantmentsData } from 'utils';
import { AUCTIONSERVICE } from '../utils/__globals__'
import {QueryOptions} from '../data/auction_index';

export function openViewListings(player: Player, page = 0): void {
  const listings = AUCTIONSERVICE.queryListing();
  openPaginatedListings(
    player,
    listings,
    'Auction Listings',
    (newPage) => openViewListings(player, newPage),
    page
  );
}

export function openViewUserListings(player: Player, page = 0): void {
  const query: QueryOptions = {sellerName: player.name};

  const listings = AUCTIONSERVICE.queryListing(query);
  openPaginatedListings(
    player,
    listings,
    'Your Listings',
    (newPage) => openViewUserListings(player, newPage),
    page
  );
}

function openPaginatedListings(
  player: Player,
  listings: AuctionListing[],
  title: string,
  onNavigate: (page: number) => void,
  page: number = 0
): void {
  const listingsPerPage = getSetting('maxPageListings');
  const totalPages = Math.max(1, Math.ceil(listings.length / listingsPerPage));
  const start = page * listingsPerPage;
  const pageListings = listings.slice(start, start + listingsPerPage);

  const gui = new ChestFormData('large').title(`§l§6${title} (Page ${page + 1}/${totalPages})`);

  gui.button(1, 'Refresh Page', [], 'minecraft:barrier');

  pageListings.forEach((listing, i) => {
    const rawId = listing.item.typeId.replace(/^minecraft:/, '');
    const displayName = rawId
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');

    const slot = 9 + i;
    const lore = [
      `§7Price: ${listing.price}`,
      `§7Seller: ${listing.seller.sellerName}`,
      `§8Expires: ${listing.timeRemaining()}`
    ];

    // Get durability (if present)
    const durabilityComponent: ItemDurabilityComponent = listing.item.getComponent('durability');
    let damageNormalized = 0;

    if (durabilityComponent)
      damageNormalized = (1 - durabilityComponent.damage / durabilityComponent.maxDurability) * 100;

    if (durabilityComponent) {
      // Insert durability before expiration (2nd last position)
      lore.splice(lore.length - 1, 0, `§8Durability: ${damageNormalized.toFixed()}%`);
    }

    // Get enchantments and insert after seller (index 2)
    const enchantments = getEnchantmentsData(listing.item);
    if (enchantments.size > 0) {
      const enchantLines: string[] = [`§dEnchantments:`];
      for (const [id, level] of enchantments) {
        const cleanName = id.replace(/^minecraft:/, '').replace(/_/g, ' ')
          .replace(/\b\w/g, c => c.toUpperCase());
        enchantLines.push(`  §r${cleanName}${level > 1 ? ' ' + level : ''}`);
      }
      lore.splice(2, 0, ...enchantLines); // Insert at index 2
    }

    gui.button(
      slot,
      `§r${displayName}`,
      lore,
      listing.item.typeId,
      listing.item.amount,
      null,
      enchantments.size > 0
    );
  });

  if (page > 0) gui.button(0, '§l⏪ Prev Page', [], 'minecraft:arrow');
  if (page < totalPages - 1) gui.button(8, '§l⏩ Next Page', [], 'minecraft:arrow');

  gui.show(player).then((res) => {
    if (res.canceled) return;

    if (res.selection === 0 && page > 0) {
      onNavigate(page - 1);
    } else if (res.selection === 8 && page < totalPages - 1) {
      onNavigate(page + 1);
    } else if (res.selection === 1) {
      onNavigate(page);
    } else {
      const actualIndex = start + (res.selection - 9);
      const listing = listings[actualIndex];

      if (!listing) player.sendMessage('§cListing not found!');
      else if (listing.sold) player.sendMessage('§cListing was sold already!');
      else buyListing(listing, player);
    }
  });
}
