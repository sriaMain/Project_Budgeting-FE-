import React, { useState } from 'react';
import { Layout } from '../components/Layout';
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

// Dummy Data
const summaryCards = [
    { label: 'Budget', amount: '$1,250,000', icon: <DollarSign size={20} className="text-blue-600" />, trend: '+12%' },
    { label: 'Invoiced', amount: '$850,000', icon: <FileText size={20} className="text-indigo-600" />, trend: '+5%' },
    { label: 'Received', amount: '$720,000', icon: <CheckCircle size={20} className="text-emerald-600" />, trend: '+8%' },
    { label: 'Expenses', amount: '$420,000', icon: <TrendingUp size={20} className="text-rose-600" />, trend: '-2%' },
    { label: 'Profit', amount: '$300,000', icon: <PieChart size={20} className="text-amber-600" />, trend: '+15%' },
];

const financialReports = [
    { id: 1, revenue: '$150,000', expenses: '$45,000', status: 'Paid', history: '2023-10-15', outstanding: '$0' },
    { id: 2, revenue: '$280,000', expenses: '$92,000', status: 'Pending', history: '2023-11-02', outstanding: '$280,000' },
    { id: 3, revenue: '$65,000', expenses: '$12,000', status: 'Partial', history: '2023-11-20', outstanding: '$30,000' },
    { id: 4, revenue: '$420,000', expenses: '$110,000', status: 'Paid', history: '2023-09-28', outstanding: '$0' },
];

const projectReports = [
    { id: 1, name: 'Cloud Migration', status: 'Active', timeline: 'Jan - Dec 2024', utilization: '85%' },
    { id: 2, name: 'ERP Implementation', status: 'Completed', timeline: 'Jun - Nov 2023', utilization: '92%' },
    { id: 3, name: 'Security Audit', status: 'Active', timeline: 'Oct 2023 - Mar 2024', utilization: '45%' },
    { id: 4, name: 'Mobile App Dev', status: 'Active', timeline: 'Feb - Aug 2024', utilization: '70%' },
];

const paymentReports = [
    { id: 1, rate: '95%', aging: '15 Days', analysis: 'On-time', tracking: 'Net 30' },
    { id: 2, rate: '82%', aging: '45 Days', analysis: 'Delayed', tracking: 'Net 30' },
    { id: 3, rate: '100%', aging: '0 Days', analysis: 'Early', tracking: 'Net 15' },
    { id: 4, rate: '75%', aging: '60 Days', analysis: 'Critical', tracking: 'Net 45' },
];

const poInvoiceReports = [
    { id: 1, poStatus: 'Approved', amount: '$45,000', matchStatus: 'Matched', timeline: '10 Days', behavior: 'Reliable' },
    { id: 2, poStatus: 'Pending', amount: '$12,500', matchStatus: 'Unmatched', timeline: 'N/A', behavior: 'New Client' },
    { id: 3, poStatus: 'Approved', amount: '$89,000', matchStatus: 'Matched', timeline: '22 Days', behavior: 'Slow Payer' },
    { id: 4, poStatus: 'Rejected', amount: '$5,000', matchStatus: 'N/A', timeline: 'N/A', behavior: 'N/A' },
];

const allReports = [
    ...financialReports.map(r => ({ ...r, type: 'Financial' })),
    ...projectReports.map(r => ({ ...r, type: 'Project' })),
    ...paymentReports.map(r => ({ ...r, type: 'Payment' })),
    ...poInvoiceReports.map(r => ({ ...r, type: 'PO & Invoice' })),
];

type TabType = 'All' | 'Financial Reports' | 'Project Reports' | 'Payment Reports' | 'PO & Invoice Reports';

interface ReportsPageProps {
    userRole: 'admin' | 'user' | 'manager';
    currentPage: string;
    onNavigate: (page: string) => void;
}

const ReportsPage: React.FC<ReportsPageProps> = ({ userRole, currentPage, onNavigate }) => {
    const [activeTab, setActiveTab] = useState<TabType>('All');

    const tabs: TabType[] = ['All', 'Financial Reports', 'Project Reports', 'Payment Reports', 'PO & Invoice Reports'];

    // Axios instance (commented as requested)
    // const api = axios.create({ baseURL: '/api' });

    const renderTable = () => {
        switch (activeTab) {
            case 'Financial Reports':
                return (
                    <table className="w-full text-left border-collapse">
                        <thead className="sticky top-0 bg-gray-50 z-10">
                            <tr className="border-b border-gray-200">
                                <th className="px-6 py-4 text-sm font-semibold text-gray-600 uppercase tracking-wider">Revenue</th>
                                <th className="px-6 py-4 text-sm font-semibold text-gray-600 uppercase tracking-wider">Expenses</th>
                                <th className="px-6 py-4 text-sm font-semibold text-gray-600 uppercase tracking-wider">Invoice Status</th>
                                <th className="px-6 py-4 text-sm font-semibold text-gray-600 uppercase tracking-wider">Receipt History</th>
                                <th className="px-6 py-4 text-sm font-semibold text-gray-600 uppercase tracking-wider">Outstanding Amount</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {financialReports.map((row) => (
                                <tr key={row.id} className="hover:bg-gray-50 transition-colors group">
                                    <td className="px-6 py-4 text-sm text-gray-700 font-medium">{row.revenue}</td>
                                    <td className="px-6 py-4 text-sm text-gray-600">{row.expenses}</td>
                                    <td className="px-6 py-4 text-sm">
                                        <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${row.status === 'Paid' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' :
                                            row.status === 'Pending' ? 'bg-amber-50 text-amber-700 border border-amber-100' :
                                                'bg-blue-50 text-blue-700 border border-blue-100'
                                            }`}>
                                            {row.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-600">{row.history}</td>
                                    <td className="px-6 py-4 text-sm text-rose-600 font-semibold">{row.outstanding}</td>
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
                                <th className="px-6 py-4 text-sm font-semibold text-gray-600 uppercase tracking-wider">Project Name</th>
                                <th className="px-6 py-4 text-sm font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-4 text-sm font-semibold text-gray-600 uppercase tracking-wider">Timeline</th>
                                <th className="px-6 py-4 text-sm font-semibold text-gray-600 uppercase tracking-wider">Resource Utilization</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {projectReports.map((row) => (
                                <tr key={row.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4 text-sm text-gray-700 font-medium">{row.name}</td>
                                    <td className="px-6 py-4 text-sm">
                                        <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${row.status === 'Completed' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-blue-50 text-blue-700 border border-blue-100'
                                            }`}>
                                            {row.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-600">{row.timeline}</td>
                                    <td className="px-6 py-4 text-sm">
                                        <div className="flex items-center gap-2">
                                            <div className="w-24 bg-gray-200 rounded-full h-1.5">
                                                <div className="bg-blue-600 h-1.5 rounded-full" style={{ width: row.utilization }}></div>
                                            </div>
                                            <span className="text-xs text-gray-600">{row.utilization}</span>
                                        </div>
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
                                <th className="px-6 py-4 text-sm font-semibold text-gray-600 uppercase tracking-wider">Collection Rate</th>
                                <th className="px-6 py-4 text-sm font-semibold text-gray-600 uppercase tracking-wider">Aging</th>
                                <th className="px-6 py-4 text-sm font-semibold text-gray-600 uppercase tracking-wider">Receipt Analysis</th>
                                <th className="px-6 py-4 text-sm font-semibold text-gray-600 uppercase tracking-wider">Payment Terms Tracking</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {paymentReports.map((row) => (
                                <tr key={row.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4 text-sm text-gray-700 font-medium">{row.rate}</td>
                                    <td className="px-6 py-4 text-sm text-gray-600">{row.aging}</td>
                                    <td className="px-6 py-4 text-sm">
                                        <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${row.analysis === 'On-time' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' :
                                            row.analysis === 'Early' ? 'bg-blue-50 text-blue-700 border border-blue-100' :
                                                'bg-rose-50 text-rose-700 border border-rose-100'
                                            }`}>
                                            {row.analysis}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-600">{row.tracking}</td>
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
                                <th className="px-6 py-4 text-sm font-semibold text-gray-600 uppercase tracking-wider">PO Status</th>
                                <th className="px-6 py-4 text-sm font-semibold text-gray-600 uppercase tracking-wider">Invoice Amount</th>
                                <th className="px-6 py-4 text-sm font-semibold text-gray-600 uppercase tracking-wider">Receipt Match Status</th>
                                <th className="px-6 py-4 text-sm font-semibold text-gray-600 uppercase tracking-wider">Payment Timeline</th>
                                <th className="px-6 py-4 text-sm font-semibold text-gray-600 uppercase tracking-wider">Client Behavior</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {poInvoiceReports.map((row) => (
                                <tr key={row.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4 text-sm">
                                        <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${row.poStatus === 'Approved' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' :
                                            row.poStatus === 'Pending' ? 'bg-amber-50 text-amber-700 border border-amber-100' :
                                                'bg-rose-50 text-rose-700 border border-rose-100'
                                            }`}>
                                            {row.poStatus}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-700 font-medium">{row.amount}</td>
                                    <td className="px-6 py-4 text-sm text-gray-600">{row.matchStatus}</td>
                                    <td className="px-6 py-4 text-sm text-gray-600">{row.timeline}</td>
                                    <td className="px-6 py-4 text-sm text-gray-600">{row.behavior}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                );
            case 'All':
            default:
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
                            {allReports.map((row: any, idx) => (
                                <tr key={idx} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4 text-sm">
                                        <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs font-bold uppercase">
                                            {row.type}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-700 font-medium">
                                        {row.type === 'Financial' ? row.revenue :
                                            row.type === 'Project' ? row.name :
                                                row.type === 'Payment' ? row.rate :
                                                    row.amount}
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-600">
                                        {row.type === 'Financial' ? row.expenses :
                                            row.type === 'Project' ? row.timeline :
                                                row.type === 'Payment' ? row.aging :
                                                    row.matchStatus}
                                    </td>
                                    <td className="px-6 py-4 text-sm">
                                        {row.type === 'Financial' ? (
                                            <span className="text-emerald-600 font-semibold">{row.status}</span>
                                        ) : row.type === 'Project' ? (
                                            <span className="text-blue-600 font-semibold">{row.status}</span>
                                        ) : row.type === 'Payment' ? (
                                            <span className="text-indigo-600 font-semibold">{row.analysis}</span>
                                        ) : (
                                            <span className="text-amber-600 font-semibold">{row.poStatus}</span>
                                        )}
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
                    {summaryCards.map((card, idx) => (
                        <div key={idx} className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow group">
                            <div className="flex items-start justify-between">
                                <div className="p-2 bg-gray-50 rounded-lg group-hover:bg-white transition-colors border border-transparent group-hover:border-gray-100">
                                    {card.icon}
                                </div>
                                <span className={`text-xs font-bold flex items-center gap-0.5 ${card.trend.startsWith('+') ? 'text-emerald-600' : 'text-rose-600'}`}>
                                    {card.trend.startsWith('+') ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                                    {card.trend}
                                </span>
                            </div>
                            <div className="mt-4">
                                <p className="text-sm font-medium text-gray-500">{card.label}</p>
                                <h3 className="text-2xl font-bold text-gray-900 mt-1">{card.amount}</h3>
                            </div>
                        </div>
                    ))}
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

                        {/* Empty State (if data was empty) */}
                        {allReports.length === 0 && (
                            <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
                                <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                                    <FileText size={32} className="text-gray-300" />
                                </div>
                                <h3 className="text-lg font-semibold text-gray-900">No report data found</h3>
                                <p className="text-gray-500 max-w-xs mt-1">
                                    There is no data available for the selected criteria. Try adjusting your filters.
                                </p>
                            </div>
                        )}
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
