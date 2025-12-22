/**
 * Quote Details Page
 * Displays detailed information about a specific quote
 * Matches the reference design exactly
 */

import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Edit, FileText, Share2, Send } from 'lucide-react';
import { Layout } from '../components/Layout';
import { InfoDisplay } from '../components/InfoDisplay';
import { ReusableTable, type Column } from '../components/ReusableTable';
import { CreateProjectModal } from '../components/CreateProjectModal';

interface QuoteDetailsPageProps {
    userRole?: 'admin' | 'user';
    currentPage?: string;
    onNavigate?: (page: string) => void;
}

interface ProductRow {
    id: string;
    productGroup: string;
    productName: string;
    quantity: string;
    unit: string;
    unitPrice: string;
    amount: string;
    cost: string;
    po: string;
    bri: string;
}

export default function QuoteDetailsPage({
    userRole = 'admin',
    currentPage = 'pipeline',
    onNavigate = () => { }
}: QuoteDetailsPageProps) {
    const { quoteNo } = useParams<{ quoteNo: string }>();
    const navigate = useNavigate();
    const [isCreateProjectModalOpen, setIsCreateProjectModalOpen] = useState(false);

    // Static data for demonstration (as requested)
    const quoteData = {
        quoteNo: quoteNo || '40',
        author: 'Vigranth Kumar',
        dateOfIssue: '25-10-2025',
        dueDate: '25-12-2025',
        quoteName: 'Client A quote',
        status: 'Opportunity',
        client: 'Client A',
        clientSubtitle: 'Project Essentials Template'
    };

    // Static product data matching the reference design
    const products: ProductRow[] = [
        {
            id: '1',
            productGroup: 'Subvest',
            productName: 'Subvest',
            quantity: '0.00',
            unit: 'Total',
            unitPrice: '0.00',
            amount: '0.00',
            cost: '0.00',
            po: '',
            bri: ''
        },
        {
            id: '2',
            productGroup: '',
            productName: 'In-house',
            quantity: '0.00',
            unit: '',
            unitPrice: '0.00',
            amount: '0.00',
            cost: '0.00',
            po: '',
            bri: ''
        },
        {
            id: '3',
            productGroup: '',
            productName: 'Out-Sourced',
            quantity: '0.00',
            unit: '',
            unitPrice: '0.00',
            amount: '0.00',
            cost: '0.00',
            po: '',
            bri: ''
        },
        {
            id: '4',
            productGroup: 'Total/MI',
            productName: '',
            quantity: '0.00',
            unit: '',
            unitPrice: '',
            amount: '0.00',
            cost: '0.00',
            po: '',
            bri: ''
        },
        {
            id: '5',
            productGroup: 'Inclusive Synoptic',
            productName: '',
            quantity: '0.00',
            unit: '',
            unitPrice: '',
            amount: '0.00',
            cost: '0.00',
            po: '',
            bri: ''
        },
        {
            id: '6',
            productGroup: 'To be Scoped (TBS)',
            productName: '',
            quantity: '0.00',
            unit: '',
            unitPrice: '',
            amount: '0.00',
            cost: '0.00',
            po: '',
            bri: ''
        }
    ];

    // Define table columns for products
    const productColumns: Column<ProductRow>[] = [
        {
            header: 'Product Group',
            accessor: 'productGroup',
            className: 'font-medium'
        },
        {
            header: 'Product Name',
            accessor: 'productName'
        },
        {
            header: 'Quantity',
            accessor: 'quantity',
            className: 'text-right'
        },
        {
            header: 'Unit',
            accessor: 'unit'
        },
        {
            header: 'Unit Price',
            accessor: 'unitPrice',
            className: 'text-right'
        },
        {
            header: 'Amount',
            accessor: 'amount',
            className: 'text-right'
        },
        {
            header: 'Cost',
            accessor: 'cost',
            className: 'text-right'
        },
        {
            header: 'PO',
            accessor: 'po',
            className: 'text-center'
        },
        {
            header: 'BRI',
            accessor: 'bri',
            className: 'text-center'
        }
    ];

    const handleEdit = () => {
        console.log('Edit quote:', quoteNo);
        // TODO: Navigate to edit page or open edit modal
    };

    return (
        <Layout userRole={userRole} currentPage={currentPage} onNavigate={onNavigate}>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-bold text-gray-900">Quote Details</h1>
                    <button
                        onClick={handleEdit}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                        aria-label="Edit quote"
                    >
                        <Edit size={20} className="text-gray-600" />
                    </button>
                </div>

                {/* Quote Information Card */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    {/* Info Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                        {/* Quote No */}
                        <InfoDisplay label="Quote No" value={quoteData.quoteNo} />

                        {/* Author */}
                        <InfoDisplay label="Author" value={quoteData.author} />

                        {/* Date of Issue */}
                        <InfoDisplay label="Date of Issue" value={quoteData.dateOfIssue} />

                        {/* Due Date */}
                        <InfoDisplay label="Due Date" value={quoteData.dueDate} />

                        {/* Quote Name */}
                        <InfoDisplay label="Quote Name" value={quoteData.quoteName} />

                        {/* Status with Edit Button */}
                        <InfoDisplay
                            label="Status"
                            value={
                                <div className="flex items-center gap-2">
                                    <span className="inline-flex items-center bg-purple-100 text-purple-700 px-3 py-1 rounded text-sm font-medium">
                                        {quoteData.status}
                                    </span>
                                    <button
                                        onClick={handleEdit}
                                        className="p-1 hover:bg-gray-100 rounded transition-colors"
                                        aria-label="Edit status"
                                    >
                                        <Edit size={16} className="text-gray-600" />
                                    </button>
                                </div>
                            }
                        />

                        {/* Client - Full Width */}
                        <div className="md:col-span-2">
                            <InfoDisplay
                                label="Client"
                                value={
                                    <div>
                                        <span className="font-semibold">{quoteData.client}</span>
                                        <span className="text-sm text-gray-500 ml-2">
                                            {quoteData.clientSubtitle}
                                        </span>
                                    </div>
                                }
                            />
                        </div>
                    </div>

                    <div className="pt-4 border-t border-gray-200">
                        <button
                            onClick={() => setIsCreateProjectModalOpen(true)}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-lg font-semibold transition-colors shadow-md hover:shadow-lg"
                        >
                            Create Project
                        </button>
                    </div>
                </div>

                {/* Products Table */}
                <div>
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">Products</h2>
                    <ReusableTable
                        data={products}
                        columns={productColumns}
                        keyField="id"
                        emptyMessage="No products found"
                    />
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-3 pb-6">
                    <button className="flex items-center gap-2 px-5 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-gray-700 font-medium shadow-sm">
                        <FileText size={18} />
                        <span>PDF</span>
                    </button>
                    <button className="flex items-center gap-2 px-5 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-gray-700 font-medium shadow-sm">
                        <Share2 size={18} />
                        <span>Share via link</span>
                    </button>
                    <button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-lg font-semibold transition-colors shadow-md hover:shadow-lg">
                        <Send size={18} />
                        <span>Send</span>
                    </button>
                </div>
            </div>

            {/* Create Project Modal */}
            <CreateProjectModal
                isOpen={isCreateProjectModalOpen}
                onClose={() => setIsCreateProjectModalOpen(false)}
                quoteName={quoteData.quoteName}
            />
        </Layout>
    );
}
