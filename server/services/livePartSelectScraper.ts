import axios from 'axios';
import * as cheerio from 'cheerio';
import puppeteer from 'puppeteer';

/**
 * Live PartSelect Data Scraper
 * Scrapes real part information, prices, and images from PartSelect website
 */
export interface ScrapedPartData {
  partNumber: string;
  name: string;
  price: string;
  imageUrl: string | null;
  description: string;
  inStock: boolean;
  modelCompatibility: string[];
  category: string;
}

export class LivePartSelectScraper {
  
  /**
   * Main function to scrape comprehensive part data from PartSelect
   */
  static async scrapePartData(partNumber: string): Promise<ScrapedPartData | null> {
    console.log(`🔍 Live scraping PartSelect data for ${partNumber}`);
    
    try {
      // Try multiple strategies to get data
      let data = await this.scrapePuppeteer(partNumber);
      if (!data) {
        data = await this.scrapeWithAxios(partNumber);
      }
      
      if (data) {
        console.log(`✅ Successfully scraped data for ${partNumber}:`, data);
        return data;
      }
      
      console.log(`❌ Failed to scrape data for ${partNumber}`);
      return null;
      
    } catch (error) {
      console.log(`❌ Error scraping ${partNumber}:`, error instanceof Error ? error.message : String(error));
      return null;
    }
  }

  /**
   * Strategy 1: Use Puppeteer for JavaScript-heavy pages
   */
  private static async scrapePuppeteer(partNumber: string): Promise<ScrapedPartData | null> {
    let browser;
    try {
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
      
      // Navigate to PartSelect part page
      const url = `https://www.partselect.com/PS/${partNumber}.htm`;
      console.log(`🤖 Puppeteer navigating to: ${url}`);
      
      await page.goto(url, { 
        waitUntil: 'networkidle2', 
        timeout: 30000 
      });

      // Extract comprehensive part data
      const partData = await page.evaluate((pn) => {
        const data: any = { partNumber: pn };
        
        // Extract part name
        const nameSelectors = [
          '.product-title h1',
          '.product-name h1',
          '.part-title',
          'h1.title',
          '.product-header h1'
        ];
        
        for (const selector of nameSelectors) {
          const nameEl = document.querySelector(selector);
          if (nameEl?.textContent) {
            data.name = nameEl.textContent.trim();
            break;
          }
        }
        
        // Extract price
        const priceSelectors = [
          '.price .current-price',
          '.product-price .price',
          '.price-current',
          '.current-price',
          '.price'
        ];
        
        for (const selector of priceSelectors) {
          const priceEl = document.querySelector(selector);
          if (priceEl?.textContent) {
            data.price = priceEl.textContent.trim();
            break;
          }
        }
        
        // Extract main product image
        const imageSelectors = [
          '.product-main-image img',
          '.main-product-image img',
          '.product-image img',
          '.part-image img',
          '.product-photo img'
        ];
        
        for (const selector of imageSelectors) {
          const imgEl = document.querySelector(selector) as HTMLImageElement;
          if (imgEl?.src && imgEl.src.includes('partselect')) {
            data.imageUrl = imgEl.src;
            break;
          }
        }
        
        // Extract description
        const descSelectors = [
          '.product-description',
          '.part-description',
          '.product-summary',
          '.description'
        ];
        
        for (const selector of descSelectors) {
          const descEl = document.querySelector(selector);
          if (descEl?.textContent) {
            data.description = descEl.textContent.trim();
            break;
          }
        }
        
        // Extract stock status
        const stockSelectors = [
          '.stock-status',
          '.availability',
          '.in-stock'
        ];
        
        data.inStock = true; // Default assumption
        for (const selector of stockSelectors) {
          const stockEl = document.querySelector(selector);
          if (stockEl?.textContent) {
            const stockText = stockEl.textContent.toLowerCase();
            data.inStock = !stockText.includes('out of stock') && !stockText.includes('unavailable');
            break;
          }
        }
        
        // Extract compatible models
        data.modelCompatibility = [];
        const compatElements = document.querySelectorAll('.compatible-models li, .model-list li, .compatibility li');
        compatElements.forEach(el => {
          if (el.textContent) {
            data.modelCompatibility.push(el.textContent.trim());
          }
        });
        
        // Determine category
        data.category = 'appliance';
        const categoryIndicators = document.querySelector('.breadcrumb, .category, .product-category');
        if (categoryIndicators?.textContent) {
          const catText = categoryIndicators.textContent.toLowerCase();
          if (catText.includes('refrigerator') || catText.includes('fridge')) {
            data.category = 'refrigerator';
          } else if (catText.includes('dishwasher')) {
            data.category = 'dishwasher';
          }
        }
        
        return data;
      }, partNumber);

      if (partData.name && partData.price) {
        return {
          partNumber: partData.partNumber,
          name: partData.name || 'Unknown Part',
          price: partData.price || 'See current pricing',
          imageUrl: partData.imageUrl || null,
          description: partData.description || `${partData.name} replacement part`,
          inStock: partData.inStock || true,
          modelCompatibility: partData.modelCompatibility || [],
          category: partData.category || 'appliance'
        };
      }

      return null;

    } catch (error) {
      console.log(`⚠️ Puppeteer error for ${partNumber}:`, error instanceof Error ? error.message : String(error));
      return null;
    } finally {
      if (browser) {
        await browser.close();
      }
    }
  }

  /**
   * Strategy 2: Use Axios with advanced headers
   */
  private static async scrapeWithAxios(partNumber: string): Promise<ScrapedPartData | null> {
    try {
      const session = axios.create({
        timeout: 25000,
        maxRedirects: 10
      });

      const headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
        'Accept-Encoding': 'gzip, deflate, br',
        'DNT': '1',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1'
      };

      const url = `https://www.partselect.com/PS/${partNumber}.htm`;
      console.log(`🔄 Axios scraping: ${url}`);
      
      const response = await session.get(url, { headers });
      
      if (response.status === 200) {
        const $ = cheerio.load(response.data);
        
        // Extract data using cheerio
        const name = $('.product-title h1').text().trim() || 
                    $('.product-name h1').text().trim() || 
                    $('.part-title').text().trim();
        
        const price = $('.price .current-price').text().trim() || 
                     $('.product-price .price').text().trim() || 
                     $('.price-current').text().trim();
        
        const description = $('.product-description').text().trim() || 
                           $('.part-description').text().trim();
        
        // Extract image URL
        let imageUrl: string | null = null;
        const $img = $('.product-main-image img, .main-product-image img, .product-image img').first();
        if ($img.length) {
          let src = $img.attr('src') || $img.attr('data-src');
          if (src) {
            if (src.startsWith('//')) {
              imageUrl = 'https:' + src;
            } else if (src.startsWith('/')) {
              imageUrl = 'https://www.partselect.com' + src;
            } else {
              imageUrl = src;
            }
          }
        }
        
        // Extract compatible models
        const modelCompatibility: string[] = [];
        $('.compatible-models li, .model-list li').each((i, el) => {
          const model = $(el).text().trim();
          if (model) {
            modelCompatibility.push(model);
          }
        });
        
        // Determine category
        let category = 'appliance';
        const breadcrumb = $('.breadcrumb, .category').text().toLowerCase();
        if (breadcrumb.includes('refrigerator') || breadcrumb.includes('fridge')) {
          category = 'refrigerator';
        } else if (breadcrumb.includes('dishwasher')) {
          category = 'dishwasher';
        }
        
        if (name && price) {
          return {
            partNumber,
            name,
            price,
            imageUrl,
            description: description || `${name} replacement part`,
            inStock: true, // Assume in stock if listed
            modelCompatibility,
            category
          };
        }
      }

      return null;

    } catch (error) {
      console.log(`⚠️ Axios error for ${partNumber}:`, error instanceof Error ? error.message : String(error));
      return null;
    }
  }

  /**
   * Batch scrape multiple parts
   */
  static async batchScrapePartData(partNumbers: string[]): Promise<{ [partNumber: string]: ScrapedPartData }> {
    console.log(`🔄 Batch scraping ${partNumbers.length} parts from PartSelect`);
    
    const results: { [partNumber: string]: ScrapedPartData } = {};
    
    // Process in batches to avoid overwhelming the server
    const batchSize = 3;
    for (let i = 0; i < partNumbers.length; i += batchSize) {
      const batch = partNumbers.slice(i, i + batchSize);
      
      const promises = batch.map(async (partNumber) => {
        const data = await this.scrapePartData(partNumber);
        if (data) {
          results[partNumber] = data;
        }
        return data;
      });
      
      await Promise.all(promises);
      
      // Rate limiting between batches
      if (i + batchSize < partNumbers.length) {
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }
    
    console.log(`✅ Successfully scraped ${Object.keys(results).length} out of ${partNumbers.length} parts`);
    return results;
  }
}