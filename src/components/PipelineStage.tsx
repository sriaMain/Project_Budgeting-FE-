/**
 * Pipeline Stage Column Component
 * Displays a single stage with its quotes in the pipeline
 */

import React from 'react';
import { QuoteCard } from './QuoteCard';
import type { StageColumn, Quote } from '../types/pipeline.types';

interface PipelineStageProps {
  stage: StageColumn;
  onQuoteClick?: (quote: Quote) => void;
  onQuoteDragStart?: (quote: Quote, fromStage: string, e: React.DragEvent) => void;
  onQuoteDrop?: (toStage: string, e: React.DragEvent) => void;
}

const STAGE_COLORS = {
  oppurtunity: 'bg-gray-50 border-gray-200',
  scoping: 'bg-blue-50 border-blue-200',
  proposal: 'bg-yellow-50 border-yellow-200',
  confirmed: 'bg-green-50 border-green-200'
};

export const PipelineStage: React.FC<PipelineStageProps> = ({ stage, onQuoteClick, onQuoteDragStart, onQuoteDrop }) => {
  const colorClass = STAGE_COLORS[stage.stage] || 'bg-gray-50 border-gray-200';

  return (
    <div className="flex-1 min-w-[280px]">
      {/* Stage Header */}
      <div className={`${colorClass} rounded-t-lg border-2 border-b-0 p-4`}>
        <h3 className="font-bold text-gray-900 text-sm mb-1">{stage.title}</h3>
        <div className="flex items-baseline gap-2 text-xs text-gray-600">
          <span className="font-semibold">{stage.count} quotes</span>
          <span>
            ₹{stage.total_sum.toLocaleString('en-IN', {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2
            })} (Total sum)
          </span>
        </div>
      </div>

      {/* Quotes List */}
      <div
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => onQuoteDrop?.(stage.stage, e)}
        className={`${colorClass} rounded-b-lg border-2 border-t-0 p-3 min-h-[400px] max-h-[calc(100vh-350px)] overflow-y-auto space-y-3`}
      >
        {stage.quotes.length > 0 ? (
          stage.quotes.map((quote) => (
            <div
              key={quote.quote_no}
              draggable
              onDragStart={(e) => onQuoteDragStart?.(quote, stage.stage, e)}
            >
              <QuoteCard quote={quote} onClick={onQuoteClick} />
            </div>
          ))
        ) : (
          <div className="text-center text-gray-400 text-sm py-8">
            No quotes in this stage
          </div>
        )}
      </div>
    </div>
  );
};
