import { SparseIndexArray } from '../src/auction/stroage/auction_index';

function compareArrayValues<T>(a: Array<T>, b: Array<T>): boolean {
  if (a.length !== b.length) return false;
  return a.every((v, i) => v === b[i]);
}

function logTestResult(name: string, pass: boolean): void {
  if (pass) {
    console.log(`✅ ${name} passed`);
  } else {
    console.error(`❌ ${name} failed`);
  }
}

function addTest() {
  const iArray = new SparseIndexArray();

  const firstIndex = iArray.push(32);
  logTestResult("addTest[sub]", firstIndex === 0);
  iArray.removeAtIndex(0);

  [0, 1, 2, 3].forEach(v => iArray.push(v));

  const values = new Array(...iArray.getIndexValues());
  const expected = [0, 1, 2, 3];

  logTestResult("addTest", compareArrayValues(values, expected));
}

function removeAtIndexTest() {
  const iArray = new SparseIndexArray();
  [0, 1, 2].forEach(v => iArray.push(v));

  iArray.removeAtIndex(0);

  const values = new Array(...iArray.getIndexValues());
  const expected = [null, 1, 2];

  logTestResult("removeAtIndexTest", compareArrayValues(values, expected));
}

function removeByValueTest() {
  const iArray = new SparseIndexArray();
  [0, 1, 2].forEach(v => iArray.push(v));

  const goodIndex = iArray.removeByValue(1); // should be 1
  const badIndex = iArray.removeByValue(12); // should be -1

  logTestResult(
    "removeByValueTest",
    goodIndex === 1 && badIndex === -1
  );
}

function reinsertToOpenSlotTest() {
  const iArray = new SparseIndexArray();
  [0, 1, 2].forEach(v => iArray.push(v));

  iArray.removeAtIndex(1);
  const valuesAfterRemove = new Array(...iArray.getIndexValues());
  const expectedAfterRemove = [0, null, 2];

  const reusedIndex = iArray.push(12);
  const valuesAfterInsert = new Array(...iArray.getIndexValues());
  const expectedAfterInsert = [0, 12, 2];

  const openIndexLength = iArray.getOpenIndexValues().length;

  const allPass =
    compareArrayValues(valuesAfterRemove, expectedAfterRemove) &&
    compareArrayValues(valuesAfterInsert, expectedAfterInsert) &&
    openIndexLength === 0 &&
    reusedIndex === 1;

  logTestResult("reinsertToOpenSlotTest", allPass);
}

function boundaryTest() {
  const iArray = new SparseIndexArray();

  // Remove from empty
  iArray.removeAtIndex(0); // should not throw
  iArray.removeAtIndex(-1); // invalid, should do nothing

  // Push a large number of items
  for (let i = 0; i < 1000; i++) {
    iArray.push(i);
  }

  const values = new Array(...iArray.getIndexValues());
  const expected = Array.from({ length: 1000 }, (_, i) => i);

  const allMatch = compareArrayValues(values, expected);

  logTestResult("boundaryTest", allMatch);
}

function stressTest() {
  const iArray = new SparseIndexArray();
  let ok = true;

  for (let round = 0; round < 100; round++) {
    // fill with 0-99
    for (let i = 0; i < 100; i++) iArray.push(i);

    // remove even indexes
    for (let i = 0; i < 100; i += 2) iArray.removeByValue(i);

    // reinsert at freed slots
    for (let i = 0; i < 50; i++) iArray.push(1000 + i);

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

  logTestResult("stressTest", ok);
}


addTest();
removeAtIndexTest();
removeByValueTest();
reinsertToOpenSlotTest();
boundaryTest();
stressTest();