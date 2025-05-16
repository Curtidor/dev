import { ItemStack } from '@minecraft/server';

import { AuctionService } from '../src/auction/core/auction_service';
import { AuctionListing } from '../src/models/auction_listing';
import { Category } from '../src/auction/types/enums';
import { QueryOptions } from '../src/auction/types/types';
import { assert, compareArrayValues } from './utils';

function testAddListing() {
  const aService = new AuctionService();

  const [sellerID, sellerName] = ['1234', 'Mrbreezy4'];
  const listing: AuctionListing = new AuctionListing(
    new ItemStack('minecraft:dimond_sword', 1),
    0,
    new Date(),
    sellerID,
    sellerName,
    Category.Tools
  );

  aService.addListing(listing);

  assert(aService.queryListing().pop() === listing, 'Auction Service Add Listing');
}

function testAddMultipleListings() {
  const aService = new AuctionService();

  const [sellerID, sellerName] = ['1234', 'Mrbreezy4'];
  const listings: AuctionListing[] = [];
  const maxListings = 50;
  for (let i = 0; i < maxListings; i++) {
    const listing: AuctionListing = new AuctionListing(
      new ItemStack('minecraft:dimond_sword', 1),
      i,
      new Date(),
      sellerID,
      sellerName,
      Category.Tools
    );
    aService.addListing(listing);
    listings.push(listing);
  }

  const query: QueryOptions = { pageOptions: { maxListings: maxListings } };
  console.log(aService.queryListing(query).length, listings.length);
  assert(
    compareArrayValues<AuctionListing>(aService.queryListing(query), listings),
    'Auction Service Add Many Listing'
  );
}

function testQueryListing() {
  const aService = new AuctionService();

  const [sellerID, sellerName] = ['1234', 'Mrbreezy4'];

  const listingExpected: AuctionListing = new AuctionListing(
    new ItemStack('minecraft:dimond_sword', 1),
    0,
    new Date(),
    sellerID,
    sellerName,
    Category.Tools
  );
  const listingBad: AuctionListing = new AuctionListing(
    new ItemStack('minecraft:dimond_sword', 1),
    12,
    new Date(),
    sellerID,
    'bob',
    Category.Tools
  );
  const listingBad1: AuctionListing = new AuctionListing(
    new ItemStack('minecraft:dimond_sword', 1),
    0,
    new Date(),
    sellerID,
    'jeff',
    Category.Tools
  );

  aService.addListing(listingBad1);
  aService.addListing(listingExpected);
  aService.addListing(listingBad);

  const queryName: QueryOptions = { sellerName: sellerName };
  const queryPrice: QueryOptions = { price: 0 };
  const queryCat: QueryOptions = { category: Category.Tools };

  assert(aService.queryListing(queryName).pop() === listingExpected, 'Query Name');
  assert(aService.queryListing(queryPrice).pop() === listingExpected, 'Query Price');
  assert(aService.queryListing(queryCat).find((listin) => {return listingExpected.equals(listin)}) !== undefined, 'Query Category');
}

export function testAuctionService() {
  testAddListing();
  testAddMultipleListings();
  testQueryListing();
}
