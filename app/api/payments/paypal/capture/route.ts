import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { captureOrder } from "@/lib/paypal";
import { readGatewayConfig } from "@/lib/gatewayConfig";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  const cfg = readGatewayConfig();
  if (!cfg.paypal_client_id || !cfg.paypal_client_secret)
    return NextResponse.json({ error: "PayPal não configurado" }, { status: 400 });

  const { orderId } = await req.json();
  if (!orderId) return NextResponse.json({ error: "orderId obrigatório" }, { status: 400 });

  const mode = cfg.paypal_mode || "sandbox";

  const result = await captureOrder(cfg.paypal_client_id, cfg.paypal_client_secret, mode, orderId);
  if (result.status !== "COMPLETED")
    return NextResponse.json({ error: "Pagamento não aprovado: " + result.status }, { status: 400 });

  const capture = result.purchase_units?.[0]?.payments?.captures?.[0];
  const amountUSD = parseFloat(capture?.amount?.value ?? "0");

  const payment = await db.payment.findFirst({
    where: { externalId: orderId, userId: session.userId },
  });

  await db.$transaction(async (tx) => {
    await tx.user.update({ where: { id: session.userId }, data: { balance: { increment: amountUSD } } });
    await tx.transaction.create({ data: { userId: session.userId, type: "deposit", amount: amountUSD, detail: `PayPal $${amountUSD} USD` } });
    if (payment) {
      await tx.payment.update({ where: { id: payment.id }, data: { status: "completed" } });
    }
  });

  return NextResponse.json({ ok: true, amount: amountUSD });
}
