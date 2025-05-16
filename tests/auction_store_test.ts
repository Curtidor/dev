import { ItemStack } from '@minecraft/server';

import { categories, Category } from '../src/auction/types/enums';
import { AuctionStore } from '../src/auction/core/auction_store';
import { AuctionListing } from '../src/models/auction_listing';
import { assert, compareArrayValues } from './utils';

function testGetListingFromCategory() {
  const aStore = new AuctionStore();
  const listingsArmorCat = new AuctionListing(
    new ItemStack('minecraft:dimand_sword', 0),
    0,
    new Date(),
    '12',
    'MrBreezy',
    Category.Armor
  );
  aStore.insertListing(listingsArmorCat);

  assert(
    aStore.getListingByIndex(aStore.getListingFromCategory(Category.Armor).pop() ?? -1) ===
      listingsArmorCat,
    'Get Listing From Armor Category'
  );
}

function testGetMultipleListingFromCategory() {
  const aStore = new AuctionStore();

  const listings = new Array<AuctionListing>();
  for (let i = 0; i < 10; i++) {
    const listing = new AuctionListing(
      new ItemStack('minecraft:dimand_sword', 0),
      0,
      new Date(),
      '12',
      'MrBreezy',
      Category.Blocks
    );
    listings.push(listing);
    aStore.insertListing(listing);
  }

  const queryedListingsIndexes = aStore.getListingFromCategory(Category.Blocks, 0, listings.length);
  const collectedListings = queryedListingsIndexes
    .map((index) => aStore.getListingByIndex(index))
    .filter((listing) => {
      return listing !== null;
    });

  assert(
    compareArrayValues<AuctionListing>(listings, collectedListings),
    'Get listings from category'
  );
}

export function testAuctionStore() {
  testGetListingFromCategory();
  testGetMultipleListingFromCategory();
}
