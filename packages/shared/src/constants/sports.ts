export interface Sport {
  id: string;
  name: string;
  slug: string;
  icon: string;
  isActive: boolean;
}

export interface League {
  id: string;
  sportId: string;
  name: string;
  slug: string;
  country: string;
  isActive: boolean;
}

export const SPORTS: Sport[] = [
  { id: 'football', name: 'Football', slug: 'football', icon: 'football', isActive: true },
  { id: 'basketball', name: 'Basketball', slug: 'basketball', icon: 'basketball', isActive: true },
  { id: 'baseball', name: 'Baseball', slug: 'baseball', icon: 'baseball', isActive: true },
  { id: 'hockey', name: 'Hockey', slug: 'hockey', icon: 'hockey', isActive: true },
  { id: 'soccer', name: 'Soccer', slug: 'soccer', icon: 'soccer', isActive: true },
  { id: 'tennis', name: 'Tennis', slug: 'tennis', icon: 'tennis', isActive: true },
  { id: 'golf', name: 'Golf', slug: 'golf', icon: 'golf', isActive: true },
  { id: 'mma', name: 'MMA', slug: 'mma', icon: 'mma', isActive: true },
  { id: 'boxing', name: 'Boxing', slug: 'boxing', icon: 'boxing', isActive: true },
];

export const LEAGUES: League[] = [
  // Football
  { id: 'nfl', sportId: 'football', name: 'NFL', slug: 'nfl', country: 'USA', isActive: true },
  { id: 'ncaaf', sportId: 'football', name: 'NCAA Football', slug: 'ncaaf', country: 'USA', isActive: true },

  // Basketball
  { id: 'nba', sportId: 'basketball', name: 'NBA', slug: 'nba', country: 'USA', isActive: true },
  { id: 'ncaab', sportId: 'basketball', name: 'NCAA Basketball', slug: 'ncaab', country: 'USA', isActive: true },

  // Baseball
  { id: 'mlb', sportId: 'baseball', name: 'MLB', slug: 'mlb', country: 'USA', isActive: true },

  // Hockey
  { id: 'nhl', sportId: 'hockey', name: 'NHL', slug: 'nhl', country: 'USA', isActive: true },

  // Soccer
  { id: 'mls', sportId: 'soccer', name: 'MLS', slug: 'mls', country: 'USA', isActive: true },
  { id: 'epl', sportId: 'soccer', name: 'Premier League', slug: 'epl', country: 'England', isActive: true },

  // MMA
  { id: 'ufc', sportId: 'mma', name: 'UFC', slug: 'ufc', country: 'USA', isActive: true },
];

export const SPORT_BY_ID = SPORTS.reduce(
  (acc, sport) => {
    acc[sport.id] = sport;
    return acc;
  },
  {} as Record<string, Sport>
);

export const LEAGUE_BY_ID = LEAGUES.reduce(
  (acc, league) => {
    acc[league.id] = league;
    return acc;
  },
  {} as Record<string, League>
);

export const LEAGUES_BY_SPORT = LEAGUES.reduce(
  (acc, league) => {
    if (!acc[league.sportId]) {
      acc[league.sportId] = [];
    }
    acc[league.sportId].push(league);
    return acc;
  },
  {} as Record<string, League[]>
);
