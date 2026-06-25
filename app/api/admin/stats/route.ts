import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Não autorizado" }, { status: 403 });
  const user = await db.user.findUnique({ where: { id: session.userId } });
  if (user?.role !== "admin") return NextResponse.json({ error: "Não autorizado" }, { status: 403 });

  const [totalUsers, totalMarkets, openMarkets, resolvedMarkets, totalPositions, volumeAgg] = await Promise.all([
    db.user.count(),
    db.market.count(),
    db.market.count({ where: { status: "open" } }),
    db.market.count({ where: { status: "resolved" } }),
    db.position.count(),
    db.market.aggregate({ _sum: { volume: true } }),
  ]);

  return NextResponse.json({
    totalUsers, totalMarkets, openMarkets, resolvedMarkets, totalPositions,
    totalVolume: volumeAgg._sum.volume ?? 0,
  });
}
