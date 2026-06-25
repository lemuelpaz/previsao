import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";
import bcrypt from "bcryptjs";

export const dynamic = "force-dynamic";

async function requireAdmin() {
  const session = await getSession();
  if (!session) return null;
  const user = await db.user.findUnique({ where: { id: session.userId } });
  return user?.role === "admin" ? user : null;
}

export async function GET() {
  if (!(await requireAdmin())) return NextResponse.json({ error: "Não autorizado" }, { status: 403 });
  const users = await db.user.findMany({
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { positions: true, transactions: true } } },
  });
  return NextResponse.json({ users });
}

export async function POST(req: Request) {
  if (!(await requireAdmin())) return NextResponse.json({ error: "Não autorizado" }, { status: 403 });

  const body = await req.json();
  const { action, userId } = body;

  if (action === "adjust_balance") {
    const { amount, note } = body;
    if (!userId || amount === undefined) return NextResponse.json({ error: "Dados inválidos" }, { status: 400 });
    const user = await db.user.findUnique({ where: { id: userId } });
    if (!user) return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 });
    await db.user.update({ where: { id: userId }, data: { balance: { increment: Number(amount) } } });
    await db.transaction.create({
      data: {
        userId,
        type: Number(amount) >= 0 ? "deposit" : "withdraw",
        amount: Number(amount),
        detail: note || `Ajuste manual pelo admin`,
      },
    });
    return NextResponse.json({ ok: true });
  }

  if (action === "set_role") {
    const { role } = body;
    if (!userId || !role) return NextResponse.json({ error: "Dados inválidos" }, { status: 400 });
    await db.user.update({ where: { id: userId }, data: { role } });
    return NextResponse.json({ ok: true });
  }

  if (action === "reset_password") {
    const { newPassword } = body;
    if (!userId || !newPassword) return NextResponse.json({ error: "Dados inválidos" }, { status: 400 });
    const hash = await bcrypt.hash(newPassword, 10);
    await db.user.update({ where: { id: userId }, data: { password: hash } });
    return NextResponse.json({ ok: true });
  }

  if (action === "delete") {
    if (!userId) return NextResponse.json({ error: "Dados inválidos" }, { status: 400 });
    await db.user.delete({ where: { id: userId } });
    return NextResponse.json({ ok: true });
  }

  if (action === "create") {
    const { phone, name, password, role, balance } = body;
    if (!phone || !password) return NextResponse.json({ error: "Telefone e senha obrigatórios" }, { status: 400 });
    const exists = await db.user.findUnique({ where: { phone } });
    if (exists) return NextResponse.json({ error: "Telefone já cadastrado" }, { status: 409 });
    const hash = await bcrypt.hash(password, 10);
    const user = await db.user.create({
      data: { phone, name: name || null, password: hash, role: role || "user", balance: balance ?? 0 },
    });
    return NextResponse.json({ user });
  }

  return NextResponse.json({ error: "Ação inválida" }, { status: 400 });
}
