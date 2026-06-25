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

export async function GET() {
  if (!(await requireAdmin())) return NextResponse.json({ error: "Não autorizado" }, { status: 403 });
  const markets = await db.market.findMany({
    include: { outcomes: true, _count: { select: { positions: true } } },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json({ markets });
}

export async function POST(req: Request) {
  if (!(await requireAdmin())) return NextResponse.json({ error: "Não autorizado" }, { status: 403 });

  const body = await req.json();

  // ── Actions (resolve, close, reopen, delete, edit) ──────────
  if (body.action) {
    const { action, marketId, resolution, title, description, category, emoji, endsAt } = body;
    if (!marketId) return NextResponse.json({ error: "marketId obrigatório" }, { status: 400 });

    if (action === "resolve") {
      const market = await db.market.findUnique({ where: { id: marketId }, include: { outcomes: true } });
      if (!market) return NextResponse.json({ error: "Mercado não encontrado" }, { status: 404 });
      const winOutcome = market.outcomes.find(o => o.label === resolution);
      if (!winOutcome) return NextResponse.json({ error: "Resultado inválido" }, { status: 400 });

      await db.market.update({
        where: { id: marketId },
        data: { status: "resolved", resolution, resolvedAt: new Date() },
      });

      const positions = await db.position.findMany({ where: { marketId, status: "open" } });
      for (const pos of positions) {
        const won = pos.outcomeId === winOutcome.id;
        const pnl = won ? pos.shares - pos.shares * pos.avgPrice : -(pos.shares * pos.avgPrice);
        await db.position.update({ where: { id: pos.id }, data: { status: won ? "won" : "lost", pnl } });
        if (won) {
          await db.user.update({ where: { id: pos.userId }, data: { balance: { increment: pos.shares } } });
          await db.transaction.create({
            data: {
              userId: pos.userId, type: "win", amount: pos.shares,
              detail: `Ganhou ${pos.shares.toFixed(2)} em "${market.title.slice(0, 40)}"`,
            },
          });
        }
      }
      return NextResponse.json({ ok: true });
    }

    if (action === "close")   { await db.market.update({ where: { id: marketId }, data: { status: "closed" } }); return NextResponse.json({ ok: true }); }
    if (action === "reopen")  { await db.market.update({ where: { id: marketId }, data: { status: "open" }   }); return NextResponse.json({ ok: true }); }
    if (action === "delete")  { await db.market.delete({ where: { id: marketId } }); return NextResponse.json({ ok: true }); }
    if (action === "edit") {
      await db.market.update({
        where: { id: marketId },
        data: {
          ...(title       ? { title }       : {}),
          ...(description !== undefined ? { description } : {}),
          ...(category    ? { category }    : {}),
          ...(emoji       ? { emoji }       : {}),
          ...(endsAt      ? { endsAt: new Date(endsAt) } : {}),
        },
      });
      return NextResponse.json({ ok: true });
    }

    return NextResponse.json({ error: "Ação inválida" }, { status: 400 });
  }

  // ── Create market ────────────────────────────────────────────
  const { title, description, category, emoji, endsAt, yesProb } = body;
  if (!title) return NextResponse.json({ error: "Título obrigatório" }, { status: 400 });

  const prob = Math.min(99, Math.max(1, yesProb ?? 50));
  const market = await db.market.create({
    data: {
      title, description: description || null,
      category: category || "Geral",
      emoji: emoji || "📊",
      endsAt: endsAt ? new Date(endsAt) : null,
    },
  });
  await db.outcome.createMany({
    data: [
      { marketId: market.id, label: "SIM", probability: prob,       shares: prob * 100 },
      { marketId: market.id, label: "NÃO", probability: 100 - prob, shares: (100 - prob) * 100 },
    ],
  });
  return NextResponse.json({ market });
}
