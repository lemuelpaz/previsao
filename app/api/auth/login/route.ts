import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { createSession } from "@/lib/auth";

export async function POST(req: Request) {
  const { phone, password } = await req.json();
  if (!phone || !password) return NextResponse.json({ error: "Campos obrigatórios" }, { status: 400 });

  const user = await db.user.findUnique({ where: { phone } });
  if (!user || !(await bcrypt.compare(password, user.password)))
    return NextResponse.json({ error: "Credenciais inválidas" }, { status: 401 });

  await createSession(user.id);
  return NextResponse.json({ ok: true, role: user.role });
}
