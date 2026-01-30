import React, { useState, useEffect } from 'react';
import { Layout } from '../components/Layout';
import axiosInstance from '../utils/axiosInstance';
import {
    FileText,
    Download,
    DollarSign,
    PieChart,
    TrendingUp,
    CheckCircle,
    Clock,
    Users,
    FileSpreadsheet,
    ArrowUpRight,
    ArrowDownRight,
    Filter
} from 'lucide-react';

// Interface for API Response
interface MetricData {
    value: string;
    change: number;
}

interface DashboardMetrics {
    budget: MetricData;
    invoiced: MetricData;
    received: MetricData;
    expenses: MetricData;
    profit: MetricData;
}

// Interface for Finance Overview API Response
interface FinanceSummaryCards {
    total_revenue: number;
    total_expenses: number;
    total_profit: number;
    total_outstanding: number;
    overall_collection_rate: number;
}

interface RecentHighlight {
    client_name: string;
    project_name: string;
    total_revenue: number;
    total_expenses: number;
    profit: number;
    profit_margin_percent: number;
    latest_invoice_status: string;
    last_receipt_date: string;
    outstanding_amount: number;
    collection_rate_percent: number;
}

interface FinanceOverviewResponse {
    summary_cards: FinanceSummaryCards;
    recent_highlights: RecentHighlight[];
}

// Interface for Financial Reports API Response (dedicated endpoint)
interface FinancialReportRow {
    invoice_no: string;
    invoice_date: string;
    client_name: string;
    invoice_total: number;
    amount_paid: number;
    outstanding_balance: number;
    status: string;
    due_date: string;
    last_payment_date: string | null;
    days_overdue: number;
}

interface FinancialReportsResponse {
    rows: FinancialReportRow[];
}

// Interface for Project Reports API Response
interface ProjectReportRow {
    project_no: number;
    project_name: string;
    project_status: string;
    budget: number;
    invoiced: number;
    received: number;
    expenses: number;
    profit: number;
}

interface ProjectReportsResponse {
    rows: ProjectReportRow[];
}

// Interface for Payment Reports API Response
interface PaymentReportRow {
    payment_date: string;
    invoice__invoice_no: string;
    invoice__client__company_name: string;
    payment_method: string;
    amount: number;
    invoice__status: string;
}

interface PaymentReportsResponse {
    rows: PaymentReportRow[];
}

// Interface for PO Invoice Reports API Response
interface POInvoiceReportRow {
    po_no: string;
    vendor__name: string;
    total_amount: number;
    paid: number;
    balance: number;
}

interface POInvoiceReportsResponse {
    rows: POInvoiceReportRow[];
}

type TabType = 'All' | 'Financial Reports' | 'Project Reports' | 'Payment Reports' | 'PO & Invoice Reports';

interface ReportsPageProps {
    userRole: 'admin' | 'user' | 'manager';
    currentPage: string;
    onNavigate: (page: string) => void;
}

const ReportsPage: React.FC<ReportsPageProps> = ({ userRole, currentPage, onNavigate }) => {
    const [activeTab, setActiveTab] = useState<TabType>('All');
    const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
    const [financeOverview, setFinanceOverview] = useState<FinanceOverviewResponse | null>(null);
    const [financialReports, setFinancialReports] = useState<FinancialReportsResponse | null>(null);
    const [projectReports, setProjectReports] = useState<ProjectReportsResponse | null>(null);
    const [paymentReports, setPaymentReports] = useState<PaymentReportsResponse | null>(null);
    const [poInvoiceReports, setPOInvoiceReports] = useState<POInvoiceReportsResponse | null>(null);
    const [loading, setLoading] = useState(true);

    // Fetch dashboard metrics and all reports from API
    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                // Fetch all APIs in parallel
                const [metricsResponse, financeResponse, financialResponse, projectResponse, paymentResponse, poInvoiceResponse] = await Promise.all([
                    axiosInstance.get('dashboard/metrics/'),
                    axiosInstance.get('finance/overview/?section=all'),
                    axiosInstance.get('finance/overview/?section=financial_reports'),
                    axiosInstance.get('finance/overview/?section=project_reports'),
                    axiosInstance.get('finance/overview/?section=payment_reports'),
                    axiosInstance.get('finance/overview/?section=po_invoice_reports')
                ]);

                setMetrics(metricsResponse.data);
                setFinanceOverview(financeResponse.data);
                setFinancialReports(financialResponse.data);
                setProjectReports(projectResponse.data);
                setPaymentReports(paymentResponse.data);
                setPOInvoiceReports(poInvoiceResponse.data);
            } catch (error) {
                console.error('Error fetching data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    // Helper function to format currency
    const formatCurrency = (value: string | number) => {
        const num = typeof value === 'string' ? parseFloat(value) : value;
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(num);
    };

    // Helper function to format trend
    const formatTrend = (change: number) => {
        if (change === 0) return '0%';
        return change > 0 ? `+${change}%` : `${change}%`;
    };

    // Create summary cards from API data
    const summaryCards = financeOverview?.summary_cards ? [
        {
            label: 'Total Revenue',
            amount: formatCurrency(financeOverview.summary_cards.total_revenue),
            icon: <DollarSign size={20} className="text-blue-600" />,
            trend: null as string | null
        },
        {
            label: 'Total Expenses',
            amount: formatCurrency(financeOverview.summary_cards.total_expenses),
            icon: <TrendingUp size={20} className="text-rose-600" />,
            trend: null as string | null
        },
        {
            label: 'Total Profit',
            amount: formatCurrency(financeOverview.summary_cards.total_profit),
            icon: <PieChart size={20} className="text-emerald-600" />,
            trend: null as string | null
        },
        {
            label: 'Total Outstanding',
            amount: formatCurrency(financeOverview.summary_cards.total_outstanding),
            icon: <Clock size={20} className="text-amber-600" />,
            trend: null as string | null
        },
        {
            label: 'Collection Rate',
            amount: `${financeOverview.summary_cards.overall_collection_rate.toFixed(2)}%`,
            icon: <CheckCircle size={20} className="text-indigo-600" />,
            trend: null as string | null
        },
    ] : [];

    const tabs: TabType[] = ['All', 'Financial Reports', 'Project Reports', 'Payment Reports', 'PO & Invoice Reports'];

    const renderTable = () => {
        switch (activeTab) {
            case 'Financial Reports':
                return (
                    <table className="w-full text-left border-collapse">
                        <thead className="sticky top-0 bg-gray-50 z-10">
                            <tr className="border-b border-gray-200">
                                <th className="px-6 py-4 text-sm font-semibold text-gray-600 uppercase tracking-wider">Invoice No</th>
                                <th className="px-6 py-4 text-sm font-semibold text-gray-600 uppercase tracking-wider">Client Name</th>
                                <th className="px-6 py-4 text-sm font-semibold text-gray-600 uppercase tracking-wider">Invoice Total</th>
                                <th className="px-6 py-4 text-sm font-semibold text-gray-600 uppercase tracking-wider">Amount Paid</th>
                                <th className="px-6 py-4 text-sm font-semibold text-gray-600 uppercase tracking-wider">Outstanding</th>
                                <th className="px-6 py-4 text-sm font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-4 text-sm font-semibold text-gray-600 uppercase tracking-wider">Due Date</th>
                                <th className="px-6 py-4 text-sm font-semibold text-gray-600 uppercase tracking-wider">Last Payment</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {financialReports?.rows?.map((row, idx) => (
                                <tr key={idx} className="hover:bg-gray-50 transition-colors group">
                                    <td className="px-6 py-4 text-sm text-gray-700 font-medium">{row.invoice_no}</td>
                                    <td className="px-6 py-4 text-sm text-gray-700">{row.client_name}</td>
                                    <td className="px-6 py-4 text-sm text-gray-700 font-semibold">{formatCurrency(row.invoice_total)}</td>
                                    <td className="px-6 py-4 text-sm text-gray-700">{formatCurrency(row.amount_paid)}</td>
                                    <td className="px-6 py-4 text-sm">
                                        <span className={`font-semibold ${row.outstanding_balance > 0 ? 'text-amber-600' : 'text-emerald-600'}`}>
                                            {formatCurrency(row.outstanding_balance)}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-sm">
                                        <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${row.status === 'Paid' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' :
                                            row.status === 'Partially Paid' ? 'bg-blue-50 text-blue-700 border border-blue-100' :
                                                row.status === 'Issued' ? 'bg-amber-50 text-amber-700 border border-amber-100' :
                                                    'bg-rose-50 text-rose-700 border border-rose-100'
                                            }`}>
                                            {row.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-600">{new Date(row.due_date).toLocaleDateString()}</td>
                                    <td className="px-6 py-4 text-sm text-gray-600">
                                        {row.last_payment_date ? new Date(row.last_payment_date).toLocaleDateString() : '-'}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                );
            case 'Project Reports':
                return (
                    <table className="w-full text-left border-collapse">
                        <thead className="sticky top-0 bg-gray-50 z-10">
                            <tr className="border-b border-gray-200">
                                <th className="px-6 py-4 text-sm font-semibold text-gray-600 uppercase tracking-wider">Project No</th>
                                <th className="px-6 py-4 text-sm font-semibold text-gray-600 uppercase tracking-wider">Project Name</th>
                                <th className="px-6 py-4 text-sm font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-4 text-sm font-semibold text-gray-600 uppercase tracking-wider">Budget</th>
                                <th className="px-6 py-4 text-sm font-semibold text-gray-600 uppercase tracking-wider">Invoiced</th>
                                <th className="px-6 py-4 text-sm font-semibold text-gray-600 uppercase tracking-wider">Received</th>
                                <th className="px-6 py-4 text-sm font-semibold text-gray-600 uppercase tracking-wider">Expenses</th>
                                <th className="px-6 py-4 text-sm font-semibold text-gray-600 uppercase tracking-wider">Profit</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {projectReports?.rows?.map((row) => (
                                <tr key={row.project_no} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4 text-sm text-gray-700 font-medium">#{row.project_no}</td>
                                    <td className="px-6 py-4 text-sm text-gray-700 font-medium">{row.project_name}</td>
                                    <td className="px-6 py-4 text-sm">
                                        <span className={`px-2.5 py-1 rounded-full text-xs font-medium capitalize ${row.project_status === 'completed' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' :
                                            row.project_status === 'planning' ? 'bg-blue-50 text-blue-700 border border-blue-100' :
                                                row.project_status === 'in_progress' ? 'bg-amber-50 text-amber-700 border border-amber-100' :
                                                    'bg-gray-50 text-gray-700 border border-gray-100'
                                            }`}>
                                            {row.project_status.replace('_', ' ')}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-700 font-semibold">{formatCurrency(row.budget)}</td>
                                    <td className="px-6 py-4 text-sm text-gray-700">{formatCurrency(row.invoiced)}</td>
                                    <td className="px-6 py-4 text-sm text-gray-700">{formatCurrency(row.received)}</td>
                                    <td className="px-6 py-4 text-sm text-gray-700">{formatCurrency(row.expenses)}</td>
                                    <td className="px-6 py-4 text-sm">
                                        <span className={`font-semibold ${row.profit >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                                            {formatCurrency(row.profit)}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                );
            case 'Payment Reports':
                return (
                    <table className="w-full text-left border-collapse">
                        <thead className="sticky top-0 bg-gray-50 z-10">
                            <tr className="border-b border-gray-200">
                                <th className="px-6 py-4 text-sm font-semibold text-gray-600 uppercase tracking-wider">Payment Date</th>
                                <th className="px-6 py-4 text-sm font-semibold text-gray-600 uppercase tracking-wider">Invoice No</th>
                                <th className="px-6 py-4 text-sm font-semibold text-gray-600 uppercase tracking-wider">Client Name</th>
                                <th className="px-6 py-4 text-sm font-semibold text-gray-600 uppercase tracking-wider">Payment Method</th>
                                <th className="px-6 py-4 text-sm font-semibold text-gray-600 uppercase tracking-wider">Amount</th>
                                <th className="px-6 py-4 text-sm font-semibold text-gray-600 uppercase tracking-wider">Invoice Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {paymentReports?.rows?.map((row, idx) => (
                                <tr key={idx} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4 text-sm text-gray-700">{new Date(row.payment_date).toLocaleDateString()}</td>
                                    <td className="px-6 py-4 text-sm text-gray-700 font-medium">{row.invoice__invoice_no}</td>
                                    <td className="px-6 py-4 text-sm text-gray-700">{row.invoice__client__company_name}</td>
                                    <td className="px-6 py-4 text-sm">
                                        <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${row.payment_method === 'Bank Transfer' ? 'bg-blue-50 text-blue-700 border border-blue-100' :
                                            row.payment_method === 'Credit Card' ? 'bg-purple-50 text-purple-700 border border-purple-100' :
                                                row.payment_method === 'Debit Card' ? 'bg-indigo-50 text-indigo-700 border border-indigo-100' :
                                                    'bg-gray-50 text-gray-700 border border-gray-100'
                                            }`}>
                                            {row.payment_method}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-700 font-semibold">{formatCurrency(row.amount)}</td>
                                    <td className="px-6 py-4 text-sm">
                                        <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${row.invoice__status === 'Paid' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' :
                                            row.invoice__status === 'Partially Paid' ? 'bg-amber-50 text-amber-700 border border-amber-100' :
                                                row.invoice__status === 'Cancelled' ? 'bg-rose-50 text-rose-700 border border-rose-100' :
                                                    'bg-blue-50 text-blue-700 border border-blue-100'
                                            }`}>
                                            {row.invoice__status}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                );
            case 'PO & Invoice Reports':
                return (
                    <table className="w-full text-left border-collapse">
                        <thead className="sticky top-0 bg-gray-50 z-10">
                            <tr className="border-b border-gray-200">
                                <th className="px-6 py-4 text-sm font-semibold text-gray-600 uppercase tracking-wider">PO Number</th>
                                <th className="px-6 py-4 text-sm font-semibold text-gray-600 uppercase tracking-wider">Vendor Name</th>
                                <th className="px-6 py-4 text-sm font-semibold text-gray-600 uppercase tracking-wider">Total Amount</th>
                                <th className="px-6 py-4 text-sm font-semibold text-gray-600 uppercase tracking-wider">Paid</th>
                                <th className="px-6 py-4 text-sm font-semibold text-gray-600 uppercase tracking-wider">Balance</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {poInvoiceReports?.rows?.map((row, idx) => (
                                <tr key={idx} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4 text-sm text-gray-700 font-medium">{row.po_no}</td>
                                    <td className="px-6 py-4 text-sm text-gray-700">{row.vendor__name}</td>
                                    <td className="px-6 py-4 text-sm text-gray-700 font-semibold">{formatCurrency(row.total_amount)}</td>
                                    <td className="px-6 py-4 text-sm text-gray-700">{formatCurrency(row.paid)}</td>
                                    <td className="px-6 py-4 text-sm">
                                        <span className={`font-semibold ${row.balance === 0 ? 'text-emerald-600' : 'text-amber-600'}`}>
                                            {formatCurrency(row.balance)}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                );
            case 'All':
            default:
                // Combine all reports from API data
                const allReports: any[] = [
                    ...(financialReports?.rows?.map(row => ({
                        type: 'Financial',
                        primary: row.invoice_no,
                        secondary: row.client_name,
                        status: row.status
                    })) || []),
                    ...(projectReports?.rows?.map(row => ({
                        type: 'Project',
                        primary: row.project_name,
                        secondary: formatCurrency(row.budget),
                        status: row.project_status
                    })) || []),
                    ...(paymentReports?.rows?.map(row => ({
                        type: 'Payment',
                        primary: row.invoice__invoice_no,
                        secondary: row.invoice__client__company_name,
                        status: row.payment_method
                    })) || []),
                    ...(poInvoiceReports?.rows?.map(row => ({
                        type: 'PO & Invoice',
                        primary: row.po_no,
                        secondary: row.vendor__name,
                        status: formatCurrency(row.balance)
                    })) || [])
                ];

                return (
                    <table className="w-full text-left border-collapse">
                        <thead className="sticky top-0 bg-gray-50 z-10">
                            <tr className="border-b border-gray-200">
                                <th className="px-6 py-4 text-sm font-semibold text-gray-600 uppercase tracking-wider">Report Type</th>
                                <th className="px-6 py-4 text-sm font-semibold text-gray-600 uppercase tracking-wider">Primary Detail</th>
                                <th className="px-6 py-4 text-sm font-semibold text-gray-600 uppercase tracking-wider">Secondary Detail</th>
                                <th className="px-6 py-4 text-sm font-semibold text-gray-600 uppercase tracking-wider">Status/Value</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {allReports.map((row, idx) => (
                                <tr key={idx} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4 text-sm">
                                        <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs font-bold uppercase">
                                            {row.type}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-700 font-medium">{row.primary}</td>
                                    <td className="px-6 py-4 text-sm text-gray-600">{row.secondary}</td>
                                    <td className="px-6 py-4 text-sm">
                                        <span className={`font-semibold ${row.type === 'Financial' ? 'text-emerald-600' :
                                            row.type === 'Project' ? 'text-blue-600 capitalize' :
                                                row.type === 'Payment' ? 'text-indigo-600' :
                                                    'text-amber-600'
                                            }`}>
                                            {row.type === 'Project' ? row.status.replace('_', ' ') : row.status}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                );
        }
    };

    return (
        <Layout userRole={userRole} currentPage={currentPage} onNavigate={onNavigate}>
            <div className="space-y-8 animate-in fade-in duration-500">

                {/* Page Header */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                    <div>
                        <nav className="flex mb-2" aria-label="Breadcrumb">
                            <ol className="flex items-center space-x-2 text-sm text-gray-500">
                                <li><a href="/dashboard" className="hover:text-blue-600 transition-colors">Home</a></li>
                                <li><span className="mx-1 text-gray-400">/</span></li>
                                <li className="text-gray-900 font-medium">Reports</li>
                            </ol>
                        </nav>
                        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Reports</h1>
                        <p className="text-gray-500 mt-1">Financial, Project, Payment & Invoice Insights</p>
                    </div>

                    <div className="flex items-center gap-3">
                        <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-semibold text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-all shadow-sm">
                            <Filter size={16} />
                            Filter
                        </button>
                        <div className="h-8 w-px bg-gray-200 mx-1 hidden md:block"></div>
                        <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-semibold text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-all shadow-sm">
                            <FileSpreadsheet size={16} className="text-emerald-600" />
                            Export Excel
                        </button>
                        <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-semibold text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-all shadow-sm">
                            <Download size={16} className="text-rose-600" />
                            Export PDF
                        </button>
                    </div>
                </div>

                {/* Financial Summary Section */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                    {loading ? (
                        // Loading skeleton
                        Array.from({ length: 5 }).map((_, idx) => (
                            <div key={idx} className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm animate-pulse">
                                <div className="flex items-start justify-between">
                                    <div className="w-10 h-10 bg-gray-200 rounded-lg"></div>
                                    <div className="w-12 h-4 bg-gray-200 rounded"></div>
                                </div>
                                <div className="mt-4">
                                    <div className="w-16 h-4 bg-gray-200 rounded mb-2"></div>
                                    <div className="w-24 h-8 bg-gray-200 rounded"></div>
                                </div>
                            </div>
                        ))
                    ) : (
                        summaryCards.map((card, idx) => (
                            <div key={idx} className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow group">
                                <div className="flex items-start justify-between">
                                    <div className="p-2 bg-gray-50 rounded-lg group-hover:bg-white transition-colors border border-transparent group-hover:border-gray-100">
                                        {card.icon}
                                    </div>
                                    {card.trend && (
                                        <span className={`text-xs font-bold flex items-center gap-0.5 ${card.trend.startsWith('+') ? 'text-emerald-600' : card.trend.startsWith('-') ? 'text-rose-600' : 'text-gray-600'}`}>
                                            {card.trend.startsWith('+') ? <ArrowUpRight size={12} /> : card.trend.startsWith('-') ? <ArrowDownRight size={12} /> : null}
                                            {card.trend}
                                        </span>
                                    )}
                                </div>
                                <div className="mt-4">
                                    <p className="text-sm font-medium text-gray-500">{card.label}</p>
                                    <h3 className="text-2xl font-bold text-gray-900 mt-1">{card.amount}</h3>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* Reports Tabs Section */}
                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                    <div className="border-b border-gray-200 bg-gray-50/50 px-6">
                        <nav className="flex -mb-px space-x-8 overflow-x-auto no-scrollbar">
                            {tabs.map((tab) => (
                                <button
                                    key={tab}
                                    onClick={() => setActiveTab(tab)}
                                    className={`
                    whitespace-nowrap py-5 px-1 border-b-2 font-semibold text-sm transition-all
                    ${activeTab === tab
                                            ? 'border-blue-600 text-blue-600'
                                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                        }
                  `}
                                >
                                    {tab}
                                </button>
                            ))}
                        </nav>
                    </div>

                    {/* Report Content Area */}
                    <div className="overflow-x-auto">
                        {renderTable()}
                    </div>

                    {/* Table Footer / Pagination Placeholder */}
                    <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex items-center justify-between">
                        <p className="text-sm text-gray-500">
                            Showing <span className="font-medium text-gray-900">1</span> to <span className="font-medium text-gray-900">10</span> of <span className="font-medium text-gray-900">45</span> results
                        </p>
                        <div className="flex gap-2">
                            <button className="px-3 py-1 border border-gray-300 rounded text-sm font-medium text-gray-600 hover:bg-white disabled:opacity-50" disabled>Previous</button>
                            <button className="px-3 py-1 border border-gray-300 rounded text-sm font-medium text-gray-600 hover:bg-white">Next</button>
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    );
};

export default ReportsPage;
