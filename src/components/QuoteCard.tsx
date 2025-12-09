/**
 * Quote Card Component
 * Displays individual quote information within pipeline stages
 */

import React from 'react';
import { Building2 } from 'lucide-react';
import type { Quote } from '../types/pipeline.types';

interface QuoteCardProps {
  quote: Quote;
  onClick?: (quote: Quote) => void;
}

export const QuoteCard: React.FC<QuoteCardProps> = ({ quote, onClick }) => {
  return (
    <div
      onClick={() => onClick?.(quote)}
      className="bg-white rounded-lg p-4 shadow-sm border border-gray-200 hover:shadow-md transition-shadow cursor-pointer"
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <Building2 className="w-4 h-4 text-gray-400" />
          <span className="font-semibold text-gray-900 text-sm">{quote.client_name}</span>
        </div>
        <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
          {quote.id}d
        </span>
      </div>

      {/* Metrics */}
      <div className="space-y-1.5 text-xs text-gray-600 mb-3">
        <div className="flex justify-between">
          <span>Margin %:</span>
          <span className="font-semibold text-gray-900">{quote.margin_percentage.toFixed(2)} %</span>
        </div>
        <div className="flex justify-between">
          <span>Probability:</span>
          <span className="font-semibold text-gray-900">{quote.probability.toFixed(2)}</span>
        </div>
      </div>

      {/* Value */}
      <div className="pt-3 border-t border-gray-100 flex items-center justify-between">
        <span className="text-xs text-gray-500">{quote.id}d</span>
        <span className="font-bold text-gray-900">
          {quote.quote_value.toLocaleString('en-IN', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
          })}
        </span>
      </div>
    </div>
  );
};
