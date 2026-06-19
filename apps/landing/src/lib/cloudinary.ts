/**
 * Helper to get optimized Cloudinary URLs using the Fetch API.
 * If the image is already a Cloudinary URL, it returns it directly.
 * Otherwise, it wraps it through Cloudinary Fetch.
 */
export function getCloudinaryUrl(url: string): string {
  if (!url) return '';
  if (url.includes('cloudinary.com')) {
    return url;
  }
  
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || 'demo';
  
  // Using Cloudinary Fetch API to optimize format (f_auto) and quality (q_auto)
  return `https://res.cloudinary.com/${cloudName}/image/fetch/f_auto,q_auto/${encodeURIComponent(url)}`;
}
