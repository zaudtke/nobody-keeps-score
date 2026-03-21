import type {
  CanastaFinalStanding,
  CanastaGameOverResult,
  CanastaPlayerStanding,
  MeldTier,
} from './canasta.model';

export function getMeldTier(score: number): MeldTier {
  if (score < 0) return 'none';
  if (score < 1500) return '50';
  if (score < 3000) return '90';
  return '120';
}

export function calculateNewTotal(prev: number, base: number, score: number): number {
  return prev + base + score;
}

export function isNearWin(score: number): boolean {
  return score >= 4000;
}

export function isGameOver(standings: CanastaPlayerStanding[]): boolean {
  return standings.some((s) => s.total >= 5000);
}

export function buildCanastaGameOverResult(
  standings: CanastaPlayerStanding[],
): CanastaGameOverResult {
  const sorted = [...standings].sort((a, b) => b.total - a.total);

  // Assign places (tied players share the same place)
  const withPlaces: CanastaFinalStanding[] = [];
  let place = 1;
  for (let i = 0; i < sorted.length; i++) {
    if (i > 0 && sorted[i].total < sorted[i - 1].total) {
      place = i + 1;
    }
    withPlaces.push({
      playerId: sorted[i].playerId,
      name: sorted[i].name,
      order: sorted[i].order,
      total: sorted[i].total,
      place,
    });
  }

  const topScore = sorted[0].total;
  const topPlayers = sorted.filter((s) => s.total === topScore);
  const isTie = topPlayers.length > 1;

  return {
    standings: withPlaces,
    winnerId: topPlayers[0].playerId,
    winnerName: isTie
      ? topPlayers.map((p) => p.name).join(' & ')
      : topPlayers[0].name,
    winnerScore: topScore,
    isTie,
  };
}

export function meldBadgeLabel(tier: MeldTier): string {
  if (tier === 'none') return 'No min.';
  return `Meld ${tier}`;
}
