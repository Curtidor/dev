import { ItemStack } from "@minecraft/server";

import { AuctionStore } from "../src/auction/stroage/auction_index";
import { AuctionListing, categories } from "../src/models/auction_listing";


function assert(condition: boolean, message: string) {
  if (!condition) throw new Error("❌ " + message);
  console.log("✅ " + message);
}

function testAddAndRetrieveListing() {
  const manager = new AuctionStore();

  const item = new ItemStack("minecraft:diamond_sword", 1);
  const listing = new AuctionListing(
    item,
    500,
    new Date(),
    "123",
    "Curtidor",
    categories[0]
  );

  manager.insertListing(listing);

  const sellerIndexes = manager.getSellerListings("Curtidor");
  console.log(sellerIndexes.length);
  assert(sellerIndexes.length === 1, "Listing was added and indexed");

  const result = manager.getListingByIndex(sellerIndexes[0]);
  if (result === null){
    console.error('null result');
    return;
  }
  assert(result !== null, "Listing was retrievable by index");
  assert(result.equals(listing), "Retrieved listing matches original");
}

function testMultipleListingsSameSeller() {
  const manager = new AuctionStore();
  const seller = "MrBreezy";

  for (let i = 0; i < categories.length; i++) {
    const item = new ItemStack("minecraft:diamond_sword", 1);
    const listing = new AuctionListing(
      item,
      100 + i,
      new Date(),
      "id-" + i,
      seller,
      categories[i]
    );
    manager.insertListing(listing);
  }

  const indexes = manager.getSellerListings(seller);
  assert(indexes.length === categories.length, "All 5 listings were indexed for the seller");

  for (let i = 0; i < indexes.length; i++) {
    const listing = manager.getListingByIndex(indexes[i]);
    assert(listing?.seller.sellerName === seller, `Listing ${i} has correct seller`);
  }
}

function testRemoveListing() {
  const manager = new AuctionStore();
  const item = new ItemStack("minecraft:diamond_pickaxe", 1);
  const listing = new AuctionListing(
    item,
    300,
    new Date(),
    "del-1",
    "Remover",
    categories[1]
  );

  manager.insertListing(listing);
  const before = manager.getSellerListings("Remover").length;

  manager.removeListing(listing);
  const after = manager.getSellerListings("Remover").length;

  assert(before === 1 && after === 0, "Listing was removed successfully");
}

// Run all tests
testAddAndRetrieveListing();
testMultipleListingsSameSeller();
testRemoveListing();
