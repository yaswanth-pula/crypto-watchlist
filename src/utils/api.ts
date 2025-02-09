import axios from 'axios';
import type { Crypto, Binance24hrTicker } from '../types/crypto';

const BINANCE_API_BASE = 'https://api.binance.com/api/v3';

export const searchCryptos = async (term: string): Promise<Crypto[]> => {
  try {
    const response = await axios.get<Binance24hrTicker[]>(`${BINANCE_API_BASE}/ticker/24hr`);
    
    return response.data
      .filter((pair: Binance24hrTicker) => {
        const symbol = pair.symbol.toLowerCase();
        return symbol.endsWith('usdt') && 
               symbol.includes(term.toLowerCase()) &&
               !symbol.includes('up') && 
               !symbol.includes('down'); // Filter out leveraged tokens
    })
      .map((pair: Binance24hrTicker) => ({
        symbol: pair.symbol.replace('USDT', ''),
        name: pair.symbol.replace('USDT', ''),
        price: parseFloat(pair.lastPrice).toFixed(2),
        priceChange: parseFloat(pair.priceChangePercent).toFixed(2),
        volume: parseFloat(pair.volume).toFixed(2),
        high: parseFloat(pair.highPrice).toFixed(2),
        low: parseFloat(pair.lowPrice).toFixed(2)
      }))
      .slice(0, 10);
  } catch (error) {
    console.error('Error fetching crypto data:', error);
    throw error;
  }
};

export const formatPrice = (price: string | number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(Number(price));
};

export const formatVolume = (volume: string | number): string => {
  return new Intl.NumberFormat('en-US', {
    notation: 'compact',
    maximumFractionDigits: 2
  }).format(Number(volume));
};