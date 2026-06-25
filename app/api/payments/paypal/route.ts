import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { createOrder } from "@/lib/paypal";
import { readGatewayConfig } from "@/lib/gatewayConfig";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  const cfg = readGatewayConfig();
  if (!cfg.paypal_client_id || !cfg.paypal_client_secret)
    return NextResponse.json({ error: "PayPal não configurado" }, { status: 400 });

  const { amount } = await req.json();
  if (!amount || amount < 1) return NextResponse.json({ error: "Valor mínimo: $1" }, { status: 400 });

  const mode = cfg.paypal_mode || "sandbox";

  const payment = await db.payment.create({
    data: { userId: session.userId, type: "deposit", amount, status: "pending", detail: "paypal" },
  });

  try {
    const order = await createOrder(cfg.paypal_client_id, cfg.paypal_client_secret, mode, amount, session.userId);
    await db.payment.update({ where: { id: payment.id }, data: { externalId: order.id } });

    const approveLink = order.links?.find((l) => l.rel === "approve")?.href;
    return NextResponse.json({ orderId: order.id, approveUrl: approveLink });
  } catch (e: unknown) {
    await db.payment.update({ where: { id: payment.id }, data: { status: "failed" } });
    const msg = e instanceof Error ? e.message : "Erro desconhecido";
    console.error("[paypal/order]", msg);
    return NextResponse.json({ error: "Falha ao criar ordem PayPal" }, { status: 500 });
  }
}
