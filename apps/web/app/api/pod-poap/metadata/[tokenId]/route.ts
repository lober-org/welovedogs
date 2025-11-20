export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";

type RouteParams = { tokenId: string };

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
] as const;

export async function GET(req: NextRequest, context: { params: Promise<RouteParams> }) {
  const { tokenId } = await context.params;
  const parsedId = Number(tokenId);

  if (!Number.isInteger(parsedId) || parsedId < 0) {
    return NextResponse.json({ ok: false, error: "Invalid token id" }, { status: 400 });
  }

  const definition = TOKEN_DEFINITIONS[parsedId];
  if (!definition) {
    return NextResponse.json({ ok: false, error: "Token metadata not found" }, { status: 404 });
  }

  const total = TOKEN_DEFINITIONS.length;
  const baseUrl = req.nextUrl.origin.replace(/\/$/, "");

  const metadata = {
    name: `Proof of Donation #${parsedId}`,
    description:
      "AI-generated commemorative Proof of Donation (PO(D)AP) artwork celebrating supporters of POD campaigns.",
    image: `${baseUrl}/nft-images/${definition.image}`,
    attributes: [
      { trait_type: "Collection", value: "Proof of Donation" },
      { trait_type: "Series", value: definition.label },
      { trait_type: "Edition", value: `${parsedId + 1} of ${total}` },
    ],
    external_url: `${baseUrl}/`,
  };

  return NextResponse.json(metadata, {
    headers: {
      "Cache-Control": "public, s-maxage=300, stale-while-revalidate=3600",
    },
  });
}
