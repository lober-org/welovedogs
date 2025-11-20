/**
 * IPFS utility functions for uploading NFT metadata and images
 * Uses Pinata IPFS pinning service (or can be configured for other services)
 */

export type IPFSUploadResult = {
  ipfsHash: string;
  ipfsUrl: string;
  gatewayUrl: string;
};

/**
 * Upload JSON metadata to IPFS using Pinata
 * @param metadata - JSON object to upload
 * @returns IPFS hash and URLs
 */
export async function uploadMetadataToIPFS(
  metadata: Record<string, unknown>
): Promise<IPFSUploadResult> {
  const pinataApiKey = process.env.PINATA_API_KEY;
  const pinataSecretApiKey = process.env.PINATA_SECRET_API_KEY;
  const ipfsGateway = process.env.NEXT_PUBLIC_IPFS_GATEWAY || "https://gateway.pinata.cloud/ipfs";

  if (!pinataApiKey || !pinataSecretApiKey) {
    throw new Error(
      "IPFS pinning not configured. Set PINATA_API_KEY and PINATA_SECRET_API_KEY environment variables."
    );
  }

  // Use Pinata's pinJSONToIPFS endpoint for JSON data
  const response = await fetch("https://api.pinata.cloud/pinning/pinJSONToIPFS", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      pinata_api_key: pinataApiKey,
      pinata_secret_api_key: pinataSecretApiKey,
    },
    body: JSON.stringify({
      pinataContent: metadata,
      pinataMetadata: {
        name: "pod-nft-metadata.json",
      },
    }),
  });

  if (!response.ok) {
    const error = await response.text().catch(() => "Unknown error");
    throw new Error(`Failed to upload metadata to IPFS: ${error}`);
  }

  const result = await response.json();
  const ipfsHash = result.IpfsHash;

  if (!ipfsHash) {
    throw new Error("IPFS upload did not return a hash");
  }

  return {
    ipfsHash,
    ipfsUrl: `ipfs://${ipfsHash}`,
    gatewayUrl: `${ipfsGateway}/${ipfsHash}`,
  };
}

/**
 * Upload image file to IPFS using Pinata
 * @param imagePath - Path to image file (relative to public directory or absolute)
 * @param fileName - Name for the file in IPFS
 * @returns IPFS hash and URLs
 */
export async function uploadImageToIPFS(
  imagePath: string,
  fileName?: string
): Promise<IPFSUploadResult> {
  const pinataApiKey = process.env.PINATA_API_KEY;
  const pinataSecretApiKey = process.env.PINATA_SECRET_API_KEY;
  const ipfsGateway = process.env.NEXT_PUBLIC_IPFS_GATEWAY || "https://gateway.pinata.cloud/ipfs";

  if (!pinataApiKey || !pinataSecretApiKey) {
    throw new Error(
      "IPFS pinning not configured. Set PINATA_API_KEY and PINATA_SECRET_API_KEY environment variables."
    );
  }

  // Read file from filesystem (server-side only)
  const fs = await import("fs");
  const path = await import("path");

  const absolutePath = path.isAbsolute(imagePath)
    ? imagePath
    : path.join(process.cwd(), "public", imagePath);

  if (!fs.existsSync(absolutePath)) {
    throw new Error(`Image file not found: ${absolutePath}`);
  }

  const fileBuffer = fs.readFileSync(absolutePath);
  const fileBaseName = fileName || path.basename(imagePath);

  // Use native FormData (Node.js 18+)
  const formData = new FormData();
  const blob = new Blob([fileBuffer], {
    type: `image/${path.extname(fileBaseName).slice(1) || "png"}`,
  });
  formData.append("file", blob, fileBaseName);

  const response = await fetch("https://api.pinata.cloud/pinning/pinFileToIPFS", {
    method: "POST",
    headers: {
      pinata_api_key: pinataApiKey,
      pinata_secret_api_key: pinataSecretApiKey,
    },
    body: formData,
  });

  if (!response.ok) {
    const error = await response.text().catch(() => "Unknown error");
    throw new Error(`Failed to upload image to IPFS: ${error}`);
  }

  const result = await response.json();
  const ipfsHash = result.IpfsHash;

  if (!ipfsHash) {
    throw new Error("IPFS upload did not return a hash");
  }

  return {
    ipfsHash,
    ipfsUrl: `ipfs://${ipfsHash}`,
    gatewayUrl: `${ipfsGateway}/${ipfsHash}`,
  };
}

/**
 * Build IPFS URL from hash
 * @param ipfsHash - IPFS content hash
 * @returns Gateway URL
 */
export function getIPFSUrl(ipfsHash: string): string {
  const ipfsGateway = process.env.NEXT_PUBLIC_IPFS_GATEWAY || "https://gateway.pinata.cloud/ipfs";
  // Remove ipfs:// prefix if present
  const hash = ipfsHash.replace(/^ipfs:\/\//, "");
  return `${ipfsGateway}/${hash}`;
}

/**
 * Convert IPFS URL to gateway URL
 * @param ipfsUrl - IPFS URL (ipfs://hash or gateway URL)
 * @returns Gateway URL
 */
export function ipfsUrlToGateway(ipfsUrl: string): string {
  if (ipfsUrl.startsWith("ipfs://")) {
    return getIPFSUrl(ipfsUrl);
  }
  // Already a gateway URL
  return ipfsUrl;
}
