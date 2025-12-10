/**
 * Pipeline Dummy Data
 * Mock data for development and testing
 */

import type { PipelineData, Quote } from "../types/pipeline.types";

export const DUMMY_QUOTES: Quote[] = [
  // Opportunity Stage
  {
    id: 1,
    client_id: 1,
    client_name: "Client A",
    margin_percentage: 41.14,
    probability: 20.0,
    quote_value: 7170.0,
    stage: "opportunity"
  },
  {
    id: 2,
    client_id: 1,
    client_name: "Client A",
    margin_percentage: 41.14,
    probability: 20.0,
    quote_value: 7170.0,
    stage: "opportunity"
  },
  // Scoping Stage
  {
    id: 3,
    client_id: 1,
    client_name: "Client A",
    margin_percentage: 41.14,
    probability: 20.0,
    quote_value: 7170.0,
    stage: "scoping"
  },
  {
    id: 4,
    client_id: 1,
    client_name: "Client A",
    margin_percentage: 41.14,
    probability: 20.0,
    quote_value: 7170.0,
    stage: "scoping"
  },
  {
    id: 5,
    client_id: 1,
    client_name: "Client A",
    margin_percentage: 41.14,
    probability: 20.0,
    quote_value: 7170.0,
    stage: "scoping"
  },
  {
    id: 6,
    client_id: 1,
    client_name: "Client A",
    margin_percentage: 41.14,
    probability: 20.0,
    quote_value: 7170.0,
    stage: "scoping"
  },
  // Proposal Stage
  {
    id: 7,
    client_id: 1,
    client_name: "Client A",
    margin_percentage: 41.14,
    probability: 20.0,
    quote_value: 7170.0,
    stage: "proposal"
    
  },
  // Confirmed Stage
  {
    id: 8,
    client_id: 1,
    client_name: "Client A",
    margin_percentage: 41.14,
    probability: 20.0,
    quote_value: 81170.0,
    stage: "confirmed"
  },
  {
    id: 9,
    client_id: 1,
    client_name: "Client A",
    margin_percentage: 41.14,
    probability: 20.0,
    quote_value: 7170.0,
    stage: "confirmed"
  },
  {
    id: 10,
    client_id: 1,
    client_name: "Client A",
    margin_percentage: 41.14,
    probability: 20.0,
    quote_value: 7170.0,
    stage: "confirmed"
  },
  {
    id: 11,
    client_id: 1,
    client_name: "Client A",
    margin_percentage: 41.14,
    probability: 20.0,
    quote_value: 7170.0,
    stage: "confirmed"
  }
];

export const DUMMY_PIPELINE_DATA: PipelineData = {
  stats: {
    total_quotes: 20,
    average_quote: 36500.55,
    total_sum: 2122000.0,
    total_margin: 1072000.0
  },
  stages: [
    {
      stage: "opportunity",
      title: "Opportunity",
      count: 2,
      total_sum: 57170.0,
      quotes: DUMMY_QUOTES.filter(q => q.stage === "opportunity")
    },
    {
      stage: "scoping",
      title: "Scoping",
      count: 4,
      total_sum: 41520.0,
      quotes: DUMMY_QUOTES.filter(q => q.stage === "scoping")
    },
    {
      stage: "proposal",
      title: "Proposal",
      count: 1,
      total_sum: 33170.0,
      quotes: DUMMY_QUOTES.filter(q => q.stage === "proposal")
    },
    {
      stage: "confirmed",
      title: "Confirmed",
      count: 4,
      total_sum: 81170.0,
      quotes: DUMMY_QUOTES.filter(q => q.stage === "confirmed")
    }
  ]
};

/**
 * Simulate API call with dummy data
 */
export const fetchDummyPipelineData = async (): Promise<PipelineData> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(DUMMY_PIPELINE_DATA);
    }, 500);
  });
};
