import Link from 'next/link';
import { ArrowRight, Zap, Shield, TrendingUp, BarChart3 } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold">ArbEdge</span>
          </div>
          <nav className="hidden md:flex items-center gap-6">
            <Link href="/features" className="text-muted-foreground hover:text-foreground transition">
              Features
            </Link>
            <Link href="/pricing" className="text-muted-foreground hover:text-foreground transition">
              Pricing
            </Link>
            <Link href="/login" className="text-muted-foreground hover:text-foreground transition">
              Login
            </Link>
            <Link
              href="/register"
              className="px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition"
            >
              Start Free Trial
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm mb-6">
          <Zap className="w-4 h-4" />
          <span>Sub-3-Second Live Odds</span>
        </div>
        <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
          Professional Sports
          <br />
          <span className="text-primary">Arbitrage Intelligence</span>
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
          Identify guaranteed-profit arbitrage opportunities across 50+ US sportsbooks with
          industry-leading speed, accuracy, and account protection.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/register"
            className="px-8 py-3 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition flex items-center gap-2 text-lg font-semibold"
          >
            Start 7-Day Free Trial
            <ArrowRight className="w-5 h-5" />
          </Link>
          <Link
            href="/features"
            className="px-8 py-3 rounded-lg border border-border hover:bg-muted transition text-lg"
          >
            See How It Works
          </Link>
        </div>
      </section>

      {/* Features Grid */}
      <section className="container mx-auto px-4 py-20">
        <h2 className="text-3xl font-bold text-center mb-12">Why Professionals Choose ArbEdge</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          <FeatureCard
            icon={<Zap className="w-6 h-6" />}
            title="Sub-3-Second Latency"
            description="WebSocket-native architecture delivers live odds faster than any competitor. Execute before opportunities disappear."
          />
          <FeatureCard
            icon={<BarChart3 className="w-6 h-6" />}
            title="Confidence Scoring"
            description="AI-powered scoring validates opportunities across multiple sources, reducing false positives from 15% to under 3%."
          />
          <FeatureCard
            icon={<Shield className="w-6 h-6" />}
            title="Account Protection"
            description="CLV tracking and bet sizing recommendations extend account lifespan 3-4x by avoiding detection patterns."
          />
          <FeatureCard
            icon={<TrendingUp className="w-6 h-6" />}
            title="Portfolio Management"
            description="Integrated bankroll tracking, P&L analytics, and tax reporting - everything in one platform."
          />
        </div>
      </section>

      {/* Stats Section */}
      <section className="container mx-auto px-4 py-20 border-t border-border">
        <div className="grid md:grid-cols-4 gap-8 text-center">
          <StatCard value="50+" label="US Sportsbooks" />
          <StatCard value="<3s" label="Odds Latency" />
          <StatCard value="97%" label="Accuracy Rate" />
          <StatCard value="3-4x" label="Account Longevity" />
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="bg-primary/10 rounded-2xl p-12 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Start Profiting?</h2>
          <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
            Join thousands of professional arbitrage bettors who trust ArbEdge for guaranteed
            profits.
          </p>
          <Link
            href="/register"
            className="inline-flex items-center gap-2 px-8 py-3 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition text-lg font-semibold"
          >
            Start Your Free Trial
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold">ArbEdge</span>
            </div>
            <p className="text-muted-foreground text-sm">
              &copy; {new Date().getFullYear()} ArbEdge. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="p-6 rounded-xl border border-border bg-card hover:border-primary/50 transition">
      <div className="w-12 h-12 rounded-lg bg-primary/10 text-primary flex items-center justify-center mb-4">
        {icon}
      </div>
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      <p className="text-muted-foreground text-sm">{description}</p>
    </div>
  );
}

function StatCard({ value, label }: { value: string; label: string }) {
  return (
    <div>
      <div className="text-4xl font-bold text-primary mb-2">{value}</div>
      <div className="text-muted-foreground">{label}</div>
    </div>
  );
}
