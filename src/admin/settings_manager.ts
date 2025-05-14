import { world, Player } from "@minecraft/server";

/**
 * @template T
 * @typedef {Object} SettingDefinition
 * @property {string} key - Unique key used to store the setting as a dynamic property.
 * @property {T} default - The default value of the setting.
 * @property {string} displayName - Human-readable name for UI or logs.
 * @property {(value: T) => string} [message] - Optional function to generate a message when the setting is updated.
 */
type SettingDefinition<T> = {
  key: string;
  default: T;
  displayName: string;
  message?: (value: T) => string;
};

/**
 * Defines a type-safe settings object. This ensures all settings are inferred with their proper types.
 *
 * @template {Record<string, SettingDefinition<any>>} T
 * @param {T} settings - An object mapping setting names to their definitions.
 * @returns {T} - The same object with its types preserved.
 */
function defineSettings<T extends Record<string, SettingDefinition<any>>>(settings: T): T {
  return settings;
}

/**
 * All application-wide settings defined here. Each has a unique key, default value, display name,
 * and optional message function used when updating via a player.
 */
export const SETTINGS = defineSettings({
  currencyScoreboard: {
    key: "currencyScoreboard",
    default: "",
    displayName: "Currency Scoreboard",
    message: (val: string) => `§aCurrency scoreboard set to: §e${val}`,
  },
  maxPageListings: {
    key: "maxPageListings",
    default: 27,
    displayName: "Max Listings Per Page",
    message: (val: number) => `§aMax listings per page set to: §e${val}`,
  },
  showExpired: {
    key: "showExpired",
    default: false,
    displayName: "Show Expired Listings",
    message: (val: boolean) => `§aShow expired listings: §e${val ? "On" : "Off"}`,
  },
});

type SettingsMap = typeof SETTINGS;
type SettingKey = keyof SettingsMap;
type SettingValue<K extends SettingKey> = SettingsMap[K]["default"];

/**
 * Sets a setting to a new value, updating the dynamic property store. If a player is passed and the setting
 * includes a message function, the player will receive a formatted feedback message.
 *
 * @template {SettingKey} K
 * @param {K} key - The setting key to update.
 * @param {SettingValue<K>} value - The value to assign.
 * @param {Player} [player] - Optional player to send the message to.
 */
export function setSetting<K extends SettingKey>(
  key: K,
  value: SettingValue<K>,
  player?: Player
): void {
  const setting = SETTINGS[key] as SettingsMap[K];
  world.setDynamicProperty(setting.key, value);

  if (player && typeof setting.message === "function") {
    player.sendMessage((setting.message as (v: SettingValue<K>) => string)(value));
  }
}

/**
 * Retrieves the current value of a setting from the dynamic property store.
 * If the stored value is missing or has the wrong type, the default is returned.
 *
 * @template {SettingKey} K
 * @param {K} key - The setting key to retrieve.
 * @returns {SettingValue<K>} - The current value or default if invalid.
 */
export function getSetting<K extends SettingKey>(key: K): SettingValue<K> {
  const setting = SETTINGS[key];
  const raw = world.getDynamicProperty(setting.key);
  const expectedType = typeof setting.default;

  if (typeof raw === expectedType) {
    return raw as SettingValue<K>;
  }

  return setting.default;
}
