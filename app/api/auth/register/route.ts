import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { createSession } from "@/lib/auth";

export async function POST(req: Request) {
  const { phone, name, password } = await req.json();
  if (!phone || !password) return NextResponse.json({ error: "Campos obrigatórios" }, { status: 400 });
  if (password.length < 6) return NextResponse.json({ error: "Senha mínima: 6 caracteres" }, { status: 400 });

  const exists = await db.user.findUnique({ where: { phone } });
  if (exists) return NextResponse.json({ error: "Usuário já existe" }, { status: 409 });

  const hash = await bcrypt.hash(password, 10);
  const user = await db.user.create({
    data: { phone, name: name || null, password: hash, balance: 1000 },
  });

  await db.transaction.create({
    data: { userId: user.id, type: "bonus", amount: 1000, detail: "Bônus de boas-vindas" },
  });

  await createSession(user.id);
  return NextResponse.json({ ok: true });
}
