import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(_: Request, { params }: { params: { id: string } }) {
  const market = await db.market.findUnique({
    where: { id: params.id },
    include: {
      outcomes: true,
      comments: {
        include: { user: { select: { id: true, name: true, phone: true } } },
        orderBy: { createdAt: "desc" },
        take: 50,
      },
      _count: { select: { positions: true } },
    },
  });

  if (!market) return NextResponse.json({ error: "Mercado não encontrado" }, { status: 404 });

  const session = await getSession();
  let myPosition = null;
  if (session) {
    myPosition = await db.position.findFirst({
      where: { userId: session.userId, marketId: params.id, status: "open" },
      include: { outcome: true },
    });
  }

  return NextResponse.json({ market, myPosition });
}
