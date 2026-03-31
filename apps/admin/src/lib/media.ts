export interface MediaItem {
  id: string;
  url: string;
  filename: string | null;
  folder: string | null;
  createdAt: string;
}

export interface MediaFolder {
  name: string;
  itemCount: number;
}
