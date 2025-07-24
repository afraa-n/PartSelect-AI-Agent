/**
 * Product Card Component - Visual product display with image handling
 * Shows product information, handles image loading failures, and provides purchase links
 */
import React, { useState } from "react";
import { ExternalLink, Truck, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface ProductCardProps {
  product: {
    partNumber: string;
    name: string;
    price: string;
    imageUrl: string;
    buyLink?: string;
  };
}

export default function ProductCard({ product }: ProductCardProps) {
  // Pre-generate multiple optimized image sources for instant fallbacks
  const [imageUrls] = useState<string[]>(() => {
    const urls = [product.imageUrl];
    // Add reliable fallback sources using image proxy
    if (product.partNumber) {
      // Fallback images through proxy for CORS handling
      urls.push(`/api/proxy-image?url=${encodeURIComponent('https://images.unsplash.com/photo-1585659722983-3a675dabf23d?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80')}`);
      urls.push(`/api/proxy-image?url=${encodeURIComponent('https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80')}`);
    }
    return urls;
  });
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [imageError, setImageError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Handle purchase link navigation with fallback for blocked links
  const handleBuyClick = () => {
    if (product.buyLink) {
      // Generate a search-based fallback if direct link fails
      const searchUrl = `https://www.partselect.com/search?searchterm=${product.partNumber}`;
      
      // Try to open the direct link, with search as fallback
      const linkToOpen = product.buyLink.includes('partselect.com') ? product.buyLink : searchUrl;
      window.open(linkToOpen, '_blank', 'noopener,noreferrer');
    }
  };

  // Instant fallback to next image source
  const tryNextImage = () => {
    if (currentImageIndex < imageUrls.length - 1) {
      setCurrentImageIndex(currentImageIndex + 1);
      setImageError(false);
      setIsLoading(true);
    } else {
      setImageError(true);
      setIsLoading(false);
    }
  };

  return (
    <Card className="max-w-md bg-card border-border">
      <CardContent className="p-4">
        <div className="flex space-x-4">
          <div className="w-16 h-16 rounded-lg bg-muted flex-shrink-0 flex items-center justify-center overflow-hidden">
            {isLoading && (
              <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            )}
            {!imageError && imageUrls[currentImageIndex] ? (
              <img 
                src={imageUrls[currentImageIndex]} 
                alt={product.name}
                className={`w-full h-full object-cover transition-opacity duration-200 ${isLoading ? 'opacity-0' : 'opacity-100'}`}
                onError={() => {
                  console.error('Failed to load image:', imageUrls[currentImageIndex]);
                  tryNextImage();
                }}
                onLoad={() => {
                  console.log('Successfully loaded image:', imageUrls[currentImageIndex]);
                  setIsLoading(false);
                }}
                loading="eager"
              />
            ) : (
              <span className="text-muted-foreground text-xs">Loading...</span>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="font-medium text-foreground truncate">{product.name}</h4>
            <p className="text-sm text-muted-foreground mt-1">Part #{product.partNumber}</p>
            <div className="flex items-center justify-between mt-3">
              <span className="text-lg font-semibold bg-secondary text-secondary-foreground px-2 py-1 rounded">{product.price}</span>
              {product.buyLink && (
                <Button 
                  onClick={handleBuyClick}
                  size="sm"
                  className="bg-orange-600 hover:bg-orange-700 text-white"
                >
                  Shop PartSelect
                  <ExternalLink className="ml-1 h-3 w-3" />
                </Button>
              )}
            </div>
          </div>
        </div>
        <div className="mt-3 pt-3 border-t border-border">
          <div className="flex items-center space-x-4 text-xs text-muted-foreground">
            <span className="flex items-center space-x-1 bg-primary/10 px-2 py-1 rounded">
              <Truck className="h-3 w-3 text-primary" />
              <span>Free shipping</span>
            </span>
            <span className="flex items-center space-x-1 bg-secondary/20 px-2 py-1 rounded">
              <Clock className="h-3 w-3 text-foreground" />
              <span>Ships in 1-2 days</span>
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
