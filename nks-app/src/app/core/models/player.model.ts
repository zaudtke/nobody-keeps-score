export interface Player {
  id: string;
  name: string; // host-entered name; no player claiming in v1
  order: number; // 1-based insertion order; used for avatar colour assignment
}
