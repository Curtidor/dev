import { world, Entity } from "@minecraft/server";

export function spawnDumpEntity(sellerName: string): Entity {
  const entity = world
    .getDimension('overworld')
    .spawnEntity('tm:auction_dump', { x: 0, y: -63, z: 0 });
  entity.addTag('auction-dump');
  entity.addTag('seller:' + sellerName);

  return entity;
}