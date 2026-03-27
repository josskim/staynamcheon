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
    crop
  } = options;

  // Cloudinary URL format: res.cloudinary.com/cloud_name/image/upload/v12345678/folder/image.jpg
  // Transformation goes after /upload/
  // Use a simple split on "/upload/" which works for both images and videos
  const parts = url.split("/upload/");
  if (parts.length !== 2) return url;

  // baseUrl might be .../image or .../video or .../raw
  const baseUrl = parts[0];
  const remainingPath = parts[1];

  return applyTransform(baseUrl, "/upload/", remainingPath, options);
}

/**
 * Helper to apply transformations while stripping existing ones.
 */
function applyTransform(
  baseUrl: string, 
  uploadSegment: string, 
  remainingPath: string, 
  options: any
) {
  const { width, height, quality, format, crop } = options;
  const transformations = [];
  
  if (width) transformations.push(`w_${width}`);
  if (height) transformations.push(`h_${height}`);
  if (crop && (width || height)) {
    transformations.push(`c_${crop}`);
    if (crop === "fill") transformations.push("g_auto");
  } else if (!crop && (width || height)) {
    transformations.push("c_scale");
  }

  if (quality) transformations.push(`q_${quality}`);
  if (format) transformations.push(`f_${format}`);

  const transformationStr = transformations.join(",");
  const finalTransform = transformationStr ? `${transformationStr}/` : "";

  // Strip existing transformations if present
  const pathParts = remainingPath.split("/");
  const firstSegment = pathParts[0];

  // Cloudinary transformation segments usually contain an underscore (e.g., w_200) 
  // but are not versions (v123456)
  if (firstSegment.includes("_") && !/^v\d+$/.test(firstSegment)) {
    pathParts.shift();
  }

  return `${baseUrl}${uploadSegment}${finalTransform}${pathParts.join("/")}`;
}

/**
 * Standard thumbnail transformation for gallery grids.
 * Uses smaller width for better performance.
 */
export function getThumbnailUrl(url: string, width: number = 800) {
  return getOptimizeImageUrl(url, {
    width,
    quality: "auto:good",
    format: "auto"
  });
}

/**
 * Hero/full-width image optimization.
 * Larger size but still compressed.
 */
export function getHeroImageUrl(url: string) {
  return getOptimizeImageUrl(url, {
    width: 2400,
    quality: "auto:best",
    format: "auto",
  });
}

/**
 * Cloudinary 비디오 URL을 H.264(vc_h264)로 자동 변환.
 * HEVC(H.265) 등 일부 브라우저에서 재생 불가한 코덱을 범용 H.264로 변환.
 */
export function getH264VideoUrl(url: string) {
  if (!url || !url.includes("cloudinary.com") || !url.includes("/video/upload/")) return url;
  // 이미 vc_ 변환이 있으면 그대로
  if (url.includes("/vc_")) return url;
  const parts = url.split("/upload/");
  if (parts.length !== 2) return url;
  return `${parts[0]}/upload/vc_h264/${parts[1]}`;
}

/**
 * Small thumbnail for navigation strips (96px buttons).
 */
export function getMiniThumbnailUrl(url: string) {
  return getOptimizeImageUrl(url, {
    width: 200,
    quality: "auto:good",
    format: "auto",
    crop: "fill",
  });
}

/**
 * Cloudinary 비디오 URL에서 이미지 썸네일(JPG)을 생성.
 * so_auto를 사용하여 적절한 프레임을 썸네일로 추출.
 */
export function getVideoThumbnailUrl(url: string, width: number = 400) {
  if (!url || !url.includes("cloudinary.com") || !url.includes("/video/upload/")) return url;
  
  // 기본 이미지 추출 변환 추가
  // so_auto: 자동으로 적절한 장면 추출
  // f_jpg: 결과물을 jpg로 변환
  const parts = url.split("/upload/");
  if (parts.length !== 2) return url;
  
  // 확장자 제거 및 .jpg 추가
  const pathWithoutExt = parts[1].replace(/\.[^/.]+$/, "");
  
  return `${parts[0]}/video/upload/c_fill,w_${width},q_auto,so_auto,f_jpg/${pathWithoutExt}.jpg`;
}
