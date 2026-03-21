export type WinDirection = 'high' | 'low';

export interface OpenScorerRound {
  id: string;
  roundNumber: number;
  scores: Record<string, number>;
}

export interface OpenScorerPlayerStanding {
  playerId: string;
  name: string;
  order: number;
  total: number;
  roundScore: number | null; // score confirmed in the current round (null = not yet entered)
}

export interface OpenScorerFinalStanding {
  playerId: string;
  name: string;
  order: number;
  total: number;
  place: number;
}

export interface OpenScorerGameOverResult {
  standings: OpenScorerFinalStanding[];
  winnerId: string;
  winnerName: string;
  winnerScore: number;
  isTie: boolean;
  winDirection: WinDirection;
}
