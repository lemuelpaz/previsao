import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { writeFileSync, mkdirSync, existsSync } from "fs";
import { join, extname } from "path";
import { randomUUID } from "crypto";

export const dynamic = "force-dynamic";

async function requireAdmin() {
  const session = await getSession();
  if (!session) return null;
  const user = await db.user.findUnique({ where: { id: session.userId } });
  return user?.role === "admin" ? user : null;
}

export async function POST(req: Request) {
  if (!(await requireAdmin())) return NextResponse.json({ error: "Não autorizado" }, { status: 403 });

  const formData = await req.formData();
  const file = formData.get("file") as File | null;

  if (!file) return NextResponse.json({ error: "Nenhum arquivo enviado" }, { status: 400 });

  const allowed = ["image/jpeg", "image/jpg", "image/png", "image/webp", "image/gif"];
  if (!allowed.includes(file.type))
    return NextResponse.json({ error: "Tipo não permitido. Use JPG, PNG, WebP ou GIF." }, { status: 400 });

  if (file.size > 5 * 1024 * 1024)
    return NextResponse.json({ error: "Arquivo muito grande. Máximo 5 MB." }, { status: 400 });

  const dir = join(process.cwd(), "public", "uploads", "banners");
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });

  const ext = extname(file.name) || ".jpg";
  const filename = `${randomUUID()}${ext}`;
  writeFileSync(join(dir, filename), Buffer.from(await file.arrayBuffer()));

  return NextResponse.json({ url: `/uploads/banners/${filename}` });
}
