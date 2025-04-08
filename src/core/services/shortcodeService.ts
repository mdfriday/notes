import { Shortcode } from '@mdfriday/shortcode';
import { ShortcodeItem, ShortcodeMetadata } from '@/types/shortcode';
import { shortcodeApiService } from './shortcodeApiService';

// Initialize a singleton instance of the Shortcode class
const globalShortcode = new Shortcode();

/**
 * Service for managing shortcodes
 * Handles registration, discovery, and optimization of shortcodes
 */
export const shortcodeService = {
  /**
   * Get the global shortcode instance
   */
  getInstance(): Shortcode {
    return globalShortcode;
  },

  /**
   * Register a shortcode
   * @param shortcodeItem The shortcode item to register
   */
  registerShortcode(shortcodeItem: ShortcodeItem): void {
    // Create shortcode metadata from the shortcode item
    const metadata: ShortcodeMetadata = {
      id: parseInt(shortcodeItem.id, 10),
      name: shortcodeItem.title,
      template: shortcodeItem.template,
      uuid: shortcodeItem.id,
      tags: shortcodeItem.tags
    };

    // Register the shortcode
    globalShortcode.registerShortcode(metadata);
  },

  /**
   * Check if a shortcode is already registered
   * @param name The name of the shortcode to check
   * @returns True if the shortcode is registered, false otherwise
   */
  isShortcodeRegistered(name: string): boolean {
    // Use the built-in findByName method
    return !!globalShortcode.findByName(name);
  },

  /**
   * Extract shortcode names from a markdown string
   * @param markdown The markdown string to extract shortcode names from
   * @returns Array of shortcode names
   */
  extractShortcodeNames(markdown: string): string[] {
    // Use the built-in extractShortcodeNames method
    return globalShortcode.extractShortcodeNames(markdown);
  },

  /**
   * Fetch shortcode details by name from the API
   * @param name The name of the shortcode to fetch
   * @returns The shortcode item, or null if not found
   */
  async fetchShortcodeByName(name: string): Promise<ShortcodeItem | null> {
    // Delegate to the shortcodeApiService
    return shortcodeApiService.fetchShortcodeByName(name);
  },

  /**
   * Process markdown content to ensure all shortcodes are registered
   * @param markdown The markdown content to process
   * @returns A promise that resolves when all shortcodes are registered
   */
  async ensureShortcodesRegistered(markdown: string): Promise<void> {
    // Extract all shortcode names from the markdown
    const shortcodeNames = this.extractShortcodeNames(markdown);
    console.log('Extracted shortcode names:', shortcodeNames);
    
    if (shortcodeNames.length === 0) {
      console.log('No shortcodes found in content');
      return;
    }
    
    // Check which shortcodes are not registered yet
    const unregisteredShortcodes = shortcodeNames.filter(
      name => !this.isShortcodeRegistered(name)
    );
    console.log('Unregistered shortcodes:', unregisteredShortcodes);
    
    if (unregisteredShortcodes.length === 0) {
      console.log('All shortcodes are already registered');
      return;
    }
    
    // Fetch and register all unregistered shortcodes
    const fetchPromises = unregisteredShortcodes.map(async (name) => {
      const shortcodeItem = await this.fetchShortcodeByName(name);
      if (shortcodeItem) {
        this.registerShortcode(shortcodeItem);
        console.log(`Registered shortcode: ${name}`);
      } else {
        console.warn(`Failed to fetch shortcode: ${name}`);
      }
    });
    
    // Wait for all shortcodes to be registered
    await Promise.all(fetchPromises);
  },

  /**
   * Step 1 of markdown rendering: replace shortcodes with placeholders
   * @param markdown The markdown to render
   * @returns The rendered markdown with placeholders
   */
  stepRender(markdown: string): string {
    return globalShortcode.stepRender(markdown);
  },

  /**
   * Step 3 of markdown rendering: final rendering
   * @param html The HTML with shortcode placeholders
   * @returns The final HTML with shortcodes rendered
   */
  finalRender(html: string): string {
    return globalShortcode.finalRender(html);
  }
}; 