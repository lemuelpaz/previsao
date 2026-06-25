import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { createPixDeposit } from "@/lib/veoPag";
import QRCode from "qrcode";

export const dynamic = "force-dynamic";

const MIN_DEPOSIT = 10;
const MAX_DEPOSIT = 10000;

export async function POST(req: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  const { amount } = await req.json();
  if (!amount || amount < MIN_DEPOSIT)
    return NextResponse.json({ error: `Valor mínimo: R$${MIN_DEPOSIT}` }, { status: 400 });
  if (amount > MAX_DEPOSIT)
    return NextResponse.json({ error: `Valor máximo: R$${MAX_DEPOSIT}` }, { status: 400 });

  const user = await db.user.findUnique({ where: { id: session.userId } });
  if (!user) return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 });

  const payment = await db.payment.create({
    data: { userId: session.userId, type: "deposit", amount, status: "pending" },
  });

  try {
    const result = await createPixDeposit({
      amount,
      externalId: payment.id,
      payer: {
        name: user.name ?? user.phone,
        email: `user${session.userId.slice(-8)}@metrix.app`,
        document: user.phone.replace(/\D/g, "").padEnd(11, "0").slice(0, 11),
        phone: user.phone,
      },
    });

    // Generate QR code PNG as base64 data URL
    const pixQRCode = await QRCode.toDataURL(result.qrcode, {
      width: 260,
      margin: 2,
      color: { dark: "#000000", light: "#ffffff" },
    });

    await db.payment.update({
      where: { id: payment.id },
      data: {
        externalId: result.transactionId,
        pixCode: result.qrcode,
        pixQRCode,
        status: "awaiting",
      },
    });

    return NextResponse.json({
      paymentId: payment.id,
      pixCode: result.qrcode,
      pixQRCode,
      fee: result.fee,
    });
  } catch (e: unknown) {
    await db.payment.update({ where: { id: payment.id }, data: { status: "failed" } });
    const msg = e instanceof Error ? e.message : "Erro desconhecido";
    console.error("[deposit]", msg);
    return NextResponse.json({ error: "Falha ao criar cobrança PIX" }, { status: 500 });
  }
}
