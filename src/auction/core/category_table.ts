import { categories, Category } from "../../auction/types/enums";
import { SparseIndexArray } from "./sparse_index_array";

export class CategoryTable {
  private readonly _catergoryTable: Map<string, SparseIndexArray>;

  constructor() {
    this._catergoryTable = CategoryTable._createCategoryMaping();
  }

  public hasEntries(): boolean {
    for (let cat of categories) {
      if (this.getIndexArray(cat).length() !== 0) return true;
    }
    return false;
  }

  public size(): number {
    let size = 0;
    for (let cat of categories) {
      size += this.getIndexArray(cat).length();
    }

    return size;
  }

  public getIndexArray(category: Category): SparseIndexArray {
    let indexArray = this._catergoryTable.get(category);
    if (indexArray === undefined) {
      indexArray = new SparseIndexArray();
    }

    this._catergoryTable.set(category, indexArray);

    return indexArray;
  }

  private static _createCategoryMaping(): Map<string, SparseIndexArray> {
    const map: Map<string, SparseIndexArray> = new Map();

    for (const cat of categories) {
      map.set(cat, new SparseIndexArray());
    }

    return map;
  }
}
