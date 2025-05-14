export enum SaleStatusCode {
  Sold,
  NotEnoughFunds,
  AlreadyBought,
  InvalidListing
}

export enum Category {
  Default = 'default',
  Armor = 'armor',
  Tools = 'tools',
  Items = 'items',
  Blocks = 'blocks'
}

export const categories: Category[] = Object.values(Category).filter((cat) => cat !== Category.Default);