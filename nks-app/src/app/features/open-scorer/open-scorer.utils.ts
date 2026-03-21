import type {
  OpenScorerFinalStanding,
  OpenScorerGameOverResult,
  OpenScorerPlayerStanding,
  WinDirection,
} from './open-scorer.model';

export function calculateNewTotal(prev: number, turnScore: number): number {
  return prev + turnScore;
}

export function buildOpenScorerGameOverResult(
  standings: OpenScorerPlayerStanding[],
  winDirection: WinDirection,
): OpenScorerGameOverResult {
  // Sort by win direction
  const sorted = [...standings].sort((a, b) =>
    winDirection === 'high' ? b.total - a.total : a.total - b.total,
  );

  const withPlaces: OpenScorerFinalStanding[] = [];
  let place = 1;
  for (let i = 0; i < sorted.length; i++) {
    if (i > 0) {
      const prev = sorted[i - 1].total;
      const curr = sorted[i].total;
      const isDifferent = winDirection === 'high' ? curr < prev : curr > prev;
      if (isDifferent) place = i + 1;
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
    winDirection,
  };
}
