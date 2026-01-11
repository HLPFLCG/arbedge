import Link from 'next/link';
import { Check, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { SUBSCRIPTION_PLANS } from '@arbedge/shared';

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold">ArbEdge</span>
          </Link>
          <nav className="flex items-center gap-6">
            <Link href="/features" className="text-muted-foreground hover:text-foreground">
              Features
            </Link>
            <Link href="/login" className="text-muted-foreground hover:text-foreground">
              Login
            </Link>
            <Link href="/register">
              <Button>Start Free Trial</Button>
            </Link>
          </nav>
        </div>
      </header>

      {/* Pricing Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Simple, Transparent Pricing</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Choose the plan that fits your arbitrage betting needs. All plans include a 7-day free
            trial.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {SUBSCRIPTION_PLANS.map((plan) => (
            <Card
              key={plan.tier}
              className={`relative ${
                plan.tier === 'PROFESSIONAL' ? 'border-primary shadow-lg scale-105' : ''
              }`}
            >
              {plan.tier === 'PROFESSIONAL' && (
                <Badge className="absolute -top-3 left-1/2 -translate-x-1/2">Most Popular</Badge>
              )}
              <CardHeader className="text-center pb-2">
                <CardTitle className="text-2xl">{plan.name}</CardTitle>
                <CardDescription>{plan.description}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="text-center">
                  <span className="text-4xl font-bold">${plan.priceMonthly}</span>
                  <span className="text-muted-foreground">/month</span>
                  <p className="text-sm text-muted-foreground mt-1">
                    or ${Math.round(plan.priceYearly / 12)}/mo billed annually
                  </p>
                </div>

                <ul className="space-y-3">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2">
                      <Check className="w-5 h-5 text-profit shrink-0 mt-0.5" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>

                <Link href="/register" className="block">
                  <Button
                    className="w-full"
                    variant={plan.tier === 'PROFESSIONAL' ? 'default' : 'outline'}
                  >
                    Start Free Trial
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* FAQ */}
        <div className="mt-20 max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold text-center mb-8">Frequently Asked Questions</h2>
          <div className="space-y-6">
            <FAQItem
              question="What is sports arbitrage betting?"
              answer="Sports arbitrage betting involves placing bets on all possible outcomes of a sporting event across different sportsbooks to guarantee a profit regardless of the result. Price discrepancies between books create these opportunities."
            />
            <FAQItem
              question="How does the 7-day free trial work?"
              answer="Start with full access to your chosen plan for 7 days. No credit card required. If you decide to continue, you'll be prompted to add payment details before the trial ends."
            />
            <FAQItem
              question="What sportsbooks do you cover?"
              answer="We cover 50+ US sportsbooks including DraftKings, FanDuel, BetMGM, Caesars, ESPN BET, and many more. Coverage varies by state based on legal availability."
            />
            <FAQItem
              question="How fast are your odds updates?"
              answer="Our WebSocket-native architecture delivers odds updates in under 3 seconds, making it possible to capture live arbitrage opportunities that competitors miss."
            />
            <FAQItem
              question="Can I cancel anytime?"
              answer="Yes, you can cancel your subscription at any time. You'll continue to have access until the end of your current billing period."
            />
          </div>
        </div>
      </section>
    </div>
  );
}

function FAQItem({ question, answer }: { question: string; answer: string }) {
  return (
    <div className="p-4 rounded-lg border border-border">
      <h3 className="font-semibold mb-2">{question}</h3>
      <p className="text-muted-foreground text-sm">{answer}</p>
    </div>
  );
}
