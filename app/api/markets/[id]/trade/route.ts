import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });

  const { outcomeId, amount } = await req.json();
  if (!outcomeId || !amount || amount <= 0)
    return NextResponse.json({ error: "Dados inválidos" }, { status: 400 });

  const [market, outcome, user] = await Promise.all([
    db.market.findUnique({ where: { id: params.id } }),
    db.outcome.findUnique({ where: { id: outcomeId } }),
    db.user.findUnique({ where: { id: session.userId } }),
  ]);

  if (!market || market.status !== "open")
    return NextResponse.json({ error: "Mercado não está aberto" }, { status: 400 });
  if (!outcome || outcome.marketId !== params.id)
    return NextResponse.json({ error: "Outcome inválido" }, { status: 400 });
  if (!user || user.balance < amount)
    return NextResponse.json({ error: "Saldo insuficiente" }, { status: 400 });

  // Price per share = probability / 100
  const price  = outcome.probability / 100;
  const shares = amount / price;

  // Probability impact: each R$100 shifts ~1% toward this outcome
  const impact  = amount / 100;
  const allOutcomes = await db.outcome.findMany({ where: { marketId: params.id } });
  const others  = allOutcomes.filter(o => o.id !== outcomeId);
  const totalProb = 100;

  // New probability for bought outcome (capped 1-99)
  const newProb = Math.min(99, Math.max(1, outcome.probability + impact));
  const probDiff = newProb - outcome.probability;

  // Existing position?
  const existing = await db.position.findFirst({
    where: { userId: session.userId, marketId: params.id, outcomeId, status: "open" },
  });

  await db.$transaction(async tx => {
    // Deduct balance
    await tx.user.update({ where: { id: session.userId }, data: { balance: { decrement: amount } } });

    // Update or create position
    if (existing) {
      const totalShares = existing.shares + shares;
      const totalCost   = existing.shares * existing.avgPrice + amount;
      await tx.position.update({
        where: { id: existing.id },
        data: { shares: totalShares, avgPrice: totalCost / totalShares },
      });
    } else {
      await tx.position.create({
        data: { userId: session.userId, marketId: params.id, outcomeId, shares, avgPrice: price },
      });
    }

    // Update outcome probability & shares
    await tx.outcome.update({
      where: { id: outcomeId },
      data: { probability: newProb, shares: { increment: shares } },
    });
    await tx.priceHistory.create({ data: { outcomeId, probability: newProb } });

    // Redistribute probability from other outcomes
    if (others.length > 0 && probDiff > 0) {
      const perOther = probDiff / others.length;
      for (const o of others) {
        const newOtherProb = Math.min(99, Math.max(1, o.probability - perOther));
        await tx.outcome.update({ where: { id: o.id }, data: { probability: newOtherProb } });
        await tx.priceHistory.create({ data: { outcomeId: o.id, probability: newOtherProb } });
      }
    }

    // Market volume
    await tx.market.update({ where: { id: params.id }, data: { volume: { increment: amount } } });

    // Transaction log
    await tx.transaction.create({
      data: {
        userId: session.userId, type: "buy",
        amount: -amount,
        detail: `${outcome.label} — ${market.title.slice(0, 50)} — ${shares.toFixed(2)} cotas`,
      },
    });
  });

  const updated = await db.user.findUnique({ where: { id: session.userId }, select: { balance: true } });
  return NextResponse.json({ ok: true, shares, price, newBalance: updated!.balance });
}
