import type { GameOverResult, HandOutcome, PayoutRow, PlayerStanding } from './dirty-clubs.model';

export interface HandResult {
  scoreDelta: number;
  newScore: number;
  bumpsAdded: number;
  newBumpCount: number;
  moonWin: boolean;
}

export function isOnBoard(score: number, bumps: number): boolean {
  return score > 0 || bumps > 0;
}

export function isForcedPlay(score: number): boolean {
  return score === 13 || score === 14;
}

export function calculateHandResult(
  currentScore: number,
  currentBumps: number,
  outcome: HandOutcome,
  tricks?: number,
): HandResult {
  switch (outcome) {
    case 'dnp':
      return {
        scoreDelta: 0,
        newScore: currentScore,
        bumpsAdded: 0,
        newBumpCount: currentBumps,
        moonWin: false,
      };

    case 'tricks': {
      const t = tricks ?? 0;
      const newScore = currentScore + t;
      return {
        scoreDelta: t,
        newScore,
        bumpsAdded: 0,
        newBumpCount: currentBumps,
        moonWin: false,
      };
    }

    case 'bump': {
      const newScore = Math.max(0, currentScore - 5);
      return {
        scoreDelta: newScore - currentScore,
        newScore,
        bumpsAdded: 1,
        newBumpCount: currentBumps + 1,
        moonWin: false,
      };
    }

    case 'double_bump': {
      const newScore = Math.max(0, currentScore - 5);
      return {
        scoreDelta: newScore - currentScore,
        newScore,
        bumpsAdded: 2,
        newBumpCount: currentBumps + 2,
        moonWin: false,
      };
    }

    case 'moon':
      return {
        scoreDelta: 0,
        newScore: currentScore,
        bumpsAdded: 0,
        newBumpCount: currentBumps,
        moonWin: true,
      };
  }
}

export function resolveWinnerId(
  standings: PlayerStanding[],
  moonWin: boolean,
  moonShooterId?: string,
): string | null {
  if (moonWin && moonShooterId) return moonShooterId;

  const winners = standings.filter((s) => s.score >= 15);
  if (winners.length === 0) return null;

  const sorted = [...winners].sort((a, b) => b.score - a.score);
  // Tie: highest score wins; if equal, return null (tiebreaker at table)
  if (sorted.length > 1 && sorted[0].score === sorted[1].score) return null;
  return sorted[0].playerId;
}

export function buildGameOverResult(
  standings: PlayerStanding[],
  winnerId: string,
  moonWin: boolean,
): GameOverResult {
  const winner = standings.find((s) => s.playerId === winnerId)!;

  const payouts: PayoutRow[] = standings
    .filter((s) => s.playerId !== winnerId)
    .map((s) => ({
      playerId: s.playerId,
      name: s.name,
      order: s.order,
      bumps: s.bumps,
      amountCents: 25 + s.bumps * 10,
    }));

  const winnerCollectsCents = payouts.reduce((sum, p) => sum + p.amountCents, 0);

  return {
    winnerId,
    winnerName: winner.name,
    winnerScore: winner.score,
    winnerBumps: winner.bumps,
    moonWin,
    payouts,
    winnerCollectsCents,
  };
}

export function formatCents(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`;
}
