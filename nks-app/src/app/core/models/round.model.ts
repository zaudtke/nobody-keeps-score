import type { HandOutcome } from '../../features/dirty-clubs/dirty-clubs.model';

export interface Round {
  id: string;
  roundNumber: number;
  scores: Record<string, number>;
}

// Dirty Clubs round shape stored in Firestore
export interface DirtyClubsRoundDoc {
  id: string;
  handNumber: number;
  moonWin: boolean;
  scores: Record<
    string,
    {
      outcome: HandOutcome;
      tricksValue: number;
      scoreDelta: number;
      newScore: number;
      bumpsAdded: number;
      newBumpCount: number;
    }
  >;
}
