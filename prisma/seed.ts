import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const db = new PrismaClient();

const markets = [
  // ── Existentes ──────────────────────────────────────────────────────────
  {
    title: "O Bitcoin vai superar US$150.000 em 2025?",
    description: "Mercado resolve SIM se o BTC atingir ou superar US$150.000 em qualquer exchange antes de 31/12/2025.",
    category: "Crypto", emoji: "₿", yesProb: 42, endsAt: new Date("2025-12-31"),
  },
  {
    title: "Brasil será campeão da Copa do Mundo 2026?",
    description: "Mercado resolve SIM se a Seleção Brasileira vencer a Copa do Mundo FIFA 2026.",
    category: "Esportes", emoji: "⚽", yesProb: 18, endsAt: new Date("2026-07-20"),
  },
  {
    title: "SELIC abaixo de 10% antes de dezembro de 2025?",
    description: "Mercado resolve SIM se a taxa SELIC for reduzida abaixo de 10% ao ano pelo COPOM antes de 01/12/2025.",
    category: "Economia", emoji: "📉", yesProb: 31, endsAt: new Date("2025-12-01"),
  },
  {
    title: "Elon Musk ainda será CEO da Tesla no final de 2025?",
    description: "Mercado resolve SIM se Elon Musk permanecer como CEO da Tesla até 31/12/2025.",
    category: "Tech", emoji: "🚗", yesProb: 68, endsAt: new Date("2025-12-31"),
  },
  {
    title: "Flamengo vai vencer a Libertadores 2025?",
    description: "Mercado resolve SIM se o Flamengo conquistar a Copa Libertadores da América em 2025.",
    category: "Esportes", emoji: "🏆", yesProb: 22, endsAt: new Date("2025-11-29"),
  },
  {
    title: "ChatGPT terá mais de 500M de usuários ativos até julho/2025?",
    description: "Mercado resolve SIM se a OpenAI reportar 500M+ usuários mensais ativos no ChatGPT até 31/07/2025.",
    category: "Tech", emoji: "🤖", yesProb: 58, endsAt: new Date("2025-07-31"),
  },
  {
    title: "Dólar abaixo de R$5,00 em algum momento de 2025?",
    description: "Mercado resolve SIM se o câmbio USD/BRL fechar abaixo de R$5,00 em qualquer dia útil de 2025.",
    category: "Economia", emoji: "💵", yesProb: 8, endsAt: new Date("2025-12-31"),
  },

  // ── Globais 2026+ — Tech / IA ────────────────────────────────────────
  {
    title: "GPT-5 será lançado oficialmente até o final de 2026?",
    description: "Mercado resolve SIM se a OpenAI lançar o GPT-5 com acesso público antes de 31/12/2026.",
    category: "Tech", emoji: "🧠", yesProb: 74, endsAt: new Date("2026-12-31"),
  },
  {
    title: "Apple lança óculos de AR com vendas acima de 5M de unidades em 2026?",
    description: "Mercado resolve SIM se a Apple reportar vendas acumuladas do Apple Vision Pro (ou sucessor) acima de 5 milhões de unidades até 31/12/2026.",
    category: "Tech", emoji: "🥽", yesProb: 29, endsAt: new Date("2026-12-31"),
  },
  {
    title: "Tesla Robotaxi disponível em mais de 10 cidades até 2026?",
    description: "Mercado resolve SIM se a Tesla operar serviço de robotaxi autônomo (sem motorista) em pelo menos 10 cidades até 31/12/2026.",
    category: "Tech", emoji: "🤖", yesProb: 24, endsAt: new Date("2026-12-31"),
  },
  {
    title: "Microsoft Copilot supera 300M de usuários ativos em 2026?",
    description: "Mercado resolve SIM se a Microsoft reportar 300M+ usuários mensais ativos do Copilot até 31/12/2026.",
    category: "Tech", emoji: "💼", yesProb: 38, endsAt: new Date("2026-12-31"),
  },
  {
    title: "Meta lança óculos de AR totalmente autônomos em 2026?",
    description: "Mercado resolve SIM se a Meta lançar óculos de realidade aumentada sem depender de smartphone até 31/12/2026.",
    category: "Tech", emoji: "👓", yesProb: 41, endsAt: new Date("2026-12-31"),
  },

  // ── Globais 2026+ — Crypto ───────────────────────────────────────────
  {
    title: "Bitcoin atinge US$250.000 antes de 2027?",
    description: "Mercado resolve SIM se o BTC fechar acima de US$250.000 em qualquer exchange antes de 01/01/2027.",
    category: "Crypto", emoji: "🚀", yesProb: 33, endsAt: new Date("2026-12-31"),
  },
  {
    title: "Ethereum supera US$12.000 em 2026?",
    description: "Mercado resolve SIM se o ETH atingir US$12.000 em qualquer exchange antes de 31/12/2026.",
    category: "Crypto", emoji: "💎", yesProb: 28, endsAt: new Date("2026-12-31"),
  },
  {
    title: "Solana entra no top 2 por capitalização de mercado em 2026?",
    description: "Mercado resolve SIM se a SOL ultrapassar o ETH em capitalização de mercado antes de 31/12/2026.",
    category: "Crypto", emoji: "☀️", yesProb: 17, endsAt: new Date("2026-12-31"),
  },
  {
    title: "Primeiro ETF de Ethereum à vista supera US$10B em AUM até 2026?",
    description: "Mercado resolve SIM se algum ETF spot de Ethereum nos EUA superar US$10 bilhões em ativos gerenciados até 31/12/2026.",
    category: "Crypto", emoji: "📈", yesProb: 52, endsAt: new Date("2026-12-31"),
  },

  // ── Globais 2026+ — Esportes ─────────────────────────────────────────
  {
    title: "Argentina defende o título na Copa do Mundo 2026?",
    description: "Mercado resolve SIM se a Seleção Argentina vencer a Copa do Mundo FIFA 2026 no México/EUA/Canadá.",
    category: "Esportes", emoji: "🏆", yesProb: 14, endsAt: new Date("2026-07-20"),
  },
  {
    title: "Novak Djokovic vence mais um Grand Slam em 2026?",
    description: "Mercado resolve SIM se Djokovic conquistar pelo menos um título de Grand Slam ao longo de 2026.",
    category: "Esportes", emoji: "🎾", yesProb: 44, endsAt: new Date("2026-12-31"),
  },
  {
    title: "Max Verstappen vence o campeonato de F1 em 2026?",
    description: "Mercado resolve SIM se Max Verstappen (Red Bull ou outra equipe) sagrar-se campeão mundial de Fórmula 1 em 2026.",
    category: "Esportes", emoji: "🏎️", yesProb: 35, endsAt: new Date("2026-12-01"),
  },
  {
    title: "Jogos Olímpicos de Los Angeles 2028 batem recorde de audiência global?",
    description: "Mercado resolve SIM se os Jogos Olímpicos de 2028 superarem o recorde de audiência acumulada dos Jogos de Tóquio 2020.",
    category: "Esportes", emoji: "🏅", yesProb: 62, endsAt: new Date("2028-09-15"),
  },

  // ── Globais 2026+ — Economia ─────────────────────────────────────────
  {
    title: "Nasdaq atinge 25.000 pontos antes de dezembro de 2026?",
    description: "Mercado resolve SIM se o índice Nasdaq Composite fechar acima de 25.000 pontos antes de 01/12/2026.",
    category: "Economia", emoji: "📊", yesProb: 54, endsAt: new Date("2026-11-30"),
  },
  {
    title: "Ouro ultrapassa US$3.500 por onça em 2026?",
    description: "Mercado resolve SIM se o preço do ouro (XAU/USD) atingir US$3.500 por onça troy antes de 31/12/2026.",
    category: "Economia", emoji: "🥇", yesProb: 47, endsAt: new Date("2026-12-31"),
  },
  {
    title: "Fed corta juros para abaixo de 3% ao ano até dezembro de 2026?",
    description: "Mercado resolve SIM se o Federal Reserve reduzir a taxa dos Fed Funds para abaixo de 3% ao ano antes de 31/12/2026.",
    category: "Economia", emoji: "🏦", yesProb: 26, endsAt: new Date("2026-12-31"),
  },
  {
    title: "PIB global cresce acima de 3,5% em 2026 segundo o FMI?",
    description: "Mercado resolve SIM se o Fundo Monetário Internacional reportar crescimento do PIB mundial acima de 3,5% para o ano de 2026.",
    category: "Economia", emoji: "🌍", yesProb: 49, endsAt: new Date("2027-04-30"),
  },

  // ── Globais 2026+ — Ciência / Espaço ────────────────────────────────
  {
    title: "SpaceX realiza primeira missão tripulada ao redor da Lua até 2027?",
    description: "Mercado resolve SIM se a SpaceX completar uma missão Starship tripulada ao redor da Lua antes de 31/12/2027.",
    category: "Ciência", emoji: "🚀", yesProb: 42, endsAt: new Date("2027-12-31"),
  },
  {
    title: "NASA pousa astronautas na Lua pelo Programa Artemis até 2027?",
    description: "Mercado resolve SIM se a NASA realizar uma alunissagem tripulada pelo programa Artemis antes de 31/12/2027.",
    category: "Ciência", emoji: "🌕", yesProb: 38, endsAt: new Date("2027-12-31"),
  },
  {
    title: "Primeiro reator de fusão nuclear gera energia à rede elétrica até 2028?",
    description: "Mercado resolve SIM se alguma empresa ou governo injetar eletricidade de fusão nuclear na rede pública antes de 31/12/2028.",
    category: "Ciência", emoji: "⚛️", yesProb: 9, endsAt: new Date("2028-12-31"),
  },
  {
    title: "IA ultrapassa desempenho humano médio no MCAT de medicina até 2027?",
    description: "Mercado resolve SIM se algum modelo de IA atingir pontuação acima da média dos candidatos humanos no exame MCAT (medicina dos EUA) até 31/12/2027.",
    category: "Ciência", emoji: "🧬", yesProb: 71, endsAt: new Date("2027-12-31"),
  },

  // ── Globais 2026+ — Clima ────────────────────────────────────────────
  {
    title: "2026 será o ano mais quente já registrado na história?",
    description: "Mercado resolve SIM se a temperatura média global de 2026 superar o recorde atual, segundo NASA ou NOAA.",
    category: "Clima", emoji: "🌡️", yesProb: 61, endsAt: new Date("2027-01-31"),
  },
  {
    title: "Vendas de carros elétricos superam 30% do total global em 2026?",
    description: "Mercado resolve SIM se veículos elétricos representarem mais de 30% das vendas globais de carros novos em 2026, segundo a IEA.",
    category: "Clima", emoji: "⚡", yesProb: 43, endsAt: new Date("2027-06-30"),
  },
  {
    title: "Algum país do G20 proíbe venda de carros a gasolina até 2030 (anúncio até 2026)?",
    description: "Mercado resolve SIM se pelo menos um país do G20 anunciar proibição de venda de carros a combustão com data-limite até 2030, antes de 31/12/2026.",
    category: "Clima", emoji: "🌿", yesProb: 31, endsAt: new Date("2026-12-31"),
  },

  // ── Globais 2026+ — Entretenimento ──────────────────────────────────
  {
    title: "GTA VI bate US$2 bilhões em receita na primeira semana?",
    description: "Mercado resolve SIM se Grand Theft Auto VI atingir US$2 bilhões em receita bruta global nos primeiros 7 dias após o lançamento.",
    category: "Entretenimento", emoji: "🎮", yesProb: 69, endsAt: new Date("2026-12-31"),
  },
  {
    title: "Netflix ultrapassa 400M de assinantes globais até 2027?",
    description: "Mercado resolve SIM se a Netflix reportar 400 milhões ou mais de assinantes pagantes antes de 31/12/2027.",
    category: "Entretenimento", emoji: "🎬", yesProb: 57, endsAt: new Date("2027-12-31"),
  },
  {
    title: "Algum filme de animação bate recorde de bilheteria global em 2026?",
    description: "Mercado resolve SIM se um filme de animação estrear em 2026 e superar US$2 bilhões de bilheteria mundial.",
    category: "Entretenimento", emoji: "🎭", yesProb: 22, endsAt: new Date("2026-12-31"),
  },
];

async function main() {
  const hash = await bcrypt.hash("admin123", 10);
  await db.user.upsert({
    where: { phone: "admin" },
    update: {},
    create: { phone: "admin", name: "Administrador", password: hash, role: "admin", balance: 0 },
  });

  const demoHash = await bcrypt.hash("demo123", 10);
  await db.user.upsert({
    where: { phone: "demo" },
    update: {},
    create: { phone: "demo", name: "Trader Demo", password: demoHash, role: "user", balance: 5000 },
  });

  for (const m of markets) {
    const existing = await db.market.findFirst({ where: { title: m.title } });
    if (existing) continue;

    const market = await db.market.create({
      data: {
        title: m.title, description: m.description,
        category: m.category, emoji: m.emoji,
        endsAt: m.endsAt, volume: Math.random() * 50000 + 5000,
      },
    });

    await db.outcome.createMany({
      data: [
        { marketId: market.id, label: "SIM", probability: m.yesProb, shares: m.yesProb * 100 },
        { marketId: market.id, label: "NÃO", probability: 100 - m.yesProb, shares: (100 - m.yesProb) * 100 },
      ],
    });
  }

  console.log("Seed concluído — admin/admin123, demo/demo123");
}

main().catch(console.error).finally(() => db.$disconnect());
