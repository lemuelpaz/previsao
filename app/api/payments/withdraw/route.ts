import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { createPixWithdraw } from "@/lib/veoPag";

export const dynamic = "force-dynamic";

const MIN_WITHDRAW = 20;

export async function POST(req: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  const { amount, pixKey, pixKeyType } = await req.json();

  if (!amount || amount < MIN_WITHDRAW)
    return NextResponse.json({ error: `Valor mínimo: R$${MIN_WITHDRAW}` }, { status: 400 });
  if (!pixKey || !pixKeyType)
    return NextResponse.json({ error: "Chave PIX obrigatória" }, { status: 400 });

  const user = await db.user.findUnique({ where: { id: session.userId } });
  if (!user || user.balance < amount)
    return NextResponse.json({ error: "Saldo insuficiente" }, { status: 400 });

  // Deduct balance + create records atomically
  const [, payment] = await db.$transaction([
    db.user.update({ where: { id: session.userId }, data: { balance: { decrement: amount } } }),
    db.payment.create({ data: { userId: session.userId, type: "withdraw", amount, status: "pending", pixKey, pixKeyType } }),
    db.transaction.create({ data: { userId: session.userId, type: "withdraw", amount: -amount, detail: `Saque PIX → ${pixKey}` } }),
  ]);

  try {
    const result = await createPixWithdraw({
      amount,
      externalId: payment.id,
      pixKey,
      pixKeyType,
      description: `Saque Metrix — ${user.name ?? user.phone}`,
    });

    await db.payment.update({
      where: { id: payment.id },
      data: { externalId: result.transactionId, status: "processing" },
    });

    return NextResponse.json({ ok: true, paymentId: payment.id });
  } catch (e: unknown) {
    // Refund on VeoPag error
    await db.$transaction([
      db.user.update({ where: { id: session.userId }, data: { balance: { increment: amount } } }),
      db.payment.update({ where: { id: payment.id }, data: { status: "failed" } }),
      db.transaction.create({ data: { userId: session.userId, type: "bonus", amount, detail: "Estorno — saque não processado" } }),
    ]);
    const msg = e instanceof Error ? e.message : "Erro desconhecido";
    console.error("[withdraw]", msg);
    return NextResponse.json({ error: "Falha ao processar saque" }, { status: 500 });
  }
}
