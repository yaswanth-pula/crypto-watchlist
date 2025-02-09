import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Trash2, TrendingUp, TrendingDown } from 'lucide-react';
import { formatPrice, formatVolume } from '@/utils/api';
import type { Crypto } from '@/types/crypto';

interface CryptoCardProps {
  crypto: Crypto;
  onRemove: () => void;
}

const CryptoCard: React.FC<CryptoCardProps> = ({ crypto, onRemove }) => (
  <Card className="hover:shadow-md transition-shadow">
    <CardContent className="p-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-bold">{crypto.name}</h3>
          <p className="text-sm text-gray-500">{crypto.symbol}</p>
        </div>
        <Button variant="ghost" size="icon" onClick={onRemove}>
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
      <div className="mt-4 grid grid-cols-2 gap-4">
        <div>
          <p className="text-sm text-gray-500">Price</p>
          <p className="font-medium">{formatPrice(crypto.price)}</p>
        </div>
        <div>
          <p className="text-sm text-gray-500">24h Change</p>
          <p className={`font-medium flex items-center ${Number(crypto.priceChange) >= 0 ? 'text-green-500' : 'text-red-500'}`}>
            {Number(crypto.priceChange) >= 0 ? <TrendingUp className="h-4 w-4 mr-1" /> : <TrendingDown className="h-4 w-4 mr-1" />}
            {crypto.priceChange}%
          </p>
        </div>
        <div>
          <p className="text-sm text-gray-500">24h Volume</p>
          <p className="font-medium">{formatVolume(crypto.volume)}</p>
        </div>
        <div>
          <p className="text-sm text-gray-500">24h High/Low</p>
          <p className="font-medium">{formatPrice(crypto.high)} / {formatPrice(crypto.low)}</p>
        </div>
      </div>
    </CardContent>
  </Card>
);

export default CryptoCard;