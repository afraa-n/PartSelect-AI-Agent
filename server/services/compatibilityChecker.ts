import { Product } from '@shared/schema';
import { mockPartsCatalog, findPartByNumber } from './mockCatalog';

export class CompatibilityCheckerService {
  checkPartCompatibility(partNumber: string, modelNumber: string): {
    isCompatible: boolean;
    part?: Product;
    confidence: 'high' | 'medium' | 'low';
    reason: string;
  } {
    const part = findPartByNumber(partNumber);
    
    if (!part) {
      return {
        isCompatible: false,
        confidence: 'high',
        reason: `Part ${partNumber} not found in our catalog.`
      };
    }

    const isExactMatch = part.compatibility.some(model => 
      model.toLowerCase() === modelNumber.toLowerCase()
    );

    if (isExactMatch) {
      return {
        isCompatible: true,
        part,
        confidence: 'high',
        reason: `Part ${partNumber} is confirmed compatible with model ${modelNumber}.`
      };
    }

    // Check for partial matches (same brand/series)
    const partialMatch = part.compatibility.some(model => {
      const modelPrefix = modelNumber.slice(0, 6).toLowerCase();
      return model.toLowerCase().startsWith(modelPrefix);
    });

    if (partialMatch) {
      return {
        isCompatible: true,
        part,
        confidence: 'medium',
        reason: `Part ${partNumber} appears compatible with model ${modelNumber} based on model series matching.`
      };
    }

    return {
      isCompatible: false,
      part,
      confidence: 'high',
      reason: `Part ${partNumber} is not compatible with model ${modelNumber}. Compatible models include: ${part.compatibility.join(', ')}.`
    };
  }

  findAlternativeParts(modelNumber: string, category: 'refrigerator' | 'dishwasher'): Product[] {
    return mockPartsCatalog.filter(product => 
      product.category === category &&
      product.compatibility.some(model => 
        model.toLowerCase().includes(modelNumber.toLowerCase())
      )
    );
  }

  suggestCompatibleModels(partNumber: string): string[] {
    const part = findPartByNumber(partNumber);
    return part ? part.compatibility : [];
  }
}

export const compatibilityChecker = new CompatibilityCheckerService();
