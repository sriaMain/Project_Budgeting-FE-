import React, { useState, useEffect } from 'react';
import { Layout } from '../components/Layout';
import { useNavigate, useParams } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import axiosInstance from '../utils/axiosInstance';

interface Task {
    id: string;
    assignee: string;
    assigneeAvatar: string;
    title: string;
    status: 'Planned' | 'In Progress' | 'Completed';
    activityType: string;
    progress: number;
    dueDate: string;
    done: string;
    remaining: string;
}

interface ProjectDetailsPageProps {
    userRole: 'admin' | 'user';
    currentPage: string;
    onNavigate: (page: string) => void;
}

const ProjectDetailsPage: React.FC<ProjectDetailsPageProps> = ({ userRole, currentPage, onNavigate }) => {
    const { projectId } = useParams<{ projectId: string }>();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState<string>('Tasks');
    const [activeSubTab, setActiveSubTab] = useState<string>('Budget health');
    const [expandedSection, setExpandedSection] = useState<string | null>('Burn');
    const [project, setProject] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProjectDetails = async () => {
            if (!projectId) return;
            try {
                const response = await axiosInstance.get(`/projects/${projectId}/`);
                setProject(response.data);
            } catch (error) {
                console.error('Error fetching project details:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchProjectDetails();
    }, [projectId]);

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'Planned':
                return 'bg-purple-500 text-white';
            case 'In Progress':
                return 'bg-green-100 text-green-800';
            case 'Completed':
                return 'bg-blue-100 text-blue-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const tasks: Task[] = [
        {
            id: '1',
            assignee: 'Taylor Abbott',
            assigneeAvatar: 'SG',
            title: 'authentication',
            status: 'Planned',
            activityType: 'Development',
            progress: 0,
            dueDate: '2025-01-15',
            done: '1.00',
            remaining: '5.00'
        }
    ];

    // Budget chart data
    const budgetData = [
        { date: '24 Oct', budget: 2000, usedBudget: 500, forecastedBudget: 1800, budgetedCost: 1500, actualCost: 400, forecastedCost: 1200 },
        { date: '26 Oct', budget: 2000, usedBudget: 600, forecastedBudget: 1900, budgetedCost: 1500, actualCost: 500, forecastedCost: 1250 },
        { date: '28 Oct', budget: 2000, usedBudget: 750, forecastedBudget: 1950, budgetedCost: 1500, actualCost: 650, forecastedCost: 1300 },
        { date: '30 Oct', budget: 2000, usedBudget: 900, forecastedBudget: 1970, budgetedCost: 1500, actualCost: 800, forecastedCost: 1350 },
        { date: '1 Nov', budget: 2000, usedBudget: 1050, forecastedBudget: 1980, budgetedCost: 1500, actualCost: 950, forecastedCost: 1400 },
        { date: '3 Nov', budget: 2000, usedBudget: 1200, forecastedBudget: 1985, budgetedCost: 1500, actualCost: 1100, forecastedCost: 1420 },
        { date: '5 Nov', budget: 2000, usedBudget: 1350, forecastedBudget: 1990, budgetedCost: 1500, actualCost: 1250, forecastedCost: 1440 },
        { date: '7 Nov', budget: 2000, usedBudget: 1500, forecastedBudget: 1995, budgetedCost: 1500, actualCost: 1400, forecastedCost: 1460 },
        { date: '9 Nov', budget: 2000, usedBudget: 1650, forecastedBudget: 1997, budgetedCost: 1500, actualCost: 1550, forecastedCost: 1480 },
        { date: '11 Nov', budget: 2000, usedBudget: 1800, forecastedBudget: 1998, budgetedCost: 1500, actualCost: 1700, forecastedCost: 1500 },
        { date: '13 Nov', budget: 2000, usedBudget: 1950, forecastedBudget: 2000, budgetedCost: 1500, actualCost: 1850, forecastedCost: 1520 },
        { date: '15 Nov', budget: 2000, usedBudget: 2100, forecastedBudget: 2050, budgetedCost: 1500, actualCost: 2000, forecastedCost: 1550 },
        { date: '17 Nov', budget: 2000, usedBudget: 2250, forecastedBudget: 2100, budgetedCost: 1500, actualCost: 2150, forecastedCost: 1580 },
        { date: '19 Nov', budget: 2000, usedBudget: 2400, forecastedBudget: 2150, budgetedCost: 1500, actualCost: 2300, forecastedCost: 1610 },
        { date: '21 Nov', budget: 2000, usedBudget: 2550, forecastedBudget: 2200, budgetedCost: 1500, actualCost: 2450, forecastedCost: 1640 },
    ];

    if (loading) {
        return (
            <Layout userRole={userRole} currentPage={currentPage} onNavigate={onNavigate}>
                <div className="flex items-center justify-center h-screen">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                </div>
            </Layout>
        );
    }

    if (!project) {
        return (
            <Layout userRole={userRole} currentPage={currentPage} onNavigate={onNavigate}>
                <div className="flex items-center justify-center h-screen">
                    <div className="text-center">
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">Project Not Found</h2>
                        <p className="text-gray-600 mb-4">The project you are looking for does not exist or you don't have permission to view it.</p>
                        <button
                            onClick={() => navigate('/projects')}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            Back to Projects
                        </button>
                    </div>
                </div>
            </Layout>
        );
    }

    return (
        <Layout userRole={userRole} currentPage={currentPage} onNavigate={onNavigate}>
            <div className="max-w-7xl mx-auto space-y-6">
                {/* Header Section */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
                        <div className="flex items-center gap-3">
                            <span className="text-sm text-gray-600 font-medium">#{project.project_no || projectId}</span>
                            <span className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-medium ${getStatusColor(project.status || 'In Progress')}`}>
                                {project.status || 'In Progress'}
                            </span>
                        </div>
                        <div className="flex gap-4">
                            <button
                                onClick={() => navigate('/pipeline/add-quote', { state: { clientName: project.client_details?.company_name || project.client_details?.name } })}
                                className="px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors duration-200 shadow-md"
                            >
                                + Add Quote
                            </button>
                            <button
                                onClick={() => navigate(`/projects/edit/${projectId}`)}
                                className="px-4 py-2 bg-purple-200 text-black font-medium rounded-lg hover:bg-purple-300 transition-colors duration-200"
                            >
                                ✎ Modify Details
                            </button>
                            <button className="px-4 py-2 bg-purple-200 text-black font-medium rounded-lg hover:bg-purple-300 transition-colors duration-200">
                                Monthly Budget
                            </button>
                        </div>
                    </div>

                    {/* Project Title */}
                    <h1 className="text-2xl font-bold text-gray-900 mb-4">{project.project_name}</h1>

                    {/* Team Member, Date & Progress Bar */}
                    <div className="space-y-2">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-medium text-sm">
                                    {project.client_details?.name?.substring(0, 2).toUpperCase() || 'CL'}
                                </div>
                                <span className="text-sm text-gray-900">&gt;</span>
                                <div className="w-8 h-8 rounded-full border-2 border-dotted border-gray-400 flex items-center justify-center text-xs text-gray-500">
                                    +
                                </div>
                                <p className="text-xs text-gray-600">{project.start_date}</p>
                            </div>
                            <div className="flex items-center gap-2 flex-1">
                                <div className="flex-1 bg-gray-200 rounded-full h-2">
                                    <div className="bg-blue-600 h-2 rounded-full" style={{ width: `${project.progress || 0}%` }}></div>
                                </div>
                                <span className="text-xs text-gray-600 whitespace-nowrap">Estimated: {project.estimated_hours || 0}h</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Stats Section */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                        <p className="text-xs text-gray-600 mb-2">Billable hours</p>
                        <p className="text-2xl font-bold text-gray-900 mb-1">0:00</p>
                        <p className="text-xs text-gray-600">h</p>
                        <p className="text-xs text-gray-600 mt-2">0% of total</p>
                    </div>

                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                        <p className="text-xs text-gray-600 mb-2">Remaining Billable hours</p>
                        <p className="text-2xl font-bold text-gray-900 mb-1">20:00</p>
                        <p className="text-xs text-gray-600">h</p>
                        <p className="text-xs text-gray-600 mt-2">100% of total</p>
                    </div>

                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                        <p className="text-xs text-gray-600 mb-2">User budget</p>
                        <p className="text-2xl font-bold text-gray-900 mb-1">{project.budget?.total_budget || 0} {project.budget?.currency || 'INR'}</p>
                        <p className="text-xs text-gray-600 mt-2">0% of total</p>
                    </div>

                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                        <p className="text-xs text-gray-600 mb-2">Overdue tasks</p>
                        <p className="text-2xl font-bold text-gray-900">0</p>
                    </div>
                </div>

                {/* Tabs Section */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                    {/* Main Tabs */}
                    <div className="border-b border-gray-200 px-6">
                        <div className="flex gap-8 overflow-x-auto">
                            {['Tasks', 'Time', 'Budget', 'Finances', 'Details'].map((tab) => (
                                <button
                                    type="button"
                                    key={tab}
                                    onClick={() => {
                                        setActiveTab(tab);
                                        setActiveSubTab(tab === 'Tasks' ? 'Task list' : tab === 'Budget' ? 'Budget health' : '');
                                        setExpandedSection(null);
                                    }}
                                    className={`py-4 px-2 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${activeTab === tab
                                        ? 'text-gray-900 border-blue-600'
                                        : 'text-gray-600 border-transparent hover:text-gray-900'
                                        }`}
                                >
                                    {tab}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Sub Tabs - Only for Tasks */}
                    {activeTab === 'Tasks' && (
                        <div className="border-b border-gray-200 px-6 bg-gray-50">
                            <div className="flex gap-6 overflow-x-auto">
                                {['Task list', 'Gantt', 'Task Board', 'Calendar'].map((subTab) => (
                                    <button
                                        key={subTab}
                                        onClick={() => setActiveSubTab(subTab)}
                                        className={`py-3 px-2 text-xs font-medium border-b-2 transition-colors whitespace-nowrap ${activeSubTab === subTab
                                            ? 'text-gray-900 border-gray-900'
                                            : 'text-gray-600 border-transparent hover:text-gray-900'
                                            }`}
                                    >
                                        {subTab}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Tab Content */}
                    <div className="p-6">
                        {activeTab === 'Tasks' && (
                            <>
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead>
                                            <tr className="border-b border-gray-200">
                                                <th className="text-left text-xs font-semibold text-gray-700 py-3 px-3">Assignee</th>
                                                <th className="text-left text-xs font-semibold text-gray-700 py-3 px-3">Task title</th>
                                                <th className="text-left text-xs font-semibold text-gray-700 py-3 px-3">Status</th>
                                                <th className="text-left text-xs font-semibold text-gray-700 py-3 px-3">Activity type</th>
                                                <th className="text-left text-xs font-semibold text-gray-700 py-3 px-3">Progress</th>
                                                <th className="text-left text-xs font-semibold text-gray-700 py-3 px-3">Due date</th>
                                                <th className="text-left text-xs font-semibold text-gray-700 py-3 px-3">Done</th>
                                                <th className="text-left text-xs font-semibold text-gray-700 py-3 px-3">Remaining</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {tasks.map((task) => (
                                                <tr key={task.id} className="border-b border-gray-100 hover:bg-gray-50">
                                                    <td className="py-4 px-3">
                                                        <div className="flex items-center gap-2">
                                                            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-xs font-medium">
                                                                {task.assigneeAvatar}
                                                            </div>
                                                            <span className="text-sm text-gray-900">&gt;</span>
                                                            <div className="w-6 h-6 rounded-full border-2 border-dotted border-gray-400"></div>
                                                        </div>
                                                    </td>
                                                    <td className="py-4 px-3 text-sm text-gray-900">{task.title}</td>
                                                    <td className="py-4 px-3">
                                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(task.status)}`}>
                                                            {task.status}
                                                        </span>
                                                    </td>
                                                    <td className="py-4 px-3 text-sm text-gray-600">{task.activityType}</td>
                                                    <td className="py-4 px-3">
                                                        <div className="flex items-center gap-2">
                                                            <div className="w-12 bg-gray-200 rounded-full h-1.5">
                                                                <div
                                                                    className="bg-blue-600 h-1.5 rounded-full"
                                                                    style={{ width: `${task.progress}%` }}
                                                                ></div>
                                                            </div>
                                                            <span className="text-xs text-gray-600">{task.progress}%</span>
                                                        </div>
                                                    </td>
                                                    <td className="py-4 px-3 text-sm text-gray-600">{task.dueDate}</td>
                                                    <td className="py-4 px-3 text-sm text-gray-900">{task.done}</td>
                                                    <td className="py-4 px-3 text-sm text-gray-600">{task.remaining}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                                <div className="mt-6">
                                    <button className="inline-flex items-center gap-2 text-sm text-gray-700 hover:text-gray-900 font-medium">
                                        <Plus className="w-4 h-4" />
                                        Add task
                                    </button>
                                </div>
                            </>
                        )}

                        {activeTab === 'Time' && (
                            <div className="space-y-6">
                                <div className="text-center py-12">
                                    <p className="text-gray-600 text-lg">Time Tracking Content</p>
                                    <p className="text-gray-500 text-sm mt-2">Time tracking features coming soon</p>
                                </div>
                            </div>
                        )}

                        {activeTab === 'Budget' && (
                            <div className="space-y-6">
                                {/* Budget Sub Tabs */}
                                <div className="border-b border-gray-200 flex gap-6">
                                    {['Budget health', 'Learn more'].map((subTab) => (
                                        <button
                                            key={subTab}
                                            className={`py-3 px-1 text-sm font-medium border-b-2 transition-colors ${activeSubTab === subTab
                                                ? 'text-gray-900 border-pink-500'
                                                : 'text-gray-600 border-transparent hover:text-gray-900'
                                                }`}
                                            onClick={() => setActiveSubTab(subTab)}
                                        >
                                            {subTab}
                                        </button>
                                    ))}
                                </div>

                                {/* Budget Health Content */}
                                {activeSubTab === 'Budget health' && (
                                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                        {/* Left Section - Collapsible Items */}
                                        <div className="lg:col-span-2 space-y-4">
                                            {/* Burn Section */}
                                            <div className="border border-gray-200 rounded-lg overflow-hidden">
                                                <button
                                                    onClick={() => setExpandedSection(expandedSection === 'Burn' ? null : 'Burn')}
                                                    className="w-full px-4 py-3 bg-gray-50 hover:bg-gray-100 flex items-center gap-2 font-medium text-gray-700 transition-colors"
                                                >
                                                    <span>{expandedSection === 'Burn' ? '▼' : '▶'}</span>
                                                    Burn
                                                </button>
                                                {expandedSection === 'Burn' && (
                                                    <div className="p-4 bg-white">
                                                        <div className="h-64">
                                                            <ResponsiveContainer width="100%" height="100%">
                                                                <LineChart data={budgetData}>
                                                                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                                                                    <XAxis dataKey="date" stroke="#9ca3af" style={{ fontSize: '11px' }} />
                                                                    <YAxis stroke="#9ca3af" style={{ fontSize: '11px' }} />
                                                                    <Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px' }} />
                                                                    <Line type="monotone" dataKey="budget" stroke="#2563eb" dot={false} strokeWidth={2} />
                                                                    <Line type="monotone" dataKey="usedBudget" stroke="#dc2626" dot={false} strokeWidth={2} />
                                                                </LineChart>
                                                            </ResponsiveContainer>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Run Section */}
                                            <div className="border border-gray-200 rounded-lg overflow-hidden">
                                                <button
                                                    onClick={() => setExpandedSection(expandedSection === 'Run' ? null : 'Run')}
                                                    className="w-full px-4 py-3 bg-gray-50 hover:bg-gray-100 flex items-center gap-2 font-medium text-gray-700 transition-colors"
                                                >
                                                    <span>{expandedSection === 'Run' ? '▼' : '▶'}</span>
                                                    Run
                                                </button>
                                                {expandedSection === 'Run' && (
                                                    <div className="p-4 bg-white">
                                                        <div className="h-64">
                                                            <ResponsiveContainer width="100%" height="100%">
                                                                <LineChart data={budgetData}>
                                                                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                                                                    <XAxis dataKey="date" stroke="#9ca3af" style={{ fontSize: '11px' }} />
                                                                    <YAxis stroke="#9ca3af" style={{ fontSize: '11px' }} />
                                                                    <Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px' }} />
                                                                    <Line type="monotone" dataKey="budgetedCost" stroke="#0891b2" dot={false} strokeWidth={2} />
                                                                    <Line type="monotone" dataKey="actualCost" stroke="#0891b2" dot={false} strokeWidth={2} strokeDasharray="5 5" />
                                                                </LineChart>
                                                            </ResponsiveContainer>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {/* Right Section - Metrics Legend */}
                                        <div className="lg:col-span-1">
                                            <div className="bg-gray-50 rounded-lg p-4 space-y-4 sticky top-6">
                                                <h3 className="font-semibold text-gray-900 mb-4">Metrics</h3>

                                                <div className="flex items-start gap-3">
                                                    <div className="w-3 h-3 bg-blue-600 rounded-full mt-1 flex-shrink-0"></div>
                                                    <div>
                                                        <div className="text-xs text-gray-500">Budget</div>
                                                        <div className="text-lg font-semibold text-gray-900">4,866</div>
                                                    </div>
                                                </div>

                                                <div className="flex items-start gap-3">
                                                    <div className="w-3 h-3 bg-red-600 rounded-full mt-1 flex-shrink-0"></div>
                                                    <div>
                                                        <div className="text-xs text-gray-500">Used budget</div>
                                                        <div className="text-lg font-semibold text-gray-900">1,087</div>
                                                    </div>
                                                </div>

                                                <div className="flex items-start gap-3">
                                                    <div className="w-3 h-0.5 bg-red-600 mt-2 flex-shrink-0"></div>
                                                    <div>
                                                        <div className="text-xs text-gray-500">Forecasted budget</div>
                                                        <div className="text-lg font-semibold text-gray-900">3,779</div>
                                                    </div>
                                                </div>

                                                <div className="flex items-start gap-3">
                                                    <div className="w-3 h-3 bg-cyan-600 rounded-full mt-1 flex-shrink-0"></div>
                                                    <div>
                                                        <div className="text-xs text-gray-500">Budgeted cost</div>
                                                        <div className="text-lg font-semibold text-gray-900">534</div>
                                                    </div>
                                                </div>

                                                <div className="flex items-start gap-3">
                                                    <div className="w-3 h-0.5 bg-cyan-600 mt-2 flex-shrink-0"></div>
                                                    <div>
                                                        <div className="text-xs text-gray-500">Actual cost</div>
                                                        <div className="text-lg font-semibold text-gray-900">1,100</div>
                                                    </div>
                                                </div>

                                                <div className="flex items-start gap-3">
                                                    <div className="w-3 h-0.5 bg-cyan-600 mt-2 flex-shrink-0" style={{ backgroundImage: 'repeating-linear-gradient(90deg,currentColor 0,currentColor 2px,transparent 2px,transparent 4px)' }}></div>
                                                    <div>
                                                        <div className="text-xs text-gray-500">Forecasted profit</div>
                                                        <div className="text-lg font-semibold text-gray-900">2,250</div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Learn More Content */}
                                {activeSubTab === 'Learn more' && (
                                    <div className="text-center py-12">
                                        <p className="text-gray-600">Learn more content coming soon</p>
                                    </div>
                                )}
                            </div>
                        )}

                        {activeTab === 'Finances' && (
                            <div className="space-y-4">
                                {/* Quotes Section */}
                                <div className="border border-gray-200 rounded-lg overflow-hidden">
                                    <div className="px-6 py-4 bg-gray-50 hover:bg-gray-100 flex items-center justify-between transition-colors">
                                        <h3 className="font-semibold text-blue-600 text-sm">Quotes</h3>
                                        <button className="text-blue-600 text-sm font-medium hover:text-blue-700">New Quote</button>
                                    </div>
                                    <div className="px-6 py-4 bg-white">
                                        <p className="text-gray-500 text-sm">No quotes to display</p>
                                    </div>
                                </div>

                                {/* Invoices Section */}
                                <div className="border border-gray-200 rounded-lg overflow-hidden">
                                    <div className="px-6 py-4 bg-gray-50 hover:bg-gray-100 flex items-center justify-between transition-colors">
                                        <h3 className="font-semibold text-blue-600 text-sm">Invoices</h3>
                                        <button className="text-blue-600 text-sm font-medium hover:text-blue-700">New Invoices</button>
                                    </div>
                                    <div className="px-6 py-4 bg-white">
                                        <p className="text-gray-500 text-sm">No invoices to display</p>
                                    </div>
                                </div>

                                {/* Purchase Orders Section */}
                                <div className="border border-gray-200 rounded-lg overflow-hidden">
                                    <div className="px-6 py-4 bg-gray-50 hover:bg-gray-100 flex items-center justify-between transition-colors">
                                        <h3 className="font-semibold text-blue-600 text-sm">Purchase orders</h3>
                                        <button className="text-blue-600 text-sm font-medium hover:text-blue-700">New Purchase orders</button>
                                    </div>
                                    <div className="px-6 py-4 bg-white">
                                        <p className="text-gray-500 text-sm">No purchase orders to display</p>
                                    </div>
                                </div>

                                {/* Bills Section */}
                                <div className="border border-gray-200 rounded-lg overflow-hidden">
                                    <div className="px-6 py-4 bg-gray-50 hover:bg-gray-100 flex items-center justify-between transition-colors">
                                        <h3 className="font-semibold text-blue-600 text-sm">Bills</h3>
                                        <button className="text-blue-600 text-sm font-medium hover:text-blue-700">New Bills</button>
                                    </div>
                                    <div className="px-6 py-4 bg-white">
                                        <p className="text-gray-500 text-sm">No bills to display</p>
                                    </div>
                                </div>

                                {/* Expenses Section */}
                                <div className="border border-gray-200 rounded-lg overflow-hidden">
                                    <div className="px-6 py-4 bg-gray-50 hover:bg-gray-100 flex items-center justify-between transition-colors">
                                        <h3 className="font-semibold text-blue-600 text-sm">Expenses</h3>
                                        <button className="text-blue-600 text-sm font-medium hover:text-blue-700">New Expenses</button>
                                    </div>
                                    <div className="px-6 py-4 bg-white">
                                        <p className="text-gray-500 text-sm">No expenses to display</p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'Details' && (
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                {/* Left Column */}
                                <div className="space-y-6">
                                    {/* Project Info Section */}
                                    <div className="border border-gray-200 rounded-lg overflow-hidden">
                                        <div className="px-6 py-4 bg-gray-50 flex items-center justify-between">
                                            <h3 className="font-semibold text-gray-900 text-sm">Project Info</h3>
                                            <button className="text-blue-600 text-sm font-medium hover:text-blue-700">Modify</button>
                                        </div>
                                        <div className="px-6 py-6 bg-white">
                                            <p className="text-gray-500 text-sm">No project info  to display</p>
                                        </div>
                                    </div>

                                    {/* Files Section */}
                                    <div className="border border-gray-200 rounded-lg overflow-hidden">
                                        <div className="px-6 py-4 bg-gray-50 flex items-center justify-between">
                                            <h3 className="font-semibold text-gray-900 text-sm">Files</h3>
                                            <button className="text-gray-600 text-sm font-medium hover:text-gray-900 flex items-center gap-1">
                                                <span>📎</span> Add Files
                                            </button>
                                        </div>
                                        <div className="px-6 py-6 bg-white">
                                            <p className="text-gray-500 text-sm">No Files to display</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Right Column */}
                                <div className="space-y-6">
                                    {/* Custom Fields Section */}
                                    <div className="border border-gray-200 rounded-lg overflow-hidden">
                                        <div className="px-6 py-4 bg-white border-b border-gray-200">
                                            <h3 className="font-semibold text-blue-600 text-sm">Custom Fields</h3>
                                        </div>
                                        <div className="px-6 py-6 bg-gray-50">
                                            <p className="text-gray-500 text-sm">No custom fields to display</p>
                                        </div>
                                    </div>

                                    {/* Related Contacts Section */}
                                    <div className="border border-gray-200 rounded-lg overflow-hidden">
                                        <div className="px-6 py-4 bg-gray-50 flex items-center justify-between">
                                            <h3 className="font-semibold text-gray-900 text-sm">Related Contacts</h3>
                                            <button className="text-blue-600 text-sm font-medium hover:text-blue-700">Add</button>
                                        </div>
                                        <div className="px-6 py-6 bg-white">
                                            <p className="text-gray-500 text-sm">No Contacts to display</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </Layout>
    );
};

export default ProjectDetailsPage;