/**
 * Pipeline Screen
 * Main component for opportunity/quote pipeline management
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, SlidersHorizontal, ChevronDown, ChevronUp } from 'lucide-react';

import { Layout } from '../components/Layout';
import { PipelineStatistics } from '../components/PipelineStatistics';
import { PipelineStage } from '../components/PipelineStage';
import { QuoteCard } from '../components/QuoteCard';

import type { PipelineData, Quote, StageColumn } from '../types/pipeline.types';
import axiosInstance from '../utils/axiosInstance';

interface PipelineScreenProps {
  userRole?: 'admin' | 'user';
  currentPage?: string;
  onNavigate?: (page: string) => void;
}

const STAGE_COLORS = {
  oppurtunity: 'bg-gray-50 border-gray-200',
  scoping: 'bg-blue-50 border-blue-200',
  proposal: 'bg-yellow-50 border-yellow-200',
  confirmed: 'bg-green-50 border-green-200'
};

export default function PipelineScreen({
  userRole = 'admin',
  currentPage = 'pipeline',
  onNavigate = () => { }
}: PipelineScreenProps) {
  // -- Hooks & State --
  const navigate = useNavigate();
  const [pipelineData, setPipelineData] = useState<PipelineData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedStages, setExpandedStages] = useState<Set<string>>(new Set());
  const [draggingQuote, setDraggingQuote] = useState<{ quote_no: number; fromStage: string } | null>(null);

  // -- Effects --
  useEffect(() => {
    loadPipelineData();
  }, []);

  // -- Data Fetching --
  const loadPipelineData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await axiosInstance.get('/pipeline-data/');

      if (response.status === 200 && response.data) {
        setPipelineData(response.data);
      } else {
        throw new Error('Invalid response from server');
      }
    } catch (err: any) {
      console.error('Failed to load pipeline data:', err);

      // User-friendly error messages
      if (err.response?.status === 404) {
        setError('Pipeline data not found. Please contact support.');
      } else if (err.response?.status === 500) {
        setError('Server error. Please try again later.');
      } else if (err.code === 'ERR_NETWORK') {
        setError('Network error. Please check your connection.');
      } else {
        setError('Failed to load pipeline data. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // -- Event Handlers --
  const handleQuoteClick = (quote: Quote) => {
    navigate(`/pipeline/quote/${quote.quote_no}`);
  };

  const handleQuoteDragStart = (quote: Quote, fromStage: string, e: React.DragEvent) => {
    try {
      const payload = { quote_no: quote.quote_no, fromStage };
      e.dataTransfer.setData('application/json', JSON.stringify(payload));
      e.dataTransfer.effectAllowed = 'move';
      setDraggingQuote(payload);
    } catch (err) {
      console.error('Drag start error', err);
    }
  };

  const handleQuoteDrop = async (toStage: string, e: React.DragEvent) => {
    e.preventDefault();
    try {
      const raw = e.dataTransfer.getData('application/json');
      if (!raw) return;

      const { quote_no, fromStage } = JSON.parse(raw);

      // Don't do anything if dropped in the same stage
      if (!quote_no || fromStage === toStage) return;

      // Optimistic UI update: Update local state immediately for better UX
      setPipelineData((prev) => {
        if (!prev) return prev;

        // Deep copy stages to avoid mutation issues
        const newData = {
          ...prev,
          stages: prev.stages.map(s => ({ ...s, quotes: [...s.quotes] }))
        } as PipelineData;

        const fromCol = newData.stages.find(s => s.stage === fromStage);
        const toCol = newData.stages.find(s => s.stage === toStage);

        if (!fromCol || !toCol) return prev;

        const quoteIndex = fromCol.quotes.findIndex(q => q.quote_no === quote_no);
        if (quoteIndex === -1) return prev;

        // Move the quote
        const [moved] = fromCol.quotes.splice(quoteIndex, 1);
        // Update the status of the moved quote in the local state to match the new column
        // Note: Backend might return capitalized status, but we use the stage key for logic
        moved.status = toStage;
        toCol.quotes.unshift(moved);

        // Recompute counts and totals
        fromCol.count = fromCol.quotes.length;
        toCol.count = toCol.quotes.length;

        const calculateTotal = (quotes: Quote[]) =>
          quotes.reduce((sum, q) => sum + (parseFloat(q.quote_value) || 0), 0);

        fromCol.total_sum = calculateTotal(fromCol.quotes);
        toCol.total_sum = calculateTotal(toCol.quotes);

        return newData;
      });

      // Fetch full quote details to construct PUT payload
      const { data: quoteDetails } = await axiosInstance.get(`/quotes/${quote_no}/`);

      // Prepare payload for PUT request
      // Requirement: 'client' field must be the client ID
      // Requirement: 'status' field must be the new stage value
      const payload = {
        quote_name: quoteDetails.quote_name,
        date_of_issue: quoteDetails.date_of_issue.split('T')[0],
        due_date: quoteDetails.due_date.split('T')[0],
        // Ensure we send the ID for client
        client: typeof quoteDetails.client === 'object' ? quoteDetails.client.id : quoteDetails.client,
        status: quoteDetails.status, // Send the new stage as status
        tax_percentage: quoteDetails.tax_percentage,
        poc: quoteDetails.poc?.id || (typeof quoteDetails.poc === 'object' ? quoteDetails.poc.id : quoteDetails.poc) || null,
        items: quoteDetails.items.map((item: any) => ({
          id: item.id,
          // Ensure we send the ID for product_service
          product_service: typeof item.product_service === 'object' ? item.product_service.id : item.product_service,
          description: item.description || '',
          quantity: item.quantity,
          unit: item.unit,
          price_per_unit: item.price_per_unit
        }))
      };

      // Send update to server using PUT
      await axiosInstance.put(`/quotes/${quote_no}/`, payload);
      setDraggingQuote(null);

    } catch (err) {
      console.error('Failed to move quote:', err);
      // On error, reload pipeline to ensure UI matches server state
      await loadPipelineData();
    }
  };

  const handleNewQuote = () => {
    navigate('/pipeline/add-quote');
  };

  const handleFilterClick = () => {
    console.log('Open filters');
  };

  const toggleStage = (stageName: string) => {
    setExpandedStages(prev => {
      const newSet = new Set(prev);
      if (newSet.has(stageName)) {
        newSet.delete(stageName);
      } else {
        newSet.add(stageName);
      }
      return newSet;
    });
  };

  // -- Render Helpers --
  if (isLoading) {
    return (
      <Layout userRole={userRole} currentPage={currentPage} onNavigate={onNavigate}>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout userRole={userRole} currentPage={currentPage} onNavigate={onNavigate}>
        <div className="flex flex-col items-center justify-center min-h-[400px]">
          <div className="text-red-600 mb-4">{error}</div>
          <button
            onClick={loadPipelineData}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </Layout>
    );
  }

  if (!pipelineData) {
    return null;
  }

  // -- Main Render --
  return (
    <Layout userRole={userRole} currentPage={currentPage} onNavigate={onNavigate}>
      <div className="space-y-4 sm:space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Pipeline</h1>

          <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto">
            <button
              onClick={handleFilterClick}
              className="flex items-center gap-2 px-3 sm:px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-gray-700 font-medium text-sm sm:text-base"
            >
              <span>Filter</span>
              <SlidersHorizontal size={18} className="sm:w-5 sm:h-5" />
            </button>

            <button
              onClick={handleNewQuote}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 sm:px-5 py-2 rounded-lg font-semibold transition-colors shadow-md hover:shadow-lg text-sm sm:text-base flex-1 sm:flex-initial justify-center"
            >
              <Plus size={18} className="sm:w-5 sm:h-5" />
              <span>New</span>
            </button>
          </div>
        </div>

        {/* Statistics */}
        <PipelineStatistics stats={pipelineData.stats} />

        {/* Desktop View - Pipeline Stages (Horizontal Scroll) */}
        <div className="hidden md:block overflow-x-auto pb-4">
          <div className="flex gap-4 min-w-max">
            {pipelineData.stages.map((stage) => (
              <PipelineStage
                key={stage.stage}
                stage={stage}
                onQuoteClick={handleQuoteClick}
                onQuoteDragStart={handleQuoteDragStart}
                onQuoteDrop={handleQuoteDrop}
              />
            ))}
          </div>
        </div>

        {/* Mobile View - Accordion Style */}
        <div className="md:hidden space-y-3">
          {pipelineData.stages.map((stage) => {
            const isExpanded = expandedStages.has(stage.stage);
            const colorClass = STAGE_COLORS[stage.stage] || 'bg-gray-50 border-gray-200';

            return (
              <div key={stage.stage} className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm">
                {/* Accordion Header */}
                <button
                  onClick={() => toggleStage(stage.stage)}
                  className={`w-full ${colorClass} p-4 flex items-center justify-between transition-colors hover:opacity-90`}
                >
                  <div className="flex-1 text-left">
                    <h3 className="font-bold text-gray-900 text-base mb-1">{stage.title}</h3>
                    <div className="flex items-baseline gap-2 text-xs text-gray-600">
                      <span className="font-semibold">{stage.count} quotes</span>
                      <span>
                        ₹{stage.total_sum.toLocaleString('en-IN', {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2
                        })}
                      </span>
                    </div>
                  </div>

                  {/* Chevron Icon */}
                  <div className="ml-3">
                    {isExpanded ? (
                      <ChevronUp size={20} className="text-gray-600" />
                    ) : (
                      <ChevronDown size={20} className="text-gray-600" />
                    )}
                  </div>
                </button>

                {/* Accordion Content */}
                {isExpanded && (
                  <div
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => handleQuoteDrop(stage.stage, e)}
                    className={`${colorClass} p-3 space-y-3 border-t border-gray-300`}
                  >
                    {stage.quotes.length > 0 ? (
                      stage.quotes.map((quote) => (
                        <div
                          key={quote.quote_no}
                          draggable
                          onDragStart={(e) => handleQuoteDragStart(quote, stage.stage, e)}
                        >
                          <QuoteCard quote={quote} onClick={handleQuoteClick} />
                        </div>
                      ))
                    ) : (
                      <div className="text-center text-gray-400 text-sm py-8">
                        No quotes in this stage
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </Layout>
  );
}
