export interface Round {
  id: string;
  roundNumber: number;
  scores: Record<string, number>;
}
