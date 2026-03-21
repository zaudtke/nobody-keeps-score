export type MeldTier = 'none' | '50' | '90' | '120';

export interface CanastaPlayerScore {
  base: number;
  score: number;
  newTotal: number;
}

export interface CanastaRound {
  id: string;
  roundNumber: number;
  scores: Record<string, CanastaPlayerScore>;
}

export interface CanastaPlayerStanding {
  playerId: string;
  name: string;
  order: number;
  total: number;
  meldTier: MeldTier;
}

export interface CanastaFinalStanding {
  playerId: string;
  name: string;
  order: number;
  total: number;
  place: number;
}

export interface CanastaGameOverResult {
  standings: CanastaFinalStanding[];
  winnerId: string;
  winnerName: string;
  winnerScore: number;
  isTie: boolean;
}
