import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { verifyWebhookSignature } from "@/lib/veoPag";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const rawBody  = await req.text();
  const sig      = req.headers.get("x-webhook-signature") ?? "";
  const ts       = req.headers.get("x-webhook-timestamp") ?? "";

  if (!verifyWebhookSignature(rawBody, ts, sig)) {
    return NextResponse.json({ error: "Signature inválida" }, { status: 401 });
  }

  // Reject stale webhooks (> 5 min)
  if (ts && Math.abs(Date.now() / 1000 - parseInt(ts)) > 300) {
    return NextResponse.json({ error: "Webhook expirado" }, { status: 401 });
  }

  let body: { event?: string; external_id?: string; transaction_id?: string; status?: string; type?: string; amount?: number };
  try { body = JSON.parse(rawBody); } catch { return NextResponse.json({ error: "Invalid JSON" }, { status: 400 }); }

  const externalId = body.external_id;
  const veoTxId    = body.transaction_id;
  const status     = body.status?.toLowerCase();

  const payment = await db.payment.findFirst({
    where: externalId ? { id: externalId } : veoTxId ? { externalId: veoTxId } : { id: "" },
  });
  if (!payment) return NextResponse.json({ ok: true }); // unknown payment, ignore

  if (status === "paid" || status === "approved" || status === "completed" || status === "confirmed") {
    if (payment.type === "deposit" && payment.status !== "approved") {
      await db.$transaction([
        db.payment.update({ where: { id: payment.id }, data: { status: "approved" } }),
        db.user.update({ where: { id: payment.userId }, data: { balance: { increment: payment.amount } } }),
        db.transaction.create({ data: { userId: payment.userId, type: "deposit", amount: payment.amount, detail: `Depósito PIX aprovado` } }),
      ]);
    }
  } else if (status === "failed" || status === "cancelled" || status === "expired") {
    await db.payment.update({ where: { id: payment.id }, data: { status } });
    // If withdraw failed after deduction, refund
    if (payment.type === "withdraw" && payment.status === "processing") {
      await db.$transaction([
        db.user.update({ where: { id: payment.userId }, data: { balance: { increment: payment.amount } } }),
        db.transaction.create({ data: { userId: payment.userId, type: "bonus", amount: payment.amount, detail: "Estorno saque" } }),
      ]);
    }
  }

  return NextResponse.json({ ok: true });
}
