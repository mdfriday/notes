/**
 * Shortcode service for registering and rendering shortcodes
 */
import { ShortcodeMetadata } from '../../types/shortcode.ts';

/**
 * Shortcode class to handle registration and rendering of shortcodes
 */
export class Shortcode {
  private shortcodes: Map<string, ShortcodeMetadata>;
  private shortcodeRegex: RegExp;
  
  constructor() {
    this.shortcodes = new Map();
    // Match pattern like {{< shortcodeName param="value" >}}
    this.shortcodeRegex = /\{\{<\s*([a-zA-Z0-9_-]+)([^>]*?)\/?\s*>\}\}/g;
  }
  
  /**
   * Register a new shortcode
   */
  registerShortcode(metadata: ShortcodeMetadata): boolean {
    if (!metadata || !metadata.name || !metadata.template) {
      console.error('Invalid shortcode metadata:', metadata);
      return false;
    }
    
    try {
      this.shortcodes.set(metadata.name, metadata);
      console.log(`Registered shortcode: ${metadata.name}`);
      return true;
    } catch (error) {
      console.error(`Error registering shortcode: ${metadata.name}`, error);
      return false;
    }
  }
  
  /**
   * First step of rendering: replace shortcodes with placeholders
   */
  stepRender(markdown: string): string {
    if (!markdown) return markdown;
    
    // Replace shortcodes with placeholders
    return markdown.replace(this.shortcodeRegex, (match, name, params) => {
      const shortcode = this.shortcodes.get(name);
      if (!shortcode) {
        console.warn(`Unknown shortcode: ${name}`);
        return match; // Keep original if not found
      }
      
      // Create a placeholder to preserve the shortcode during markdown parsing
      const placeholderId = `shortcode_${Math.random().toString(36).substring(2, 15)}`;
      // Store the shortcode data for final rendering
      (window as any)[placeholderId] = { name, params, shortcode };
      return `<div data-shortcode-placeholder="${placeholderId}"></div>`;
    });
  }
  
  /**
   * Final rendering: replace placeholders with rendered shortcodes
   */
  finalRender(html: string): string {
    if (!html) return html;
    
    // Replace placeholders with rendered shortcodes
    return html.replace(/<div data-shortcode-placeholder="([^"]+)"><\/div>/g, (match, placeholderId) => {
      const data = (window as any)[placeholderId];
      if (!data) {
        console.warn(`Missing shortcode data for placeholder: ${placeholderId}`);
        return match;
      }
      
      // Clean up after use
      delete (window as any)[placeholderId];
      
      try {
        return this.renderShortcode(data.name, data.params, data.shortcode);
      } catch (error) {
        console.error(`Error rendering shortcode: ${data.name}`, error);
        return `<div class="shortcode-error">Error rendering shortcode: ${data.name}</div>`;
      }
    });
  }
  
  /**
   * Parse shortcode parameters
   */
  private parseParams(paramsStr: string): Record<string, string> {
    const params: Record<string, string> = {};
    const regex = /([a-zA-Z0-9_-]+)=["']([^"']*?)["']/g;
    let match;
    
    while ((match = regex.exec(paramsStr)) !== null) {
      const [, key, value] = match;
      params[key] = value;
    }
    
    return params;
  }
  
  /**
   * Render a shortcode with parameters
   */
  private renderShortcode(name: string, paramsStr: string, shortcodeData: ShortcodeMetadata): string {
    const params = this.parseParams(paramsStr);
    let template = shortcodeData.template;
    
    // Replace parameter placeholders
    Object.entries(params).forEach(([key, value]) => {
      const regex = new RegExp(`\\{\\{\\.Get\\s+["']${key}["']\\s*\\}\\}`, 'g');
      template = template.replace(regex, value);
    });
    
    // Handle special template logic for split and range
    template = this.handleTemplateFunctions(template, params);
    
    return template;
  }
  
  /**
   * Handle special template functions like split and range
   */
  private handleTemplateFunctions(template: string, params: Record<string, string>): string {
    // Handle {{ $topics := split (.Get "footerContent") "," }}
    const splitRegex = /\{\{\s*\$([a-zA-Z0-9_]+)\s*:=\s*split\s*\(\.Get\s+["']([a-zA-Z0-9_]+)["']\)\s*["']([^"']+)["']\s*\}\}/g;
    template = template.replace(splitRegex, (match, varName, paramName, delimiter) => {
      const paramValue = params[paramName] || '';
      // Store the split value in window for use in range
      (window as any)[`split_${varName}`] = paramValue.split(delimiter);
      return ''; // Remove the declaration from output
    });
    
    // Handle {{ range $index, $topic := $topics }}...{{ end }}
    const rangeRegex = /\{\{\s*range\s+\$([a-zA-Z0-9_]+),\s*\$([a-zA-Z0-9_]+)\s*:=\s*\$([a-zA-Z0-9_]+)\s*\}\}(.*?)\{\{\s*end\s*\}\}/gs;
    template = template.replace(rangeRegex, (match, indexVar, itemVar, arrayVar, content) => {
      const array = (window as any)[`split_${arrayVar}`] || [];
      
      // Process each item in the array
      return array.map((item: string, index: number) => {
        let itemContent = content;
        
        // Replace index and item variables
        itemContent = itemContent.replace(
          new RegExp(`\\{\\{\\s*\\$${indexVar}\\s*\\}\\}`, 'g'),
          index.toString()
        );
        itemContent = itemContent.replace(
          new RegExp(`\\{\\{\\s*\\$${itemVar}\\s*\\}\\}`, 'g'),
          item
        );
        
        // Handle conditional statements inside the range
        itemContent = this.handleConditionals(itemContent, index);
        
        return itemContent;
      }).join('');
    });
    
    return template;
  }
  
  /**
   * Handle conditional statements like {{ if gt $index 0 }}
   */
  private handleConditionals(content: string, index: number): string {
    // Handle {{ if gt $index 0 }}...{{ end }}
    const ifGtRegex = /\{\{\s*if\s+gt\s+\$([a-zA-Z0-9_]+)\s+([0-9]+)\s*\}\}(.*?)\{\{\s*end\s*\}\}/gs;
    return content.replace(ifGtRegex, (match, varName, value, ifContent) => {
      if (varName === 'index' && index > parseInt(value, 10)) {
        return ifContent;
      }
      return '';
    });
  }
} 