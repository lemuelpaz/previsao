import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

const DAY_MS = 24 * 60 * 60 * 1000;
const SPARKLINE_POINTS = 20;

export async function GET() {
  const markets = await db.market.findMany({
    where: { status: "open" },
    include: { outcomes: true },
    orderBy: { volume: "desc" },
  });

  // Preço/variação são baseados no outcome "SIM" (o "preço" da ação, na analogia com bolsa)
  const primaryOutcomeIds = markets
    .map(m => m.outcomes.find(o => o.label === "SIM")?.id)
    .filter((id): id is string => !!id);

  const since = new Date(Date.now() - DAY_MS);

  const before24h = await db.priceHistory.findMany({
    where: { outcomeId: { in: primaryOutcomeIds }, createdAt: { lte: since } },
    orderBy: { createdAt: "desc" },
  });
  const baselineMap = new Map<string, number>();
  for (const row of before24h) if (!baselineMap.has(row.outcomeId)) baselineMap.set(row.outcomeId, row.probability);

  const missingIds = primaryOutcomeIds.filter(id => !baselineMap.has(id));
  if (missingIds.length > 0) {
    const earliest = await db.priceHistory.findMany({
      where: { outcomeId: { in: missingIds } },
      orderBy: { createdAt: "asc" },
    });
    for (const row of earliest) if (!baselineMap.has(row.outcomeId)) baselineMap.set(row.outcomeId, row.probability);
  }

  const sparklines = await Promise.all(
    primaryOutcomeIds.map(async id => {
      const points = await db.priceHistory.findMany({
        where: { outcomeId: id },
        orderBy: { createdAt: "desc" },
        take: SPARKLINE_POINTS,
      });
      return [id, points.map(p => p.probability).reverse()] as const;
    })
  );
  const sparklineMap = new Map(sparklines);

  const ticker = markets.map(m => {
    const yes = m.outcomes.find(o => o.label === "SIM");
    const no  = m.outcomes.find(o => o.label === "NÃO");
    const price = yes?.probability ?? 50;
    const baseline = yes ? baselineMap.get(yes.id) ?? price : price;
    return {
      id: m.id, title: m.title, emoji: m.emoji, category: m.category,
      volume: m.volume, endsAt: m.endsAt,
      yesPrice: price, noPrice: no?.probability ?? 100 - price,
      yesOutcomeId: yes?.id ?? null, noOutcomeId: no?.id ?? null,
      change24h: price - baseline,
      sparkline: yes ? sparklineMap.get(yes.id) ?? [] : [],
    };
  });

  return NextResponse.json({ ticker });
}
