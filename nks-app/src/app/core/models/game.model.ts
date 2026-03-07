export type GameType = 'rummy' | 'whist' | 'open';

export interface Game {
  id: string;
  gameType: GameType;
  status: 'active' | 'complete';
  startedAt: Date;
}
