import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });

  const { text } = await req.json();
  if (!text?.trim()) return NextResponse.json({ error: "Comentário vazio" }, { status: 400 });

  const comment = await db.comment.create({
    data: { userId: session.userId, marketId: params.id, text: text.trim() },
    include: { user: { select: { id: true, name: true, phone: true } } },
  });

  return NextResponse.json({ comment });
}
