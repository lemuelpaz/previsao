import { PrismaClient } from "@prisma/client";
const db = new PrismaClient();
const [markets, users] = await Promise.all([db.market.count(), db.user.count()]);
console.log("Markets:", markets, "| Users:", users);
await db.$disconnect();
