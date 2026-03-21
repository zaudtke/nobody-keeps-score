export interface RoundDef {
  label: string;
  cards: number;
  wild: string;
}

export interface FiveCrownsRound {
  id: string;
  roundNumber: number;
  roundIndex: number;
  scores: Record<string, number>;
}

export interface FiveCrownsPlayerStanding {
  playerId: string;
  name: string;
  order: number;
  total: number;        // cumulative total before the current round
  roundScore: number | null; // this round's confirmed score (null = not yet entered)
}

export interface FiveCrownsFinalStanding {
  playerId: string;
  name: string;
  order: number;
  total: number;
  place: number;
  lastRoundScore: number | null;
}

export interface FiveCrownsGameOverResult {
  standings: FiveCrownsFinalStanding[];
  winnerId: string;
  winnerName: string;
  winnerScore: number;
  isTie: boolean;
}
