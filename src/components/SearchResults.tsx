import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { formatPrice } from '@/utils/api';
import type { Crypto } from '@/types/crypto';

interface SearchResultsProps {
  results: Crypto[];
  onAdd: (crypto: Crypto) => void;
  onClose: () => void;
}

const SearchResults: React.FC<SearchResultsProps> = ({ results, onAdd, onClose }) => (
  <Card className="absolute w-full mt-1 z-50">
    <CardContent className="p-2">
      {results.map(crypto => (
        <div
          key={crypto.symbol}
          className="flex items-center justify-between p-3 hover:bg-gray-100 cursor-pointer rounded-lg"
          onClick={() => {
            onAdd(crypto);
            onClose();
          }}
        >
          <div>
            <div className="font-medium">{crypto.name}</div>
            <div className="text-sm text-gray-500">{crypto.symbol}</div>
          </div>
          <div className="text-right">
            <div>{formatPrice(crypto.price)}</div>
            <div className={`text-sm ${Number(crypto.priceChange) >= 0 ? 'text-green-500' : 'text-red-500'}`}>
              {crypto.priceChange}%
            </div>
          </div>
        </div>
      ))}
    </CardContent>
  </Card>
);

export default SearchResults;