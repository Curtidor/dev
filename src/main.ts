import {
  world,
  system,
  PlayerInteractWithEntityBeforeEvent,
  Entity,
  Player,
  PlayerLeaveBeforeEvent,
  PlayerSpawnAfterEvent,
  PlayerJoinAfterEvent
} from '@minecraft/server';

import { ChestFormData } from './ui/forms';
import { openSellForm, sellItem } from './auction/auction_sell';
import { openViewListings, openViewUserListings } from './auction/auction_view';
import { openAdminConsole } from './admin/admin_config';
import { getSetting } from './admin/settings_manager';
import { saveAuctionDumps, syncAuctionStorage, loadAuctionDumps, killDumps } from 'auction_persistence/dump_persistence';
import { globalAuctionDB } from 'auction/data/auction_db';

let initialized = false;
world.afterEvents.playerJoin.subscribe((event: PlayerJoinAfterEvent) => {
  if (!initialized){
    globalAuctionDB.itemListed.addListener(syncAuctionStorage);
    loadAuctionDumps();
  }

  if (world.getAllPlayers().length === 3){
    killDumps();
  }

  initialized = true;
})

world.beforeEvents.playerInteractWithEntity.subscribe(
  (event: PlayerInteractWithEntityBeforeEvent) => {
    const target: Entity = event.target;
    const player: Player = event.player;

    if (target.typeId !== 'tm:auction_container') return;

    system.run(() => {
      player.setDynamicProperty('tm:in_auction', true);
      player.runCommand('say opening');

      playerOpenedAuction(player);
    });
  }
);

world.beforeEvents.playerLeave.subscribe((event: PlayerLeaveBeforeEvent) => {
  const player: Player = event.player;

  if (player.getDynamicProperty('tm:in_auction') === true) {
    player.setDynamicProperty('tm:in_auction', false);
  }

  if (world.getAllPlayers().length === 2) {
    console.warn('Saving Auction Dumps');
    system.run(() =>{
      saveAuctionDumps();
    });
  }
});

world.afterEvents.playerSpawn.subscribe((event: PlayerSpawnAfterEvent) => {
  const scoreboardName = getSetting('currencyScoreboard');
  const scoreboard = world.scoreboard.getObjective(scoreboardName);
  if (!scoreboard) return;

  const player: Player = event.player;
  const key = `credit:${player.name}`;
  const credit = world.getDynamicProperty(key);

  if (typeof credit === 'number' && credit > 0) {
    // if the player has no scoreboardIdentity they have not yet been added to a scoreboad
    if (player.scoreboardIdentity === undefined) {
      player.runCommand(`scoreboard players add ${player.name} ${scoreboardName} 0`);
      console.log(`[Auction] Registered "${player.name}" to scoreboard with score 0.`);
    }
    const current = scoreboard.getScore(player.scoreboardIdentity) ?? 0;
    scoreboard.setScore(player.scoreboardIdentity, current + credit);
    player.sendMessage(`§aYou received §e${credit} §acurrency while offline.`);
    world.setDynamicProperty(key, 0);
  }
});

world.beforeEvents.itemUse.subscribe((event) => {
  const item = event.itemStack;
  const player = event.source;

  if (item.typeId !== 'tm:admin_console') return;

  system.run(() => {
    openAdminConsole(player);
  });
});

async function playerOpenedAuction(player: Player) {
  const form = new ChestFormData('large')
    .title('§l§5Auction House')
    .button(20, '§l§6Your Listings', [], 'minecraft:enchanted_book', 1)
    .button(22, '§l§nBuy', [], 'minecraft:book', 1)
    .button(24, '§l§bSell', [], 'minecraft:paper', 1);

  const response = await form.show(player);
  if (response.canceled) return;

  switch (response.selection) {
    case 20:
      openViewUserListings(player, 0);
      break;
    case 22:
      openViewListings(player, 0);
      break;
    case 24: {
      const sellResponse = await openSellForm(player);
      if (sellResponse) {
        sellItem(player, sellResponse);
      }
      break;
    }
    default:
      world.sendMessage(`${player.name} chose ${response.selection}`);
  }
}
