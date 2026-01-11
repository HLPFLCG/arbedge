export interface Sportsbook {
  id: string;
  name: string;
  slug: string;
  logo?: string;
  isActive: boolean;
  tier: 1 | 2 | 3; // 1 = major, 2 = mid, 3 = minor
  states: string[]; // US states where available
  website?: string;
}

export interface SportsbookOdds {
  sportsbookId: string;
  sportsbookName: string;
  sportsbookLogo?: string;
  price: number;
  decimalPrice: number;
  line?: number;
  lastUpdated: Date;
}
