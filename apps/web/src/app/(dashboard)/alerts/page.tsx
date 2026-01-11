'use client';

export const runtime = 'edge';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Bell, Plus, Trash2, Webhook, MessageCircle } from 'lucide-react';

export default function AlertsPage() {
  const [alerts, setAlerts] = useState([
    {
      id: '1',
      name: 'High Profit Alerts',
      minProfit: 2.0,
      minConfidence: 80,
      channels: ['websocket', 'discord'],
      isActive: true,
    },
    {
      id: '2',
      name: 'NFL Only',
      minProfit: 1.5,
      minConfidence: 70,
      channels: ['websocket'],
      sports: ['football'],
      isActive: true,
    },
  ]);

  const recentAlerts = [
    {
      id: '1',
      event: 'Chiefs @ Ravens - Moneyline',
      profit: 2.8,
      confidence: 92,
      time: new Date(Date.now() - 120000),
    },
    {
      id: '2',
      event: 'Lakers @ Celtics - Spread',
      profit: 1.9,
      confidence: 85,
      time: new Date(Date.now() - 300000),
    },
    {
      id: '3',
      event: 'Yankees @ Red Sox - Total',
      profit: 3.2,
      confidence: 78,
      time: new Date(Date.now() - 600000),
    },
  ];

  const toggleAlert = (id: string) => {
    setAlerts((prev) =>
      prev.map((a) => (a.id === id ? { ...a, isActive: !a.isActive } : a))
    );
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Alerts</h1>
          <p className="text-muted-foreground mt-1">
            Configure real-time notifications for arbitrage opportunities
          </p>
        </div>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          New Alert Rule
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Alert Rules */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-lg font-semibold">Alert Rules</h2>

          {alerts.map((alert) => (
            <Card key={alert.id}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className={`p-2 rounded-lg ${
                        alert.isActive ? 'bg-profit/10 text-profit' : 'bg-muted text-muted-foreground'
                      }`}
                    >
                      <Bell className="w-5 h-5" />
                    </div>
                    <div>
                      <CardTitle className="text-base">{alert.name}</CardTitle>
                      <CardDescription>
                        Min {alert.minProfit}% profit, {alert.minConfidence}+ confidence
                      </CardDescription>
                    </div>
                  </div>
                  <Switch checked={alert.isActive} onCheckedChange={() => toggleAlert(alert.id)} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">Channels:</span>
                  {alert.channels.map((channel) => (
                    <Badge key={channel} variant="secondary">
                      {channel === 'websocket' && 'In-App'}
                      {channel === 'discord' && 'Discord'}
                      {channel === 'telegram' && 'Telegram'}
                    </Badge>
                  ))}
                  {alert.sports && (
                    <>
                      <span className="text-sm text-muted-foreground ml-2">Sports:</span>
                      {alert.sports.map((sport) => (
                        <Badge key={sport} variant="outline">
                          {sport}
                        </Badge>
                      ))}
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}

          {/* Integration Cards */}
          <h2 className="text-lg font-semibold pt-4">Integrations</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-lg bg-[#5865F2]/10">
                    <MessageCircle className="w-6 h-6 text-[#5865F2]" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold">Discord</h3>
                    <p className="text-sm text-muted-foreground">Connected</p>
                  </div>
                  <Badge variant="profit">Active</Badge>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-lg bg-[#0088cc]/10">
                    <Webhook className="w-6 h-6 text-[#0088cc]" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold">Telegram</h3>
                    <p className="text-sm text-muted-foreground">Not connected</p>
                  </div>
                  <Button size="sm" variant="outline">
                    Connect
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Recent Alerts */}
        <div>
          <h2 className="text-lg font-semibold mb-4">Recent Alerts</h2>
          <Card>
            <CardContent className="p-0">
              <div className="divide-y">
                {recentAlerts.map((alert) => (
                  <div key={alert.id} className="p-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-medium text-sm">{alert.event}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="profit" className="text-xs">
                            +{alert.profit}%
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            Conf: {alert.confidence}
                          </span>
                        </div>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {Math.round((Date.now() - alert.time.getTime()) / 60000)}m ago
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
