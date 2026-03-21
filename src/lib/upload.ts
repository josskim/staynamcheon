/**
 * Utility to upload a file directly to Cloudinary using a signed request.
 * This bypasses Vercel's 4.5MB request body limit and streaming issues.
 */
export async function uploadToCloudinary(file: File, folder: string = "staynamcheon") {
  const timestamp = Math.round(new Date().getTime() / 1000);
  
  // 1. Get Signature from our API
  let sigRes;
  try {
    sigRes = await fetch("/api/admin/upload/signature", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ 
        paramsToSign: { timestamp, folder } 
      }),
    });
  } catch (err: any) {
    console.error("Network error fetching signature:", err);
    throw new Error("네트워크 오류로 서명을 받아오지 못했습니다.");
  }
  
  if (!sigRes.ok) {
     let errorText = await sigRes.text();
     console.error("Signature API Error:", sigRes.status, errorText);
     try { errorText = JSON.parse(errorText).details || errorText; } catch (e) {}
     throw new Error(`업로드 서명 발급 실패 (${sigRes.status}): ${errorText}`);
  }
  
  const { signature, apiKey, cloudName } = await sigRes.json();
  
  // 2. Upload to Cloudinary direct
  const formData = new FormData();
  formData.append("file", file);
  formData.append("api_key", apiKey);
  formData.append("timestamp", timestamp.toString());
  formData.append("signature", signature);
  formData.append("folder", folder);

  const resourceType = file.type.startsWith("video/") ? "video" : "image";
  let cloudinaryRes;
  try {
    cloudinaryRes = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/${resourceType}/upload`,
      {
        method: "POST",
        body: formData,
      }
    );
  } catch (err: any) {
     console.error("Network error uploading to Cloudinary:", err);
     throw new Error("클라우디너리 접속 오류가 발생했습니다.");
  }

  if (!cloudinaryRes.ok) {
    const errorData = await cloudinaryRes.text();
    console.error("Cloudinary error:", cloudinaryRes.status, errorData);
    let errorMsg = "Upload failed";
    try { errorMsg = JSON.parse(errorData).error?.message || errorData; } catch (e) {}
    throw new Error(`클라우디너리 에러 (${cloudinaryRes.status}): ${errorMsg}`);
  }
  
  return await cloudinaryRes.json();
}
