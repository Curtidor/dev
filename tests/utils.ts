export function assert(condition: boolean, message: string) {
  if (!condition) throw new Error('❌ ' + message);
  console.log('✅ ' + message);
}


export function compareArrayValues<T>(a: Array<T>, b: Array<T>): boolean {
  if (a.length !== b.length) return false;
  return a.every((v, i) => v === b[i]);
}