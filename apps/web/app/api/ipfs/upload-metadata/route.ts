export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { uploadMetadataToIPFS } from "@/lib/utils/ipfs";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { metadata } = body;

    if (!metadata || typeof metadata !== "object") {
      return NextResponse.json(
        { ok: false, error: "Missing or invalid metadata object" },
        { status: 400 }
      );
    }

    const result = await uploadMetadataToIPFS(metadata);

    return NextResponse.json({
      ok: true,
      ...result,
    });
  } catch (error: any) {
    console.error("Error uploading metadata to IPFS:", error);
    return NextResponse.json(
      { ok: false, error: error?.message || "Failed to upload metadata to IPFS" },
      { status: 500 }
    );
  }
}
