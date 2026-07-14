import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { parseMbWayCallback, isMbWayPaid } from "@/lib/ifthenpay";
import { readGatewayConfig } from "@/lib/gatewayConfig";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const cb = parseMbWayCallback(searchParams);

  const cfg = readGatewayConfig();
  if (cfg.mbway_antiphishing_key && cb.antiPhishingKey !== cfg.mbway_antiphishing_key) {
    return NextResponse.json({ error: "Chave anti-phishing inválida" }, { status: 401 });
  }

  const payment = await db.payment.findFirst({
    where: cb.reference ? { id: cb.reference } : cb.requestId ? { externalId: cb.requestId } : { id: "" },
  });
  if (!payment) return NextResponse.json({ ok: true }); // pagamento desconhecido, ignora

  if (isMbWayPaid(cb.status) && payment.type === "deposit" && payment.status !== "approved") {
    await db.$transaction([
      db.payment.update({ where: { id: payment.id }, data: { status: "approved" } }),
      db.user.update({ where: { id: payment.userId }, data: { balance: { increment: payment.amount } } }),
      db.transaction.create({ data: { userId: payment.userId, type: "deposit", amount: payment.amount, detail: "Depósito MB WAY aprovado" } }),
    ]);
  } else if (!isMbWayPaid(cb.status) && cb.status) {
    await db.payment.update({ where: { id: payment.id }, data: { status: "failed" } });
  }

  return NextResponse.json({ ok: true });
}

// Alguns terminais MB WAY notificam por POST em vez de GET.
export async function POST(req: Request) {
  return GET(req);
}
