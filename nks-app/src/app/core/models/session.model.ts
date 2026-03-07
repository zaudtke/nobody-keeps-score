export interface Session {
  id: string;
  hostId: string;
  createdAt: Date;
  status: 'active' | 'archived';
}
