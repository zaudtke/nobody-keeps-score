import type {
  FiveCrownsFinalStanding,
  FiveCrownsGameOverResult,
  FiveCrownsPlayerStanding,
  RoundDef,
} from './five-crowns.model';

export const ROUNDS: RoundDef[] = [
  { label: '3',  cards: 3,  wild: '3s'     },
  { label: '4',  cards: 4,  wild: '4s'     },
  { label: '5',  cards: 5,  wild: '5s'     },
  { label: '6',  cards: 6,  wild: '6s'     },
  { label: '7',  cards: 7,  wild: '7s'     },
  { label: '8',  cards: 8,  wild: '8s'     },
  { label: '9',  cards: 9,  wild: '9s'     },
  { label: '10', cards: 10, wild: '10s'    },
  { label: 'J',  cards: 11, wild: 'Jacks'  },
  { label: 'Q',  cards: 12, wild: 'Queens' },
  { label: 'K',  cards: 13, wild: 'Kings'  },
];

export function getRoundDef(roundNumber: number): RoundDef {
  return ROUNDS[roundNumber - 1];
}

export function calculateNewTotal(prev: number, roundScore: number): number {
  return prev + roundScore;
}

export function buildFiveCrownsGameOverResult(
  standings: FiveCrownsPlayerStanding[],
): FiveCrownsGameOverResult {
  // Lowest total wins — sort ascending
  const sorted = [...standings].sort((a, b) => a.total - b.total);

  const withPlaces: FiveCrownsFinalStanding[] = [];
  let place = 1;
  for (let i = 0; i < sorted.length; i++) {
    if (i > 0 && sorted[i].total > sorted[i - 1].total) {
      place = i + 1;
    }
    withPlaces.push({
      playerId: sorted[i].playerId,
      name: sorted[i].name,
      order: sorted[i].order,
      total: sorted[i].total,
      place,
      lastRoundScore: sorted[i].roundScore,
    });
  }

  const lowestScore = sorted[0].total;
  const topPlayers = sorted.filter((s) => s.total === lowestScore);
  const isTie = topPlayers.length > 1;

  return {
    standings: withPlaces,
    winnerId: topPlayers[0].playerId,
    winnerName: isTie
      ? topPlayers.map((p) => p.name).join(' & ')
      : topPlayers[0].name,
    winnerScore: lowestScore,
    isTie,
  };
}
