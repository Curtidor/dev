"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.testIndexArray = testIndexArray;
const index_array_1 = require("../src/auction/core/index_array");
const utils_1 = require("./utils");
function logTestResult(name, pass) {
    if (pass) {
        console.log(`✅ ${name} passed`);
    }
    else {
        console.error(`❌ ${name} failed`);
    }
}
function addTest() {
    const iArray = new index_array_1.IndexArray();
    const firstIndex = iArray.push(32);
    logTestResult('addTest[sub]', firstIndex === 0);
    iArray.removeAtIndex(0);
    [0, 1, 2, 3].forEach((v) => iArray.push(v));
    const values = new Array(...iArray.getIndexValues());
    const expected = [0, 1, 2, 3];
    logTestResult('addTest', (0, utils_1.compareArrayValues)(values, expected));
}
function removeAtIndexTest() {
    const iArray = new index_array_1.IndexArray();
    [0, 1, 2].forEach((v) => iArray.push(v));
    iArray.removeAtIndex(0);
    const values = new Array(...iArray.getIndexValues());
    const expected = [null, 1, 2];
    logTestResult('removeAtIndexTest', (0, utils_1.compareArrayValues)(values, expected));
}
function removeByValueTest() {
    const iArray = new index_array_1.IndexArray();
    [0, 1, 2].forEach((v) => iArray.push(v));
    const goodIndex = iArray.removeByValue(1); // should be 1
    const badIndex = iArray.removeByValue(12); // should be -1
    logTestResult('removeByValueTest', goodIndex === 1 && badIndex === -1);
}
function reinsertToOpenSlotTest() {
    const iArray = new index_array_1.IndexArray();
    [0, 1, 2].forEach((v) => iArray.push(v));
    iArray.removeAtIndex(1);
    const valuesAfterRemove = new Array(...iArray.getIndexValues());
    const expectedAfterRemove = [0, null, 2];
    const reusedIndex = iArray.push(12);
    const valuesAfterInsert = new Array(...iArray.getIndexValues());
    const expectedAfterInsert = [0, 12, 2];
    const openIndexLength = iArray.getOpenIndexValues().length;
    const allPass = (0, utils_1.compareArrayValues)(valuesAfterRemove, expectedAfterRemove) &&
        (0, utils_1.compareArrayValues)(valuesAfterInsert, expectedAfterInsert) &&
        openIndexLength === 0 &&
        reusedIndex === 1;
    logTestResult('reinsertToOpenSlotTest', allPass);
}
function boundaryTest() {
    const iArray = new index_array_1.IndexArray();
    // Remove from empty
    iArray.removeAtIndex(0); // should not throw
    iArray.removeAtIndex(-1); // invalid, should do nothing
    // Push a large number of items
    for (let i = 0; i < 1000; i++) {
        iArray.push(i);
    }
    const values = new Array(...iArray.getIndexValues());
    const expected = Array.from({ length: 1000 }, (_, i) => i);
    const allMatch = (0, utils_1.compareArrayValues)(values, expected);
    logTestResult('boundaryTest', allMatch);
}
function stressTest() {
    const iArray = new index_array_1.IndexArray();
    let ok = true;
    for (let round = 0; round < 100; round++) {
        // fill with 0-99
        for (let i = 0; i < 100; i++)
            iArray.push(i);
        // remove even indexes
        for (let i = 0; i < 100; i += 2)
            iArray.removeByValue(i);
        // reinsert at freed slots
        for (let i = 0; i < 50; i++)
            iArray.push(1000 + i);
        // verify open slots were reused
        if (iArray.getOpenIndexValues().length !== 0) {
            console.warn(`Open index not cleared at round ${round}`);
            ok = false;
            break;
        }
        // clear for next round
        for (let i = 0; i < iArray.getIndexValues().length; i++) {
            iArray.removeAtIndex(i);
        }
    }
    logTestResult('stressTest', ok);
}
function testIndexArray() {
    addTest();
    removeAtIndexTest();
    removeByValueTest();
    reinsertToOpenSlotTest();
    boundaryTest();
    stressTest();
}
