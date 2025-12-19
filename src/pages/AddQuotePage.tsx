/**
 * Add Quote Page
 * Full page for creating and editing quotes/opportunities in the pipeline
 */

import React, { useState, useEffect } from 'react';
import { ArrowLeft, Plus, Trash2, GripVertical, ChevronDown, AlertCircle } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Layout } from '../components/Layout';
import { AddClientModal } from '../components/AddClientModal';
import ModulesTab from '../components/ModulesTab';
import type { Quote, QuoteFormData, PipelineStage } from '../types/pipeline.types';
import axiosInstance from '../utils/axiosInstance';
import { parseApiErrors } from '../utils/parseApiErrors';

interface ProductRow {
  id: string;
  group: string;
  product: string;
  description: string;
  quantity: number;
  unit: string;
  unit_price: number;
  amount: number;
  apiId?: number;
}

interface POC {
  id: number;
  company_name: string;
  poc_name: string;
  designation: string;
  poc_mobile: string;
  poc_email: string;
}

interface Client {
  id: number;
  company_name: string;
  mobile_number: string;
  email: string;
  gstin: string;
  street_address: string;
  city: string;
  postal_code: string;
  municipality: string;
  state: string;
  country: string;
  tags: any[];
  created_at: string;
  updated_at: string;
  pocs: POC[];
}

interface Module {
  module_id: number;
  module_name: string;
  description: string;
  is_active: boolean;
}

interface ProductGroup {
  group_id: number;
  group_name: string;
  description: string;
  modules: Module[];
}

interface Service {
  id: string;
  product_service_name: string;
  description: string;
  product_group: string;
}

interface StatusChoice {
  value: string;
  label: string;
}

interface UnitChoice {
  value: string;
  label: string;
}

export default function AddQuotePage() {
  const navigate = useNavigate();
  const { quoteNo } = useParams<{ quoteNo: string }>();
  const isEditMode = !!quoteNo;
  const username = useSelector((state: any) => state.auth.username);

  // Get today's date in YYYY-MM-DD format
  const getTodayDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  const [clients, setClients] = useState<Client[]>([]);
  const [productGroups, setProductGroups] = useState<ProductGroup[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [statusChoices, setStatusChoices] = useState<StatusChoice[]>([]);
  const [unitChoices, setUnitChoices] = useState<UnitChoice[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [errors, setErrors] = useState<{ general?: string }>({});
  const [isAddClientModalOpen, setIsAddClientModalOpen] = useState(false);
  const [isAddServiceModalOpen, setIsAddServiceModalOpen] = useState(false);

  const [quoteDetails, setQuoteDetails] = useState({
    author: username || '',
    dateOfIssue: getTodayDate(),
    dueDate: getTodayDate(),
    client: '',
    poc: '',
    status: '',
    quoteName: ''
  });

  const [items, setItems] = useState<ProductRow[]>([
    {
      id: crypto.randomUUID(),
      group: '',
      product: '',
      description: '',
      quantity: 0,
      unit: '',
      unit_price: 0,
      amount: 0
    }
  ]);
  const [taxPercentage, setTaxPercentage] = useState(0);

  // Fetch all required data on component mount
  useEffect(() => {
    initializeData();
  }, []);

  // Fetch quote details if in edit mode
  useEffect(() => {
    if (isEditMode && quoteNo && !isLoadingData) {
      fetchQuoteDetails();
    }
  }, [isEditMode, quoteNo, isLoadingData]);

  const fetchQuoteDetails = async () => {
    try {
      const response = await axiosInstance.get(`/quotes/${quoteNo}/`);
      if (response.status === 200) {
        const data = response.data;

        // Map API data to form state
        setQuoteDetails({
          author: data.author,
          dateOfIssue: data.date_of_issue.split('T')[0],
          dueDate: data.due_date.split('T')[0],
          client: data.client.company_name,
          poc: data.poc ? data.poc.poc_name : '', // Assuming API returns nested POC object or ID
          status: data.status,
          quoteName: data.quote_name
        });

        // Map items
        const mappedItems: ProductRow[] = data.items.map((item: any) => ({
          id: crypto.randomUUID(),
          apiId: item.id,
          group: item.product_group,
          product: item.product_name,
          description: item.description || '',
          quantity: parseFloat(item.quantity),
          unit: item.unit,
          unit_price: parseFloat(item.price_per_unit),
          amount: parseFloat(item.amount)
        }));

        setItems(mappedItems);
        setTaxPercentage(parseFloat(data.tax_percentage) || 0);
      }
    } catch (err) {
      console.error('Failed to fetch quote details:', err);
      setErrors({ general: 'Failed to load quote details' });
    }
  };

  // Update author when username loads from Redux
  useEffect(() => {
    if (username && !isEditMode) {
      setQuoteDetails(prev => ({
        ...prev,
        author: username
      }));
    }
  }, [username, isEditMode]);

  /**
   * Initialize all data fetching in parallel for optimal performance
   * Uses Promise.allSettled to handle partial failures gracefully
   */
  const initializeData = async () => {
    setIsLoadingData(true);

    try {
      const results = await Promise.allSettled([
        fetchClients(),
        fetchProductGroupsWithModules(),
        fetchStatusChoices(),
        fetchUnitChoices()
      ]);

      // Log any failed requests for debugging
      results.forEach((result, index) => {
        if (result.status === 'rejected') {
          const endpoints = ['clients', 'product-groups-with-modules', 'quote-status-choices', 'quote-item-unit-choices'];
          console.error(`Failed to fetch ${endpoints[index]}:`, result.reason);
        }
      });
    } catch (error) {
      console.error('Error initializing data:', error);
    } finally {
      setIsLoadingData(false);
    }
  };

  /**
   * Fetch clients list with POCs
   */
  const fetchClients = async () => {
    try {
      const response = await axiosInstance.get('/client/pocs/');
      if (response.status === 200) {
        setClients(response.data);
      }
    } catch (err) {
      console.error('Failed to fetch clients:', err);
      throw err; // Re-throw for Promise.allSettled
    }
  };

  /**
   * Fetch product groups with nested modules
   * Flattens active modules into services array
   */
  const fetchProductGroupsWithModules = async () => {
    try {
      const response = await axiosInstance.get('/product-groups-with-modules/');
      if (response.status === 200) {
        const data: ProductGroup[] = response.data;
        setProductGroups(data);

        // Flatten modules from all groups into services array
        const allServices: Service[] = [];
        data.forEach(group => {
          group.modules.forEach(module => {
            if (module.is_active) {
              allServices.push({
                id: module.module_id.toString(),
                product_service_name: module.module_name,
                description: module.description,
                product_group: group.group_name
              });
            }
          });
        });
        setServices(allServices);
      }
    } catch (err) {
      console.error('Failed to fetch product groups with modules:', err);
      throw err; // Re-throw for Promise.allSettled
    }
  };

  /**
   * Fetch quote status choices
   */
  const fetchStatusChoices = async () => {
    try {
      const response = await axiosInstance.get('/quote-status-choices/');
      if (response.status === 200) {
        setStatusChoices(response.data);

        // Set default status to first option if available
        if (response.data.length > 0 && !quoteDetails.status) {
          setQuoteDetails(prev => ({
            ...prev,
            status: response.data[0].value
          }));
        }
      }
    } catch (err) {
      console.error('Failed to fetch status choices:', err);
      throw err; // Re-throw for Promise.allSettled
    }
  };

  /**
   * Fetch quote item unit choices
   */
  const fetchUnitChoices = async () => {
    try {
      const response = await axiosInstance.get('/quote-item-unit-choices/');
      if (response.status === 200) {
        setUnitChoices(response.data);

        // Set default unit for initial row if not already set
        if (response.data.length > 0) {
          setItems(prev => prev.map(item =>
            item.unit === '' ? { ...item, unit: response.data[0].value } : item
          ));
        }
      }
    } catch (err) {
      console.error('Failed to fetch unit choices:', err);
      throw err; // Re-throw for Promise.allSettled
    }
  };

  const handleDetailChange = (field: string, value: string) => {
    setQuoteDetails(prev => {
      const updated = { ...prev, [field]: value };

      // Clear POC when client changes
      if (field === 'client') {
        updated.poc = '';
      }

      return updated;
    });
    setErrors({});
  };

  const handleItemChange = (id: string, field: keyof ProductRow, value: string | number) => {
    setItems(prev => prev.map(item => {
      if (item.id === id) {
        const updated = { ...item, [field]: value };

        // If group changes, clear the product selection
        if (field === 'group') {
          updated.product = '';
        }

        if (field === 'quantity' || field === 'unit_price') {
          updated.amount = updated.quantity * updated.unit_price;
        }
        return updated;
      }
      return item;
    }));
  };

  const addNewRow = () => {
    setItems(prev => [...prev, {
      id: crypto.randomUUID(),
      group: '',
      product: '',
      description: '',
      quantity: 0,
      unit: unitChoices.length > 0 ? unitChoices[0].value : '',
      unit_price: 0,
      amount: 0
    }]);
  };

  const removeRow = (id: string) => {
    if (items.length > 1) {
      setItems(prev => prev.filter(item => item.id !== id));
    }
  };

  const calculateRowTotal = (item: ProductRow) => {
    return item.quantity * item.unit_price;
  };

  // Calculate totals
  const subTotal = items.reduce((sum, item) => sum + item.amount, 0);
  const taxAmount = (subTotal * taxPercentage) / 100;
  const total = subTotal + taxAmount;

  // Cost calculations
  const totalCost = total * 1;
  const inHouse = totalCost;
  const outsourced = 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!quoteDetails.client) {
      setErrors({ general: 'Please select a client' });
      return;
    }

    if (!quoteDetails.status) {
      setErrors({ general: 'Please select a status' });
      return;
    }

    if (!quoteDetails.quoteName?.trim()) {
      setErrors({ general: 'Please enter a quote name' });
      return;
    }

    if (items.length === 0 || !items.some(item => item.product && item.quantity > 0)) {
      setErrors({ general: 'Please add at least one item with product and quantity' });
      return;
    }

    setIsSaving(true);

    try {
      // Find selected client
      const selectedClient = clients.find(c => c.company_name === quoteDetails.client);
      if (!selectedClient) {
        setErrors({ general: 'Invalid client selected' });
        setIsSaving(false);
        return;
      }

      // Find selected POC ID (optional)
      let pocId: number | null = null;
      if (quoteDetails.poc) {
        const selectedPoc = selectedClient.pocs.find(p => p.poc_name === quoteDetails.poc);
        pocId = selectedPoc ? selectedPoc.id : null;
      }

      // Map items to API format
      const quoteItems = items
        .filter(item => item.product && item.quantity > 0) // Only include valid items
        .map(item => {
          // Find the service/product ID
          const service = services.find(s => s.product_service_name === item.product);

          return {
            ...(item.apiId && { id: item.apiId }),
            product_service: service ? parseInt(service.id) : null,
            description: item.description || '',
            quantity: item.quantity,
            unit: item.unit,
            price_per_unit: item.unit_price.toFixed(2)
          };
        })
        .filter(item => item.product_service !== null); // Remove items without valid product

      if (quoteItems.length === 0) {
        setErrors({ general: 'Please select valid products for all items' });
        setIsSaving(false);
        return;
      }

      // Build the payload
      const payload = {
        quote_name: quoteDetails.quoteName.trim(),
        date_of_issue: quoteDetails.dateOfIssue,
        due_date: quoteDetails.dueDate,
        client: selectedClient.id,
        status: quoteDetails.status,
        tax_percentage: taxPercentage,
        ...(pocId && { poc: pocId }), // Include POC only if selected
        items: quoteItems
      };

      console.log('Submitting quote:', payload);

      let response;
      if (isEditMode) {
        response = await axiosInstance.put(`quotes/${quoteNo}/`, payload);
        if (response.status === 201 || response.status === 200) {
          console.log('Quote saved successfully:', response.data);
          // Navigate to pipeline or show success message
          navigate(`/pipeline/quote/${quoteNo}`);
        }
      } else {
        response = await axiosInstance.post('quotes/', payload);
        if (response.status === 201 || response.status === 200) {
          console.log('Quote saved successfully:', response.data);
          // Navigate to pipeline or show success message
          navigate('/pipeline');
        }
      }
    } catch (error: any) {
      console.error('Failed to create quote:', error);
      const apiErrors = parseApiErrors(error);
      setErrors(apiErrors);
    } finally {
      setIsSaving(false);
    }
  };

  const handleClientAdded = (newClient: any) => {
    // Convert to Client format with pocs array
    const clientWithPocs: Client = {
      ...newClient,
      pocs: newClient.pocs || []
    };
    setClients(prev => [...prev, clientWithPocs]);
    setQuoteDetails(prev => ({ ...prev, client: clientWithPocs.company_name, poc: '' }));
  };

  const handleServiceAdded = (newService: any) => {
    // Convert ModulesTab format to Service format
    const formattedService: Service = {
      id: newService.id,
      product_service_name: newService.product_service_name,
      description: newService.description,
      product_group: newService.product_group
    };
    setServices(prev => [...prev, formattedService]);

    // Refresh the full data to keep groups and modules in sync
    fetchProductGroupsWithModules();
  };

  return (
    <Layout userRole="admin" currentPage="pipeline" onNavigate={() => { }}>
      <div className="px-2 sm:px-4 md:px-6 lg:px-8">
        <div className="max-w-[1600px] mx-auto py-4 sm:py-6 md:py-8">

          {/* Breadcrumb Navigation */}
          <div className="flex items-center gap-2 text-xs sm:text-sm mb-4 sm:mb-6">
            <button
              onClick={() => navigate('/pipeline')}
              className="text-blue-600 hover:text-blue-800 font-semibold transition-colors flex items-center gap-1"
            >
              <ArrowLeft size={16} className="hidden sm:block" />
              <ArrowLeft size={14} className="sm:hidden" />
              Pipeline
            </button>
            <span className="text-gray-400">/</span>
            <span className="text-gray-700 font-medium">{isEditMode ? 'Edit Quote Details' : 'Add Quote Details'}</span>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden relative">

            {/* Loading Overlay */}
            {isLoadingData && (
              <div className="absolute inset-0 bg-white/70 backdrop-blur-sm z-20 flex items-center justify-center">
                <div className="text-center">
                  <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-gray-200 border-t-blue-600 mb-4"></div>
                  <p className="text-gray-600 font-medium">Loading quote data...</p>
                </div>
              </div>
            )}

            {/* Header Section */}
            <div className="p-4 sm:p-6 md:p-8 border-b border-gray-100">
              <h1 className="text-lg sm:text-xl font-bold text-gray-800 mb-6 sm:mb-8">{isEditMode ? 'Edit Quote Details' : 'Add Quote Details'}</h1>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-8 lg:gap-x-24 gap-y-4 sm:gap-y-6">
                {/* Left Column */}
                <div className="space-y-4 sm:space-y-5">
                  <div className="grid grid-cols-1 sm:grid-cols-[160px_1fr] items-start sm:items-center gap-2 sm:gap-6">
                    <label className="text-sm sm:text-base font-medium text-gray-700">Date of Issue</label>
                    <input
                      type="date"
                      value={quoteDetails.dateOfIssue}
                      onChange={(e) => handleDetailChange('dateOfIssue', e.target.value)}
                      className="w-full px-3 sm:px-4 py-2 sm:py-2.5 border border-gray-300 rounded text-sm sm:text-base focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-[160px_1fr] items-start sm:items-center gap-2 sm:gap-6">
                    <label className="text-sm sm:text-base font-medium text-gray-700">Client</label>
                    <div className="flex gap-2 items-center">
                      <div className="relative flex-1">
                        <select
                          value={quoteDetails.client}
                          onChange={(e) => handleDetailChange('client', e.target.value)}
                          className="w-full px-3 sm:px-4 py-2 sm:py-2.5 border border-gray-300 rounded text-sm sm:text-base appearance-none bg-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                          disabled={isLoadingData}
                        >
                          <option value="">
                            {isLoadingData ? 'Loading clients...' : 'Enter Client Name'}
                          </option>
                          {clients.map(client => (
                            <option key={client.id} value={client.company_name}>
                              {client.company_name}
                            </option>
                          ))}
                        </select>
                        <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                      </div>
                      <button
                        type="button"
                        onClick={() => setIsAddClientModalOpen(true)}
                        className="flex-shrink-0 flex items-center justify-center w-10 h-10 sm:w-11 sm:h-11 bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors shadow-md hover:shadow-lg active:scale-95"
                        title="Add New Client"
                        aria-label="Add New Client"
                      >
                        <Plus size={18} className="sm:hidden" strokeWidth={2.5} />
                        <Plus size={20} className="hidden sm:block" strokeWidth={2.5} />
                      </button>
                    </div>
                  </div>

                  {/* POC Dropdown - Shows after client is selected */}
                  <div className="grid grid-cols-1 sm:grid-cols-[160px_1fr] items-start sm:items-center gap-2 sm:gap-6">
                    <label className="text-sm sm:text-base font-medium text-gray-700">POC (Optional)</label>
                    <div className="relative">
                      <select
                        value={quoteDetails.poc}
                        onChange={(e) => handleDetailChange('poc', e.target.value)}
                        className="w-full px-3 sm:px-4 py-2 sm:py-2.5 border border-gray-300 rounded text-sm sm:text-base appearance-none bg-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                        disabled={!quoteDetails.client || isLoadingData}
                      >
                        <option value="">
                          {!quoteDetails.client ? 'Select client first' : 'Select POC (Optional)'}
                        </option>
                        {quoteDetails.client && clients
                          .find(c => c.company_name === quoteDetails.client)
                          ?.pocs.map(poc => (
                            <option key={poc.id} value={poc.poc_name}>
                              {poc.poc_name} - {poc.designation}
                            </option>
                          ))}
                      </select>
                      <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-[160px_1fr] items-start sm:items-center gap-2 sm:gap-6">
                    <label className="text-sm sm:text-base font-medium text-gray-700">Quote Name</label>
                    <input
                      type="text"
                      placeholder="Enter Quote Name"
                      value={quoteDetails.quoteName}
                      onChange={(e) => handleDetailChange('quoteName', e.target.value)}
                      className="w-full px-3 sm:px-4 py-2 sm:py-2.5 border border-gray-300 rounded text-sm sm:text-base focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                </div>

                {/* Right Column */}
                <div className="space-y-4 sm:space-y-5">
                  <div className="grid grid-cols-1 sm:grid-cols-[160px_1fr] items-start sm:items-center gap-2 sm:gap-6">
                    <label className="text-sm sm:text-base font-medium text-gray-700">Author</label>
                    <input
                      type="text"
                      value={quoteDetails.author}
                      onChange={(e) => handleDetailChange('author', e.target.value)}
                      className="w-full px-3 sm:px-4 py-2 sm:py-2.5 border border-gray-300 rounded text-sm sm:text-base bg-gray-50 focus:outline-none"
                      readOnly
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-[160px_1fr] items-start sm:items-center gap-2 sm:gap-6">
                    <label className="text-sm sm:text-base font-medium text-gray-700">Due Date</label>
                    <input
                      type="date"
                      value={quoteDetails.dueDate}
                      onChange={(e) => handleDetailChange('dueDate', e.target.value)}
                      className="w-full px-3 sm:px-4 py-2 sm:py-2.5 border border-gray-300 rounded text-sm sm:text-base focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-[160px_1fr] items-start sm:items-center gap-2 sm:gap-6">
                    <label className="text-sm sm:text-base font-medium text-gray-700">Status</label>
                    <div className="relative">
                      <select
                        value={quoteDetails.status}
                        onChange={(e) => handleDetailChange('status', e.target.value)}
                        className="w-full px-3 sm:px-4 py-2 sm:py-2.5 border border-gray-300 rounded text-sm sm:text-base appearance-none bg-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 cursor-pointer"
                        disabled={isLoadingData || statusChoices.length === 0}
                      >
                        <option value="" disabled>Select Status</option>
                        {statusChoices.map(choice => (
                          <option key={choice.value} value={choice.value}>
                            {choice.label}
                          </option>
                        ))}
                      </select>
                      <ChevronDown size={16} className="absolute right-3 top-3 text-gray-400 pointer-events-none" />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Line Items Table Section */}
            <div className="p-4 sm:p-6 md:p-8 pb-0">
              {/* Desktop Table View - Hidden on mobile */}
              <div className="hidden lg:block">
                {/* Table Header */}
                <div className="grid grid-cols-[50px_140px_2fr_200px_140px_140px_50px] gap-4 mb-2 text-sm font-semibold text-gray-700 px-2">
                  <div></div>
                  <div>Group</div>
                  <div>Product | Description</div>
                  <div>Quantity | Unit</div>
                  <div className="text-right">Unit Price</div>
                  <div className="text-right">Amount</div>
                  <div></div>
                </div>

                <div className="border-t border-gray-200">
                  {items.map((item) => (
                    <div key={item.id} className="group border-b border-gray-100 py-4 hover:bg-gray-50 transition-colors">
                      <div className="grid grid-cols-[50px_140px_2fr_200px_140px_140px_50px] gap-4 items-start px-2">

                        {/* Drag Handle */}
                        <div className="flex justify-center pt-2.5 cursor-move text-gray-400 hover:text-gray-600">
                          <GripVertical size={18} />
                        </div>

                        {/* Group */}
                        <div>
                          <div className="relative">
                            <select
                              value={item.group}
                              onChange={(e) => handleItemChange(item.id, 'group', e.target.value)}
                              className="w-full px-3 py-2.5 border border-gray-300 rounded text-sm appearance-none bg-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                            >
                              <option value="">Product Group</option>
                              {productGroups.map(group => (
                                <option key={group.group_id} value={group.group_name}>
                                  {group.group_name}
                                </option>
                              ))}
                            </select>
                            <ChevronDown size={14} className="absolute right-2 top-3 text-gray-400 pointer-events-none" />
                          </div>
                        </div>

                        {/* Product & Description */}
                        <div className="space-y-2">
                          <div className="flex gap-2 items-center">
                            <div className="relative flex-1">
                              <select
                                value={item.product}
                                onChange={(e) => handleItemChange(item.id, 'product', e.target.value)}
                                className="w-full px-3 py-2.5 border border-gray-300 rounded text-sm appearance-none bg-white font-medium focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                                disabled={!item.group}
                              >
                                <option value="">
                                  {!item.group ? 'Select product group first' : 'Select product or service'}
                                </option>
                                {item.group && services
                                  .filter(service => service.product_group === item.group)
                                  .map(service => (
                                    <option key={service.id} value={service.product_service_name}>
                                      {service.product_service_name}
                                    </option>
                                  ))}
                              </select>
                              <ChevronDown size={14} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                            </div>
                            <button
                              type="button"
                              onClick={() => setIsAddServiceModalOpen(true)}
                              className="flex-shrink-0 flex items-center justify-center w-9 h-9 bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors shadow-sm hover:shadow-md active:scale-95"
                              title="Add New Service"
                              aria-label="Add New Service"
                            >
                              <Plus size={16} strokeWidth={2.5} />
                            </button>
                          </div>
                          <textarea
                            value={item.description}
                            onChange={(e) => handleItemChange(item.id, 'description', e.target.value)}
                            placeholder="Product or service description"
                            className="w-full px-3 py-2.5 border border-gray-300 rounded text-sm text-gray-600 h-20 resize-none focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                          />
                        </div>

                        {/* Quantity & Unit */}
                        <div className="flex space-x-2">
                          <input
                            type="number"
                            value={item.quantity}
                            onChange={(e) => handleItemChange(item.id, 'quantity', parseFloat(e.target.value) || 0)}
                            className="w-full px-3 py-2.5 border border-gray-300 rounded text-sm text-right focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                          />
                          <div className="relative w-24 shrink-0">
                            <select
                              value={item.unit}
                              onChange={(e) => handleItemChange(item.id, 'unit', e.target.value)}
                              className="w-full px-2 py-2.5 border border-gray-300 rounded text-sm appearance-none bg-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                              disabled={isLoadingData || unitChoices.length === 0}
                            >
                              {unitChoices.map(choice => (
                                <option key={choice.value} value={choice.value}>
                                  {choice.label}
                                </option>
                              ))}
                            </select>
                            <ChevronDown size={14} className="absolute right-1 top-3 text-gray-400 pointer-events-none" />
                          </div>
                        </div>

                        {/* Unit Price */}
                        <div>
                          <input
                            type="number"
                            placeholder="Price"
                            value={item.unit_price || ''}
                            onChange={(e) => handleItemChange(item.id, 'unit_price', parseFloat(e.target.value) || 0)}
                            className="w-full px-3 py-2.5 border border-gray-300 rounded text-sm text-right focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 placeholder-gray-400"
                          />
                        </div>

                        {/* Amount */}
                        <div className="pt-2.5 text-right text-sm font-bold text-gray-800">
                          {calculateRowTotal(item).toFixed(2)}
                          <div className="text-gray-300 font-normal mt-1 text-xs">0.00</div>
                        </div>

                        {/* Delete Action */}
                        <button
                          onClick={() => removeRow(item.id)}
                          className="flex justify-center pt-2.5 text-gray-300 hover:text-red-500 transition-colors"
                        >
                          <Trash2 size={16} />
                        </button>

                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Mobile Card View - Visible on mobile only */}
              <div className="lg:hidden space-y-4">
                {items.map((item, index) => (
                  <div key={item.id} className="bg-gray-50 border border-gray-200 rounded-lg p-4 space-y-3">
                    {/* Card Header */}
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <GripVertical size={16} className="text-gray-400" />
                        <span className="text-sm font-semibold text-gray-700">Item #{index + 1}</span>
                      </div>
                      <button
                        onClick={() => removeRow(item.id)}
                        className="p-1.5 text-gray-400 hover:text-red-500 transition-colors"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>

                    {/* Group */}
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Product Group</label>
                      <div className="relative">
                        <select
                          value={item.group}
                          onChange={(e) => handleItemChange(item.id, 'group', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded text-sm appearance-none bg-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                        >
                          <option value="">Select Group</option>
                          {productGroups.map(group => (
                            <option key={group.group_id} value={group.group_name}>
                              {group.group_name}
                            </option>
                          ))}
                        </select>
                        <ChevronDown size={14} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                      </div>
                    </div>

                    {/* Product */}
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Product/Service</label>
                      <div className="flex gap-2">
                        <div className="relative flex-1">
                          <select
                            value={item.product}
                            onChange={(e) => handleItemChange(item.id, 'product', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded text-sm appearance-none bg-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                            disabled={!item.group}
                          >
                            <option value="">
                              {!item.group ? 'Select group first' : 'Select product'}
                            </option>
                            {item.group && services
                              .filter(service => service.product_group === item.group)
                              .map(service => (
                                <option key={service.id} value={service.product_service_name}>
                                  {service.product_service_name}
                                </option>
                              ))}
                          </select>
                          <ChevronDown size={14} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                        </div>
                        <button
                          type="button"
                          onClick={() => setIsAddServiceModalOpen(true)}
                          className="flex-shrink-0 flex items-center justify-center w-9 h-9 bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors"
                          title="Add New Service"
                        >
                          <Plus size={16} strokeWidth={2.5} />
                        </button>
                      </div>
                    </div>

                    {/* Description */}
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Description</label>
                      <textarea
                        value={item.description}
                        onChange={(e) => handleItemChange(item.id, 'description', e.target.value)}
                        placeholder="Product or service description"
                        className="w-full px-3 py-2 border border-gray-300 rounded text-sm text-gray-600 h-16 resize-none focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                      />
                    </div>

                    {/* Quantity and Unit */}
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Quantity</label>
                        <input
                          type="number"
                          value={item.quantity}
                          onChange={(e) => handleItemChange(item.id, 'quantity', parseFloat(e.target.value) || 0)}
                          className="w-full px-3 py-2 border border-gray-300 rounded text-sm text-right focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Unit</label>
                        <div className="relative">
                          <select
                            value={item.unit}
                            onChange={(e) => handleItemChange(item.id, 'unit', e.target.value)}
                            className="w-full px-2 py-2 border border-gray-300 rounded text-sm appearance-none bg-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                            disabled={isLoadingData || unitChoices.length === 0}
                          >
                            {unitChoices.map(choice => (
                              <option key={choice.value} value={choice.value}>
                                {choice.label}
                              </option>
                            ))}
                          </select>
                          <ChevronDown size={14} className="absolute right-1 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                        </div>
                      </div>
                    </div>

                    {/* Unit Price and Amount */}
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Unit Price</label>
                        <input
                          type="number"
                          placeholder="0.00"
                          value={item.unit_price || ''}
                          onChange={(e) => handleItemChange(item.id, 'unit_price', parseFloat(e.target.value) || 0)}
                          className="w-full px-3 py-2 border border-gray-300 rounded text-sm text-right focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Amount</label>
                        <div className="px-3 py-2 bg-gray-100 border border-gray-200 rounded text-sm text-right font-bold text-gray-800">
                          {calculateRowTotal(item).toFixed(2)}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Table Actions */}
              <div className="flex flex-wrap items-center gap-2 sm:gap-3 mt-6 mb-6 sm:mb-8">
                <button
                  onClick={addNewRow}
                  className="px-4 sm:px-5 py-2 sm:py-2.5 bg-blue-600 text-white text-sm font-semibold rounded hover:bg-blue-700 transition-colors shadow-sm"
                >
                  Add New Row
                </button>
                <button className="px-4 sm:px-5 py-2 sm:py-2.5 bg-blue-600 text-white text-sm font-semibold rounded hover:bg-blue-700 transition-colors shadow-sm">
                  Add Sub Row
                </button>
                <button className="px-4 sm:px-5 py-2 sm:py-2.5 bg-blue-600 text-white text-sm font-semibold rounded hover:bg-blue-700 transition-colors shadow-sm">
                  Add Product Group
                </button>

              </div>
            </div>


            {/* Footer & Totals Section */}
            <div className="bg-white px-4 sm:px-6 md:px-8 py-4 sm:py-6 mb-8 sm:mb-12">
              <div className="flex flex-col lg:flex-row justify-end items-start gap-8 lg:gap-12">

                {/* Totals Calculation */}
                <div className="w-full lg:w-80 space-y-3">
                  <div className="flex justify-between items-center text-sm">
                    <span className="font-semibold text-gray-800">Sub Total</span>
                    <span className="text-gray-700">{subTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                  </div>

                  <div className="flex justify-between items-center text-sm">
                    <span className="font-semibold text-gray-800">Some without tax</span>
                    <span className="text-gray-700">{subTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                  </div>

                  <div className="flex justify-between items-center text-sm">
                    <span className="font-semibold text-gray-800">Tax</span>
                    <div className="flex items-center gap-3">
                      <div className="relative w-20">
                        <select
                          className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm appearance-none bg-white pr-6 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                          value={taxPercentage}
                          onChange={(e) => setTaxPercentage(parseFloat(e.target.value))}
                        >
                          <option value="0">0 %</option>
                          <option value="5">5 %</option>
                          <option value="10">10 %</option>
                          <option value="18">18 %</option>
                        </select>
                        <ChevronDown size={14} className="absolute right-1 top-2 text-gray-500 pointer-events-none" />
                      </div>
                      <span className="text-gray-700 w-20 text-right">{taxAmount.toFixed(2)}</span>
                    </div>
                  </div>

                  <div className="flex justify-between items-center text-sm pt-3 border-t border-gray-200">
                    <span className="font-bold text-gray-800">Total</span>
                    <span className="text-gray-800 font-bold">{total.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                  </div>
                </div>

                {/* Right Side Stats */}
                <div className="w-full lg:w-64 space-y-4 lg:border-l border-gray-200 lg:pl-8">
                  <div className="flex justify-between items-center text-sm">
                    <span className="font-semibold text-gray-800">Total Cost</span>
                    <div className="text-right">
                      <div className="font-bold text-gray-800">{totalCost.toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
                      {/* <div className="text-gray-400 text-xs">60.00 %</div> */}
                    </div>
                  </div>

                  <div className="flex justify-between items-center text-sm">
                    {/* <span className="text-gray-600">In-house</span>
                    <div className="text-right">
                      <div className="font-bold text-gray-800">{inHouse.toLocaleString(undefined, {minimumFractionDigits: 2})}</div>
                      <div className="text-gray-400 text-xs">60.00 %</div>
                    </div> */}
                  </div>

                  <div className="flex justify-between items-center text-sm">
                    {/* <span className="text-gray-600">Outsourced</span>
                    <div className="text-right">
                      <div className="font-bold text-gray-800">{outsourced}</div>
                      <div className="text-gray-400 text-xs">0.00 %</div>
                    </div> */}
                  </div>
                </div>

              </div>
            </div>

            {/* Error Message */}
            {errors.general && (
              <div className="mx-4 sm:mx-6 md:mx-8 mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3 text-red-700 animate-in fade-in slide-in-from-top-2">
                <AlertCircle size={20} className="text-red-500 shrink-0" />
                <p className="text-sm font-medium">{errors.general}</p>
              </div>
            )}

            {/* Bottom Action Bar */}
            <div className="p-4 sm:p-6 bg-white border-t border-gray-200 flex justify-center sticky bottom-0 z-10">
              <button
                onClick={handleSubmit}
                disabled={isSaving}
                className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 px-8 sm:px-12 rounded shadow-md transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSaving ? 'Saving...' : (isEditMode ? 'Update' : 'Save')}
              </button>
            </div>

          </div>
        </div>
      </div>

      {/* Add Client Modal */}
      <AddClientModal
        isOpen={isAddClientModalOpen}
        onClose={() => setIsAddClientModalOpen(false)}
        onClientAdded={handleClientAdded}
      />

      {/* Add Service Modal - Using ModulesTab */}
      {isAddServiceModalOpen && (
        <ModulesTab
          isModalMode={true}
          onModalClose={() => setIsAddServiceModalOpen(false)}
          onServiceAdded={handleServiceAdded}
        />
      )}
    </Layout>
  );
}
