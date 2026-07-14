import { PrismaClient } from "@prisma/client";

const db = new PrismaClient();

async function main() {
  const outcomes = await db.outcome.findMany({ where: { priceHistory: { none: {} } } });
  for (const o of outcomes) {
    await db.priceHistory.create({ data: { outcomeId: o.id, probability: o.probability } });
  }
  console.log(`Backfill concluído — ${outcomes.length} outcomes.`);
}

main().catch(console.error).finally(() => db.$disconnect());
