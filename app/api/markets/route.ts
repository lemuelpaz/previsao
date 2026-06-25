import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const category = searchParams.get("category");
  const q        = searchParams.get("q") ?? "";
  const status   = searchParams.get("status") ?? "open";

  const markets = await db.market.findMany({
    where: {
      ...(status !== "all" ? { status } : {}),
      ...(category && category !== "Todos" ? { category } : {}),
      ...(q ? { title: { contains: q } } : {}),
    },
    include: { outcomes: true, _count: { select: { positions: true, comments: true } } },
    orderBy: { volume: "desc" },
  });

  return NextResponse.json({ markets });
}
