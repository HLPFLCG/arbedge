-- CreateEnum
CREATE TYPE "SubscriptionTier" AS ENUM ('FREE', 'STARTER', 'PROFESSIONAL', 'ENTERPRISE');
CREATE TYPE "SubscriptionStatus" AS ENUM ('ACTIVE', 'PAST_DUE', 'CANCELED', 'TRIALING');
CREATE TYPE "EventStatus" AS ENUM ('SCHEDULED', 'LIVE', 'COMPLETED', 'CANCELED', 'POSTPONED');
CREATE TYPE "MarketType" AS ENUM ('MONEYLINE', 'SPREAD', 'TOTAL', 'PROP', 'FUTURES');
CREATE TYPE "ArbitrageStatus" AS ENUM ('ACTIVE', 'EXPIRED', 'EXECUTED', 'INVALID');
CREATE TYPE "TransactionType" AS ENUM ('DEPOSIT', 'WITHDRAWAL', 'BET_PLACED', 'BET_WON', 'BET_LOST', 'BET_VOIDED');
CREATE TYPE "AccountStatus" AS ENUM ('ACTIVE', 'LIMITED', 'SUSPENDED', 'CLOSED');
CREATE TYPE "BetResult" AS ENUM ('PENDING', 'WON', 'LOST', 'PUSH', 'VOIDED');
CREATE TYPE "AlertChannel" AS ENUM ('WEBSOCKET', 'DISCORD', 'TELEGRAM', 'EMAIL');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT,
    "name" TEXT,
    "image" TEXT,
    "emailVerified" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "accounts" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "providerAccountId" TEXT NOT NULL,
    "refresh_token" TEXT,
    "access_token" TEXT,
    "expires_at" INTEGER,
    "token_type" TEXT,
    "scope" TEXT,
    "id_token" TEXT,
    "session_state" TEXT,
    CONSTRAINT "accounts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sessions" (
    "id" TEXT NOT NULL,
    "sessionToken" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "verification_tokens" (
    "identifier" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL
);

-- CreateTable
CREATE TABLE "subscriptions" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "tier" "SubscriptionTier" NOT NULL DEFAULT 'FREE',
    "status" "SubscriptionStatus" NOT NULL DEFAULT 'TRIALING',
    "stripeCustomerId" TEXT,
    "stripeSubscriptionId" TEXT,
    "stripePriceId" TEXT,
    "currentPeriodStart" TIMESTAMP(3),
    "currentPeriodEnd" TIMESTAMP(3),
    "cancelAtPeriodEnd" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "subscriptions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sports" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "icon" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    CONSTRAINT "sports_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "leagues" (
    "id" TEXT NOT NULL,
    "sportId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "country" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    CONSTRAINT "leagues_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "events" (
    "id" TEXT NOT NULL,
    "leagueId" TEXT NOT NULL,
    "externalId" TEXT,
    "homeTeam" TEXT NOT NULL,
    "awayTeam" TEXT NOT NULL,
    "startTime" TIMESTAMP(3) NOT NULL,
    "status" "EventStatus" NOT NULL DEFAULT 'SCHEDULED',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sportsbooks" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "logo" TEXT,
    "website" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "tier" INTEGER NOT NULL DEFAULT 1,
    CONSTRAINT "sportsbooks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "markets" (
    "id" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "type" "MarketType" NOT NULL,
    "description" TEXT,
    "period" TEXT,
    CONSTRAINT "markets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "odds" (
    "id" TEXT NOT NULL,
    "marketId" TEXT NOT NULL,
    "sportsbookId" TEXT NOT NULL,
    "selection" TEXT NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "decimalPrice" DOUBLE PRECISION NOT NULL,
    "line" DOUBLE PRECISION,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "isLive" BOOLEAN NOT NULL DEFAULT false,
    CONSTRAINT "odds_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "arbitrages" (
    "id" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "marketType" "MarketType" NOT NULL,
    "profitPercent" DOUBLE PRECISION NOT NULL,
    "confidence" INTEGER NOT NULL,
    "status" "ArbitrageStatus" NOT NULL DEFAULT 'ACTIVE',
    "detectedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3),
    "isLive" BOOLEAN NOT NULL DEFAULT false,
    CONSTRAINT "arbitrages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "arbitrage_legs" (
    "id" TEXT NOT NULL,
    "arbitrageId" TEXT NOT NULL,
    "sportsbookId" TEXT NOT NULL,
    "selection" TEXT NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "decimalPrice" DOUBLE PRECISION NOT NULL,
    "line" DOUBLE PRECISION,
    "stakePercent" DOUBLE PRECISION NOT NULL,
    CONSTRAINT "arbitrage_legs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "portfolios" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "totalBankroll" DECIMAL(12,2) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "portfolios_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "portfolio_snapshots" (
    "id" TEXT NOT NULL,
    "portfolioId" TEXT NOT NULL,
    "bankroll" DECIMAL(12,2) NOT NULL,
    "pnl" DECIMAL(12,2) NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "portfolio_snapshots_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "transactions" (
    "id" TEXT NOT NULL,
    "portfolioId" TEXT NOT NULL,
    "type" "TransactionType" NOT NULL,
    "amount" DECIMAL(12,2) NOT NULL,
    "description" TEXT,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "transactions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sports_accounts" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "sportsbookId" TEXT NOT NULL,
    "username" TEXT,
    "balance" DECIMAL(12,2),
    "status" "AccountStatus" NOT NULL DEFAULT 'ACTIVE',
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "sports_accounts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "bets" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "sportsAccountId" TEXT NOT NULL,
    "arbitrageId" TEXT,
    "eventDescription" TEXT NOT NULL,
    "selection" TEXT NOT NULL,
    "odds" DOUBLE PRECISION NOT NULL,
    "stake" DECIMAL(12,2) NOT NULL,
    "potentialPayout" DECIMAL(12,2) NOT NULL,
    "result" "BetResult" NOT NULL DEFAULT 'PENDING',
    "actualPayout" DECIMAL(12,2),
    "placedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "settledAt" TIMESTAMP(3),
    CONSTRAINT "bets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "clv_records" (
    "id" TEXT NOT NULL,
    "betId" TEXT NOT NULL,
    "sportsAccountId" TEXT NOT NULL,
    "openingOdds" DOUBLE PRECISION NOT NULL,
    "closingOdds" DOUBLE PRECISION NOT NULL,
    "clvPercent" DOUBLE PRECISION NOT NULL,
    "recordedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "clv_records_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "alert_configs" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "channels" "AlertChannel"[],
    "minProfit" DOUBLE PRECISION,
    "maxProfit" DOUBLE PRECISION,
    "minConfidence" INTEGER,
    "sports" TEXT[],
    "sportsbooks" TEXT[],
    "marketTypes" "MarketType"[],
    "discordWebhook" TEXT,
    "telegramChatId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "alert_configs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "alert_logs" (
    "id" TEXT NOT NULL,
    "arbitrageId" TEXT NOT NULL,
    "channel" "AlertChannel" NOT NULL,
    "sentAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "delivered" BOOLEAN NOT NULL DEFAULT true,
    "error" TEXT,
    CONSTRAINT "alert_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");
CREATE UNIQUE INDEX "accounts_provider_providerAccountId_key" ON "accounts"("provider", "providerAccountId");
CREATE UNIQUE INDEX "sessions_sessionToken_key" ON "sessions"("sessionToken");
CREATE UNIQUE INDEX "verification_tokens_token_key" ON "verification_tokens"("token");
CREATE UNIQUE INDEX "verification_tokens_identifier_token_key" ON "verification_tokens"("identifier", "token");
CREATE UNIQUE INDEX "subscriptions_userId_key" ON "subscriptions"("userId");
CREATE UNIQUE INDEX "subscriptions_stripeCustomerId_key" ON "subscriptions"("stripeCustomerId");
CREATE UNIQUE INDEX "subscriptions_stripeSubscriptionId_key" ON "subscriptions"("stripeSubscriptionId");
CREATE UNIQUE INDEX "sports_name_key" ON "sports"("name");
CREATE UNIQUE INDEX "sports_slug_key" ON "sports"("slug");
CREATE UNIQUE INDEX "leagues_slug_key" ON "leagues"("slug");
CREATE UNIQUE INDEX "events_leagueId_homeTeam_awayTeam_startTime_key" ON "events"("leagueId", "homeTeam", "awayTeam", "startTime");
CREATE INDEX "events_startTime_idx" ON "events"("startTime");
CREATE INDEX "events_status_idx" ON "events"("status");
CREATE UNIQUE INDEX "sportsbooks_name_key" ON "sportsbooks"("name");
CREATE UNIQUE INDEX "sportsbooks_slug_key" ON "sportsbooks"("slug");
CREATE UNIQUE INDEX "markets_eventId_type_description_period_key" ON "markets"("eventId", "type", "description", "period");
CREATE INDEX "odds_marketId_sportsbookId_idx" ON "odds"("marketId", "sportsbookId");
CREATE INDEX "odds_timestamp_idx" ON "odds"("timestamp");
CREATE INDEX "arbitrages_detectedAt_idx" ON "arbitrages"("detectedAt");
CREATE INDEX "arbitrages_status_idx" ON "arbitrages"("status");
CREATE INDEX "arbitrages_profitPercent_idx" ON "arbitrages"("profitPercent");
CREATE UNIQUE INDEX "portfolios_userId_key" ON "portfolios"("userId");
CREATE INDEX "portfolio_snapshots_portfolioId_timestamp_idx" ON "portfolio_snapshots"("portfolioId", "timestamp");
CREATE INDEX "transactions_portfolioId_timestamp_idx" ON "transactions"("portfolioId", "timestamp");
CREATE UNIQUE INDEX "sports_accounts_userId_sportsbookId_key" ON "sports_accounts"("userId", "sportsbookId");
CREATE INDEX "bets_userId_placedAt_idx" ON "bets"("userId", "placedAt");
CREATE INDEX "bets_result_idx" ON "bets"("result");
CREATE UNIQUE INDEX "clv_records_betId_key" ON "clv_records"("betId");
CREATE INDEX "clv_records_sportsAccountId_recordedAt_idx" ON "clv_records"("sportsAccountId", "recordedAt");
CREATE INDEX "alert_logs_arbitrageId_idx" ON "alert_logs"("arbitrageId");

-- AddForeignKey
ALTER TABLE "accounts" ADD CONSTRAINT "accounts_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "leagues" ADD CONSTRAINT "leagues_sportId_fkey" FOREIGN KEY ("sportId") REFERENCES "sports"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "events" ADD CONSTRAINT "events_leagueId_fkey" FOREIGN KEY ("leagueId") REFERENCES "leagues"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "markets" ADD CONSTRAINT "markets_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "events"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "odds" ADD CONSTRAINT "odds_marketId_fkey" FOREIGN KEY ("marketId") REFERENCES "markets"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "odds" ADD CONSTRAINT "odds_sportsbookId_fkey" FOREIGN KEY ("sportsbookId") REFERENCES "sportsbooks"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "arbitrages" ADD CONSTRAINT "arbitrages_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "events"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "arbitrage_legs" ADD CONSTRAINT "arbitrage_legs_arbitrageId_fkey" FOREIGN KEY ("arbitrageId") REFERENCES "arbitrages"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "portfolios" ADD CONSTRAINT "portfolios_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "portfolio_snapshots" ADD CONSTRAINT "portfolio_snapshots_portfolioId_fkey" FOREIGN KEY ("portfolioId") REFERENCES "portfolios"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_portfolioId_fkey" FOREIGN KEY ("portfolioId") REFERENCES "portfolios"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "sports_accounts" ADD CONSTRAINT "sports_accounts_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "sports_accounts" ADD CONSTRAINT "sports_accounts_sportsbookId_fkey" FOREIGN KEY ("sportsbookId") REFERENCES "sportsbooks"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "bets" ADD CONSTRAINT "bets_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "bets" ADD CONSTRAINT "bets_sportsAccountId_fkey" FOREIGN KEY ("sportsAccountId") REFERENCES "sports_accounts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "bets" ADD CONSTRAINT "bets_arbitrageId_fkey" FOREIGN KEY ("arbitrageId") REFERENCES "arbitrages"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "clv_records" ADD CONSTRAINT "clv_records_betId_fkey" FOREIGN KEY ("betId") REFERENCES "bets"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "clv_records" ADD CONSTRAINT "clv_records_sportsAccountId_fkey" FOREIGN KEY ("sportsAccountId") REFERENCES "sports_accounts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "alert_configs" ADD CONSTRAINT "alert_configs_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "alert_logs" ADD CONSTRAINT "alert_logs_arbitrageId_fkey" FOREIGN KEY ("arbitrageId") REFERENCES "arbitrages"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Seed sportsbooks
INSERT INTO "sportsbooks" ("id", "name", "slug", "isActive", "tier") VALUES
('dk', 'DraftKings', 'draftkings', true, 1),
('fd', 'FanDuel', 'fanduel', true, 1),
('mgm', 'BetMGM', 'betmgm', true, 1),
('czr', 'Caesars', 'caesars', true, 1),
('espn', 'ESPN BET', 'espn-bet', true, 1);

-- Seed sports
INSERT INTO "sports" ("id", "name", "slug", "isActive") VALUES
('nfl', 'NFL', 'nfl', true),
('nba', 'NBA', 'nba', true),
('mlb', 'MLB', 'mlb', true),
('nhl', 'NHL', 'nhl', true),
('ncaaf', 'NCAAF', 'ncaaf', true),
('ncaab', 'NCAAB', 'ncaab', true);
