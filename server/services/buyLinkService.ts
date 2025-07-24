export class BuyLinkService {
  private static readonly PARTSELECT_BASE = "https://www.partselect.com";
  
  /**
   * Generate a working buy link for a part number
   * Uses the correct PartSelect URL format that actually works
   */
  static generateBuyLink(partNumber: string, partName?: string): string {
    // Remove 'PS' prefix if present for URL generation
    const numericPart = partNumber.replace(/^PS/, '');
    
    // Format part name for URL (remove special characters, spaces to hyphens, lowercase)
    const urlSafeName = partName 
      ? partName.toLowerCase().replace(/[^a-zA-Z0-9\s-]/g, '').replace(/\s+/g, '-')
      : '';
    
    // Generate PartSelect URL with correct format
    // Try the working URL format first
    return `${this.PARTSELECT_BASE}/parts/PS${numericPart}`;
  }
  
  /**
   * Alternative URL format for PartSelect parts
   */
  static generateAlternativeLink(partNumber: string, partName?: string): string {
    const numericPart = partNumber.replace(/^PS/, '');
    const urlSafeName = partName 
      ? partName.toLowerCase().replace(/[^a-zA-Z0-9\s-]/g, '').replace(/\s+/g, '-')
      : '';
    
    if (urlSafeName) {
      return `${this.PARTSELECT_BASE}/PS${numericPart}-${urlSafeName}.htm`;
    } else {
      return `${this.PARTSELECT_BASE}/part/PS${numericPart}`;
    }
  }
  
  /**
   * Generate working PartSelect product URL based on actual format
   */
  static generateWorkingProductLink(partNumber: string, partName: string): string {
    const numericPart = partNumber.replace(/^PS/, '');
    // Clean and format part name for URL
    const urlName = partName
      .replace(/[^a-zA-Z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .toUpperCase();
    
    return `https://www.partselect.com/PS${numericPart}-Whirlpool-${urlName}.htm?SourceCode=3&SearchTerm=${partNumber}`;
  }

  /**
   * Generate search-based buy link as fallback
   */
  static generateSearchLink(partNumber: string): string {
    return `https://www.partselect.com/search/?searchterm=${partNumber}`;
  }
  
  /**
   * Get the primary buy link using working PartSelect format
   */
  static getPrimaryBuyLink(partNumber: string, partName?: string): string {
    if (partName) {
      return this.generateWorkingProductLink(partNumber, partName);
    }
    return this.generateSearchLink(partNumber);
  }
  
  /**
   * Validate if a buy link format is correct
   */
  static isValidBuyLink(url: string): boolean {
    try {
      const parsed = new URL(url);
      return parsed.hostname === 'www.partselect.com' && 
             (parsed.pathname.includes('/PS') || parsed.pathname.includes('/search'));
    } catch {
      return false;
    }
  }
}