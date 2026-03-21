/**
 * Function to generate optimized Cloudinary URLs using dynamic transformations.
 * 
 * @param url Original Cloudinary URL
 * @param options Transformation options
 * @returns Optimized URL string
 */
export function getOptimizeImageUrl(
  url: string, 
  options: { 
    width?: number; 
    height?: number; 
    quality?: number | string; 
    format?: string;
    crop?: string;
  } = {}
) {
  if (!url || !url.includes("cloudinary.com")) return url;

  const { 
    width, 
    height, 
    quality = "auto", 
    format = "auto", 
    crop = "fill" 
  } = options;

  // Cloudinary URL format: res.cloudinary.com/cloud_name/image/upload/v12345678/folder/image.jpg
  // Transformation goes after /upload/
  const parts = url.split("/upload/");
  if (parts.length !== 2) return url;

  const transformations = [];
  if (width) transformations.push(`w_${width}`);
  if (height) transformations.push(`h_${height}`);
  if (crop && (width || height)) transformations.push(`c_${crop}`);
  if (quality) transformations.push(`q_${quality}`);
  if (format) transformations.push(`f_${format}`);
  
  // Add g_auto for better cropping (focus on subject)
  if (crop === "fill") transformations.push("g_auto");

  const transformationStr = transformations.join(",");
  
  return `${parts[0]}/upload/${transformationStr}/${parts[1]}`;
}

/**
 * Standard thumbnail transformation for gallery grids
 */
export function getThumbnailUrl(url: string) {
  return getOptimizeImageUrl(url, { 
    width: 600, 
    quality: "auto", 
    format: "auto" 
  });
}
