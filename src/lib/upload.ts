/**
 * Utility to upload a file directly to Cloudinary using a signed request.
 * This bypasses Vercel's 4.5MB request body limit and streaming issues.
 */
export async function uploadToCloudinary(file: File, folder: string = "staynamcheon") {
  const timestamp = Math.round(new Date().getTime() / 1000);
  
  // 1. Get Signature from our API
  const sigRes = await fetch("/api/admin/upload/signature", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ 
      paramsToSign: { timestamp, folder } 
    }),
  });
  
  if (!sigRes.ok) throw new Error("Failed to get upload signature");
  
  const { signature, apiKey, cloudName } = await sigRes.json();
  
  // 2. Upload to Cloudinary direct
  const formData = new FormData();
  formData.append("file", file);
  formData.append("api_key", apiKey);
  formData.append("timestamp", timestamp.toString());
  formData.append("signature", signature);
  formData.append("folder", folder);

  const resourceType = file.type.startsWith("video/") ? "video" : "image";
  const cloudinaryRes = await fetch(
    `https://api.cloudinary.com/v1_1/${cloudName}/${resourceType}/upload`,
    {
      method: "POST",
      body: formData,
    }
  );

  if (!cloudinaryRes.ok) {
    const errorData = await cloudinaryRes.json();
    console.error("Cloudinary error:", errorData);
    throw new Error(errorData.error?.message || "Upload failed");
  }
  
  return await cloudinaryRes.json();
}
