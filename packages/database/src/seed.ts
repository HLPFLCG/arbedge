import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Create sports
  const sports = [
    { name: 'Football', slug: 'football', icon: 'football' },
    { name: 'Basketball', slug: 'basketball', icon: 'basketball' },
    { name: 'Baseball', slug: 'baseball', icon: 'baseball' },
    { name: 'Hockey', slug: 'hockey', icon: 'hockey' },
    { name: 'Soccer', slug: 'soccer', icon: 'soccer' },
  ];

  for (const sport of sports) {
    await prisma.sport.upsert({
      where: { slug: sport.slug },
      update: {},
      create: sport,
    });
  }

  const football = await prisma.sport.findUnique({ where: { slug: 'football' } });
  const basketball = await prisma.sport.findUnique({ where: { slug: 'basketball' } });
  const baseball = await prisma.sport.findUnique({ where: { slug: 'baseball' } });
  const hockey = await prisma.sport.findUnique({ where: { slug: 'hockey' } });

  // Create leagues
  const leagues = [
    { sportId: football!.id, name: 'NFL', slug: 'nfl', country: 'USA' },
    { sportId: football!.id, name: 'NCAA Football', slug: 'ncaaf', country: 'USA' },
    { sportId: basketball!.id, name: 'NBA', slug: 'nba', country: 'USA' },
    { sportId: basketball!.id, name: 'NCAA Basketball', slug: 'ncaab', country: 'USA' },
    { sportId: baseball!.id, name: 'MLB', slug: 'mlb', country: 'USA' },
    { sportId: hockey!.id, name: 'NHL', slug: 'nhl', country: 'USA' },
  ];

  for (const league of leagues) {
    await prisma.league.upsert({
      where: { slug: league.slug },
      update: {},
      create: league,
    });
  }

  // Create sportsbooks
  const sportsbooks = [
    { name: 'DraftKings', slug: 'draftkings', logo: '/sportsbooks/draftkings.svg', tier: 1, website: 'https://sportsbook.draftkings.com' },
    { name: 'FanDuel', slug: 'fanduel', logo: '/sportsbooks/fanduel.svg', tier: 1, website: 'https://sportsbook.fanduel.com' },
    { name: 'BetMGM', slug: 'betmgm', logo: '/sportsbooks/betmgm.svg', tier: 1, website: 'https://sports.betmgm.com' },
    { name: 'Caesars', slug: 'caesars', logo: '/sportsbooks/caesars.svg', tier: 1, website: 'https://www.caesars.com/sportsbook-and-casino' },
    { name: 'ESPN BET', slug: 'espnbet', logo: '/sportsbooks/espnbet.svg', tier: 1, website: 'https://espnbet.com' },
  ];

  for (const sportsbook of sportsbooks) {
    await prisma.sportsbook.upsert({
      where: { slug: sportsbook.slug },
      update: {},
      create: sportsbook,
    });
  }

  console.log('Database seeded successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
