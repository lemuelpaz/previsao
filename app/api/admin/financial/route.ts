import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";

export const dynamic = "force-dynamic";

async function requireAdmin() {
  const session = await getSession();
  if (!session) return null;
  const user = await db.user.findUnique({ where: { id: session.userId } });
  return user?.role === "admin" ? user : null;
}

export async function GET(req: Request) {
  if (!(await requireAdmin())) return NextResponse.json({ error: "Não autorizado" }, { status: 403 });

  const { searchParams } = new URL(req.url);
  const type   = searchParams.get("type") ?? "all";
  const limit  = Number(searchParams.get("limit") ?? 50);

  const transactions = await db.transaction.findMany({
    where: type !== "all" ? { type } : {},
    orderBy: { createdAt: "desc" },
    take: limit,
    include: { user: { select: { id: true, phone: true, name: true } } },
  });

  // Aggregates
  const [depositAgg, withdrawAgg, winAgg, buyAgg, totalUsers, totalMarkets] = await Promise.all([
    db.transaction.aggregate({ where: { type: "deposit" }, _sum: { amount: true }, _count: true }),
    db.transaction.aggregate({ where: { type: "withdraw" }, _sum: { amount: true }, _count: true }),
    db.transaction.aggregate({ where: { type: "win" }, _sum: { amount: true }, _count: true }),
    db.transaction.aggregate({ where: { type: "buy" }, _sum: { amount: true }, _count: true }),
    db.user.count(),
    db.market.count(),
  ]);

  const volumeAgg = await db.market.aggregate({ _sum: { volume: true } });
  const balanceAgg = await db.user.aggregate({ _sum: { balance: true } });

  return NextResponse.json({
    transactions,
    summary: {
      totalDeposits:   depositAgg._sum.amount  ?? 0,
      totalWithdraws:  withdrawAgg._sum.amount ?? 0,
      totalWins:       winAgg._sum.amount      ?? 0,
      totalBuyVolume:  Math.abs(buyAgg._sum.amount ?? 0),
      countDeposits:   depositAgg._count,
      countWithdraws:  withdrawAgg._count,
      totalUsers,
      totalMarkets,
      totalVolume:     volumeAgg._sum.volume   ?? 0,
      totalBalances:   balanceAgg._sum.balance ?? 0,
    },
  });
}
