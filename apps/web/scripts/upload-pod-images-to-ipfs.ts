/**
 * Script to pre-upload all POD images to IPFS
 * Run with: npx tsx scripts/upload-pod-images-to-ipfs.ts
 */

import { uploadImageToIPFS } from "../lib/utils/ipfs";
import fs from "fs";
import path from "path";

// Load environment variables from .env.local or .env
function loadEnvFile(filename: string) {
  const envPath = path.join(process.cwd(), filename);
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, "utf-8");
    envContent.split("\n").forEach((line) => {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith("#")) {
        const [key, ...valueParts] = trimmed.split("=");
        if (key && valueParts.length > 0) {
          const value = valueParts.join("=").replace(/^["']|["']$/g, "");
          process.env[key.trim()] = value.trim();
        }
      }
    });
    return true;
  }
  return false;
}

// Try .env.local first, then .env
loadEnvFile(".env.local") || loadEnvFile(".env");

const TOKEN_DEFINITIONS = [
  { image: "Gemini_Generated_Image_10xvng10xvng10xv.png", label: "Aurora" },
  { image: "Gemini_Generated_Image_nkcuupnkcuupnkcu.png", label: "Harbor" },
  { image: "Gemini_Generated_Image_g0gwjeg0gwjeg0gw.png", label: "Summit" },
  { image: "Gemini_Generated_Image_y32s4ty32s4ty32s.png", label: "Bloom" },
  { image: "Gemini_Generated_Image_6xd9r26xd9r26xd9.png", label: "Solaris" },
  { image: "Gemini_Generated_Image_d7uouzd7uouzd7uo.png", label: "Nebula" },
  { image: "Gemini_Generated_Image_lcjl9mlcjl9mlcjl.png", label: "Horizon" },
  { image: "Gemini_Generated_Image_5aqvll5aqvll5aqv.png", label: "Mirage" },
  { image: "Gemini_Generated_Image_59h21f59h21f59h2.png", label: "Cascade" },
  { image: "Gemini_Generated_Image_d9axvtd9axvtd9ax.png", label: "Pulse" },
  { image: "Gemini_Generated_Image_5tgc995tgc995tgc.png", label: "Echo" },
  { image: "Gemini_Generated_Image_63cf1y63cf1y63cf.png", label: "Nova" },
  { image: "Gemini_Generated_Image_b5dmcb5dmcb5dmcb.png", label: "Vortex" },
  { image: "Gemini_Generated_Image_ki9m2iki9m2iki9m.png", label: "Prism" },
  { image: "Gemini_Generated_Image_kx2xczkx2xczkx2x.png", label: "Zenith" },
  { image: "Gemini_Generated_Image_pz0obspz0obspz0o.png", label: "Apex" },
  { image: "Gemini_Generated_Image_sl6rrmsl6rrmsl6r.png", label: "Crest" },
] as const;

interface IPFSMapping {
  [imageName: string]: {
    ipfsHash: string;
    ipfsUrl: string;
    gatewayUrl: string;
    label: string;
  };
}

async function uploadAllPODImages() {
  console.log("🚀 Starting POD images upload to IPFS...\n");

  // Check if API keys are set
  if (!process.env.PINATA_API_KEY || !process.env.PINATA_SECRET_API_KEY) {
    console.error("❌ Error: PINATA_API_KEY and PINATA_SECRET_API_KEY must be set in environment");
    process.exit(1);
  }

  const imagesDir = path.join(process.cwd(), "public", "images", "POD");

  if (!fs.existsSync(imagesDir)) {
    console.error(`❌ Error: Images directory not found: ${imagesDir}`);
    process.exit(1);
  }

  const ipfsMapping: IPFSMapping = {};
  const errors: Array<{ image: string; error: string }> = [];

  // Upload each image
  for (let i = 0; i < TOKEN_DEFINITIONS.length; i++) {
    const definition = TOKEN_DEFINITIONS[i];
    const imagePath = path.join(imagesDir, definition.image);

    if (!fs.existsSync(imagePath)) {
      console.warn(`⚠️  Skipping ${definition.image} - file not found`);
      continue;
    }

    try {
      console.log(
        `📤 Uploading ${i + 1}/${TOKEN_DEFINITIONS.length}: ${definition.label} (${definition.image})...`
      );

      const result = await uploadImageToIPFS(
        path.join("images", "POD", definition.image),
        definition.image
      );

      ipfsMapping[definition.image] = {
        ipfsHash: result.ipfsHash,
        ipfsUrl: result.ipfsUrl,
        gatewayUrl: result.gatewayUrl,
        label: definition.label,
      };

      console.log(`✅ Uploaded: ${result.ipfsUrl}`);
      console.log(`   Gateway: ${result.gatewayUrl}\n`);

      // Small delay to avoid rate limiting
      await new Promise((resolve) => setTimeout(resolve, 1000));
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      console.error(`❌ Failed to upload ${definition.image}: ${errorMsg}\n`);
      errors.push({ image: definition.image, error: errorMsg });
    }
  }

  // Save mapping to file
  const mappingPath = path.join(process.cwd(), "lib", "utils", "pod-ipfs-mapping.json");
  const mappingDir = path.dirname(mappingPath);

  if (!fs.existsSync(mappingDir)) {
    fs.mkdirSync(mappingDir, { recursive: true });
  }

  fs.writeFileSync(mappingPath, JSON.stringify(ipfsMapping, null, 2), "utf-8");

  console.log("📝 IPFS mapping saved to:", mappingPath);
  console.log(
    `\n✅ Successfully uploaded ${Object.keys(ipfsMapping).length}/${TOKEN_DEFINITIONS.length} images`
  );

  if (errors.length > 0) {
    console.log(`\n⚠️  ${errors.length} errors occurred:`);
    errors.forEach(({ image, error }) => {
      console.log(`   - ${image}: ${error}`);
    });
  }

  console.log("\n🎉 Done! You can now use these IPFS URLs in your NFT metadata.");
}

uploadAllPODImages().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
