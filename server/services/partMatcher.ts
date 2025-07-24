import { Product } from '@shared/schema';
import { mockPartsCatalog } from './mockCatalog';

export class PartMatcherService {
  // Map common search terms to specific part categories
  private readonly searchTermMap = {
    // Ice maker related
    'ice maker': ['PS12584610', 'PS733947'],
    'ice maker motor': ['PS733947'],
    'ice maker assembly': ['PS12584610'],
    'ice not working': ['PS12584610', 'PS733947'],
    'whirlpool ice maker': ['PS12584610', 'PS733947'],
    
    // Dishwasher pumps
    'dishwasher pump': ['PS11756692', 'PS260801', 'PS11753379'],
    'circulation pump': ['PS11756692'],
    'drain pump': ['PS11753379'],
    'wash pump': ['PS11756692'],
    'pump motor': ['PS11756692'],
    'wdt780saem1': ['PS11756692', 'PS11746240'],
    
    // Dishwasher seals
    'door seal': ['PS9495545', 'PS356593'],
    'door gasket': ['PS9495545', 'PS356593'],
    'dishwasher leak': ['PS9495545', 'PS356593'],
    
    // Water filters
    'water filter': ['PS2179605'],
    'water taste': ['PS2179605'],
    'filter replacement': ['PS2179605'],
    
    // Motors
    'fan motor': ['PS2355119', 'PS11766737'],
    'condenser fan': ['PS11766737'],
    'evaporator fan': ['PS2355119'],
    
    // Heating elements
    'defrost heater': ['PS2071928'],
    'not cooling': ['PS2071928', 'PS11766737'],
    
    // Drain issues
    'drain hose': ['PS11746240'],
    'dishwasher not draining': ['PS11753379', 'PS11746240']
  };
  
  findBestMatches(query: string, limit: number = 3): Product[] {
    const normalizedQuery = query.toLowerCase();
    const matchingPartNumbers = new Set<string>();
    
    // First, check for exact part number matches
    const partNumberMatch = normalizedQuery.match(/ps\d+/g);
    if (partNumberMatch) {
      partNumberMatch.forEach(partNum => matchingPartNumbers.add(partNum.toUpperCase()));
    }
    
    // Then find matches based on search terms
    for (const [searchTerm, partNumbers] of Object.entries(this.searchTermMap)) {
      if (normalizedQuery.includes(searchTerm)) {
        partNumbers.forEach(partNum => matchingPartNumbers.add(partNum));
      }
    }
    
    // If no specific matches, do general category matching
    if (matchingPartNumbers.size === 0) {
      if (normalizedQuery.includes('dishwasher')) {
        // Return popular dishwasher parts
        ['PS11757388', 'PS9495545', 'PS11748244'].forEach(partNum => matchingPartNumbers.add(partNum));
      } else if (normalizedQuery.includes('refrigerator') || normalizedQuery.includes('fridge')) {
        // Return popular refrigerator parts
        ['PS11752778', 'PS12584610', 'PS733947', 'PS2179605'].forEach(partNum => matchingPartNumbers.add(partNum));
      }
    }
    
    // Convert part numbers to products
    const matchedProducts = Array.from(matchingPartNumbers)
      .map(partNum => mockPartsCatalog.find(product => product.partNumber === partNum))
      .filter((product): product is Product => product !== undefined)
      .slice(0, limit);
    
    return matchedProducts;
  }
  
  findPartByNumber(partNumber: string): Product | undefined {
    const cleanPartNumber = partNumber.startsWith('PS') ? partNumber : `PS${partNumber}`;
    return mockPartsCatalog.find(product => 
      product.partNumber.toLowerCase() === cleanPartNumber.toLowerCase()
    );
  }
  
  checkCompatibility(partNumber: string, modelNumber: string): {
    isCompatible: boolean;
    confidence: 'high' | 'medium' | 'low';
    part?: Product;
  } {
    const part = this.findPartByNumber(partNumber);
    
    if (!part) {
      return { isCompatible: false, confidence: 'high' };
    }
    
    const isDirectMatch = part.compatibility.some(model => 
      model.toLowerCase() === modelNumber.toLowerCase()
    );
    
    if (isDirectMatch) {
      return { isCompatible: true, confidence: 'high', part };
    }
    
    // Check partial model matches (same series)
    const modelPrefix = modelNumber.slice(0, 6).toLowerCase();
    const hasPartialMatch = part.compatibility.some(model =>
      model.toLowerCase().startsWith(modelPrefix)
    );
    
    if (hasPartialMatch) {
      return { isCompatible: true, confidence: 'medium', part };
    }
    
    return { isCompatible: false, confidence: 'high', part };
  }
}

export const partMatcher = new PartMatcherService();