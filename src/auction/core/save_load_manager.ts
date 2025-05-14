import { world } from '@minecraft/server';
import { AuctionListing } from '../../models/auction_listing';
import { spawnDumpEntity } from '../../auction/utils/spawn_dump_entity';
import { AUCTIONSERVICE } from '../utils/__globals__';

export function loadDumps() {
  const dumps = world
    .getDimension('overworld')
    .getEntities({ type: 'tm:auction_dump', tags: ['auction-dump'] });

  for (const dump of dumps) {
    const inventory = dump.getComponent('minecraft:inventory')!.container;
    const tags = dump.getTags();
    const sellerTag = tags.find((tag) => tag.startsWith('seller:'));
    if (!sellerTag) continue;

    for (let i = 0; i < inventory.size; i++) {
      const item = inventory.getItem(i);
      if (!item) continue;

      const lore = item.getLore();
      const restored = AuctionListing.fromLore(item, lore);
      if (restored) {
        AUCTIONSERVICE.addListing(restored);
      }
    }
  }
}
export function saveDumps() {
  const listings = this._auctionStore.getListings(0, this._auctionStore.dbSize());
  for (const listing of listings) {
    const entity = spawnDumpEntity(listing.seller.sellerName);
    const inventory = entity.getComponent('minecraft:inventory')!.container;

    console.warn(`Saving ${listings.length} listings for ${listing.seller.sellerName}`);
    for (const listing of listings) {
      console.warn(`Item: ${listing.item.typeId}, Price: ${listing.price}`);
      const item = listing.item.clone();
      item.setLore(listing.toLore());
      inventory.addItem(item);
    }
  }
  AUCTIONSERVICE.clear();
}
