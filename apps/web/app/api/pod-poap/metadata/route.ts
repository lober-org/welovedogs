export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { createPodPoapClient } from "@/lib/contracts/podPoap";

export async function GET() {
  try {
    const client = await createPodPoapClient();

    const [nameTx, symbolTx, totalSupplyTx] = await Promise.all([
      client.name(),
      client.symbol(),
      client.total_supply(),
    ]);

    const name = nameTx.result as string;
    const symbol = symbolTx.result as string;
    const totalSupply = Number(totalSupplyTx.result ?? 0);

    return NextResponse.json({
      ok: true,
      name,
      symbol,
      totalSupply,
    });
  } catch (error) {
    console.error(
      "[pod-poap][metadata] error:",
      error instanceof Error ? (error.stack ?? error.message) : error
    );
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
