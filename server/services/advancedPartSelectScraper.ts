import puppeteer from 'puppeteer';
import axios from 'axios';
import * as cheerio from 'cheerio';

/**
 * Advanced PartSelect Image Scraper with multiple anti-bot bypass techniques
 * Uses browser automation, session management, and intelligent retry logic
 */
export class AdvancedPartSelectScraper {

  /**
   * Main scraping function with fallback strategies
   */
  static async getPartImage(partNumber: string, partName: string): Promise<string | null> {
    console.log(`🚀 Advanced scraping for ${partNumber} (${partName})`);
    
    // Strategy 1: Browser automation with Puppeteer
    const puppeteerImage = await this.scrapWithPuppeteer(partNumber);
    if (puppeteerImage) {
      console.log(`✅ Puppeteer found image: ${puppeteerImage}`);
      return puppeteerImage;
    }

    // Strategy 2: Session-based axios with rotating headers
    const sessionImage = await this.scrapeWithSession(partNumber);
    if (sessionImage) {
      console.log(`✅ Session scraping found image: ${sessionImage}`);
      return sessionImage;
    }

    // Strategy 3: Direct image URL patterns (fastest)
    const directImage = await this.tryDirectImagePatterns(partNumber);
    if (directImage) {
      console.log(`✅ Direct pattern found image: ${directImage}`);
      return directImage;
    }

    console.log(`❌ All scraping strategies failed for ${partNumber}`);
    return null;
  }

  /**
   * Strategy 1: Puppeteer browser automation to handle JavaScript and anti-bot measures
   */
  private static async scrapWithPuppeteer(partNumber: string): Promise<string | null> {
    let browser;
    try {
      console.log(`🤖 Launching browser for ${partNumber}`);
      
      browser = await puppeteer.launch({
        headless: true,
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-accelerated-2d-canvas',
          '--disable-gpu',
          '--window-size=1920x1080'
        ]
      });

      const page = await browser.newPage();
      
      // Set realistic browser environment
      await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
      await page.setViewport({ width: 1920, height: 1080 });
      
      // Set extra headers
      await page.setExtraHTTPHeaders({
        'Accept-Language': 'en-US,en;q=0.9',
        'Accept-Encoding': 'gzip, deflate, br',
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache'
      });

      // Try multiple PartSelect URL patterns
      const urls = [
        `https://www.partselect.com/PS/${partNumber}.htm`,
        `https://www.partselect.com/search?searchterm=${partNumber}`,
        `https://www.partselect.com/PS/${partNumber}/`,
        `https://www.partselect.com/Models/${partNumber}/`
      ];

      for (const url of urls) {
        try {
          console.log(`🔍 Puppeteer navigating to: ${url}`);
          
          await page.goto(url, { 
            waitUntil: 'networkidle2', 
            timeout: 30000 
          });

          // Wait for images to load
          await page.waitForTimeout(3000);

          // Extract product images using multiple selectors
          const imageUrl = await page.evaluate((pn) => {
            const selectors = [
              // High priority selectors for product pages
              '.product-main-image img',
              '.main-product-image img',
              '.product-image img',
              '.part-image img',
              '.product-photo img',
              
              // Part number specific
              `img[alt*="${pn}"]`,
              `img[src*="${pn}"]`,
              `img[data-src*="${pn}"]`,
              
              // Search result selectors
              '.search-result-item img',
              '.product-item img',
              '.part-listing img',
              
              // Generic product selectors
              'img[src*="partselect"]',
              'img[src*="product"]',
              'img[src*="parts"]',
              '.product img',
              '.part img'
            ];

            for (const selector of selectors) {
              const imgs = document.querySelectorAll(selector) as NodeListOf<HTMLImageElement>;
              
              for (const img of imgs) {
                let src = img.src || img.getAttribute('data-src') || img.getAttribute('data-lazy-src');
                
                if (src && src.includes('partselect') && !src.includes('logo') && !src.includes('banner')) {
                  // Prefer higher resolution images
                  if (src.includes('_lg.') || src.includes('_large.') || src.includes('400') || src.includes('500')) {
                    return src;
                  }
                  // Store as fallback
                  if (!(window as any).fallbackImg) {
                    (window as any).fallbackImg = src;
                  }
                }
              }
            }
            
            return (window as any).fallbackImg || null;
          }, partNumber);

          if (imageUrl && this.isValidProductImage(imageUrl)) {
            return imageUrl;
          }

        } catch (pageError) {
          console.log(`⚠️ Puppeteer page error for ${url}:`, pageError instanceof Error ? pageError.message : String(pageError));
          continue;
        }
      }

      return null;

    } catch (error) {
      console.log(`❌ Puppeteer error:`, error instanceof Error ? error.message : String(error));
      return null;
    } finally {
      if (browser) {
        await browser.close();
      }
    }
  }

  /**
   * Strategy 2: Advanced session-based scraping with header rotation
   */
  private static async scrapeWithSession(partNumber: string): Promise<string | null> {
    try {
      // Create session with cookies
      const session = axios.create({
        timeout: 25000,
        maxRedirects: 10
      });

      // Realistic headers rotation
      const headerSets = [
        {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.9',
          'Accept-Encoding': 'gzip, deflate, br',
          'DNT': '1',
          'Connection': 'keep-alive',
          'Upgrade-Insecure-Requests': '1'
        },
        {
          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.5',
          'Accept-Encoding': 'gzip, deflate',
          'Connection': 'keep-alive',
          'Sec-Fetch-Dest': 'document',
          'Sec-Fetch-Mode': 'navigate'
        }
      ];

      const urls = [
        `https://www.partselect.com/PS/${partNumber}.htm`,
        `https://www.partselect.com/search?searchterm=${partNumber}&modelfilter=true`,
        `https://www.partselect.com/PS/${partNumber}/`
      ];

      for (let i = 0; i < urls.length; i++) {
        const url = urls[i];
        const headers = headerSets[i % headerSets.length];

        try {
          console.log(`🔄 Session scraping: ${url}`);
          
          const response = await session.get(url, { headers });
          
          if (response.status === 200) {
            const $ = cheerio.load(response.data);
            
            // Enhanced image extraction
            const imageSelectors = [
              '.product-main-image img',
              '.main-product-image img', 
              '.product-image img',
              '.part-image img',
              `img[alt*="${partNumber}"]`,
              `img[src*="${partNumber}"]`,
              'img[src*="partselect"][src*="product"]',
              '.search-result-item img',
              '.product-item img'
            ];

            for (const selector of imageSelectors) {
              const $imgs = $(selector);
              
              for (let j = 0; j < $imgs.length; j++) {
                const $img = $imgs.eq(j);
                let src = $img.attr('src') || $img.attr('data-src') || $img.attr('data-lazy-src');
                
                if (src) {
                  // Convert relative URLs
                  if (src.startsWith('//')) {
                    src = 'https:' + src;
                  } else if (src.startsWith('/')) {
                    src = 'https://www.partselect.com' + src;
                  }
                  
                  if (this.isValidProductImage(src)) {
                    return src;
                  }
                }
              }
            }
          }

          // Rate limiting
          await new Promise(resolve => setTimeout(resolve, 1500));

        } catch (urlError) {
          console.log(`⚠️ Session error for ${url}:`, urlError instanceof Error ? urlError.message : String(urlError));
          continue;
        }
      }

      return null;

    } catch (error) {
      console.log(`❌ Session scraping error:`, error instanceof Error ? error.message : String(error));
      return null;
    }
  }

  /**
   * Strategy 3: Try direct PartSelect image URL patterns
   */
  private static async tryDirectImagePatterns(partNumber: string): Promise<string | null> {
    console.log(`🎯 Trying direct image patterns for ${partNumber}`);
    
    // Common PartSelect image URL patterns
    const patterns = [
      `https://www.partselect.com/productimages/${partNumber}_large.jpg`,
      `https://www.partselect.com/productimages/${partNumber}_lg.jpg`,
      `https://www.partselect.com/productimages/${partNumber}.jpg`,
      `https://images.partselect.com/products/${partNumber}_400.jpg`,
      `https://images.partselect.com/products/${partNumber}_500.jpg`,
      `https://cdn.partselect.com/images/${partNumber}_large.jpg`,
      `https://www.partselect.com/images/products/${partNumber}.jpg`
    ];

    for (const imageUrl of patterns) {
      try {
        const response = await axios.head(imageUrl, { timeout: 10000 });
        
        if (response.status === 200 && response.headers['content-type']?.startsWith('image/')) {
          console.log(`✅ Direct pattern success: ${imageUrl}`);
          return imageUrl;
        }
      } catch (error) {
        // Continue to next pattern
        continue;
      }
    }

    return null;
  }

  /**
   * Validate if URL points to a valid product image
   */
  private static isValidProductImage(url: string): boolean {
    if (!url || typeof url !== 'string') return false;
    
    // Must be from PartSelect domain
    if (!url.includes('partselect')) return false;
    
    // Must be an image file
    const imageExtensions = ['.jpg', '.jpeg', '.png', '.webp', '.gif'];
    const hasImageExtension = imageExtensions.some(ext => url.toLowerCase().includes(ext));
    if (!hasImageExtension) return false;
    
    // Exclude common non-product images
    const excludePatterns = [
      'logo', 'banner', 'header', 'footer', 'nav', 'menu',
      'icon', 'sprite', 'button', 'background', 'bg',
      'placeholder', 'loading', 'spinner', 'thumb'
    ];
    
    const urlLower = url.toLowerCase();
    if (excludePatterns.some(pattern => urlLower.includes(pattern))) {
      return false;
    }
    
    // Prefer larger images (better quality)
    const qualityIndicators = ['large', 'lg', '_400', '_500', '_600', 'high', 'hd'];
    const hasQualityIndicator = qualityIndicators.some(indicator => urlLower.includes(indicator));
    
    return true;
  }
}