import { world, Entity, Enchantment, ItemStack } from '@minecraft/server';

export function getEnchantmentsData(item: ItemStack): Map<string, number> {
  const enchantmentsTable: Map<string, number> = new Map();

  const enchantable = item.getComponent('minecraft:enchantable');
  if (!enchantable) return enchantmentsTable;

  const enchantmentDataArray: Enchantment[] = enchantable.getEnchantments();

  enchantmentDataArray.forEach((enchantment) => {
    enchantmentsTable.set(enchantment.type.id, enchantment.level);
  });

  return enchantmentsTable;
}
