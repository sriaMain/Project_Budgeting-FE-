/**
 * Pipeline API Service
 * Handles all API calls related to pipeline/opportunity management
 */

import axiosInstance from "../utils/axiosInstance";
import type { 
  PipelineData, 
  Quote, 
  QuoteFormData, 
  PipelineFilters 
} from "../types/pipeline.types";

/**
 * Fetch all pipeline data with optional filters
 */
export const fetchPipelineData = async (filters?: PipelineFilters): Promise<PipelineData> => {
  try {
    const response = await axiosInstance.get("/pipeline/", { params: filters });
    return response.data;
  } catch (error) {
    console.error("Failed to fetch pipeline data:", error);
    throw error;
  }
};

/**
 * Fetch a single quote by ID
 */
export const fetchQuoteById = async (quoteId: number): Promise<Quote> => {
  try {
    const response = await axiosInstance.get(`/pipeline/quotes/${quoteId}/`);
    return response.data;
  } catch (error) {
    console.error(`Failed to fetch quote ${quoteId}:`, error);
    throw error;
  }
};

/**
 * Create a new quote
 */
export const createQuote = async (quoteData: QuoteFormData): Promise<Quote> => {
  try {
    const response = await axiosInstance.post("/pipeline/quotes/", quoteData);
    return response.data;
  } catch (error) {
    console.error("Failed to create quote:", error);
    throw error;
  }
};

/**
 * Update an existing quote
 */
export const updateQuote = async (quoteId: number, quoteData: Partial<QuoteFormData>): Promise<Quote> => {
  try {
    const response = await axiosInstance.put(`/pipeline/quotes/${quoteId}/`, quoteData);
    return response.data;
  } catch (error) {
    console.error(`Failed to update quote ${quoteId}:`, error);
    throw error;
  }
};

/**
 * Delete a quote
 */
export const deleteQuote = async (quoteId: number): Promise<void> => {
  try {
    await axiosInstance.delete(`/pipeline/quotes/${quoteId}/`);
  } catch (error) {
    console.error(`Failed to delete quote ${quoteId}:`, error);
    throw error;
  }
};

/**
 * Update quote stage (for drag-and-drop)
 */
export const updateQuoteStage = async (quoteId: number, newStage: string): Promise<Quote> => {
  try {
    const response = await axiosInstance.patch(`/pipeline/quotes/${quoteId}/stage/`, {
      stage: newStage
    });
    return response.data;
  } catch (error) {
    console.error(`Failed to update quote stage:`, error);
    throw error;
  }
};
