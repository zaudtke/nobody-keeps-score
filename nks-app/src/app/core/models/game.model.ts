export type GameType = 'dirty-clubs' | 'canasta' | '5-crowns' | 'open';

export interface Game {
  id: string;
  gameType: GameType;
  status: 'active' | 'complete';
  startedAt: Date;
  currentRound: number; // 1-based across all game types
  config: GameConfig | null;
}

export interface GameConfig {
  winDirection: 'high' | 'low'; // open scorer only
  gameName: string; // open scorer only — displayed in app bar
}
