import axios from 'axios';
import { Response } from 'express';

export class ImageProxyService {
  private readonly timeout = 3000; // Faster timeout for quicker failures
  private readonly cache = new Map<string, { data: Buffer; contentType: string; timestamp: number }>();
  private readonly CACHE_DURATION = 1000 * 60 * 60; // 1 hour cache

  async proxyImage(url: string, res: Response): Promise<void> {
    try {
      // Check cache first for instant response
      const cached = this.cache.get(url);
      if (cached && Date.now() - cached.timestamp < this.CACHE_DURATION) {
        res.set({
          'Content-Type': cached.contentType,
          'Cache-Control': 'public, max-age=86400',
          'Access-Control-Allow-Origin': '*',
          'X-Cache': 'HIT'
        });
        res.send(cached.data);
        return;
      }

      console.log(`🖼️ Fetching image: ${url}`);
      
      const response = await axios.get(url, {
        timeout: this.timeout,
        responseType: 'arraybuffer', // Faster than stream for caching
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          'Accept': 'image/*',
          'Accept-Encoding': 'gzip, deflate'
        }
      });

      const buffer = Buffer.from(response.data);
      const contentType = response.headers['content-type'] || 'image/jpeg';

      // Cache successful responses
      this.cache.set(url, {
        data: buffer,
        contentType,
        timestamp: Date.now()
      });

      // Clean old cache entries periodically
      if (this.cache.size > 50) {
        const cutoff = Date.now() - this.CACHE_DURATION;
        const entries = Array.from(this.cache.entries());
        for (const [cachedUrl, entry] of entries) {
          if (entry.timestamp < cutoff) {
            this.cache.delete(cachedUrl);
          }
        }
      }

      // Set headers and send response
      res.set({
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=86400',
        'Access-Control-Allow-Origin': '*',
        'X-Cache': 'MISS'
      });

      res.send(buffer);
      
    } catch (error) {
      console.error(`❌ Failed to proxy image ${url}:`, error instanceof Error ? error.message : 'Unknown error');
      
      // Return a proper 404 for failed images so frontend can try alternatives
      res.status(404).json({ error: 'Image not found' });
    }
  }
}

export const imageProxyService = new ImageProxyService();