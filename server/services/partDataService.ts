/**
 * Unified Part Data Service - Single source for part information
 * Consolidates all part data retrieval into one efficient service
 */
import { LivePartSelectScraper, ScrapedPartData } from './livePartSelectScraper';

export interface PartData {
  partNumber: string;
  name: string;
  price: string;
  imageUrl: string;
  description: string;
  buyLink: string;
  inStock: boolean;
  compatibility: string[];
  category: string;
  installationSteps?: string[];
  installationDifficulty?: 'easy' | 'medium' | 'hard';
  installationTime?: string;
  toolsRequired?: string[];
}

export class PartDataService {
  
  // Static fallback data only used when scraping fails
  private static readonly partsDatabase: { [key: string]: PartData } = {
    // Common typo/alias - PS12752778 should map to PS11752778
    'PS12752778': {
      partNumber: 'PS11752778', // Use the correct part number
      name: 'Refrigerator Door Shelf Bin',
      price: '$45.07',
      imageUrl: '', // Will be populated dynamically
      description: 'Clear door shelf bin for refrigerator storage compartment.',
      buyLink: 'https://www.partselect.com/search?searchterm=PS11752778&modelfilter=true',
      inStock: true,
      compatibility: ['WRF535SWHZ00', 'WRS325SDHZ00', 'WRF767SDHZ00', 'ED5FHAXVB02', 'WDT780SAEM1'],
      category: 'refrigerator',
      installationSteps: [
        'Safety first: Unplug the refrigerator or turn off the circuit breaker. Wait 5 minutes for any electrical components to discharge.',
        'Open the refrigerator door fully to access the door bins. Remove any items from the bin you\'re replacing.',
        'Locate the door shelf bin tabs or clips on both sides. Most bins have spring-loaded tabs that hold them in place.',
        'Grasp the old bin firmly with both hands. Lift up slightly to disengage the bottom clips, then pull the bin straight out toward you.',
        'If the bin is stuck, gently wiggle it side to side while pulling. Do not force it - check for additional clips or tabs.',
        'Inspect the door tracks for any debris or damage. Clean with a damp cloth if needed and allow to dry completely.',
        'Take the new bin and align it with the door tracks. The bin should slide in horizontally with the tabs positioned correctly.',
        'Push the bin straight back into the door until you hear or feel it click into place. The bin should sit flush against the door.',
        'Test the installation by gently pulling the bin forward - it should move smoothly but not come completely out.',
        'Load a few light items to verify the bin holds securely. Restore power to the refrigerator.'
      ],
      installationDifficulty: 'easy',
      installationTime: '10-15 minutes',
      toolsRequired: ['None required - this is a hand-installation part', 'Clean cloth (optional for cleaning tracks)']
    },
    'PS11752778': {
      partNumber: 'PS11752778',
      name: 'Refrigerator Door Shelf Bin',
      price: '$45.07',
      imageUrl: '', // Will be populated dynamically
      description: 'Clear door shelf bin for refrigerator storage compartment.',
      buyLink: 'https://www.partselect.com/search?searchterm=PS11752778&modelfilter=true',
      inStock: true,
      compatibility: ['WRF535SWHZ00', 'WRS325SDHZ00', 'WRF767SDHZ00', 'ED5FHAXVB02', 'WDT780SAEM1'],
      category: 'refrigerator',
      installationSteps: [
        'Safety first: Unplug the refrigerator or turn off the circuit breaker. Wait 5 minutes for any electrical components to discharge.',
        'Open the refrigerator door fully to access the door bins. Remove any items from the bin you\'re replacing.',
        'Locate the door shelf bin tabs or clips on both sides. Most bins have spring-loaded tabs that hold them in place.',
        'Grasp the old bin firmly with both hands. Lift up slightly to disengage the bottom clips, then pull the bin straight out toward you.',
        'If the bin is stuck, gently wiggle it side to side while pulling. Do not force it - check for additional clips or tabs.',
        'Inspect the door tracks for any debris or damage. Clean with a damp cloth if needed and allow to dry completely.',
        'Take the new bin and align it with the door tracks. The bin should slide in horizontally with the tabs positioned correctly.',
        'Push the bin straight back into the door until you hear or feel it click into place. The bin should sit flush against the door.',
        'Test the installation by gently pulling the bin forward - it should move smoothly but not come completely out.',
        'Load a few light items to verify the bin holds securely. Restore power to the refrigerator.'
      ],
      installationDifficulty: 'easy',
      installationTime: '10-15 minutes',
      toolsRequired: ['None required - this is a hand-installation part', 'Clean cloth (optional for cleaning tracks)']
    },
    'PS11756692': {
      partNumber: 'PS11756692',
      name: 'Dishwasher Pump and Motor Assembly',
      price: '$164.95',
      imageUrl: '', // Will be populated dynamically
      description: 'Whirlpool dishwasher drain pump and motor assembly. Fits models WDT780SAEM1 and similar.',
      buyLink: 'https://www.partselect.com/search?searchterm=PS11756692',
      inStock: true,
      compatibility: ['WDT780SAEM1', 'WDT730PAHZ0', 'KDTM704KPS0', 'WDF520PADM7'],
      category: 'dishwasher'
    },
    'PS12584610': {
      partNumber: 'PS12584610',
      name: 'Ice Maker Assembly',
      price: '$100.79',
      imageUrl: '', // Will be populated dynamically
      description: 'Complete ice maker assembly kit for refrigerator models WRS325SDHZ.',
      buyLink: 'https://www.partselect.com/PS12584610-Whirlpool-ICE-MAKER-ASSEMBLY.htm?SourceCode=3&SearchTerm=PS12584610',
      inStock: true,
      compatibility: ['WRS325SDHZ01', 'WRS325SDHZ05', 'WRS325SDHZ08', 'WRF535SWHZ04', 'WRF535SWHZ00'],
      category: 'refrigerator',
      installationSteps: [
        'Safety first: Unplug the refrigerator and shut off the water supply valve. Wait 5 minutes for electrical discharge.',
        'Remove all ice from the ice bin and empty the ice maker completely.',
        'Locate the ice maker in the upper left section of the freezer compartment.',
        'Remove the ice maker mounting screws (typically 2-3 Phillips head screws) using a screwdriver.',
        'Carefully pull the ice maker forward to access the electrical connections.',
        'Disconnect the wire harness connector by pressing the release tab and pulling straight out.',
        'If equipped, disconnect the water line using the quick-connect fitting (press and pull).',
        'Remove the old ice maker assembly completely from the freezer.',
        'Position the new PS12584610 ice maker in the mounting location, ensuring proper alignment.',
        'Reconnect the water line first, ensuring the quick-connect clicks securely into place.',
        'Reconnect the wire harness connector until it clicks firmly into position.',
        'Secure the ice maker with the mounting screws, tightening snugly but not overtightening.',
        'Restore water supply and electrical power to the refrigerator.',
        'Allow 24 hours for the ice maker to cycle and begin producing ice. First batch may be smaller.'
      ],
      installationDifficulty: 'medium',
      installationTime: '45-60 minutes',
      toolsRequired: ['Phillips head screwdriver', 'Flashlight (optional)']
    },
    'PS11753379': {
      partNumber: 'PS11753379',
      name: 'Dishwasher Drain Pump 120V 60Hz',
      price: '$59.95',
      imageUrl: '', // Will be populated dynamically
      description: 'Dishwasher drain pump replacement for water removal system.',
      buyLink: 'https://www.partselect.com/search?searchterm=PS11753379&modelfilter=true',
      inStock: true,
      compatibility: ['WDT780SAEM1', 'KDTE334GPS0', 'WDF520PADM7', 'KDPM354GPS0'],
      category: 'dishwasher',
      installationSteps: [
        'Disconnect power and water supply to the dishwasher',
        'Remove the bottom dish rack and spray arm',
        'Remove the dishwasher filter assembly',
        'Access the sump area and locate the drain pump',
        'Disconnect the wire connectors from the old pump',
        'Remove the clamps and disconnect the drain hoses',
        'Remove the mounting screws and lift out the old pump',
        'Install the new PS11753379 pump in reverse order',
        'Reconnect all hoses, wires, and reassemble components',
        'Restore power and water, then test for proper drainage'
      ],
      installationDifficulty: 'hard',
      installationTime: '60-90 minutes',
      toolsRequired: ['Phillips screwdriver', 'Pliers', 'Towels for water cleanup']
    },
    'PS733947': {
      partNumber: 'PS733947',
      name: 'Ice Maker Motor Kit',
      price: '$89.99',
      imageUrl: 'https://images.partselect.com/images/733947.jpg',
      description: 'Ice maker motor replacement kit with gear assembly.',
      buyLink: 'https://www.partselect.com/PS733947-Whirlpool-ICEMAKER-MOTOR-KIT.htm?SourceCode=3&SearchTerm=PS733947',
      inStock: true,
      compatibility: ['WRS325SDHZ01', 'WRF535SWHZ04', 'WRS588FIHZ00'],
      category: 'refrigerator'
    },
    'PS11746240': {
      partNumber: 'PS11746240',
      name: 'Dishwasher Drain Hose',
      price: '$31.75',
      imageUrl: 'https://images.partselect.com/images/11746240.jpg',
      description: 'Dishwasher drain hose assembly with connection fittings.',
      buyLink: 'https://www.partselect.com/search?searchterm=PS11746240',
      inStock: true,
      compatibility: ['WDT780SAEM1', 'KDTE334GPS0', 'KDPM354GPS0', 'WDT750SAHZ0'],
      category: 'dishwasher'
    },
    'PS2163382': {
      partNumber: 'PS2163382',
      name: 'Refrigerator Door Gasket',
      price: '$95.80',
      imageUrl: 'https://images.partselect.com/images/2163382.jpg',
      description: 'Refrigerator door seal gasket for airtight closure.',
      buyLink: 'https://www.partselect.com/search?searchterm=PS2163382',
      inStock: true,
      compatibility: ['WRF535SWHZ00', 'WRF767SDHZ00', 'WRS588FIHZ00', 'WRS325SDHZ00'],
      category: 'refrigerator'
    },
    'PS2071928': {
      partNumber: 'PS2071928',
      name: 'Refrigerator Defrost Heater',
      price: '$42.99',
      imageUrl: 'https://images.partselect.com/images/2071928.jpg',
      description: 'Defrost heater element for automatic defrost cycle.',
      buyLink: 'https://www.partselect.com/search?searchterm=PS2071928',
      inStock: true,
      compatibility: ['WRF767SDHZ00', 'WRS588FIHZ00', 'WRS325SDHZ00', 'GI15NDXZS4'],
      category: 'refrigerator'
    }
  };

  /**
   * Get all parts from the database
   */
  static getAllParts(): { [key: string]: PartData } {
    return this.partsDatabase;
  }

  /**
   * Get part data by part number
   */
  // Cache for scraped data to avoid repeated requests
  private static scrapedCache: { [key: string]: ScrapedPartData } = {};
  
  // Clear cache method for testing 
  static clearCache(): void {
    this.scrapedCache = {};
    console.log('🗑️ Part data cache cleared');
  }

  static async getPartData(partNumber: string): Promise<PartData | null> {
    console.log(`🔍 Looking up part data for ${partNumber}`);
    
    // Clear cache for PS11752778 to refresh price
    if (partNumber === 'PS11752778' && this.scrapedCache[partNumber]) {
      delete this.scrapedCache[partNumber];
      console.log('🗑️ Cleared cache for PS11752778 to update price');
    }
    
    // First check cache
    if (this.scrapedCache[partNumber]) {
      const cached = this.scrapedCache[partNumber];
      console.log(`✅ Using cached live data for ${partNumber}: ${cached.name} - ${cached.price}`);
      return this.convertScrapedToPartData(cached);
    }

    // Try live scraping from PartSelect first
    console.log(`🔍 Live scraping PartSelect for ${partNumber}`);
    const scrapedData = await LivePartSelectScraper.scrapePartData(partNumber);
    
    if (scrapedData) {
      // Cache the result
      this.scrapedCache[partNumber] = scrapedData;
      console.log(`✅ Successfully scraped live data for ${partNumber}: ${scrapedData.name} - ${scrapedData.price}`);
      return this.convertScrapedToPartData(scrapedData);
    }

    // Fallback to static database only if scraping fails
    console.log(`🔍 Available fallback parts:`, Object.keys(this.partsDatabase));
    const part = this.partsDatabase[partNumber];
    if (part) {
      console.log(`⚠️ Using fallback data for ${partNumber}: ${part.name} - ${part.price}`);
      
      // Get image using scraper system (which may fall back to SVG)
      const { PartImageScraper } = await import('./partImageScraper');
      const imageUrl = await PartImageScraper.getPartImage(partNumber, part.name, part.category);
      
      return {
        ...part,
        imageUrl
      };
    }
    
    console.log(`❌ No data found for part number: ${partNumber}`);
    return null;
  }

  /**
   * Convert scraped data to PartData format
   */
  private static convertScrapedToPartData(scraped: ScrapedPartData): PartData {
    return {
      partNumber: scraped.partNumber,
      name: scraped.name,
      price: scraped.price,
      imageUrl: scraped.imageUrl || '', // Will use real scraped image or fallback to SVG
      description: scraped.description,
      buyLink: `https://www.partselect.com/PS/${scraped.partNumber}.htm`,
      inStock: scraped.inStock,
      compatibility: scraped.modelCompatibility,
      category: scraped.category,
      installationSteps: [], // Could be scraped separately
      installationDifficulty: 'medium' as const,
      installationTime: '30-60 minutes',
      toolsRequired: ['Basic hand tools']
    };
  }

  /**
   * Search parts by query terms
   */
  static searchParts(query: string): PartData[] {
    const searchTerms = query.toLowerCase().split(' ');
    const results: PartData[] = [];
    
    Object.values(this.partsDatabase).forEach(part => {
      const searchableText = [
        part.name,
        part.partNumber,
        part.category,
        part.description,
        ...part.compatibility
      ].join(' ').toLowerCase();
      
      const matches = searchTerms.some(term => searchableText.includes(term));
      if (matches) {
        results.push(part);
      }
    });
    
    console.log(`🔍 Search for "${query}" returned ${results.length} results`);
    return results;
  }

  /**
   * Find compatible parts for a model number
   */
  static findCompatibleParts(modelNumber: string): PartData[] {
    const results: PartData[] = [];
    
    Object.values(this.partsDatabase).forEach(part => {
      const isCompatible = part.compatibility.some(model => 
        model.toLowerCase().includes(modelNumber.toLowerCase())
      );
      if (isCompatible) {
        results.push(part);
      }
    });
    
    console.log(`🔍 Found ${results.length} compatible parts for model ${modelNumber}`);
    return results;
  }

  /**
   * Get parts by category
   */
  static getPartsByCategory(category: string): PartData[] {
    const results = Object.values(this.partsDatabase).filter(
      part => part.category.toLowerCase() === category.toLowerCase()
    );
    
    console.log(`🔍 Found ${results.length} parts in category "${category}"`);
    return results;
  }

  /**
   * Generate buy link for any part number
   */
  static generateBuyLink(partNumber: string): string {
    return `https://www.partselect.com/search?searchterm=${partNumber}`;
  }

  /**
   * Smart image URL selection with multiple reliable sources for appliance parts
   */
  private static getPartImageUrl(category: string, partName: string, partNumber: string): string {
    
    // Refrigerator parts with high-quality stock images
    if (category === 'refrigerator') {
      if (partName.toLowerCase().includes('ice maker')) {
        // Multiple ice maker image sources
        const iceMakerImages = [
          'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
          'https://images.unsplash.com/photo-1571175443880-49e1d25b2bc5?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
          'https://images.pexels.com/photos/2062426/pexels-photo-2062426.jpeg?auto=compress&cs=tinysrgb&w=400'
        ];
        return '/api/proxy-image?url=' + encodeURIComponent(iceMakerImages[Math.floor(Math.random() * iceMakerImages.length)]);
      } else if (partName.toLowerCase().includes('filter')) {
        const filterImages = [
          'https://images.unsplash.com/photo-1582560475093-ba66accbc424?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
          'https://images.pexels.com/photos/4207892/pexels-photo-4207892.jpeg?auto=compress&cs=tinysrgb&w=400',
          'https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80'
        ];
        return '/api/proxy-image?url=' + encodeURIComponent(filterImages[Math.floor(Math.random() * filterImages.length)]);
      } else if (partName.toLowerCase().includes('shelf') || partName.toLowerCase().includes('bin')) {
        const shelfImages = [
          'https://images.unsplash.com/photo-1571175443880-49e1d25b2bc5?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
          'https://images.pexels.com/photos/1080721/pexels-photo-1080721.jpeg?auto=compress&cs=tinysrgb&w=400',
          'https://images.unsplash.com/photo-1585659722983-3a675dabf23d?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80'
        ];
        return '/api/proxy-image?url=' + encodeURIComponent(shelfImages[Math.floor(Math.random() * shelfImages.length)]);
      } else if (partName.toLowerCase().includes('compressor')) {
        return '/api/proxy-image?url=' + encodeURIComponent('https://images.unsplash.com/photo-1558618666-fcd25c85cd64?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80');
      } else if (partName.toLowerCase().includes('thermostat') || partName.toLowerCase().includes('control')) {
        return '/api/proxy-image?url=' + encodeURIComponent('https://images.unsplash.com/photo-1517077304055-6e89abbf09b0?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80');
      } else if (partName.toLowerCase().includes('door') || partName.toLowerCase().includes('gasket') || partName.toLowerCase().includes('seal')) {
        return '/api/proxy-image?url=' + encodeURIComponent('https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80');
      } else if (partName.toLowerCase().includes('fan') || partName.toLowerCase().includes('motor')) {
        return '/api/proxy-image?url=' + encodeURIComponent('https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80');
      } else {
        // Generic refrigerator part
        const genericRefrigImages = [
          'https://images.unsplash.com/photo-1571175443880-49e1d25b2bc5?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
          'https://images.pexels.com/photos/2062426/pexels-photo-2062426.jpeg?auto=compress&cs=tinysrgb&w=400'
        ];
        return '/api/proxy-image?url=' + encodeURIComponent(genericRefrigImages[Math.floor(Math.random() * genericRefrigImages.length)]);
      }
    }
    
    // Dishwasher parts with multiple sources  
    else if (category === 'dishwasher') {
      if (partName.toLowerCase().includes('pump')) {
        const pumpImages = [
          'https://images.unsplash.com/photo-1585659722983-3a675dabf23d?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
          'https://images.pexels.com/photos/5591663/pexels-photo-5591663.jpeg?auto=compress&cs=tinysrgb&w=400',
          'https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80'
        ];
        return '/api/proxy-image?url=' + encodeURIComponent(pumpImages[Math.floor(Math.random() * pumpImages.length)]);
      } else if (partName.toLowerCase().includes('motor')) {
        return '/api/proxy-image?url=' + encodeURIComponent('https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80');
      } else if (partName.toLowerCase().includes('spray') || partName.toLowerCase().includes('arm')) {
        return '/api/proxy-image?url=' + encodeURIComponent('https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80');
      } else if (partName.toLowerCase().includes('filter')) {
        return '/api/proxy-image?url=' + encodeURIComponent('https://images.unsplash.com/photo-1582560475093-ba66accbc424?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80');
      } else if (partName.toLowerCase().includes('door') || partName.toLowerCase().includes('gasket') || partName.toLowerCase().includes('seal')) {
        return '/api/proxy-image?url=' + encodeURIComponent('https://images.unsplash.com/photo-1600585154340-be6161a56a0c?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80');
      } else if (partName.toLowerCase().includes('rack') || partName.toLowerCase().includes('tray')) {
        return '/api/proxy-image?url=' + encodeURIComponent('https://images.unsplash.com/photo-1607779097040-26e80aa78e66?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80');
      } else if (partName.toLowerCase().includes('heater') || partName.toLowerCase().includes('element')) {
        return '/api/proxy-image?url=' + encodeURIComponent('https://images.unsplash.com/photo-1517077304055-6e89abbf09b0?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80');
      } else {
        // Generic dishwasher part
        const genericDishwasherImages = [
          'https://images.unsplash.com/photo-1585659722983-3a675dabf23d?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
          'https://images.pexels.com/photos/5591663/pexels-photo-5591663.jpeg?auto=compress&cs=tinysrgb&w=400'
        ];
        return '/api/proxy-image?url=' + encodeURIComponent(genericDishwasherImages[Math.floor(Math.random() * genericDishwasherImages.length)]);
      }
    }
    
    // Default fallback - general appliance parts
    const fallbackImages = [
      'https://images.unsplash.com/photo-1571175443880-49e1d25b2bc5?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
      'https://images.pexels.com/photos/2062426/pexels-photo-2062426.jpeg?auto=compress&cs=tinysrgb&w=400',
      'https://images.unsplash.com/photo-1585659722983-3a675dabf23d?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80'
    ];
    return '/api/proxy-image?url=' + encodeURIComponent(fallbackImages[Math.floor(Math.random() * fallbackImages.length)]);
  }

  /**
   * Create smart fallback data for unknown parts with appropriate images
   */
  static createFallbackData(partNumber: string): PartData {
    const numericPart = partNumber.replace('PS', '');
    
    // Smart categorization based on common part number patterns
    let category = 'general';
    let estimatedName = 'Appliance Part';
    
    if (['12584610', '11740148', '11754027'].includes(numericPart)) {
      category = 'refrigerator';
      estimatedName = 'Ice Maker Assembly';
    } else if (['11756692', '11753379', '2163382'].includes(numericPart)) {
      category = 'dishwasher';
      estimatedName = 'Drain Pump Assembly';
    } else if (numericPart.includes('73394') || numericPart.includes('46240')) {
      category = 'refrigerator';
      estimatedName = 'Water Filter';
    } else if (numericPart.length >= 7) {
      // Longer part numbers are often assemblies
      estimatedName = 'Assembly Part';
    }
    
    return {
      partNumber,
      name: `${estimatedName} ${partNumber}`,
      price: 'See current pricing',
      description: `${estimatedName} for refrigerator/dishwasher - verify compatibility with your model`,
      imageUrl: '', // Will be populated dynamically by calling service
      buyLink: `https://www.partselect.com/${partNumber}-Appliance-Part.htm?SourceCode=3&SearchTerm=${partNumber}`,
      compatibility: ['Multiple models - verify with your specific model number'],
      installationSteps: ['Check installation guide on PartSelect.com for specific steps'],
      installationDifficulty: 'medium',
      installationTime: 'Varies by part and experience',
      toolsRequired: ['Basic tools - specific tools listed on PartSelect.com'],
      category,
      inStock: true
    };
  }

  /**
   * Check if a part is compatible with a given model
   */
  static async isCompatible(partNumber: string, modelNumber: string): Promise<boolean> {
    const part = await this.getPartData(partNumber);
    if (!part) return false;
    
    return part.compatibility.includes(modelNumber);
  }

  /**
   * Get installation instructions for a part
   */
  static async getInstallationInstructions(partNumber: string): Promise<{
    steps: string[];
    difficulty: string;
    time: string;
    tools: string[];
  } | null> {
    const part = await this.getPartData(partNumber);
    if (!part || !part.installationSteps) return null;
    
    return {
      steps: part.installationSteps,
      difficulty: part.installationDifficulty || 'medium',
      time: part.installationTime || 'Varies by experience',
      tools: part.toolsRequired || ['Basic tools required']
    };
  }

  /**
   * Get detailed compatibility information
   */
  static async getCompatibilityInfo(partNumber: string, modelNumber?: string): Promise<{
    isCompatible: boolean;
    compatibleModels: string[];
    message: string;
  }> {
    const part = await this.getPartData(partNumber);
    
    if (!part) {
      return {
        isCompatible: false,
        compatibleModels: [],
        message: `Part ${partNumber} not found in our database.`
      };
    }

    if (modelNumber) {
      const isCompatible = part.compatibility && part.compatibility.includes(modelNumber);
      return {
        isCompatible,
        compatibleModels: part.compatibility || [],
        message: isCompatible 
          ? `Yes, part ${partNumber} is compatible with model ${modelNumber}.`
          : `No, part ${partNumber} is not compatible with model ${modelNumber}. Compatible models: ${part.compatibility ? part.compatibility.join(', ') : 'None listed'}.`
      };
    }

    return {
      isCompatible: true,
      compatibleModels: part.compatibility || [],
      message: `Part ${partNumber} is compatible with models: ${part.compatibility ? part.compatibility.join(', ') : 'None listed'}.`
    };
  }
}