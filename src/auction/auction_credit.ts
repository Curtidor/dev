import { world } from '@minecraft/server';

/**
 * Credits currency to a seller or stores it if they’re offline.
 */
export function creditSeller(scoreboardName: string, sellerName: string, amount: number): boolean {
  const scoreboard = world.scoreboard.getObjective(scoreboardName);
  if (!scoreboard) return false;

  const participant = world.scoreboard.getParticipants().find((p) => p.displayName === sellerName);
  if (participant) {
    const current = scoreboard.getScore(participant) ?? 0;
    scoreboard.setScore(participant, current + amount);
    return true;
  }

  const player = [...world.getPlayers()].find((p) => p.name === sellerName);
  if (player) {
    scoreboard.setScore(player, amount);
    return true;
  }

  handleOfflineCredit(sellerName, amount);
  return false;
}

function handleOfflineCredit(sellerName: string, amount: number) {
  const key = `credit:${sellerName}`;
  const current = world.getDynamicProperty(key);
  const total = (typeof current === 'number' ? current : 0) + amount;
  world.setDynamicProperty(key, total);
}
