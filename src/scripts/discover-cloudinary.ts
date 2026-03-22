import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

console.log("Cloudinary Config:", {
  cloud_name: cloudinary.config().cloud_name,
  api_key: cloudinary.config().api_key,
  has_secret: !!cloudinary.config().api_secret
});

async function discover() {
  try {
    console.log("Listing folders in Root:");
    const folders: any = await cloudinary.api.sub_folders("");
    console.log(JSON.stringify(folders, null, 2));

    console.log("Listing ALL resources (max 100):");
    const allResources: any = await cloudinary.api.resources({ 
      type: 'upload', 
      max_results: 100,
      direction: 'desc' // Most recent first
    });
    console.log(`Found ${allResources.resources.length} total resources.`);
    allResources.resources.slice(0, 10).forEach((r: any) => {
      console.log(`- ${r.public_id} (${r.resource_type}/${r.type})`);
    });

    console.log("\nUsing Search API to find 'jqtiddwzgebnysqsxqi6':");
    const search: any = await cloudinary.search
      .expression('jqtiddwzgebnysqsxqi6')
      .execute();
    console.log(JSON.stringify(search, null, 2));

    if (search && search.resources && search.resources.length > 0) {
      console.log("✅ SEARCH FOUND IT!");
    } else {
      console.log("❌ SEARCH ALSO FAILED");
    }
  } catch (e) {
    console.error(e);
  }
}

discover();
