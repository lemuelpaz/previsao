import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { createMbWayPayment } from "@/lib/ifthenpay";
import { readGatewayConfig } from "@/lib/gatewayConfig";

export const dynamic = "force-dynamic";

const MIN_DEPOSIT = 1;
const MAX_DEPOSIT = 2000;

export async function POST(req: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  const cfg = readGatewayConfig();
  if (cfg.mbway_enabled !== "true" || !cfg.mbway_key)
    return NextResponse.json({ error: "MB WAY não configurado" }, { status: 400 });

  const { amount, phone } = await req.json();
  if (!amount || amount < MIN_DEPOSIT)
    return NextResponse.json({ error: `Valor mínimo: €${MIN_DEPOSIT}` }, { status: 400 });
  if (amount > MAX_DEPOSIT)
    return NextResponse.json({ error: `Valor máximo: €${MAX_DEPOSIT}` }, { status: 400 });
  if (!phone || phone.replace(/\D/g, "").length < 9)
    return NextResponse.json({ error: "Número de telemóvel inválido" }, { status: 400 });

  const payment = await db.payment.create({
    data: { userId: session.userId, type: "deposit", amount, status: "pending", detail: "mbway" },
  });

  try {
    const result = await createMbWayPayment({
      key: cfg.mbway_key,
      amount,
      reference: payment.id,
      phone,
      description: "Deposito Metrix",
    });

    if (!result.ok) {
      await db.payment.update({ where: { id: payment.id }, data: { status: "failed" } });
      return NextResponse.json({ error: result.message || "Falha ao iniciar pagamento MB WAY" }, { status: 400 });
    }

    await db.payment.update({
      where: { id: payment.id },
      data: { externalId: result.requestId, status: "awaiting" },
    });

    return NextResponse.json({ paymentId: payment.id });
  } catch (e: unknown) {
    await db.payment.update({ where: { id: payment.id }, data: { status: "failed" } });
    const msg = e instanceof Error ? e.message : "Erro desconhecido";
    console.error("[mbway]", msg);
    return NextResponse.json({ error: "Falha ao iniciar pagamento MB WAY" }, { status: 500 });
  }
}
