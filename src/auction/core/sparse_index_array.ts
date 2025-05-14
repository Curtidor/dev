export class SparseIndexArray {
  private readonly _indexes: Array<number | null> = [];
  private readonly _openIndexes: Array<number> = [];

  constructor() {
    this._indexes = new Array();
    this._openIndexes = new Array();
  }

  public push(value: number): number {
    const index = this._openIndexes.pop();
    if (index !== undefined) {
      this._indexes[index] = value;
      return index;
    }

    this._indexes.push(value);
    return this._indexes.length - 1;
  }

  public removeAtIndex(index: number): void {
    if (index > this._indexes.length || index < 0) return;

    this._indexes[index] = null;
    this._openIndexes.push(index);
  }

  public removeByValue(value: number): number {
    const index = this._indexes.indexOf(value);
    this.removeAtIndex(index);
    return index;
  }

  public getIndexValues(): ReadonlyArray<number | null> {
    return this._indexes;
  }

  public getOpenIndexValues(): ReadonlyArray<number> {
    return this._openIndexes;
  }

  public length(): number {
    return this._indexes.length;
  }
}