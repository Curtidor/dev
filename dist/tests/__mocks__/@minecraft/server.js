"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Enchantment = exports.Player = exports.Entity = exports.world = exports.Dimension = exports.ItemStack = void 0;
class ItemComponent {
    getEnchantments() {
        return new Array();
    }
}
class ItemStack {
    constructor(typeId, amount) {
        this.typeId = typeId;
        this.amount = amount;
        this.lore = new Array();
    }
    getComponent(name) {
        return new ItemComponent();
    }
    clone() {
        return new ItemStack(this.typeId, this.amount);
    }
    setLore(loreList) {
        if (loreList === undefined) {
            this.lore.length = 0;
            return;
        }
        this.lore = loreList;
    }
}
exports.ItemStack = ItemStack;
class Dimension {
    getEntities(query) {
        return new Array();
    }
    spawnEntity(identifier, location) {
        return new Entity(identifier);
    }
}
exports.Dimension = Dimension;
exports.world = {
    _dynamicProperties: {},
    setDynamicProperty(key, value) {
        this._dynamicProperties[key] = value;
    },
    getDynamicProperty(key) {
        return this._dynamicProperties[key];
    },
    getDimension(name) {
        return new Dimension();
    },
    _reset() {
        this._dynamicProperties = {};
    }
};
;
class Entity {
    constructor(id) {
        this.id = id;
        this.tags = new Array();
    }
    getComponent(name) {
        return undefined;
    }
    addTag(tag) {
        this.tags.push(tag);
    }
    getTags() {
        return this.tags;
    }
}
exports.Entity = Entity;
class Player extends Entity {
    constructor(name = "Player", id = "uuid-1234") {
        super(id);
        this.name = name;
        this.id = id;
    }
    sendMessage(message) {
        console.log(`[MockPlayer: ${this.name}] ${message}`);
    }
}
exports.Player = Player;
class Enchantment {
    constructor() {
        this.level = 0;
        this.type = { id: 'test' };
    }
}
exports.Enchantment = Enchantment;
;
