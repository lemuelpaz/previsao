import { NextResponse } from "next/server";
import Stripe from "stripe";
import { db } from "@/lib/db";
import { readGatewayConfig } from "@/lib/gatewayConfig";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const cfg = readGatewayConfig();
  if (!cfg.stripe_secret_key) return NextResponse.json({ error: "Stripe não configurado" }, { status: 400 });

  const rawBody = await req.text();
  const stripe = new Stripe(cfg.stripe_secret_key);

  let event: Stripe.Event;
  if (cfg.stripe_webhook_secret) {
    const sig = req.headers.get("stripe-signature") ?? "";
    try {
      event = stripe.webhooks.constructEvent(rawBody, sig, cfg.stripe_webhook_secret);
    } catch {
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
    }
  } else {
    event = JSON.parse(rawBody) as Stripe.Event;
  }

  // Multibanco é um método de "notificação atrasada": checkout.session.completed dispara
  // logo que o voucher é gerado (payment_status ainda "unpaid"); o pagamento só é confirmado
  // depois via checkout.session.async_payment_succeeded (ou falha/expira em até 7 dias com
  // checkout.session.async_payment_failed). Cartão confirma na hora, no próprio "completed".
  if (event.type === "checkout.session.completed" || event.type === "checkout.session.async_payment_succeeded") {
    const s = event.data.object as Stripe.Checkout.Session;
    if (event.type === "checkout.session.completed" && s.payment_status !== "paid") {
      return NextResponse.json({ received: true }); // voucher gerado, aguardando pagamento
    }

    const userId    = s.metadata?.userId;
    const paymentId = s.metadata?.paymentId;
    const amountUSD = parseFloat(s.metadata?.amountUSD ?? "0");

    if (userId && amountUSD > 0 && paymentId) {
      const payment = await db.payment.findUnique({ where: { id: paymentId } });
      if (payment && payment.status !== "completed") {
        await db.$transaction(async (tx) => {
          await tx.user.update({ where: { id: userId }, data: { balance: { increment: amountUSD } } });
          await tx.transaction.create({ data: { userId, type: "deposit", amount: amountUSD, detail: `Stripe $${amountUSD} USD` } });
          await tx.payment.update({ where: { id: paymentId }, data: { status: "completed" } });
        });
      }
    }
  } else if (event.type === "checkout.session.async_payment_failed") {
    const s = event.data.object as Stripe.Checkout.Session;
    const paymentId = s.metadata?.paymentId;
    if (paymentId) {
      await db.payment.update({ where: { id: paymentId }, data: { status: "failed" } });
    }
  }

  return NextResponse.json({ received: true });
}
