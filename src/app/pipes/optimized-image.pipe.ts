import { Pipe, PipeTransform } from '@angular/core';

const CDN_BASE = 'https://phimimg.com';
const IMAGE_PROXY = 'https://phimapi.com/image.php?url=';

@Pipe({ name: 'optimizedImage', standalone: true })
export class OptimizedImagePipe implements PipeTransform {
  transform(url: string | undefined | null, type: 'thumb' | 'poster' = 'thumb'): string {
    if (!url) {
      return 'assets/placeholder.webp';
    }

    // If it's already a full URL, wrap it with the proxy
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return url;
    }

    // Build the full CDN URL then wrap
    const fullUrl = `${CDN_BASE}/${url}`;
    return fullUrl;
  }
}
