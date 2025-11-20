/**
 * Utility to get IPFS URLs for POD images
 * Uses pre-uploaded IPFS mappings to avoid re-uploading images
 */

import fs from "fs";
import path from "path";
import { uploadImageToIPFS } from "./ipfs";

interface IPFSMapping {
  [imageName: string]: {
    ipfsHash: string;
    ipfsUrl: string;
    gatewayUrl: string;
    label: string;
  };
}

let cachedMapping: IPFSMapping | null = null;

/**
 * Load IPFS mapping from file
 */
function loadIPFSMapping(): IPFSMapping {
  if (cachedMapping) {
    return cachedMapping;
  }

  const mappingPath = path.join(process.cwd(), "lib", "utils", "pod-ipfs-mapping.json");

  try {
    if (fs.existsSync(mappingPath)) {
      const content = fs.readFileSync(mappingPath, "utf-8");
      const mapping = JSON.parse(content) as IPFSMapping;
      cachedMapping = mapping;
      return mapping;
    }
  } catch (error) {
    console.warn("Failed to load IPFS mapping:", error);
  }

  return {};
}

/**
 * Get IPFS URL for a POD image
 * @param imageName - Name of the image file
 * @returns IPFS URL if available, null otherwise
 */
export function getPODImageIPFS(imageName: string): {
  ipfsUrl: string;
  gatewayUrl: string;
  label: string;
} | null {
  const mapping = loadIPFSMapping();
  const entry = mapping[imageName];

  if (entry) {
    return {
      ipfsUrl: entry.ipfsUrl,
      gatewayUrl: entry.gatewayUrl,
      label: entry.label,
    };
  }

  return null;
}

/**
 * Get IPFS URL for a POD image, uploading if not already uploaded
 * @param imagePath - Path to the image file
 * @param imageName - Name of the image file
 * @returns IPFS URL
 */
export async function getOrUploadPODImageIPFS(
  imagePath: string,
  imageName: string
): Promise<{ ipfsUrl: string; gatewayUrl: string }> {
  // Check if already uploaded
  const existing = getPODImageIPFS(imageName);
  if (existing) {
    return {
      ipfsUrl: existing.ipfsUrl,
      gatewayUrl: existing.gatewayUrl,
    };
  }

  // Upload if not found
  console.log(`Uploading ${imageName} to IPFS...`);
  const result = await uploadImageToIPFS(imagePath, imageName);

  // Update mapping (optional - could save back to file)
  const mapping = loadIPFSMapping();
  mapping[imageName] = {
    ipfsHash: result.ipfsHash,
    ipfsUrl: result.ipfsUrl,
    gatewayUrl: result.gatewayUrl,
    label: "", // Label would need to be passed in
  };
  cachedMapping = mapping;

  return {
    ipfsUrl: result.ipfsUrl,
    gatewayUrl: result.gatewayUrl,
  };
}
