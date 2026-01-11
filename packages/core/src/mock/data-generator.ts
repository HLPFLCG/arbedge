import { SPORTSBOOKS, LEAGUES, type MarketType } from '@arbedge/shared';

export interface MockEvent {
  id: string;
  leagueId: string;
  leagueName: string;
  sportName: string;
  homeTeam: string;
  awayTeam: string;
  startTime: Date;
  status: 'SCHEDULED' | 'LIVE';
}

export interface MockOdds {
  id: string;
  eventId: string;
  sportsbookId: string;
  sportsbookName: string;
  marketType: MarketType;
  selection: string;
  price: number;
  decimalPrice: number;
  line?: number;
  timestamp: Date;
  isLive: boolean;
}

const TEAMS = {
  nfl: [
    ['Kansas City Chiefs', 'Baltimore Ravens'],
    ['San Francisco 49ers', 'Dallas Cowboys'],
    ['Buffalo Bills', 'Miami Dolphins'],
    ['Philadelphia Eagles', 'New York Giants'],
    ['Detroit Lions', 'Green Bay Packers'],
  ],
  nba: [
    ['Los Angeles Lakers', 'Boston Celtics'],
    ['Golden State Warriors', 'Phoenix Suns'],
    ['Milwaukee Bucks', 'Miami Heat'],
    ['Denver Nuggets', 'Oklahoma City Thunder'],
    ['Cleveland Cavaliers', 'New York Knicks'],
  ],
  mlb: [
    ['New York Yankees', 'Boston Red Sox'],
    ['Los Angeles Dodgers', 'San Francisco Giants'],
    ['Chicago Cubs', 'St. Louis Cardinals'],
    ['Houston Astros', 'Texas Rangers'],
    ['Atlanta Braves', 'Philadelphia Phillies'],
  ],
  nhl: [
    ['New York Rangers', 'Boston Bruins'],
    ['Toronto Maple Leafs', 'Montreal Canadiens'],
    ['Colorado Avalanche', 'Dallas Stars'],
    ['Vegas Golden Knights', 'Edmonton Oilers'],
    ['Florida Panthers', 'Tampa Bay Lightning'],
  ],
};

export class MockDataGenerator {
  private eventId = 0;
  private oddsId = 0;

  /**
   * Generate random events for a given league
   */
  generateEvents(leagueSlug: string, count: number = 5): MockEvent[] {
    const league = LEAGUES.find((l) => l.slug === leagueSlug);
    if (!league) return [];

    const teams = TEAMS[leagueSlug as keyof typeof TEAMS] || [];
    const events: MockEvent[] = [];

    for (let i = 0; i < Math.min(count, teams.length); i++) {
      const [home, away] = teams[i];
      const hoursFromNow = Math.floor(Math.random() * 24) + 1;

      events.push({
        id: `event-${++this.eventId}`,
        leagueId: league.id,
        leagueName: league.name,
        sportName: this.getSportName(league.sportId),
        homeTeam: home,
        awayTeam: away,
        startTime: new Date(Date.now() + hoursFromNow * 60 * 60 * 1000),
        status: Math.random() > 0.9 ? 'LIVE' : 'SCHEDULED',
      });
    }

    return events;
  }

  /**
   * Generate odds for an event across multiple sportsbooks
   */
  generateOddsForEvent(event: MockEvent, marketType: MarketType): MockOdds[] {
    const odds: MockOdds[] = [];
    const books = SPORTSBOOKS.slice(0, 5); // Use first 5 sportsbooks

    for (const book of books) {
      const baseOdds = this.generateBaseOdds(marketType);

      // Add some variation between books
      const variation = (Math.random() - 0.5) * 20; // +/- 10 points

      if (marketType === 'MONEYLINE') {
        // Home team
        odds.push(this.createOdds(event, book, marketType, 'home', baseOdds.home + variation));
        // Away team
        odds.push(this.createOdds(event, book, marketType, 'away', baseOdds.away - variation));
      } else if (marketType === 'SPREAD') {
        const spreadLine = baseOdds.line || -3.5;
        odds.push(
          this.createOdds(event, book, marketType, 'home', baseOdds.home + variation, spreadLine)
        );
        odds.push(
          this.createOdds(event, book, marketType, 'away', baseOdds.away - variation, -spreadLine)
        );
      } else if (marketType === 'TOTAL') {
        const totalLine = baseOdds.line || 45.5;
        odds.push(
          this.createOdds(event, book, marketType, 'over', baseOdds.home + variation, totalLine)
        );
        odds.push(
          this.createOdds(event, book, marketType, 'under', baseOdds.away - variation, totalLine)
        );
      }
    }

    return odds;
  }

  /**
   * Generate an arbitrage-guaranteed odds set
   */
  generateArbitrageOdds(
    event: MockEvent,
    profitPercent: number = 2
  ): { odds: MockOdds[]; legs: { sportsbookId: string; selection: string }[] } {
    // To guarantee arbitrage, we need: 1/odds1 + 1/odds2 < 1
    // For X% profit: 1/odds1 + 1/odds2 = 1 / (1 + X/100)

    const targetSum = 1 / (1 + profitPercent / 100);
    const split = 0.45 + Math.random() * 0.1; // 45-55% split

    const decimal1 = 1 / (targetSum * split);
    const decimal2 = 1 / (targetSum * (1 - split));

    const book1 = SPORTSBOOKS[0];
    const book2 = SPORTSBOOKS[1];

    const odds: MockOdds[] = [
      {
        id: `odds-${++this.oddsId}`,
        eventId: event.id,
        sportsbookId: book1.id,
        sportsbookName: book1.name,
        marketType: 'MONEYLINE',
        selection: 'home',
        price: this.decimalToAmerican(decimal1),
        decimalPrice: decimal1,
        timestamp: new Date(),
        isLive: event.status === 'LIVE',
      },
      {
        id: `odds-${++this.oddsId}`,
        eventId: event.id,
        sportsbookId: book2.id,
        sportsbookName: book2.name,
        marketType: 'MONEYLINE',
        selection: 'away',
        price: this.decimalToAmerican(decimal2),
        decimalPrice: decimal2,
        timestamp: new Date(),
        isLive: event.status === 'LIVE',
      },
    ];

    return {
      odds,
      legs: [
        { sportsbookId: book1.id, selection: 'home' },
        { sportsbookId: book2.id, selection: 'away' },
      ],
    };
  }

  private createOdds(
    event: MockEvent,
    book: (typeof SPORTSBOOKS)[0],
    marketType: MarketType,
    selection: string,
    americanOdds: number,
    line?: number
  ): MockOdds {
    return {
      id: `odds-${++this.oddsId}`,
      eventId: event.id,
      sportsbookId: book.id,
      sportsbookName: book.name,
      marketType,
      selection,
      price: Math.round(americanOdds),
      decimalPrice: this.americanToDecimal(americanOdds),
      line,
      timestamp: new Date(Date.now() - Math.random() * 30000), // 0-30 seconds ago
      isLive: event.status === 'LIVE',
    };
  }

  private generateBaseOdds(marketType: MarketType): { home: number; away: number; line?: number } {
    if (marketType === 'MONEYLINE') {
      const favorite = -150 - Math.random() * 100; // -150 to -250
      const underdog = 130 + Math.random() * 100; // +130 to +230
      return { home: favorite, away: underdog };
    }

    if (marketType === 'SPREAD') {
      return {
        home: -110,
        away: -110,
        line: -3.5 - Math.floor(Math.random() * 7), // -3.5 to -10.5
      };
    }

    if (marketType === 'TOTAL') {
      return {
        home: -110,
        away: -110,
        line: 40.5 + Math.floor(Math.random() * 15), // 40.5 to 54.5
      };
    }

    return { home: -110, away: -110 };
  }

  private americanToDecimal(american: number): number {
    if (american > 0) {
      return american / 100 + 1;
    }
    return 100 / Math.abs(american) + 1;
  }

  private decimalToAmerican(decimal: number): number {
    if (decimal >= 2) {
      return Math.round((decimal - 1) * 100);
    }
    return Math.round(-100 / (decimal - 1));
  }

  private getSportName(sportId: string): string {
    const names: Record<string, string> = {
      football: 'Football',
      basketball: 'Basketball',
      baseball: 'Baseball',
      hockey: 'Hockey',
      soccer: 'Soccer',
    };
    return names[sportId] || sportId;
  }
}

export const mockGenerator = new MockDataGenerator();
