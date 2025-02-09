'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Search, Star } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import SearchResults from '@/components/SearchResults';
import CryptoCard from '@/components/CryptoCard';
import { searchCryptos } from '@/utils/api';
import type { Crypto, Watchlist } from '@/types/crypto';

export default function Home() {
  // Initialize state with localStorage check
  const [watchlists, setWatchlists] = useState<Watchlist[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('watchlists');
      return saved ? JSON.parse(saved) : [];
    }
    return [];
  });
  const [activeWatchlist, setActiveWatchlist] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<Crypto[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [showResults, setShowResults] = useState(false);

  // Save watchlists to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('watchlists', JSON.stringify(watchlists));
  }, [watchlists]);

  // WebSocket connection for real-time updates
  useEffect(() => {
    if (!activeWatchlist) return;

    const currentWatchlist = watchlists.find(w => w.id === activeWatchlist);
    if (!currentWatchlist?.coins.length) return;

    const ws = new WebSocket('wss://stream.binance.com:9443/ws');

    const subscribe = {
      method: "SUBSCRIBE",
      params: currentWatchlist.coins.map(coin => `${coin.symbol.toLowerCase()}usdt@ticker`),
      id: 1
    };

    ws.onopen = () => {
      ws.send(JSON.stringify(subscribe));
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.e === '24hrTicker') {
        setWatchlists(current =>
          current.map(watchlist => ({
            ...watchlist,
            coins: watchlist.coins.map(coin =>
              coin.symbol.toLowerCase() === data.s.toLowerCase().replace('usdt', '') 
                ? {
                    ...coin,
                    price: parseFloat(data.c).toFixed(2),
                    priceChange: parseFloat(data.P).toFixed(2),
                    volume: parseFloat(data.v).toFixed(2),
                    high: parseFloat(data.h).toFixed(2),
                    low: parseFloat(data.l).toFixed(2)
                  }
                : coin
            )
          }))
        );
      }
    };

    return () => {
      ws.close();
    };
  }, [activeWatchlist, watchlists]);

  // Debounced search function
  const handleSearch = useCallback(async (term: string) => {
    if (term.length < 2) {
      setSearchResults([]);
      return;
    }

    try {
      const results = await searchCryptos(term);
      setSearchResults(results);
      setShowResults(true);
    } catch (error) {
      setError('Error searching cryptocurrencies');
      console.error(error);
    }
  }, []);

  // Debounce search input
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      handleSearch(searchTerm);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchTerm, handleSearch]);

  // Clear error after 5 seconds
  useEffect(() => {
    if (error) {
      const timeoutId = setTimeout(() => {
        setError(null);
      }, 5000);
      return () => clearTimeout(timeoutId);
    }
  }, [error]);

  const createWatchlist = () => {
    const name = prompt('Enter watchlist name:');
    if (name) {
      const newWatchlist: Watchlist = {
        id: Date.now().toString(),
        name,
        coins: []
      };
      setWatchlists(prev => [...prev, newWatchlist]);
      setActiveWatchlist(newWatchlist.id);
    }
  };

  const deleteWatchlist = (id: string) => {
    setWatchlists(prev => prev.filter(w => w.id !== id));
    if (activeWatchlist === id) {
      setActiveWatchlist(null);
    }
  };

  const addToWatchlist = (crypto: Crypto) => {
    if (!activeWatchlist) {
      setError('Please select a watchlist first');
      return;
    }
    
    setWatchlists(prev => prev.map(w => {
      if (w.id === activeWatchlist) {
        if (w.coins.some(c => c.symbol === crypto.symbol)) {
          setError('Crypto already in watchlist');
          return w;
        }
        return { ...w, coins: [...w.coins, crypto] };
      }
      return w;
    }));
    setShowResults(false);
  };

  const removeFromWatchlist = (watchlistId: string, symbol: string) => {
    setWatchlists(prev => prev.map(w => {
      if (w.id === watchlistId) {
        return { ...w, coins: w.coins.filter(c => c.symbol !== symbol) };
      }
      return w;
    }));
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Crypto Watchlist</h1>
          <Button onClick={createWatchlist}>
            <Plus className="h-4 w-4 mr-2" />
            New Watchlist
          </Button>
        </div>

        {/* Error Alert */}
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Watchlists Sidebar */}
          <Card className="md:col-span-1 h-fit">
            <CardHeader>
              <CardTitle>Your Watchlists</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {watchlists.map(watchlist => (
                  <div
                    key={watchlist.id}
                    className={`flex items-center justify-between p-2 rounded-lg cursor-pointer ${
                      activeWatchlist === watchlist.id ? 'bg-blue-50' : 'hover:bg-gray-50'
                    }`}
                    onClick={() => setActiveWatchlist(watchlist.id)}
                  >
                    <span className="flex items-center gap-2">
                      <Star className="h-4 w-4 text-yellow-500" />
                      {watchlist.name}
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (confirm('Are you sure you want to delete this watchlist?')) {
                          deleteWatchlist(watchlist.id);
                        }
                      }}
                    >
                      Delete
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Main Content */}
          <div className="md:col-span-3">
            {/* Search Bar */}
            <div className="mb-6 relative">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Search cryptocurrencies..."
                  className="pl-10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onFocus={() => setShowResults(true)}
                />
              </div>
              {showResults && searchResults.length > 0 && (
                <SearchResults
                  results={searchResults}
                  onAdd={addToWatchlist}
                  onClose={() => setShowResults(false)}
                />
              )}
            </div>

            {/* Watchlist Content */}
            {activeWatchlist ? (
              <div className="space-y-4">
                <h2 className="text-xl font-semibold text-gray-800">
                  {watchlists.find(w => w.id === activeWatchlist)?.name}
                </h2>
                <div className="grid grid-cols-1 gap-4">
                  {watchlists
                    .find(w => w.id === activeWatchlist)
                    ?.coins.map(coin => (
                      <CryptoCard
                        key={coin.symbol}
                        crypto={coin}
                        onRemove={() => removeFromWatchlist(activeWatchlist, coin.symbol)}
                      />
                    ))}
                </div>
              </div>
            ) : (
              <Card>
                <CardContent className="p-8 text-center text-gray-500">
                  Select a watchlist to view details
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}