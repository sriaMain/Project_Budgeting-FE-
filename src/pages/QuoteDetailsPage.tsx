/**
 * Quote Details Page
 * Displays detailed information about a specific quote
 * Matches the reference design exactly
 */

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Edit, FileText, Share2, Send } from 'lucide-react';
import { Layout } from '../components/Layout';
import { InfoDisplay } from '../components/InfoDisplay';
import { ReusableTable, type Column } from '../components/ReusableTable';
import { CreateProjectModal } from '../components/CreateProjectModal';
import axiosInstance from '../utils/axiosInstance';
import type { QuoteDetails } from '../types/pipeline.types';

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
    bill: string;
}

export default function QuoteDetailsPage({
    userRole = 'admin',
    currentPage = 'pipeline',
    onNavigate = () => { }
}: QuoteDetailsPageProps) {
    const { quoteNo } = useParams<{ quoteNo: string }>();
    const navigate = useNavigate();
    const [isCreateProjectModalOpen, setIsCreateProjectModalOpen] = useState(false);
    const [quoteDetails, setQuoteDetails] = useState<QuoteDetails | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isSending, setIsSending] = useState(false);
    const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);
    const [isSharing, setIsSharing] = useState(false);

    useEffect(() => {
        if (quoteNo) {
            fetchQuoteDetails();
        }
    }, [quoteNo]);

    const fetchQuoteDetails = async () => {
        try {
            setIsLoading(true);
            setError(null);
            const response = await axiosInstance.get(`/quotes/${quoteNo}/`);
            setQuoteDetails(response.data);
        } catch (err: any) {
            console.error('Failed to fetch quote details:', err);
            setError('Failed to load quote details. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleEdit = () => {
        navigate(`/pipeline/edit-quote/${quoteNo}`);
        // TODO: Navigate to edit page or open edit modal
    };

    const handleSendQuote = async () => {
        if (!quoteNo) return;

        try {
            setIsSending(true);
            await axiosInstance.post(`quotes/${quoteNo}/send/`);
            alert('Quote sent successfully!');
        } catch (err: any) {
            console.error('Failed to send quote:', err);
            alert('Failed to send quote. Please try again.');
        } finally {
            setIsSending(false);
        }
    };

    const handleDownloadPdf = async () => {
        if (!quoteNo) return;

        try {
            setIsDownloadingPdf(true);
            const response = await axiosInstance.get(`quotes/${quoteNo}/invoice/`, {
                responseType: 'blob', // Important for handling binary data
            });

            // Create a URL for the blob
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `quote_${quoteNo}.pdf`); // Set the file name
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url); // Clean up
        } catch (err: any) {
            console.error('Failed to download PDF:', err);
            alert('Failed to download PDF. Please try again.');
        } finally {
            setIsDownloadingPdf(false);
        }
    };

    const handleShareLink = async () => {
        if (!quoteNo) return;

        try {
            setIsSharing(true);
            const response = await axiosInstance.post(`/quotes/${quoteNo}/send/`);
            const shareLink = response.data.link; // Assuming the API returns { link: "..." }

            if (shareLink) {
                await navigator.clipboard.writeText(shareLink);
                alert('Link copied to clipboard!');
            } else {
                throw new Error('No link received from server');
            }
        } catch (err: any) {
            console.error('Failed to share link:', err);
            alert('Failed to generate share link. Please try again.');
        } finally {
            setIsSharing(false);
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

    if (error || !quoteDetails) {
        return (
            <Layout userRole={userRole} currentPage={currentPage} onNavigate={onNavigate}>
                <div className="flex flex-col items-center justify-center min-h-[400px]">
                    <div className="text-red-600 mb-4">{error || 'Quote not found'}</div>
                    <button
                        onClick={() => window.location.reload()}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        Retry
                    </button>
                </div>
            </Layout>
        );
    }

    // Map API data to UI format
    const quoteData = {
        quoteNo: quoteDetails.quote_no.toString(),
        author: quoteDetails.author,
        dateOfIssue: new Date(quoteDetails.date_of_issue).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' }).replace(/\//g, '-'),
        dueDate: new Date(quoteDetails.due_date).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' }).replace(/\//g, '-'),
        quoteName: quoteDetails.quote_name,
        status: quoteDetails.status,
        client: quoteDetails.client.company_name,
        clientSubtitle: `${quoteDetails.client.city}, ${quoteDetails.client.state}`
    };

    // Map items to table rows
    const products: ProductRow[] = quoteDetails.items.map((item, index) => ({
        id: index.toString(),
        productGroup: item.product_group,
        productName: item.product_name,
        quantity: item.quantity.toFixed(2),
        unit: item.unit,
        unitPrice: parseFloat(item.price_per_unit).toFixed(2),
        amount: parseFloat(item.amount).toFixed(2),
        cost: parseFloat(item.cost).toFixed(2),
        po: item.po_number || '',
        bill: item.bill_number || ''
    }));

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
            header: 'BILL',
            accessor: 'bill',
            className: 'text-center'
        }
    ];

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
                    <button
                        onClick={handleDownloadPdf}
                        disabled={isDownloadingPdf}
                        className={`flex items-center gap-2 px-5 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-gray-700 font-medium shadow-sm ${isDownloadingPdf ? 'opacity-70 cursor-not-allowed' : ''}`}
                    >
                        {isDownloadingPdf ? (
                            <div className="w-4 h-4 border-2 border-gray-600 border-t-transparent rounded-full animate-spin" />
                        ) : (
                            <FileText size={18} />
                        )}
                        <span>{isDownloadingPdf ? 'Downloading...' : 'PDF'}</span>
                    </button>
                    <button
                        onClick={handleShareLink}
                        disabled={isSharing}
                        className={`flex items-center gap-2 px-5 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-gray-700 font-medium shadow-sm ${isSharing ? 'opacity-70 cursor-not-allowed' : ''}`}
                    >
                        {isSharing ? (
                            <div className="w-4 h-4 border-2 border-gray-600 border-t-transparent rounded-full animate-spin" />
                        ) : (
                            <Share2 size={18} />
                        )}
                        <span>{isSharing ? 'Sharing...' : 'Share via link'}</span>
                    </button>
                    <button
                        onClick={handleSendQuote}
                        disabled={isSending}
                        className={`flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-lg font-semibold transition-colors shadow-md hover:shadow-lg ${isSending ? 'opacity-70 cursor-not-allowed' : ''}`}
                    >
                        {isSending ? (
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        ) : (
                            <Send size={18} />
                        )}
                        <span>{isSending ? 'Sending...' : 'Send'}</span>
                    </button>
                </div>
            </div>

            {/* Create Project Modal */}
            <CreateProjectModal
                isOpen={isCreateProjectModalOpen}
                onClose={() => setIsCreateProjectModalOpen(false)}
                quoteName={quoteData.quoteName}
                quoteId={quoteDetails.quote_no}
                clientId={quoteDetails.client.id}
                clientName={quoteDetails.client.company_name}
                projectManagerName={quoteDetails.author}
            />
        </Layout>
    );
}