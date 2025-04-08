export interface ImageItem {
  id: string;
  uuid: string;
  url: string;
  title: string;
  description?: string;
  width: number;
  height: number;
  tags: string[];
  asset?: string; // Original image asset path from API
} 