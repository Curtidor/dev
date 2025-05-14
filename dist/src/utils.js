"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getEnchantmentsData = getEnchantmentsData;
exports.spawnDumpEntity = spawnDumpEntity;
const server_1 = require("../tests/__mocks__/@minecraft/server");
function getEnchantmentsData(item) {
    const enchantmentsTable = new Map();
    const enchantable = item.getComponent('minecraft:enchantable');
    if (!enchantable)
        return enchantmentsTable;
    const enchantmentDataArray = enchantable.getEnchantments();
    enchantmentDataArray.forEach((enchantment) => {
        enchantmentsTable.set(enchantment.type.id, enchantment.level);
    });
    return enchantmentsTable;
}
function spawnDumpEntity(sellerName) {
    const entity = server_1.world
        .getDimension('overworld')
        .spawnEntity('tm:auction_dump', { x: 0, y: -63, z: 0 });
    entity.addTag('auction-dump');
    entity.addTag('seller:' + sellerName);
    return entity;
}
