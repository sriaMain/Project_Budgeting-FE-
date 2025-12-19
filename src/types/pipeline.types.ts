/**
 * Pipeline Module Types
 * Defines all interfaces and types for the pipeline/opportunity management system
 */

export type PipelineStage = 'oppurtunity' | 'scoping' | 'proposal' | 'confirmed';

export interface Quote {
  quote_no: number;
  client_id: number;
  client_name: string;
  quote_name: string;
  date_of_issue: string;
  quote_value: string;
  status: string;
}

export interface StageColumn {
  stage: PipelineStage;
  title: string;
  count: number;
  total_sum: number;
  quotes: Quote[];
}

export interface PipelineStats {
  total_quotes: number;
  average_quote: number;
  total_sum: number;
  total_margin: number;
}

export interface PipelineData {
  stats: PipelineStats;
  stages: StageColumn[];
}

export interface QuoteFormData {
  client_id: number;
  client_name: string;
  margin_percentage: number;
  probability: number;
  quote_value: number;
  stage: PipelineStage;
}

export interface PipelineFilters {
  search?: string;
  client_id?: number;
  stage?: PipelineStage;
  min_value?: number;
  max_value?: number;
}

// Quote Details Types
export interface QuoteItem {
  product_group: string;
  product_name: string;
  quantity: number;
  unit: string;
  price_per_unit: string;
  amount: string;
  cost: string;
  po_number: string | null;
  bill_number: string | null;
}

export interface QuoteClient {
  id: number;
  company_name: string;
  street_address: string;
  city: string;
  state: string;
  country: string;
}

export interface QuoteDetails {
  quote_no: number;
  quote_name: string;
  date_of_issue: string;
  due_date: string;
  status: string;
  author: string;
  client: QuoteClient;
  sub_total: string;
  tax_percentage: string;
  total_amount: string;
  total_cost: string;
  in_house_cost: string;
  outsourced_cost: string;
  invoiced_sum: string;
  to_be_invoiced_sum: string;
  items: QuoteItem[];
}
