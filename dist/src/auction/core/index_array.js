"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.IndexArray = void 0;
class IndexArray {
    constructor() {
        this._indexes = [];
        this._openIndexes = [];
        this._indexes = new Array();
        this._openIndexes = new Array();
    }
    push(value) {
        const index = this._openIndexes.pop();
        if (index !== undefined) {
            this._indexes[index] = value;
            return index;
        }
        this._indexes.push(value);
        return this._indexes.length - 1;
    }
    removeAtIndex(index) {
        if (index > this._indexes.length || index < 0)
            return;
        this._indexes[index] = null;
        this._openIndexes.push(index);
    }
    removeByValue(value) {
        const index = this._indexes.indexOf(value);
        this.removeAtIndex(index);
        return index;
    }
    getIndexValues() {
        return this._indexes;
    }
    getOpenIndexValues() {
        return this._openIndexes;
    }
    length() {
        return this._indexes.length;
    }
}
exports.IndexArray = IndexArray;
