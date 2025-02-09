export interface Crypto {
    symbol: string;
    name: string;
    price: string;
    priceChange: string;
    volume: string;
    high: string;
    low: string;
  }
  
  export interface Watchlist {
    id: string;
    name: string;
    coins: Crypto[];
  }

  export interface Binance24hrTicker {
    symbol: string;
    lastPrice: string;
    priceChangePercent: string;
    volume: string;
    highPrice: string;
    lowPrice: string;
    quoteVolume: string;
  }