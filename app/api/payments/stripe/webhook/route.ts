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

  if (event.type === "checkout.session.completed") {
    const s = event.data.object as Stripe.Checkout.Session;
    const userId    = s.metadata?.userId;
    const paymentId = s.metadata?.paymentId;
    const amountUSD = parseFloat(s.metadata?.amountUSD ?? "0");

    if (userId && amountUSD > 0) {
      await db.$transaction(async (tx) => {
        await tx.user.update({ where: { id: userId }, data: { balance: { increment: amountUSD } } });
        await tx.transaction.create({ data: { userId, type: "deposit", amount: amountUSD, detail: `Stripe $${amountUSD} USD` } });
        if (paymentId) {
          await tx.payment.update({ where: { id: paymentId }, data: { status: "completed" } });
        }
      });
    }
  }

  return NextResponse.json({ received: true });
}
