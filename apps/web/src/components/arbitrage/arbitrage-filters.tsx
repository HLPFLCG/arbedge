'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Filter, RefreshCw, X } from 'lucide-react';
import { SPORTS } from '@arbedge/shared';
import { SPORTSBOOKS } from '@arbedge/shared';

export function ArbitrageFilters() {
  const [minProfit, setMinProfit] = useState('');
  const [selectedSports, setSelectedSports] = useState<string[]>([]);
  const [selectedBooks, setSelectedBooks] = useState<string[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => setIsRefreshing(false), 1000);
  };

  const toggleSport = (sportId: string) => {
    setSelectedSports((prev) =>
      prev.includes(sportId) ? prev.filter((s) => s !== sportId) : [...prev, sportId]
    );
  };

  const toggleBook = (bookId: string) => {
    setSelectedBooks((prev) =>
      prev.includes(bookId) ? prev.filter((b) => b !== bookId) : [...prev, bookId]
    );
  };

  const clearFilters = () => {
    setMinProfit('');
    setSelectedSports([]);
    setSelectedBooks([]);
  };

  const hasFilters = minProfit || selectedSports.length > 0 || selectedBooks.length > 0;

  return (
    <div className="space-y-4">
      {/* Top Row - Main Controls */}
      <div className="flex items-center gap-4 flex-wrap">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm font-medium">Filters</span>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Min Profit:</span>
          <Input
            type="number"
            placeholder="0.5"
            value={minProfit}
            onChange={(e) => setMinProfit(e.target.value)}
            className="w-20 h-8"
            step="0.1"
            min="0"
          />
          <span className="text-sm text-muted-foreground">%</span>
        </div>

        <div className="flex-1" />

        {hasFilters && (
          <Button variant="ghost" size="sm" onClick={clearFilters}>
            <X className="w-4 h-4 mr-1" />
            Clear
          </Button>
        )}

        <Button
          variant="outline"
          size="sm"
          onClick={handleRefresh}
          disabled={isRefreshing}
        >
          <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Sports Filter */}
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-sm text-muted-foreground min-w-16">Sports:</span>
        {SPORTS.filter((s) => s.isActive).map((sport) => (
          <Badge
            key={sport.id}
            variant={selectedSports.includes(sport.id) ? 'default' : 'outline'}
            className="cursor-pointer"
            onClick={() => toggleSport(sport.id)}
          >
            {sport.name}
          </Badge>
        ))}
      </div>

      {/* Sportsbooks Filter */}
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-sm text-muted-foreground min-w-16">Books:</span>
        {SPORTSBOOKS.map((book) => (
          <Badge
            key={book.id}
            variant={selectedBooks.includes(book.id) ? 'default' : 'outline'}
            className="cursor-pointer"
            onClick={() => toggleBook(book.id)}
          >
            {book.name}
          </Badge>
        ))}
      </div>
    </div>
  );
}
