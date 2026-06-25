import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });

  const positions = await db.position.findMany({
    where: { userId: session.userId },
    include: {
      market: { select: { id: true, title: true, emoji: true, status: true, resolution: true } },
      outcome: { select: { id: true, label: true, probability: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  const transactions = await db.transaction.findMany({
    where: { userId: session.userId },
    orderBy: { createdAt: "desc" },
    take: 30,
  });

  const user = await db.user.findUnique({
    where: { id: session.userId },
    select: { balance: true, name: true, phone: true },
  });

  return NextResponse.json({ positions, transactions, user });
}
