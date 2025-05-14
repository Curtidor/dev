import { Player, world } from '@minecraft/server';
import { ModalFormData, ActionFormData, ActionFormResponse } from '@minecraft/server-ui';
import { getSetting, setSetting, SETTINGS } from './settings_manager';

export async function openAdminConsole(player: Player) {
  const homePage: ActionFormData = new ActionFormData()
    .title('Admin Home Page')
    .button('Config')
    .button('See Player Listinging')
    .button('See Settings');

  const response: ActionFormResponse = await homePage.show(player);
  if (response.canceled) return;

  if (response.selection === 0) await adminConfig(player);
  else if (response.selection === 1) player.runCommand('say player picked see listing');
  else if (response.selection === 2) {
    for (const [settingKey, setting] of Object.entries(SETTINGS)) {
      let settingValue = world.getDynamicProperty(settingKey);
      if (!settingValue) {
        settingValue = setting.default;
        console.log(`key: ${settingKey} had no value: ${settingValue}`);
      }

      player.sendMessage(
        `§6[Setting] §b${settingKey} §7(${setting.displayName}): §e${settingValue}`
      );
    }
  }
}

async function adminConfig(player: Player) {
  const defaultScoreboard = getSetting('currencyScoreboard') ?? '';
  const defaultMaxListings = String(
    getSetting('maxPageListings') ?? SETTINGS.maxPageListings.default
  );
  const defaultShowExpired = getSetting('showExpired') ?? false;

  const form = new ModalFormData()
    .title('Admin Config Page')
    .textField('Scoreboard to Use (e.g. Coins)', 'Enter scoreboard name', defaultScoreboard)
    .textField('Max listings per page (e.g. 27)', 'Enter max listings amount', defaultMaxListings)
    .toggle('Show expired listings', defaultShowExpired);

  const response = await form.show(player);
  if (response.canceled) return;

  let [inputScoreboard, inputMaxListings, inputShowExpired] = response.formValues;

  // --- Scoreboard name validation ---
  const scoreboardName =
    (typeof inputScoreboard === 'string' && inputScoreboard.trim()) || defaultScoreboard;
  if (!scoreboardName) {
    player.sendMessage('§cYou must enter a valid scoreboard name.');
    return;
  }

  // --- Max listings validation ---
  let maxListings = parseInt(String(inputMaxListings));
  if (isNaN(maxListings) || maxListings < 1 || maxListings > 45) {
    maxListings = parseInt(defaultMaxListings);
    player.sendMessage(`§cInvalid max listings. Defaulting to §e${maxListings}`);
  }

  setSetting('currencyScoreboard', scoreboardName, player);
  setSetting('maxPageListings', maxListings, player);
  setSetting('showExpired', Boolean(inputShowExpired), player);
}
