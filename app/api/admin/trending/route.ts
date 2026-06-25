import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { readFileSync, writeFileSync, existsSync } from "fs";
import { join } from "path";

export const dynamic = "force-dynamic";

const PATH = join(process.cwd(), "trending.json");

function readCfg(): Record<string, string> {
  try { if (existsSync(PATH)) return JSON.parse(readFileSync(PATH, "utf-8")); } catch { /* empty */ }
  return {};
}

function writeCfg(cfg: Record<string, string>) {
  writeFileSync(PATH, JSON.stringify(cfg, null, 2), "utf-8");
}

async function requireAdmin() {
  const session = await getSession();
  if (!session) return null;
  const user = await db.user.findUnique({ where: { id: session.userId } });
  return user?.role === "admin" ? user : null;
}

export async function GET() {
  if (!(await requireAdmin())) return NextResponse.json({ error: "Não autorizado" }, { status: 403 });
  const markets = await db.market.findMany({
    where: { status: "open" },
    select: { id: true, title: true, category: true, emoji: true, volume: true, _count: { select: { positions: true } } },
    orderBy: { volume: "desc" },
  });
  return NextResponse.json({ config: readCfg(), markets });
}

export async function POST(req: Request) {
  if (!(await requireAdmin())) return NextResponse.json({ error: "Não autorizado" }, { status: 403 });
  const body = await req.json();
  const current = readCfg();
  const allowed = [
    "pinned_ids",
    "banner_enabled", "banner_title", "banner_subtitle",
    "banner_cta", "banner_url", "banner_badge", "banner_color", "banner_image",
  ];
  for (const key of allowed) {
    if (body[key] !== undefined) current[key] = String(body[key]);
  }
  writeCfg(current);
  return NextResponse.json({ ok: true });
}
