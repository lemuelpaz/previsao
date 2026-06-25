import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { readFileSync, writeFileSync, existsSync } from "fs";
import { join } from "path";

export const dynamic = "force-dynamic";

const CONFIG_PATH = join(process.cwd(), "gateway.json");

function readConfig(): Record<string, string> {
  try {
    if (existsSync(CONFIG_PATH)) return JSON.parse(readFileSync(CONFIG_PATH, "utf-8"));
  } catch { /* empty file or parse error */ }
  return {};
}

function writeConfig(cfg: Record<string, string>) {
  writeFileSync(CONFIG_PATH, JSON.stringify(cfg, null, 2), "utf-8");
}

async function requireAdmin() {
  const session = await getSession();
  if (!session) return null;
  const user = await db.user.findUnique({ where: { id: session.userId } });
  return user?.role === "admin" ? user : null;
}

export async function GET() {
  if (!(await requireAdmin())) return NextResponse.json({ error: "Não autorizado" }, { status: 403 });
  return NextResponse.json({ config: readConfig() });
}

export async function POST(req: Request) {
  if (!(await requireAdmin())) return NextResponse.json({ error: "Não autorizado" }, { status: 403 });
  const body = await req.json();
  const current = readConfig();
  const allowed = [
    // VeoPag
    "gateway_enabled", "gateway_name", "gateway_api_key", "gateway_secret_key",
    "gateway_webhook_secret", "gateway_base_url", "gateway_callback_url",
    "gateway_pix_key", "gateway_pix_type", "gateway_min_deposit",
    "gateway_max_deposit", "gateway_min_withdraw", "gateway_test_mode",
    // Stripe
    "stripe_enabled", "stripe_publishable_key", "stripe_secret_key", "stripe_webhook_secret",
    // PayPal
    "paypal_enabled", "paypal_client_id", "paypal_client_secret", "paypal_mode",
  ];
  for (const key of allowed) {
    if (body[key] !== undefined) current[key] = String(body[key]);
  }
  writeConfig(current);
  return NextResponse.json({ ok: true });
}
