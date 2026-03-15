export type HandOutcome = 'dnp' | 'tricks' | 'bump' | 'double_bump' | 'moon';

export interface DirtyClubsPlayerScore {
  outcome: HandOutcome;
  tricksValue: number; // 0 unless outcome === 'tricks'
  scoreDelta: number;
  newScore: number;
  bumpsAdded: number;
  newBumpCount: number;
}

export interface DirtyClubsRound {
  id: string;
  handNumber: number;
  moonWin: boolean;
  scores: Record<string, DirtyClubsPlayerScore>;
}

export interface PlayerStanding {
  playerId: string;
  name: string;
  order: number; // 1-based, used for avatar colour
  score: number;
  bumps: number;
}

export interface GameOverResult {
  winnerId: string;
  winnerName: string;
  winnerScore: number;
  winnerBumps: number;
  moonWin: boolean;
  payouts: PayoutRow[];
  winnerCollectsCents: number;
}

export interface PayoutRow {
  playerId: string;
  name: string;
  order: number;
  bumps: number;
  amountCents: number;
}
