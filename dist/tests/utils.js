"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.assert = assert;
exports.compareArrayValues = compareArrayValues;
function assert(condition, message) {
    if (!condition)
        throw new Error('❌ ' + message);
    console.log('✅ ' + message);
}
function compareArrayValues(a, b) {
    if (a.length !== b.length)
        return false;
    return a.every((v, i) => v === b[i]);
}
