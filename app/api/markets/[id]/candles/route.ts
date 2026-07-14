import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import type { Candle } from "@/lib/candle";

export const dynamic = "force-dynamic";

const NUM_CANDLES = 30;

export async function GET(req: Request, { params }: { params: { id: string } }) {
  const { searchParams } = new URL(req.url);
  const outcomeId = searchParams.get("outcomeId");
  if (!outcomeId) return NextResponse.json({ error: "outcomeId obrigatório" }, { status: 400 });

  const outcome = await db.outcome.findUnique({ where: { id: outcomeId } });
  if (!outcome || outcome.marketId !== params.id)
    return NextResponse.json({ error: "Outcome inválido" }, { status: 400 });

  const points = await db.priceHistory.findMany({
    where: { outcomeId },
    orderBy: { createdAt: "asc" },
  });

  if (points.length === 0) return NextResponse.json({ candles: [] });

  const startTime = points[0].createdAt.getTime();
  const endTime   = Date.now();
  const span      = Math.max(endTime - startTime, 1);
  const bucketMs  = span / NUM_CANDLES;

  const buckets: { o: number; h: number; l: number; c: number }[] = [];
  for (const p of points) {
    const idx = Math.min(NUM_CANDLES - 1, Math.floor((p.createdAt.getTime() - startTime) / bucketMs));
    const v = p.probability;
    if (!buckets[idx]) buckets[idx] = { o: v, h: v, l: v, c: v };
    else {
      buckets[idx].h = Math.max(buckets[idx].h, v);
      buckets[idx].l = Math.min(buckets[idx].l, v);
      buckets[idx].c = v;
    }
  }

  let lastClose = outcome.probability;
  const candles: Candle[] = [];
  for (let i = 0; i < NUM_CANDLES; i++) {
    const t = startTime + bucketMs * (i + 0.5);
    if (buckets[i]) {
      candles.push({ t, ...buckets[i] });
      lastClose = buckets[i].c;
    } else {
      candles.push({ t, o: lastClose, h: lastClose, l: lastClose, c: lastClose });
    }
  }

  return NextResponse.json({ candles });
}
