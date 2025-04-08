import { ImageItem } from '@/types/gallery';
import { calculateProportionalDimensions } from '../utils/imageUtils';

/**
 * Image domain class to encapsulate image-related logic
 */
export class Image {
  id: string;
  uuid: string;
  url: string;
  title: string;
  description?: string;
  width: number;
  height: number;
  tags: string[];
  asset?: string;

  constructor(imageData: ImageItem) {
    this.id = imageData.id;
    this.uuid = imageData.uuid;
    this.url = imageData.url;
    this.title = imageData.title;
    this.description = imageData.description;
    this.width = imageData.width;
    this.height = imageData.height;
    this.tags = imageData.tags;
    this.asset = imageData.asset;
  }

  /**
   * Get the aspect ratio of the image
   */
  getAspectRatio(): number {
    return this.width / this.height;
  }

  /**
   * Calculate display dimensions based on container constraints
   */
  getDisplayDimensions(maxWidth: number, maxHeight: number): { width: number; height: number } {
    return calculateProportionalDimensions(this.width, this.height, maxWidth, maxHeight);
  }

  /**
   * Convert back to plain ImageItem
   */
  toImageItem(): ImageItem {
    return {
      id: this.id,
      uuid: this.uuid,
      url: this.url,
      title: this.title,
      description: this.description,
      width: this.width,
      height: this.height,
      tags: this.tags,
      asset: this.asset,
    };
  }

  /**
   * Create an Image instance from ImageItem
   */
  static fromImageItem(imageItem: ImageItem): Image {
    return new Image(imageItem);
  }

  /**
   * Create multiple Image instances from ImageItems
   */
  static fromImageItems(imageItems: ImageItem[]): Image[] {
    return imageItems.map(item => new Image(item));
  }
} 