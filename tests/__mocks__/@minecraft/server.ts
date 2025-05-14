interface Vector3 {
  x: number;
  y: number;
  z: number;
}

class ItemComponent {
  public getEnchantments(): Array<Enchantment> {
    return new Array<Enchantment>();
  }
}
export class ItemStack {
  typeId: string;
  amount: number;
  lore: string[];

  constructor(typeId: string, amount: number) {
    this.typeId = typeId;
    this.amount = amount;
    this.lore = new Array<string>();
  }

  public getComponent(name: string): ItemComponent {
    return new ItemComponent();
  }

  public clone(): ItemStack {
    return new ItemStack(this.typeId, this.amount);
  }

  public setLore(loreList?: string[]) {
    if (loreList === undefined) {
      this.lore.length = 0;
      return;
    }

    this.lore = loreList;
  }
}

type DynamicPropertyStore = Record<string, any>;

export class Dimension {
  public getEntities(query?: EntityQueryOptions): Entity[] {
    return new Array<Entity>();
  }

  public spawnEntity(identifier: string, location: Vector3): Entity {
    return new Entity(identifier);
  }
}

export const world = {
  _dynamicProperties: {} as DynamicPropertyStore,

  setDynamicProperty(key: string, value: any) {
    this._dynamicProperties[key] = value;
  },

  getDynamicProperty(key: string) {
    return this._dynamicProperties[key];
  },

  getDimension(name: string): Dimension {
    return new Dimension();
  },

  _reset() {
    this._dynamicProperties = {};
  }
};

interface EntityQueryOptions {}

export class Entity {
  id: string;
  tags: string[];

  constructor(id: string) {
    this.id = id;
    this.tags = new Array<string>();
  }

  public getComponent(name: string): any {
    return undefined;
  }

  public addTag(tag: string) {
    this.tags.push(tag);
  }

  public getTags(): string[] {
    return this.tags;
  }
}

export class Player extends Entity {
  name: string;

  constructor(name: string = 'Player', id: string = 'uuid-1234') {
    super(id);
    this.name = name;
    this.id = id;
  }

  sendMessage(message: string): void {
    console.log(`[MockPlayer: ${this.name}] ${message}`);
  }
}

interface EnchantmentType {
  id: string;
}
export class Enchantment {
  type: EnchantmentType;
  level: number;

  constructor() {
    this.level = 0;
    this.type = { id: 'test' };
  }
}
