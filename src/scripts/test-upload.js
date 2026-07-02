const cloudinary = require("cloudinary").v2;
const path = require("path");

function requireEnv(key) {
  const value = process.env[key];
  if (!value) {
    throw new Error(`${key} is required`);
  }
  return value;
}

// Configuration
cloudinary.config({
  cloud_name: requireEnv("CLOUDINARY_CLOUD_NAME"),
  api_key: requireEnv("CLOUDINARY_API_KEY"),
  api_secret: requireEnv("CLOUDINARY_API_SECRET"),
});

async function uploadTest() {
  const imagePath = "C:\\Users\\youby\\.gemini\\antigravity\\brain\\d5be4b28-86e1-4d51-916e-8da7c1786f97\\test_upload_image_1773583036546.png";
  
  console.log("Starting test upload to Cloudinary...");
  console.log("Image Path:", imagePath);
  console.log("Cloud Name:", process.env.CLOUDINARY_CLOUD_NAME);

  try {
    const result = await cloudinary.uploader.upload(imagePath, {
      folder: "staynamcheon",
      public_id: "test_verification_" + Date.now(),
      resource_type: "auto",
    });

    console.log("Upload Success!");
    console.log("URL:", result.secure_url);
    console.log("Public ID:", result.public_id);
    console.log("Folder:", result.folder);
  } catch (error) {
    console.error("Upload Failed!");
    console.error(error);
  }
}

uploadTest();
