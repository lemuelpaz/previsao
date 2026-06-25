import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { readFileSync, existsSync } from "fs";
import { join } from "path";

export const dynamic = "force-dynamic";

const PATH = join(process.cwd(), "trending.json");

function readCfg(): Record<string, string> {
  try { if (existsSync(PATH)) return JSON.parse(readFileSync(PATH, "utf-8")); } catch { /* empty */ }
  return {};
}

export async function GET() {
  const cfg = readCfg();
  const pinnedIds = cfg.pinned_ids ? cfg.pinned_ids.split(",").filter(Boolean) : [];

  let pinnedMarkets: object[] = [];
  if (pinnedIds.length > 0) {
    const rows = await db.market.findMany({
      where: { id: { in: pinnedIds }, status: "open" },
      include: { outcomes: { select: { id: true, label: true, probability: true } } },
    });
    pinnedMarkets = pinnedIds
      .map(id => rows.find(m => m.id === id))
      .filter((m): m is NonNullable<typeof m> => !!m);
  }

  const banner = cfg.banner_enabled === "true"
    ? {
        enabled:  true,
        title:    cfg.banner_title    || "",
        subtitle: cfg.banner_subtitle || "",
        cta:      cfg.banner_cta      || "",
        url:      cfg.banner_url      || "",
        badge:    cfg.banner_badge    || "",
        color:    cfg.banner_color    || "#9AFF00",
        image:    cfg.banner_image    || "",
      }
    : { enabled: false };

  return NextResponse.json({ pinnedIds, pinnedMarkets, banner });
}
