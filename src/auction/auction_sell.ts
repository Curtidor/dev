import { Player } from '@minecraft/server';

import { ModalFormData, ModalFormResponse } from '@minecraft/server-ui';
import { AuctionListing } from '../models/auction_listing';
import { SellInput } from './types/types';
import { AUCTIONSERVICE } from './utils/__globals__';
import { Category } from './types/enums';

/**
 * Displays the UI to enter sell price and expiry.
 */
export async function openSellForm(player: Player): Promise<ModalFormResponse | null> {
  const form = new ModalFormData()
    .title('§l§aSell Item')
    .textField('Price (number)', 'e.g. 100')
    .textField('Hours until expiry', 'e.g. 1')
    .textField('Minutes until expiry', 'e.g. 30');

  const response = await form.show(player);
  return response.canceled ? null : response;
}

/**
 * Processes a listing submission from the UI form.
 */
export function sellItem(player: Player, form: ModalFormResponse): AuctionListing | null {
  const sellInput = parseSellInput(player, form);
  if (!sellInput) return null;

  const listing = createAuctionListing(player, sellInput);
  if (!listing) return null;

  AUCTIONSERVICE.addListing(listing);
  player.sendMessage(
    `§aListing created for §f${listing.price} coins§a, expires in ${listing.timeRemaining()}`
  );
  return listing;
}

function parseSellInput(player: Player, form: ModalFormResponse): SellInput | null {
  const [priceRaw, hoursRaw, minutesRaw] = form.formValues as [string, string, string];
  const price = parseFloat(priceRaw);
  const hours = parseInt(hoursRaw);
  const minutes = parseInt(minutesRaw);

  if (isNaN(price) || price <= 0) {
    player.sendMessage('§cInvalid price!');
    return null;
  }

  if ((isNaN(hours) && isNaN(minutes)) || hours < 0 || minutes < 0) {
    player.sendMessage('§cInvalid expiration time!');
    return null;
  }

  return { price, hours, minutes };
}

function createAuctionListing(player: Player, input: SellInput): AuctionListing | null {
  const inventory = player.getComponent('inventory')?.container;
  const slot = player.selectedSlotIndex;
  const item = inventory?.getItem(slot);

  if (!inventory || !item) {
    player.sendMessage('§cYou must be holding an item to list it.');
    return null;
  }

  inventory.setItem(slot); // clear item
  player.runCommand('playsound random.orb @s');

  return AuctionListing.fromDuration(
    item,
    input.price,
    { hours: input.hours, minutes: input.minutes },
    player.id,
    player.name,
    Category.Armor
  );
}
