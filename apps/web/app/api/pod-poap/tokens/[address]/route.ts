export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { createPodPoapClient } from "@/lib/contracts/podPoap";

type RouteParams = { address: string };

export async function GET(_req: NextRequest, context: { params: Promise<RouteParams> }) {
  try {
    const { address } = await context.params;
    if (!address) {
      return NextResponse.json(
        { ok: false, error: "Address parameter is required." },
        { status: 400 }
      );
    }

    const client = await createPodPoapClient();
    const balanceTx = await client.balance({ account: address });
    const balance = Number(balanceTx.result ?? 0);

    const tokens = [];
    for (let index = 0; index < balance; index += 1) {
      const tokenTx = await client.get_owner_token_id({ owner: address, index });
      const tokenId = Number(tokenTx.result ?? 0);

      let tokenUri: string | null = null;
      try {
        const uriTx = await client.token_uri({ token_id: tokenId });
        tokenUri = (uriTx.result as string) ?? null;
      } catch {
        tokenUri = null;
      }

      tokens.push({ tokenId, tokenUri });
    }

    return NextResponse.json({
      ok: true,
      address,
      balance,
      tokens,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
