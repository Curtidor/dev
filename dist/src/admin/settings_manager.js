"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SETTINGS = void 0;
exports.setSetting = setSetting;
exports.getSetting = getSetting;
const server_1 = require("../../tests/__mocks__/@minecraft/server");
/**
 * Defines a type-safe settings object. This ensures all settings are inferred with their proper types.
 *
 * @template {Record<string, SettingDefinition<any>>} T
 * @param {T} settings - An object mapping setting names to their definitions.
 * @returns {T} - The same object with its types preserved.
 */
function defineSettings(settings) {
    return settings;
}
/**
 * All application-wide settings defined here. Each has a unique key, default value, display name,
 * and optional message function used when updating via a player.
 */
exports.SETTINGS = defineSettings({
    currencyScoreboard: {
        key: "currencyScoreboard",
        default: "",
        displayName: "Currency Scoreboard",
        message: (val) => `§aCurrency scoreboard set to: §e${val}`,
    },
    maxPageListings: {
        key: "maxPageListings",
        default: 27,
        displayName: "Max Listings Per Page",
        message: (val) => `§aMax listings per page set to: §e${val}`,
    },
    showExpired: {
        key: "showExpired",
        default: false,
        displayName: "Show Expired Listings",
        message: (val) => `§aShow expired listings: §e${val ? "On" : "Off"}`,
    },
});
/**
 * Sets a setting to a new value, updating the dynamic property store. If a player is passed and the setting
 * includes a message function, the player will receive a formatted feedback message.
 *
 * @template {SettingKey} K
 * @param {K} key - The setting key to update.
 * @param {SettingValue<K>} value - The value to assign.
 * @param {Player} [player] - Optional player to send the message to.
 */
function setSetting(key, value, player) {
    const setting = exports.SETTINGS[key];
    server_1.world.setDynamicProperty(setting.key, value);
    if (player && typeof setting.message === "function") {
        player.sendMessage(setting.message(value));
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
function getSetting(key) {
    const setting = exports.SETTINGS[key];
    const raw = server_1.world.getDynamicProperty(setting.key);
    const expectedType = typeof setting.default;
    if (typeof raw === expectedType) {
        return raw;
    }
    return setting.default;
}
