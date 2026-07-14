import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import Stripe from "stripe";
import { readGatewayConfig } from "@/lib/gatewayConfig";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  const cfg = readGatewayConfig();
  if (!cfg.stripe_secret_key) return NextResponse.json({ error: "Stripe não configurado" }, { status: 400 });

  const { amount, method } = await req.json();
  const isMultibanco = method === "multibanco";
  const currency = isMultibanco ? "eur" : "usd";
  if (!amount || amount < 1) return NextResponse.json({ error: `Valor mínimo: ${isMultibanco ? "€1" : "$1"}` }, { status: 400 });

  const stripe = new Stripe(cfg.stripe_secret_key);
  const origin = req.headers.get("origin") || "http://localhost:3000";

  const payment = await db.payment.create({
    data: { userId: session.userId, type: "deposit", amount, status: "pending", detail: isMultibanco ? "multibanco" : "stripe" },
  });

  const checkoutSession = await stripe.checkout.sessions.create({
    payment_method_types: isMultibanco ? ["multibanco"] : ["card"],
    line_items: [{
      price_data: {
        currency,
        product_data: { name: "Metrix — Depósito de saldo" },
        unit_amount: Math.round(amount * 100),
      },
      quantity: 1,
    }],
    mode: "payment",
    success_url: `${origin}/portfolio?stripe_success=1`,
    cancel_url:  `${origin}/portfolio?stripe_cancel=1`,
    metadata: { userId: session.userId, paymentId: payment.id, amountUSD: String(amount) },
  });

  await db.payment.update({
    where: { id: payment.id },
    data: { externalId: checkoutSession.id },
  });

  return NextResponse.json({ url: checkoutSession.url });
}
