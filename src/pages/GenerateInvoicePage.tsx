/**
 * Generate Invoice Page (Full Screen)
 * Full-screen page for creating invoices with dynamic product groups
 */

import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Plus, GripVertical, ArrowLeft } from 'lucide-react';
import { Layout } from '../components/Layout';
import { InputField } from '../components/InputField';
import axiosInstance from '../utils/axiosInstance';
import { toast } from 'react-hot-toast';

interface ProductRow {
    id: string;
    quote_item_id?: number; // Backend quote item ID
    selected: boolean;
    group: string;
    product: string;
    description: string;
    quantity: number;
    unit: string;
    unitPrice: number;
    amount: number;
}

export default function GenerateInvoicePage() {
    const navigate = useNavigate();
    const { quotationId } = useParams<{ quotationId: string }>();

    const [referenceQuoteNo, setReferenceQuoteNo] = useState(quotationId || '40');
    const [author, setAuthor] = useState('');
    const [dateOfIssue, setDateOfIssue] = useState('23-10-2025');
    const [client, setClient] = useState('');
    const [referenceQuoteName, setReferenceQuoteName] = useState('');
    const [dueDate, setDueDate] = useState('23-11-2025');
    const [taxPercentage, setTaxPercentage] = useState('0');
    const [dueDays, setDueDays] = useState('30');
    const [notes, setNotes] = useState('Pay within 30 days');
    const [termsConditions, setTermsConditions] = useState('No refunds');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    const [productRows, setProductRows] = useState<ProductRow[]>([]);

    // Fetch quote data when component mounts
    React.useEffect(() => {
        const fetchQuoteData = async () => {
            if (!quotationId) {
                setIsLoading(false);
                // Set default empty row if no quoteId
                setProductRows([{
                    id: '1',
                    selected: false,
                    group: 'Service',
                    product: '',
                    description: '',
                    quantity: 1,
                    unit: 'hr',
                    unitPrice: 0,
                    amount: 0
                }]);
                return;
            }

            try {
                setIsLoading(true);
                const response = await axiosInstance.get(`quotations/${quotationId}/`);
                const data = response.data;

                console.log('Fetched quote data:', data);

                // Extract quote data from nested structure
                const quoteData = data.quote;

                // Populate form fields from quote data
                setReferenceQuoteNo(quoteData.quote_no || quotationId);
                setClient(quoteData.client?.company_name || '');
                setReferenceQuoteName(quoteData.quote_name || '');
                setAuthor(quoteData.author || '');

                // Populate product rows from quote items
                if (quoteData.items && Array.isArray(quoteData.items)) {
                    console.log('Quote items from API:', quoteData.items);
                    console.log('First item structure:', quoteData.items[0]);

                    const rows: ProductRow[] = quoteData.items.map((item: any, index: number) => {
                        // Log each item to see its structure
                        console.log(`Item ${index}:`, item);

                        return {
                            id: `${index + 1}`,
                            quote_item_id: item.id || item.item_id || item.quote_item_id, // Try multiple possible field names
                            selected: true, // Select all by default
                            group: item.product_group || 'Service',
                            product: item.product_name || '',
                            description: '',
                            quantity: parseFloat(item.quantity || '1'),
                            unit: item.unit || 'hr',
                            unitPrice: parseFloat(item.price_per_unit || '0'),
                            amount: parseFloat(item.amount || '0')
                        };
                    });

                    console.log('Processed rows:', rows);
                    setProductRows(rows);
                } else {
                    // Default empty row if no products
                    setProductRows([{
                        id: '1',
                        selected: false,
                        group: 'Service',
                        product: '',
                        description: '',
                        quantity: 1,
                        unit: 'hr',
                        unitPrice: 0,
                        amount: 0
                    }]);
                }
            } catch (error) {
                console.error('Error fetching quote data:', error);
                toast.error('Failed to load quote data');
                // Set default empty row on error
                setProductRows([{
                    id: '1',
                    selected: false,
                    group: 'Service',
                    product: '',
                    description: '',
                    quantity: 1,
                    unit: 'hr',
                    unitPrice: 0,
                    amount: 0
                }]);
            } finally {
                setIsLoading(false);
            }
        };

        fetchQuoteData();
    }, [quotationId]);

    const handleCheckboxChange = (id: string) => {
        setProductRows(rows =>
            rows.map(row =>
                row.id === id
                    ? { ...row, selected: !row.selected, amount: !row.selected ? row.quantity * row.unitPrice : 0 }
                    : row
            )
        );
    };

    const handleQuantityChange = (id: string, value: string) => {
        const quantity = parseInt(value) || 0;
        setProductRows(rows =>
            rows.map(row =>
                row.id === id
                    ? { ...row, quantity, amount: row.selected ? quantity * row.unitPrice : 0 }
                    : row
            )
        );
    };

    const handleAddNewRow = () => {
        const newRow: ProductRow = {
            id: Date.now().toString(),
            selected: false,
            group: 'Service',
            product: '',
            description: '',
            quantity: 1,
            unit: 'hr',
            unitPrice: 0,
            amount: 0
        };
        setProductRows([...productRows, newRow]);
    };

    const calculateTotals = () => {
        const subTotal = productRows.reduce((sum, row) => sum + row.amount, 0);
        const someWithoutTax = subTotal;
        const tax = (subTotal * parseFloat(taxPercentage)) / 100;
        const total = subTotal + tax;
        const inHouse = subTotal;
        const outsourced = 0;

        return {
            subTotal: subTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 }),
            someWithoutTax: someWithoutTax.toLocaleString('en-IN', { minimumFractionDigits: 2 }),
            tax: tax.toLocaleString('en-IN', { minimumFractionDigits: 2 }),
            total: total.toLocaleString('en-IN', { minimumFractionDigits: 2 }),
            inHouse: inHouse.toLocaleString('en-IN', { minimumFractionDigits: 2 }),
            outsourced: outsourced.toLocaleString('en-IN', { minimumFractionDigits: 2 })
        };
    };

    const totals = calculateTotals();

    const handleCreateInvoice = async () => {
        try {
            setIsSubmitting(true);

            // Get selected quote item IDs
            console.log('All product rows:', productRows);
            console.log('Selected rows:', productRows.filter(row => row.selected));

            const selectedItemIds = productRows
                .filter(row => row.selected && row.quote_item_id) // Only selected items with quote_item_id
                .map(row => row.quote_item_id!);

            console.log('Selected item IDs:', selectedItemIds);

            // Prepare invoice data matching API request format
            const invoiceData: any = {
                quote_id: parseInt(quotationId || referenceQuoteNo),
                due_days: parseInt(dueDays),
                notes: notes,
                terms_conditions: termsConditions
            };

            // Only add quote_item_ids if we have valid IDs
            if (selectedItemIds.length > 0) {
                invoiceData.quote_item_ids = selectedItemIds;
                console.log('Including selected item IDs:', selectedItemIds);
            } else {
                console.log('No quote_item_ids - backend will use all items from quote');
            }

            console.log('Creating invoice with data:', invoiceData);

            // Make API call
            const response = await axiosInstance.post('invoices/generate/', invoiceData);

            if (response.status === 200 || response.status === 201) {
                toast.success(response.data.message || 'Invoice generated successfully!');
                const invoiceId = response.data.invoice?.id || '1';
                // Navigate to the newly created invoice using ID
                navigate(`/invoices/${invoiceId}`);
            }
        } catch (error: any) {
            console.error('Error creating invoice:', error);
            const errorMessage = error.response?.data?.message || error.response?.data?.error || 'Failed to create invoice. Please try again.';
            toast.error(errorMessage);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Layout userRole="admin" currentPage="pipeline" onNavigate={() => { }}>
            <div className="p-4 md:p-6 max-w-[1600px] mx-auto">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => navigate(-1)}
                            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                            <ArrowLeft className="w-5 h-5 text-gray-600" />
                        </button>
                        <h1 className="text-xl md:text-2xl font-bold text-gray-900">Invoice</h1>
                    </div>
                </div>

                {/* Loading State */}
                {isLoading ? (
                    <div className="flex items-center justify-center py-12">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {/* Basic Information */}
                        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 md:p-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                                <InputField
                                    label="Reference Quote No"
                                    value={referenceQuoteNo}
                                    onChange={(e) => setReferenceQuoteNo(e.target.value)}
                                />
                                <InputField
                                    label="Author"
                                    value={author}
                                    onChange={(e) => setAuthor(e.target.value)}
                                />
                                <InputField
                                    label="Date of Issue"
                                    type="text"
                                    value={dateOfIssue}
                                    onChange={(e) => setDateOfIssue(e.target.value)}
                                />
                                <InputField
                                    label="ReferenceQuote Name"
                                    value={referenceQuoteName}
                                    onChange={(e) => setReferenceQuoteName(e.target.value)}
                                    placeholder="Enter Quote Name"
                                />
                                <InputField
                                    label="Client"
                                    value={client}
                                    onChange={(e) => setClient(e.target.value)}
                                    placeholder="Enter Client Name"
                                />
                                <InputField
                                    label="Due Date"
                                    type="text"
                                    value={dueDate}
                                    onChange={(e) => setDueDate(e.target.value)}
                                />
                            </div>
                        </div>

                        {/* Product Groups Table */}
                        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full min-w-[800px]">
                                    <thead className="bg-gray-50 border-b border-gray-200">
                                        <tr>
                                            <th className="px-2 md:px-3 py-3 text-left text-xs font-semibold text-gray-600 uppercase w-10"></th>
                                            <th className="px-2 md:px-3 py-3 text-left text-xs font-semibold text-gray-600 uppercase w-10"></th>
                                            <th className="px-2 md:px-3 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Group</th>
                                            <th className="px-2 md:px-3 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Product | Description</th>
                                            <th className="px-2 md:px-3 py-3 text-center text-xs font-semibold text-gray-600 uppercase">Quantity</th>
                                            <th className="px-2 md:px-3 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Unit</th>
                                            <th className="px-2 md:px-3 py-3 text-right text-xs font-semibold text-gray-600 uppercase">Unit Price</th>
                                            <th className="px-2 md:px-3 py-3 text-right text-xs font-semibold text-gray-600 uppercase">Amount</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {productRows.map((row) => (
                                            <tr key={row.id} className="hover:bg-gray-50">
                                                <td className="px-2 md:px-3 py-3">
                                                    <input
                                                        type="checkbox"
                                                        checked={row.selected}
                                                        onChange={() => handleCheckboxChange(row.id)}
                                                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                                    />
                                                </td>
                                                <td className="px-2 md:px-3 py-3">
                                                    <GripVertical className="w-4 h-4 text-gray-400 cursor-move" />
                                                </td>
                                                <td className="px-2 md:px-3 py-3">
                                                    <select
                                                        value={row.group}
                                                        onChange={(e) => {
                                                            setProductRows(rows =>
                                                                rows.map(r => r.id === row.id ? { ...r, group: e.target.value } : r)
                                                            );
                                                        }}
                                                        className="w-full px-2 md:px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                    >
                                                        <option value="Service">Service</option>
                                                        <option value="Product">Product</option>
                                                        <option value="Consulting">Consulting</option>
                                                    </select>
                                                </td>
                                                <td className="px-2 md:px-3 py-3">
                                                    <div className="space-y-2">
                                                        <div className="flex items-center gap-2">
                                                            <input
                                                                type="text"
                                                                value={row.product}
                                                                onChange={(e) => {
                                                                    setProductRows(rows =>
                                                                        rows.map(r => r.id === row.id ? { ...r, product: e.target.value } : r)
                                                                    );
                                                                }}
                                                                className="flex-1 px-2 md:px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                            />
                                                            <button className="p-2 hover:bg-gray-100 rounded">
                                                                <Plus size={16} className="text-gray-600" />
                                                            </button>
                                                        </div>
                                                        <textarea
                                                            value={row.description}
                                                            onChange={(e) => {
                                                                setProductRows(rows =>
                                                                    rows.map(r => r.id === row.id ? { ...r, description: e.target.value } : r)
                                                                );
                                                            }}
                                                            placeholder="Product or service description"
                                                            className="w-full px-2 md:px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                                                            rows={2}
                                                        />
                                                    </div>
                                                </td>
                                                <td className="px-2 md:px-3 py-3">
                                                    <input
                                                        type="number"
                                                        value={row.quantity}
                                                        onChange={(e) => handleQuantityChange(row.id, e.target.value)}
                                                        className="w-16 md:w-20 px-2 md:px-3 py-2 border border-gray-300 rounded-lg text-sm text-center focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                    />
                                                </td>
                                                <td className="px-2 md:px-3 py-3">
                                                    <select
                                                        value={row.unit}
                                                        onChange={(e) => {
                                                            setProductRows(rows =>
                                                                rows.map(r => r.id === row.id ? { ...r, unit: e.target.value } : r)
                                                            );
                                                        }}
                                                        className="w-16 md:w-20 px-2 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                    >
                                                        <option value="hr">hr</option>
                                                        <option value="day">day</option>
                                                        <option value="pcs">pcs</option>
                                                    </select>
                                                </td>
                                                <td className="px-2 md:px-3 py-3 text-right">
                                                    <span className="text-sm font-medium text-gray-900">
                                                        {row.unitPrice.toLocaleString('en-IN')}
                                                    </span>
                                                </td>
                                                <td className="px-2 md:px-3 py-3 text-right">
                                                    <span className="text-sm font-medium text-gray-900">
                                                        {row.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                                    </span>
                                                    <div className="text-xs text-gray-500 mt-1">0.00</div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* Action Buttons */}
                            <div className="px-4 py-3 bg-gray-50 border-t border-gray-200 flex flex-wrap gap-3">
                                <button
                                    onClick={handleAddNewRow}
                                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors"
                                >
                                    Add New Row
                                </button>
                                <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors">
                                    Add Sub Row
                                </button>
                                <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors">
                                    Add Product Group
                                </button>
                            </div>
                        </div>

                        {/* Totals Section */}
                        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 md:p-6">
                            <div className="flex justify-end">
                                <div className="w-full max-w-2xl space-y-3">
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-8">
                                        <div className="space-y-2">
                                            <div className="flex justify-between text-sm">
                                                <span className="text-gray-600">Sub Total</span>
                                                <span className="font-medium text-gray-900">{totals.subTotal}</span>
                                            </div>
                                            <div className="flex justify-between text-sm">
                                                <span className="text-gray-600">Some without tax</span>
                                                <span className="font-medium text-gray-900">{totals.someWithoutTax}</span>
                                            </div>
                                            <div className="flex justify-between items-center text-sm">
                                                <span className="text-gray-600">Tax</span>
                                                <select
                                                    value={taxPercentage}
                                                    onChange={(e) => setTaxPercentage(e.target.value)}
                                                    className="px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                >
                                                    <option value="0">0 %</option>
                                                    <option value="5">5 %</option>
                                                    <option value="12">12 %</option>
                                                    <option value="18">18 %</option>
                                                    <option value="28">28 %</option>
                                                </select>
                                            </div>
                                            <div className="flex justify-between text-sm">
                                                <span className="text-gray-600"></span>
                                                <span className="font-medium text-gray-900">{totals.tax}</span>
                                            </div>
                                            <div className="flex justify-between text-sm font-bold border-t pt-2">
                                                <span className="text-gray-900">Total</span>
                                                <span className="text-gray-900">{totals.total}</span>
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <div className="flex justify-between text-sm font-bold">
                                                <span className="text-gray-900">Total Cost</span>
                                                <span className="text-gray-900">{totals.total}</span>
                                            </div>
                                            <div className="flex justify-between text-sm">
                                                <span className="text-gray-600">In-house</span>
                                                <span className="font-medium text-gray-900">{totals.inHouse}</span>
                                            </div>
                                            <div className="flex justify-between text-sm">
                                                <span className="text-gray-600">Outsourced</span>
                                                <span className="font-medium text-gray-900">{totals.outsourced}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Create Invoice Button */}
                        <div className="flex justify-center pb-6">
                            <button
                                onClick={handleCreateInvoice}
                                disabled={isSubmitting}
                                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-semibold transition-colors shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                            >
                                {isSubmitting ? (
                                    <>
                                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                        Creating...
                                    </>
                                ) : (
                                    'Create Invoice'
                                )}
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </Layout >
    );
}
