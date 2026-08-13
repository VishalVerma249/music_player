export interface Playlist {
  id: string;
  name: string;
  description?: string;
  coverUrl?: string;
  trackIds: string[];
  isSystem?: boolean;
  createdAt?: string;
  updatedAt?: string;
}
