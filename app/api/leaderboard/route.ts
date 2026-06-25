import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  const users = await db.user.findMany({
    where: { role: "user" },
    select: {
      id: true, name: true, phone: true, balance: true,
      _count: { select: { positions: true } },
    },
    orderBy: { balance: "desc" },
    take: 50,
  });

  return NextResponse.json({ users });
}
