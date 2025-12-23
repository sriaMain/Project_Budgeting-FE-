import React, { useState, useEffect } from 'react';
import { Plus, SlidersHorizontal, ChevronDown, ChevronUp } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { DragDropContext, Droppable, type DropResult } from '@hello-pangea/dnd';
import { Layout } from '../components/Layout';
import { PipelineStatistics } from '../components/PipelineStatistics';
import { PipelineStage } from '../components/PipelineStage';
import { QuoteCard } from '../components/QuoteCard';
import type { PipelineData, Quote, PipelineStage as StageType } from '../types/pipeline.types';
import axiosInstance from '../utils/axiosInstance';
import { toast } from 'react-hot-toast';
import { parseApiErrors } from '../utils/parseApiErrors';

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
  const navigate = useNavigate();
  const [pipelineData, setPipelineData] = useState<PipelineData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedStages, setExpandedStages] = useState<Set<string>>(new Set());

  useEffect(() => {
    loadPipelineData();
  }, []);

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
      setError('Failed to load pipeline data. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuoteClick = (quote: Quote) => {
    navigate(`/pipeline/quote/${quote.quote_no}`);
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
      if (newSet.has(stageName)) newSet.delete(stageName);
      else newSet.add(stageName);
      return newSet;
    });
  };

  const onDragEnd = async (result: DropResult) => {
    const { destination, source, draggableId } = result;

    // If no destination or dropped in same place, do nothing
    if (!destination || (destination.droppableId === source.droppableId && destination.index === source.index)) {
      return;
    }

    if (!pipelineData) return;

    const sourceStageId = source.droppableId as StageType;
    const destStageId = destination.droppableId as StageType;

    // Find the quote being moved
    const sourceStage = pipelineData.stages.find(s => s.stage === sourceStageId);
    const destStage = pipelineData.stages.find(s => s.stage === destStageId);

    if (!sourceStage || !destStage) return;

    const movedQuote = sourceStage.quotes.find(q => q.quote_no.toString() === draggableId);
    if (!movedQuote) return;

    // Optimistically update UI
    let newStages = [...pipelineData.stages];

    if (sourceStageId === destStageId) {
      // Reordering within the same stage
      newStages = newStages.map(stage => {
        if (stage.stage === sourceStageId) {
          const newQuotes = Array.from(stage.quotes);
          const [removed] = newQuotes.splice(source.index, 1);
          newQuotes.splice(destination.index, 0, removed);
          return { ...stage, quotes: newQuotes };
        }
        return stage;
      });
    } else {
      // Moving between different stages
      newStages = newStages.map(stage => {
        if (stage.stage === sourceStageId) {
          const newQuotes = Array.from(stage.quotes);
          newQuotes.splice(source.index, 1);
          return {
            ...stage,
            quotes: newQuotes,
            count: stage.count - 1,
            total_sum: stage.total_sum - parseFloat(movedQuote.quote_value)
          };
        }
        if (stage.stage === destStageId) {
          const newQuotes = Array.from(stage.quotes);
          const updatedQuote = { ...movedQuote, status: destStage.title };
          newQuotes.splice(destination.index, 0, updatedQuote);
          return {
            ...stage,
            quotes: newQuotes,
            count: stage.count + 1,
            total_sum: stage.total_sum + parseFloat(movedQuote.quote_value)
          };
        }
        return stage;
      });
    }

    const oldData = { ...pipelineData };
    setPipelineData({ ...pipelineData, stages: newStages });

    if (sourceStageId !== destStageId) {
      try {
        // API call to update status
        const response = await axiosInstance.put(`/quotes/${movedQuote.quote_no}/`, {
          status: destStage.title
        });

        if (response.status !== 200 && response.status !== 204) {
          throw new Error('Failed to update quote status');
        }

        toast.success(`Quote #${movedQuote.quote_no} moved to ${destStage.title}`);
      } catch (err) {
        console.error('Failed to update quote status:', err);
        const apiErrors = parseApiErrors(err);
        toast.error(apiErrors.general || 'Failed to move quote. Reverting changes.');
        setPipelineData(oldData);
      }
    }
  };

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

        {/* Desktop View - Board with Drag and Drop */}
        <div className="hidden md:block overflow-x-auto pb-4">
          <DragDropContext onDragEnd={onDragEnd}>
            <div className="flex gap-4 min-w-max">
              {pipelineData.stages.map(stage => (
                <PipelineStage
                  key={stage.stage}
                  stage={stage}
                  onQuoteClick={handleQuoteClick}
                />
              ))}
            </div>
          </DragDropContext>
        </div>

        {/* Mobile View */}
        <div className="md:hidden space-y-3">
          {pipelineData.stages.map(stage => {
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
                  <Droppable droppableId={`mobile-${stage.stage}`} isDropDisabled={true}>
                    {(provided) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                        className={`${colorClass} p-3 space-y-3 border-t border-gray-300`}
                      >
                        {stage.quotes.length > 0 ? (
                          stage.quotes.map((quote, index) => (
                            <QuoteCard
                              key={quote.quote_no}
                              quote={quote}
                              index={index}
                              onClick={handleQuoteClick}
                            />
                          ))
                        ) : (
                          <div className="text-center text-gray-400 text-sm py-8">
                            No quotes in this stage
                          </div>
                        )}
                        {provided.placeholder}
                      </div>
                    )}
                  </Droppable>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </Layout>
  );
}
