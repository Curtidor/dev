"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CategoryTable = void 0;
const enums_1 = require("../../auction/types/enums");
const index_array_1 = require("./index_array");
class CategoryTable {
    constructor() {
        this._catergoryTable = CategoryTable._createCategoryMaping();
    }
    hasEntries() {
        for (let cat of enums_1.categories) {
            if (this.getIndexArray(cat).length() !== 0)
                return true;
        }
        return false;
    }
    size() {
        let size = 0;
        for (let cat of enums_1.categories) {
            size += this.getIndexArray(cat).length();
        }
        return size;
    }
    getIndexArray(category) {
        let indexArray = this._catergoryTable.get(category);
        if (indexArray === undefined) {
            indexArray = new index_array_1.IndexArray();
        }
        this._catergoryTable.set(category, indexArray);
        return indexArray;
    }
    static _createCategoryMaping() {
        const map = new Map();
        for (const cat of enums_1.categories) {
            map.set(cat, new index_array_1.IndexArray());
        }
        return map;
    }
}
exports.CategoryTable = CategoryTable;
