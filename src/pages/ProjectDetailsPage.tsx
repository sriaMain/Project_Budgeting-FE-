import React, { useState, useEffect } from 'react';
import { Layout } from '../components/Layout';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { Plus, Calendar, Search, Filter } from 'lucide-react';
import axiosInstance from '../utils/axiosInstance';
import { ReusableTable } from '../components/ReusableTable';
import { AddTaskModal } from '../components/AddTaskModal';
import { AssignTaskModal } from '../components/AssignTaskModal';
import { toast } from 'react-hot-toast';


interface Task {
    id: string;
    assignee: string;
    assigneeAvatar: string;
    title: string;
    status: 'Planned' | 'In Progress' | 'Completed';
    activityType: string;
    allocatedHours: string;
    consumedHours: string;
    dueDate: string;
    remaining: string;
}

interface Payment {
    id: number;
    date: string;
    type: 'Incoming' | 'Outgoing';
    amount: number;
    clientVendor: string;
    reference: string;
    paymentMethod: string;
}

interface ProjectDetailsPageProps {
    userRole: 'admin' | 'user' | 'manager';
    currentPage: string;
    onNavigate: (page: string) => void;
}

const ProjectDetailsPage: React.FC<ProjectDetailsPageProps> = ({ userRole, currentPage, onNavigate }) => {
    const { projectId } = useParams<{ projectId: string }>();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const [activeTab, setActiveTab] = useState<string>('Tasks');
    const [activeSubTab, setActiveSubTab] = useState<string>('Task list');
    const [budgetSubTab, setBudgetSubTab] = useState<string>('Budget health');
    const [budgetHealthSubTab, setBudgetHealthSubTab] = useState<string>('Budget health');
    const [budgetViewMode, setBudgetViewMode] = useState<string>('Budget');
    const [paymentSearch, setPaymentSearch] = useState<string>('');
    const [paymentTypeFilter, setPaymentTypeFilter] = useState<string>('All');
    const [showPaymentFilter, setShowPaymentFilter] = useState<boolean>(false);
    const [project, setProject] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [isAddTaskModalOpen, setIsAddTaskModalOpen] = useState(false);
    const [selectedTaskForEdit, setSelectedTaskForEdit] = useState<any | null>(null);
    const [isAssignTaskModalOpen, setIsAssignTaskModalOpen] = useState(false);
    const [selectedTaskForAssignment, setSelectedTaskForAssignment] = useState<Task | null>(null);
    const [tasks, setTasks] = useState<Task[]>([]);
    const [isLoadingTasks, setIsLoadingTasks] = useState(true);
    const [firstQuoteId, setFirstQuoteId] = useState<number | null>(null);
    const [invoices, setInvoices] = useState<any[]>([]);
    const [isLoadingInvoices, setIsLoadingInvoices] = useState(false);
    const [projectQuotation, setProjectQuotation] = useState<any>(null);
    const [isLoadingQuotation, setIsLoadingQuotation] = useState(false);
    const [payments, setPayments] = useState<any[]>([]);
    const [isLoadingPayments, setIsLoadingPayments] = useState(false);
    const [paymentSummary, setPaymentSummary] = useState<any>(null);
    const [outgoingPayments, setOutgoingPayments] = useState<any[]>([]);
    const [purchaseOrders, setPurchaseOrders] = useState<any[]>([]);
    const [isLoadingPOs, setIsLoadingPOs] = useState(false);
    const [bills, setBills] = useState<any[]>([]);
    const [isLoadingBills, setIsLoadingBills] = useState(false);
    const [billsSummary, setBillsSummary] = useState<any>(null);

    // Handle tab query parameter
    useEffect(() => {
        const tabParam = searchParams.get('tab');
        if (tabParam) {
            setActiveTab(tabParam);
        }
    }, [searchParams]);

    // Helper function to map API task data to component Task interface
    const mapApiTaskToTask = (task: any): Task => {
        // Normalize status: capitalize first letter
        let normalizedStatus = task.status || 'planned';
        if (normalizedStatus === 'planned') normalizedStatus = 'Planned';
        else if (normalizedStatus === 'in_progress' || normalizedStatus === 'in progress') normalizedStatus = 'In Progress';
        else if (normalizedStatus === 'completed') normalizedStatus = 'Completed';

        return {
            id: task.id?.toString() || '',
            assignee: task.assigned_to?.username || 'Unassigned',
            assigneeAvatar: task.assigned_to?.username?.substring(0, 2).toUpperCase() || '○',
            title: task.title || 'Untitled Task',
            status: normalizedStatus as Task['status'],
            activityType: task.activity_type || 'Development',
            allocatedHours: task.allocated_formatted || (task.allocated_hours ? `${task.allocated_hours}h` : '0h'),
            consumedHours: task.consumed_formatted || (task.consumed_hours ? `${task.consumed_hours}h` : '0h'),
            dueDate: task.due_date ? new Date(task.due_date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }) : 'TBD',
            remaining: task.remaining_formatted_hms || (task.remaining_hours ? `${task.remaining_hours}h` : task.allocated_hours ? `${task.allocated_hours}h` : '0h')
        };
    };


    useEffect(() => {
        const fetchProjectDetails = async () => {
            if (!projectId) return;
            try {
                const response = await axiosInstance.get(`/projects/${projectId}/`);
                const projectData = response.data;
                setProject(projectData);

                // Extract invoices from project data
                if (projectData.invoices && Array.isArray(projectData.invoices)) {
                    console.log('Project invoices from API:', projectData.invoices);
                    setInvoices(projectData.invoices);
                }
            } catch (error) {
                console.error('Error fetching project details:', error);
            } finally {
                setLoading(false);
            }
        };

        const fetchProjectTasks = async () => {
            if (!projectId) return;
            setIsLoadingTasks(true);
            try {
                // Fetch tasks from api/tasks/{projectId}/tasks/
                const response = await axiosInstance.get(`/tasks/${projectId}/tasks/`);
                console.log('Tasks API response:', response.data);
                
                // Response is an array, get the first element which contains Tasks
                if (response.data && Array.isArray(response.data) && response.data.length > 0) {
                    const projectTasksData = response.data[0];
                    if (projectTasksData.Tasks && Array.isArray(projectTasksData.Tasks)) {
                        console.log('Project tasks from API:', projectTasksData.Tasks);
                        const mappedTasks: Task[] = projectTasksData.Tasks.map(mapApiTaskToTask);
                        setTasks(mappedTasks);
                    }
                }
            } catch (error) {
                console.error('Error fetching project tasks:', error);
            } finally {
                setIsLoadingTasks(false);
            }
        };

        fetchProjectDetails();
        fetchProjectTasks();
        fetchFirstQuote();
    }, [projectId]);

    // Fetch first available quote for invoice generation
    const fetchFirstQuote = async () => {
        try {
            const response = await axiosInstance.get('/pipeline-data/');
            if (response.data && response.data.stages) {
                // Find first quote from any stage
                for (const stage of response.data.stages) {
                    if (stage.quotes && stage.quotes.length > 0) {
                        setFirstQuoteId(stage.quotes[0].quote_no);
                        return;
                    }
                }
            }
        } catch (error) {
            console.error('Error fetching quotes:', error);
        }
    };

    // Fetch payments for all project invoices
    const fetchProjectPayments = async () => {
        if (!projectId) {
            setPayments([]);
            setOutgoingPayments([]);
            setPaymentSummary(null);
            return;
        }

        try {
            setIsLoadingPayments(true);
            // Fetch payments using the project payments list endpoint
            const response = await axiosInstance.get(`/projects/${projectId}/payments-list/`);

            console.log('Project payments response:', response.data);
            
            // Extract payments array and summary data from the response
            if (response.data) {
                const { payments, outgoing_payments, ...summary } = response.data;
                setPayments(payments || []);
                setOutgoingPayments(outgoing_payments || []);
                setPaymentSummary(summary);
            } else {
                setPayments([]);
                setOutgoingPayments([]);
                setPaymentSummary(null);
            }
        } catch (error) {
            console.error('Error fetching payments:', error);
            setPayments([]);
            setOutgoingPayments([]);
            setPaymentSummary(null);
        } finally {
            setIsLoadingPayments(false);
        }
    };

    // Fetch quotation for this project
    const fetchProjectQuotation = async (quotationId: number) => {
        try {
            setIsLoadingQuotation(true);
            const response = await axiosInstance.get(`/quotes/${quotationId}/`);
            console.log('Project quotation:', response.data);
            setProjectQuotation(response.data);
        } catch (error) {
            console.error('Error fetching project quotation:', error);
            setProjectQuotation(null);
        } finally {
            setIsLoadingQuotation(false);
        }
    };

    // Fetch purchase orders for the project
    const fetchPurchaseOrders = async () => {
        if (!projectId) return;

        try {
            setIsLoadingPOs(true);
            const response = await axiosInstance.get(`/projects/${projectId}/purchase-orders/`);
            if (response.status === 200 && response.data.purchase_orders) {
                setPurchaseOrders(response.data.purchase_orders);
                console.log('Fetched purchase orders:', response.data.purchase_orders);
            }
        } catch (error) {
            console.error('Error fetching purchase orders:', error);
        } finally {
            setIsLoadingPOs(false);
        }
    };

    // Fetch bills (outgoing payments) for the project
    const fetchBills = async () => {
        if (!projectId) return;

        try {
            setIsLoadingBills(true);
            const response = await axiosInstance.get(`/projects/${projectId}/outgoing-payments/`);
            if (response.status === 200) {
                setBills(response.data.payments || []);
                setBillsSummary({
                    total_paid: response.data.total_paid,
                    project_name: response.data.project_name,
                    project_no: response.data.project_no,
                    vendor_bills: response.data.debug?.vendor_bills || []
                });
                console.log('Fetched bills:', response.data);
            }
        } catch (error) {
            console.error('Error fetching bills:', error);
        } finally {
            setIsLoadingBills(false);
        }
    };

    // Fetch quotation when Finances tab is active
    useEffect(() => {
        if (activeTab === 'Finances') {
            // Fetch quotation if project was created from one
            if (project?.created_from_quotation) {
                fetchProjectQuotation(project.created_from_quotation);
            }
            // Fetch purchase orders
            fetchPurchaseOrders();
            // Fetch bills (outgoing payments)
            fetchBills();
        }
    }, [activeTab, projectId, project]);


    // Fetch payments when Payment tab is active
    useEffect(() => {
        if (activeTab === 'Payment') {
            fetchProjectPayments();
        }
    }, [activeTab, projectId]);

    const handleTaskAdded = async (newTask: any) => {
        console.log('Task created for project:', newTask);

        // Refetch tasks to get updated list
        try {
            const response = await axiosInstance.get(`/tasks/${projectId}/tasks/`);
            if (response.data && Array.isArray(response.data) && response.data.length > 0) {
                const projectTasksData = response.data[0];
                if (projectTasksData.Tasks && Array.isArray(projectTasksData.Tasks)) {
                    const mappedTasks: Task[] = projectTasksData.Tasks.map(mapApiTaskToTask);
                    setTasks(mappedTasks);
                }
            }
        } catch (error) {
            console.error('Error refetching tasks:', error);
        }

        // toast.success('Task added successfully!');
    };

    const handleUpdateTask = async (taskId: string, updates: any) => {
        try {
            const response = await axiosInstance.patch(`tasks/${taskId}/`, updates);
            if (response.status === 200 || response.status === 204) {
                toast.success('Task updated');
                const updatedApiTask = response.data;
                setTasks(prev => prev.map(t => t.id === taskId ? {
                    ...t,
                    assignee: updatedApiTask.assigned_to?.username || 'Unassigned',
                    assigneeAvatar: updatedApiTask.assigned_to?.username?.substring(0, 2).toUpperCase() || '○',
                    title: updatedApiTask.title || t.title,
                    status: (updatedApiTask.status || t.status) as Task['status'],
                    activityType: updatedApiTask.activity_type || t.activityType,
                    allocatedHours: updatedApiTask.allocated_hours ? `${updatedApiTask.allocated_hours}h` : t.allocatedHours,
                    consumedHours: updatedApiTask.consumed_hours ? `${updatedApiTask.consumed_hours}h` : t.consumedHours,
                    dueDate: updatedApiTask.due_date ? new Date(updatedApiTask.due_date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }) : t.dueDate,
                    remaining: updatedApiTask.remaining_hours ? `${updatedApiTask.remaining_hours}h` : updatedApiTask.allocated_hours ? `${updatedApiTask.allocated_hours}h` : t.remaining
                } : t));
            }
        } catch (error) {
            console.error('Failed to update task:', error);
            toast.error('Failed to update task');
        }
    };

    const handleAssignmentSuccess = async (taskId: string, userId: number) => {
        console.log('Task assigned:', taskId, 'to user:', userId);

        // Refetch tasks to get updated assignee information
        try {
            const response = await axiosInstance.get(`/tasks/${projectId}/tasks/`);
            if (response.data && Array.isArray(response.data) && response.data.length > 0) {
                const projectTasksData = response.data[0];
                if (projectTasksData.Tasks && Array.isArray(projectTasksData.Tasks)) {
                    const mappedTasks: Task[] = projectTasksData.Tasks.map(mapApiTaskToTask);
                    setTasks(mappedTasks);
                }
            }
        } catch (error) {
            console.error('Error refetching tasks:', error);
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'Planned':
                return 'bg-purple-500 text-white';
            case 'In Progress':
                return 'bg-green-500 text-white';
            case 'Completed':
                return 'bg-blue-500 text-white';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };



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
                    {/* Top Row: Project # + Status Badge + Action Buttons */}
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
                        <div className="flex items-center gap-3">
                            <span className="text-sm text-gray-500 font-medium">#{project.project_no || projectId}</span>
                            <span className={`inline-flex items-center px-3 py-1 rounded-md text-xs font-semibold ${getStatusColor(project.status || 'In Progress')}`}>
                                {project.status || 'In Progress'}
                            </span>
                        </div>
                        <div className="flex gap-4">
                            <button className="px-4 py-2 bg-purple-200 text-black font-medium rounded-lg hover:bg-purple-300 transition-colors duration-200">
                                ✎ Modify Details
                            </button>
                            <button className="px-4 py-2 bg-gray-100 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-200 transition-colors duration-200">
                                Monthly Budget
                            </button>
                        </div>
                    </div>

                    {/* Project Title */}
                    <h1 className="text-xl font-bold text-gray-900 mb-4">{project.project_name}</h1>

                    {/* Bottom Row: Avatar + Name + Arrow + Add Icon + Date + Progress Bar */}
                    <div className="flex items-center gap-4">


                        {/* Date with Calendar Icon */}
                        <div className="flex items-center gap-6 text-sm text-gray-600">
                            <Calendar className="w-4 h-4 text-gray-400" />
                            <span>{project.end_date || project.start_date}</span>
                        </div>

                        {/* Progress Bar */}
                        <div className="flex items-center gap-6 flex-1 max-w-xs">
                            <div className="flex-1 bg-gray-200 rounded-full h-2">
                                <div className="bg-blue-600 h-2 rounded-full transition-all duration-100" style={{ width: `${project.progress || 0}%` }}></div>
                            </div>
                            <span className="text-xs text-gray-500 whitespace-nowrap">Estimated: {project.estimated_hours || 20}h</span>
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
                            {['Tasks', 'Time', 'Budget', 'Finances', 'Details', 'Payment'].map((tab) => (
                                <button
                                    type="button"
                                    key={tab}
                                    onClick={() => {
                                        setActiveTab(tab);
                                        if (tab === 'Tasks') {
                                            setActiveSubTab('Task list');
                                        }
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
                                                <th className="text-left text-xs font-semibold text-gray-700 py-3 px-3">Allocated hours</th>
                                                <th className="text-left text-xs font-semibold text-gray-700 py-3 px-3">Consumed hours</th>
                                                <th className="text-left text-xs font-semibold text-gray-700 py-3 px-3">Due date</th>
                                                <th className="text-left text-xs font-semibold text-gray-700 py-3 px-3">Remaining</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {isLoadingTasks ? (
                                                <tr>
                                                    <td colSpan={8} className="py-12 text-center">
                                                        <div className="flex flex-col items-center justify-center">
                                                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-2"></div>
                                                            <p className="text-sm text-gray-500">Loading tasks...</p>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ) : tasks.length === 0 ? (
                                                <tr>
                                                    <td colSpan={8} className="py-12 text-center">
                                                        <p className="text-sm text-gray-500">No tasks found for this project. Click "Add task" to create one.</p>
                                                    </td>
                                                </tr>
                                            ) : (
                                                tasks.map((task) => (
                                                    <tr key={task.id} className="border-b border-gray-100 hover:bg-gray-50">
                                                        <td className="py-4 px-3">
                                                            <div className="flex items-center gap-2">
                                                                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium ${task.assignee !== 'Unassigned'
                                                                    ? 'bg-blue-600 text-white'
                                                                    : 'bg-gray-200 text-gray-400 border-2 border-dashed border-gray-300'
                                                                    }`}
                                                                    title={task.assignee}
                                                                >
                                                                    {task.assigneeAvatar}
                                                                </div>
                                                                <span className="text-sm text-gray-900">&gt;</span>
                                                                <button
                                                                    onClick={() => {
                                                                        setSelectedTaskForAssignment(task);
                                                                        setIsAssignTaskModalOpen(true);
                                                                    }}
                                                                    className="w-6 h-6 rounded-full border-2 border-dotted border-gray-400 hover:border-blue-500 hover:bg-blue-50 transition-all cursor-pointer flex items-center justify-center"
                                                                    title={task.assignee !== 'Unassigned' ? 'Reassign task' : 'Assign task'}
                                                                >
                                                                    <Plus className="w-3 h-3 text-gray-400 hover:text-blue-500" />
                                                                </button>
                                                            </div>
                                                        </td>
                                                        <td
                                                            onClick={async () => {
                                                                try {
                                                                    const resp = await axiosInstance.get(`tasks/${task.id}/`);
                                                                    setSelectedTaskForEdit(resp.data);
                                                                    setIsAddTaskModalOpen(true);
                                                                } catch (err) {
                                                                    console.error('Failed to fetch task details', err);
                                                                    toast.error('Failed to load task for editing');
                                                                }
                                                            }}
                                                            className="py-4 px-3 text-sm text-gray-900 cursor-pointer"
                                                        >{task.title}</td>
                                                        <td className="py-4 px-3">
                                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(task.status)}`}>
                                                                {task.status}
                                                            </span>
                                                        </td>
                                                        <td className="py-4 px-3 text-sm text-gray-600">{task.activityType}</td>
                                                        <td className="py-4 px-3 text-sm text-gray-900">{task.allocatedHours}</td>
                                                        <td className="py-4 px-3 text-sm text-gray-900">{task.consumedHours}</td>
                                                        <td className="py-4 px-3 text-sm text-gray-600">{task.dueDate}</td>
                                                        <td className="py-4 px-3 text-sm text-gray-600">{task.remaining}</td>
                                                    </tr>
                                                ))
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                                <div className="mt-6">
                                    <button
                                        onClick={() => setIsAddTaskModalOpen(true)}
                                        className="inline-flex items-center gap-2 text-sm text-gray-700 hover:text-gray-900 font-medium"
                                    >
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
                                {/* Budget Sub Tabs: Budget health, Revenue, Profit */}
                                <div className="border-b border-gray-200">
                                    <div className="flex gap-6">
                                        {['Budget health', 'Revenue', 'Profit'].map((subTab) => (
                                            <button
                                                key={subTab}
                                                type="button"
                                                className={`py-3 px-1 text-sm font-medium border-b-2 transition-colors ${budgetSubTab === subTab
                                                    ? 'text-gray-900 border-blue-600'
                                                    : 'text-gray-600 border-transparent hover:text-gray-900'
                                                    }`}
                                                onClick={() => setBudgetSubTab(subTab)}
                                            >
                                                {subTab}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Budget Health Content */}
                                {budgetSubTab === 'Budget health' && (
                                    <div className="space-y-4">
                                        {/* Header with Budget health/Learn more on left and Budget/Time toggle on right */}
                                        <div className="flex items-center justify-between mb-4">
                                            {/* Budget health / Learn more tabs on left */}
                                            <div className="flex gap-6">
                                                {['Budget health', 'Learn more'].map((healthTab) => (
                                                    <button
                                                        key={healthTab}
                                                        type="button"
                                                        className={`py-2 px-3 text-sm font-medium rounded-lg transition-colors ${budgetHealthSubTab === healthTab
                                                            ? 'bg-gray-100 text-gray-900'
                                                            : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                                                            }`}
                                                        onClick={() => setBudgetHealthSubTab(healthTab)}
                                                    >
                                                        {healthTab}
                                                    </button>
                                                ))}
                                            </div>

                                            {/* Budget/Time Toggle on right */}
                                            <div className="flex gap-2 bg-gray-100 rounded-lg p-1">
                                                {['Budget', 'Time'].map((mode) => (
                                                    <button
                                                        key={mode}
                                                        type="button"
                                                        onClick={() => setBudgetViewMode(mode)}
                                                        className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${budgetViewMode === mode
                                                            ? 'bg-white text-gray-900 shadow-sm'
                                                            : 'text-gray-600 hover:text-gray-900'
                                                            }`}
                                                    >
                                                        {mode}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Budget Health Sub-Content */}
                                        {budgetHealthSubTab === 'Budget health' && (
                                            <div className="bg-gray-50 rounded-lg border border-gray-200 p-8 text-center">
                                                <div className="max-w-md mx-auto">
                                                    <div className="mb-4">
                                                        <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                                        </svg>
                                                    </div>
                                                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Budget Health Overview</h3>
                                                    <p className="text-sm text-gray-600 mb-4">View: {budgetViewMode}</p>
                                                    <p className="text-sm text-gray-500">Budget health monitoring features are coming soon. Track your project's financial performance in real-time.</p>
                                                </div>
                                            </div>
                                        )}

                                        {/* Learn More Sub-Content */}
                                        {budgetHealthSubTab === 'Learn more' && (
                                            <div className="bg-blue-50 rounded-lg border border-blue-200 p-8 text-center">
                                                <div className="max-w-md mx-auto">
                                                    <div className="mb-4">
                                                        <svg className="mx-auto h-12 w-12 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                        </svg>
                                                    </div>
                                                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Learn More</h3>
                                                    <p className="text-sm text-gray-600">Detailed information and guides about budget management will be available here.</p>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* Revenue Content */}
                                {budgetSubTab === 'Revenue' && (
                                    <div className="bg-green-50 rounded-lg border border-green-200 p-12 text-center">
                                        <div className="max-w-md mx-auto">
                                            <div className="mb-4">
                                                <svg className="mx-auto h-16 w-16 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                </svg>
                                            </div>
                                            <h3 className="text-xl font-bold text-gray-900 mb-2">Revenue Tracking</h3>
                                            <p className="text-gray-600 mb-4">Monitor your project revenue and income streams</p>
                                            <p className="text-sm text-gray-500">Revenue tracking features are coming soon.</p>
                                        </div>
                                    </div>
                                )}

                                {/* Profit Content */}
                                {budgetSubTab === 'Profit' && (
                                    <div className="bg-purple-50 rounded-lg border border-purple-200 p-12 text-center">
                                        <div className="max-w-md mx-auto">
                                            <div className="mb-4">
                                                <svg className="mx-auto h-16 w-16 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                                                </svg>
                                            </div>
                                            <h3 className="text-xl font-bold text-gray-900 mb-2">Profit Analysis</h3>
                                            <p className="text-gray-600 mb-4">Analyze profit margins and project profitability</p>
                                            <p className="text-sm text-gray-500">Profit analysis features are coming soon.</p>
                                        </div>
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
                                        <button
                                            onClick={() => navigate('/pipeline/add-quote')}
                                            className="text-black-800 text-sm font-medium hover:text-blue-600"
                                        >
                                            New Quote
                                        </button>
                                    </div>
                                    <div className="px-6 py-4 bg-white">
                                        {isLoadingQuotation ? (
                                            <p className="text-gray-500 text-sm">Loading quotation...</p>
                                        ) : projectQuotation ? (
                                            <div
                                                onClick={() => navigate(`/pipeline/quote/${projectQuotation.quote_no}`)}
                                                className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors border border-gray-100"
                                            >
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-3">
                                                        <span className="font-medium text-gray-900">
                                                            Quote #{projectQuotation.quote_no}
                                                        </span>
                                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${projectQuotation.status === 'Confirmed'
                                                            ? 'bg-green-50 text-green-700'
                                                            : projectQuotation.status === 'Sent'
                                                                ? 'bg-blue-50 text-blue-700'
                                                                : 'bg-gray-50 text-gray-700'
                                                            }`}>
                                                            {projectQuotation.status || 'Draft'}
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center gap-4 mt-1 text-sm text-gray-500">
                                                        <span>{projectQuotation.quote_name || 'Untitled Quote'}</span>
                                                        <span>Amount: ₹{projectQuotation.total_amount || '0'}</span>
                                                        {projectQuotation.date_of_issue && (
                                                            <span>Date: {new Date(projectQuotation.date_of_issue).toLocaleDateString()}</span>
                                                        )}
                                                    </div>
                                                </div>
                                                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                                </svg>
                                            </div>
                                        ) : (
                                            <p className="text-gray-500 text-sm">No quotes to display</p>
                                        )}
                                    </div>
                                </div>

                                {/* Invoices Section */}
                                <div className="border border-gray-200 rounded-lg overflow-hidden">
                                    <div className="px-6 py-4 bg-gray-50 hover:bg-gray-100 flex items-center justify-between transition-colors">
                                        <h3 className="font-semibold text-blue-600 text-sm">Invoices</h3>
                                        <button
                                            onClick={() => {
                                                const quotationId = project?.created_from_quotation;
                                                if (quotationId) {
                                                    navigate(`/generate-invoice/${quotationId}`);
                                                } else {
                                                    toast.error('No quotation associated with this project.');
                                                }
                                            }}
                                            className="text-black-800 text-sm font-medium hover:text-blue-700"
                                        >
                                            New Invoice
                                        </button>
                                    </div>
                                    <div className="px-6 py-4 bg-white">
                                        {isLoadingInvoices ? (
                                            <p className="text-gray-500 text-sm">Loading invoices...</p>
                                        ) : invoices.length === 0 ? (
                                            <p className="text-gray-500 text-sm">No invoices to display</p>
                                        ) : (
                                            <div className="space-y-2">
                                                {invoices.map((invoice: any) => (
                                                    <div
                                                        key={invoice.id}
                                                        onClick={() => navigate(`/invoices/${invoice.id}`)}
                                                        className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors border border-gray-100"
                                                    >
                                                        <div className="flex-1">
                                                            <div className="flex items-center gap-3">
                                                                <span className="font-medium text-gray-900">
                                                                    {invoice.invoice_no || `Invoice #${invoice.id}`}
                                                                </span>
                                                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${invoice.payment_status === 'Paid' || invoice.status_display === 'Paid'
                                                                    ? 'bg-green-50 text-green-700'
                                                                    : 'bg-yellow-50 text-yellow-700'
                                                                    }`}>
                                                                    {invoice.payment_status || invoice.status_display || 'Unpaid'}
                                                                </span>
                                                            </div>
                                                            <div className="flex items-center gap-4 mt-1 text-sm text-gray-500">
                                                                <span>Total: ₹{invoice.total_amount || invoice.total || '0'}</span>
                                                                {invoice.paid_amount && parseFloat(invoice.paid_amount) > 0 && (
                                                                    <span>Paid: ₹{invoice.paid_amount}</span>
                                                                )}
                                                                {invoice.balance_amount && (
                                                                    <span>Balance: ₹{invoice.balance_amount}</span>
                                                                )}
                                                                {invoice.issue_date && (
                                                                    <span>Date: {new Date(invoice.issue_date).toLocaleDateString()}</span>
                                                                )}
                                                            </div>
                                                        </div>
                                                        <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                                        </svg>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Purchase Orders Section */}
                                <div className="border border-gray-200 rounded-lg overflow-hidden">
                                    <div className="px-6 py-4 bg-gray-50 hover:bg-gray-100 flex items-center justify-between transition-colors">
                                        <h3 className="font-semibold text-blue-600 text-sm">Purchase orders</h3>
                                        <button 
                                            onClick={() => {
                                                const quotationId = project?.created_from_quotation;
                                                if (quotationId) {
                                                    navigate(`/create-purchase-order/${quotationId}`);
                                                } else {
                                                    toast.error('No quotation associated with this project.');
                                                }
                                            }}
                                            className="text-black-800 text-sm font-medium hover:text-blue-700"
                                        >
                                            New Purchase Order
                                        </button>
                                    </div>
                                    <div className="px-6 py-4 bg-white">
                                        {isLoadingPOs ? (
                                            <p className="text-gray-500 text-sm">Loading purchase orders...</p>
                                        ) : purchaseOrders.length === 0 ? (
                                            <p className="text-gray-500 text-sm">No purchase orders to display</p>
                                        ) : (
                                            <div className="space-y-2">
                                                {purchaseOrders.map((po: any) => (
                                                    <div
                                                        key={po.po_id}
                                                        onClick={() => navigate(`/purchase-orders/${po.po_id}`)}
                                                        className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors border border-gray-100"
                                                    >
                                                        <div className="flex-1">
                                                            <div className="flex items-center gap-3">
                                                                <span className="font-medium text-gray-900">
                                                                    {po.po_no}
                                                                </span>
                                                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                                                    po.status === 'confirmed' || po.status === 'completed'
                                                                        ? 'bg-green-50 text-green-700'
                                                                        : po.status === 'sent'
                                                                            ? 'bg-blue-50 text-blue-700'
                                                                            : 'bg-gray-50 text-gray-700'
                                                                }`}>
                                                                    {po.status.charAt(0).toUpperCase() + po.status.slice(1)}
                                                                </span>
                                                            </div>
                                                            <div className="flex items-center gap-4 mt-1 text-sm text-gray-500">
                                                                <span>Vendor: {po.vendor_name}</span>
                                                                <span>Amount: ₹{parseFloat(po.total_amount).toLocaleString('en-IN')}</span>
                                                                <span>Items: {po.items_count}</span>
                                                                {po.issue_date && (
                                                                    <span>Date: {new Date(po.issue_date).toLocaleDateString()}</span>
                                                                )}
                                                            </div>
                                                        </div>
                                                        <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                                        </svg>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Bills Section */}
                                <div className="border border-gray-200 rounded-lg overflow-hidden">
                                    <div className="px-6 py-4 bg-gray-50 hover:bg-gray-100 flex items-center justify-between transition-colors">
                                        <div>
                                            <h3 className="font-semibold text-blue-600 text-sm">Bills</h3>
                                            {billsSummary && (
                                                <p className="text-xs text-gray-500 mt-1">
                                                    Total Paid: ₹{parseFloat(billsSummary.total_paid || 0).toLocaleString('en-IN')}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                    <div className="px-6 py-4 bg-white">
                                        {isLoadingBills ? (
                                            <p className="text-gray-500 text-sm">Loading bills...</p>
                                        ) : bills.length === 0 ? (
                                            <p className="text-gray-500 text-sm">No bills to display</p>
                                        ) : (() => {
                                            // Group bills by bill_no
                                            const groupedBills = bills.reduce((acc: any, bill: any) => {
                                                if (!acc[bill.bill_no]) {
                                                    acc[bill.bill_no] = {
                                                        bill_no: bill.bill_no,
                                                        po_no: bill.po_no,
                                                        vendor: bill.vendor,
                                                        total_amount: 0,
                                                        payment_count: 0,
                                                        latest_payment_date: bill.payment_date,
                                                        payment_ids: []
                                                    };
                                                }
                                                acc[bill.bill_no].total_amount += parseFloat(bill.amount);
                                                acc[bill.bill_no].payment_count += 1;
                                                acc[bill.bill_no].payment_ids.push(bill.id);
                                                // Keep the latest payment date
                                                if (new Date(bill.payment_date) > new Date(acc[bill.bill_no].latest_payment_date)) {
                                                    acc[bill.bill_no].latest_payment_date = bill.payment_date;
                                                }
                                                return acc;
                                            }, {});

                                            const uniqueBills = Object.values(groupedBills);

                                            // Get vendor_bills from billsSummary for bill_id mapping
                                            const vendorBills = billsSummary?.vendor_bills || [];

                                            return (
                                                <div className="space-y-2">
                                                    {uniqueBills.map((bill: any, index: number) => {
                                                        // Find the corresponding bill_id from vendor_bills
                                                        const vendorBill = vendorBills.find((vb: any) => vb.bill_no === bill.bill_no);
                                                        const billId = vendorBill?.bill_id || bill.payment_ids[0];

                                                        return (
                                                            <div
                                                                key={index}
                                                                onClick={() => {
                                                                    // Use the bill_id from vendor_bills to navigate
                                                                    navigate(`/bills/${billId}`);
                                                                }}
                                                                className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors border border-gray-100"
                                                            >
                                                                <div className="flex-1">
                                                                    <div className="flex items-center gap-3">
                                                                        <span className="font-medium text-gray-900">
                                                                            {bill.bill_no}
                                                                        </span>
                                                                        <span className="text-xs text-gray-500">
                                                                            PO: {bill.po_no}
                                                                        </span>
                                                                        <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                                                                            {bill.payment_count} {bill.payment_count === 1 ? 'Payment' : 'Payments'}
                                                                        </span>
                                                                    </div>
                                                                    <div className="flex items-center gap-4 mt-1 text-sm text-gray-500">
                                                                        <span>Vendor: {bill.vendor}</span>
                                                                        <span>Total: ₹{bill.total_amount.toLocaleString('en-IN')}</span>
                                                                        {bill.latest_payment_date && (
                                                                            <span>Latest: {new Date(bill.latest_payment_date).toLocaleDateString()}</span>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                                                </svg>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            );
                                        })()}
                                    </div>
                                </div>

                                {/* Expenses Section */}
                                <div className="border border-gray-200 rounded-lg overflow-hidden">
                                    <div className="px-6 py-4 bg-gray-50 hover:bg-gray-100 flex items-center justify-between transition-colors">
                                        <h3 className="font-semibold text-blue-600 text-sm">Expenses</h3>
                                        <button className="text-black-800 text-sm font-medium hover:text-blue-700">New Expenses</button>
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

                        {activeTab === 'Payment' && (
                            <div className="space-y-6">
                                {/* Payment Summary Cards */}
                                {!isLoadingPayments && paymentSummary && (
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                                        <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
                                            <p className="text-xs font-medium text-gray-600 mb-1">Total Invoiced</p>
                                            <p className="text-2xl font-bold text-gray-900">₹{parseFloat(paymentSummary.total_invoiced || 0).toLocaleString('en-IN')}</p>
                                            <p className="text-xs text-gray-500 mt-1">{paymentSummary.invoice_count || 0} invoices</p>
                                        </div>
                                        <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
                                            <p className="text-xs font-medium text-gray-600 mb-1">Incoming Payments</p>
                                            <p className="text-2xl font-bold text-gray-900">₹{parseFloat(paymentSummary.total_payments || 0).toLocaleString('en-IN')}</p>
                                            <p className="text-xs text-gray-500 mt-1">{paymentSummary.payment_count || 0} payments</p>
                                        </div>
                                        <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
                                            <p className="text-xs font-medium text-gray-600 mb-1">Outgoing Payments</p>
                                            <p className="text-2xl font-bold text-gray-900">₹{parseFloat(paymentSummary.outgoing_total_payments || 0).toLocaleString('en-IN')}</p>
                                            <p className="text-xs text-gray-500 mt-1">{paymentSummary.outgoing_payment_count || 0} payments</p>
                                        </div>
                                        <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
                                            <p className="text-xs font-medium text-gray-600 mb-1">Net Balance</p>
                                            <p className="text-2xl font-bold text-gray-900">
                                                ₹{(parseFloat(paymentSummary.total_payments || 0) - parseFloat(paymentSummary.outgoing_total_payments || 0)).toLocaleString('en-IN')}
                                            </p>
                                            <p className="text-xs text-gray-500 mt-1">Incoming - Outgoing</p>
                                        </div>
                                    </div>
                                )}

                                {/* Filter and Search Bar */}
                                <div className="flex items-center justify-between gap-3">
                                    <h3 className="text-lg font-semibold text-gray-900">Payment History</h3>
                                    <div className="flex items-center gap-3">
                                        {/* Payment Type Filter */}
                                        <div className="relative">
                                            <button
                                                onClick={() => setShowPaymentFilter(!showPaymentFilter)}
                                                className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                                            >
                                                <Filter className="w-4 h-4" />
                                                {paymentTypeFilter}
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                                </svg>
                                            </button>
                                            {showPaymentFilter && (
                                                <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                                                    {['All', 'Incoming', 'Outgoing'].map((type) => (
                                                        <button
                                                            key={type}
                                                            onClick={() => {
                                                                setPaymentTypeFilter(type);
                                                                setShowPaymentFilter(false);
                                                            }}
                                                            className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 transition-colors ${
                                                                paymentTypeFilter === type ? 'bg-gray-100 font-medium' : ''
                                                            }`}
                                                        >
                                                            {type}
                                                        </button>
                                                    ))}
                                                </div>
                                            )}
                                        </div>

                                        {/* Search */}
                                        <div className="relative w-64">
                                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                            <input
                                                type="text"
                                                placeholder="Search payments..."
                                                value={paymentSearch}
                                                onChange={(e) => setPaymentSearch(e.target.value)}
                                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Unified Payments Table */}
                                {isLoadingPayments ? (
                                    <div className="text-center py-12">
                                        <div className="inline-flex flex-col items-center">
                                            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mb-3"></div>
                                            <p className="text-sm text-gray-500">Loading payments...</p>
                                        </div>
                                    </div>
                                ) : (() => {
                                    // Combine and filter payments
                                    const allPayments = [
                                        ...payments.map(p => ({ ...p, type: 'Incoming' })),
                                        ...outgoingPayments.map(p => ({ ...p, type: 'Outgoing' }))
                                    ];

                                    const filteredPayments = allPayments.filter(payment => {
                                        // Type filter
                                        if (paymentTypeFilter !== 'All' && payment.type !== paymentTypeFilter) {
                                            return false;
                                        }

                                        // Search filter
                                        const searchLower = paymentSearch.toLowerCase();
                                        const searchMatch = paymentSearch === '' ||
                                            payment.invoice_no?.toLowerCase().includes(searchLower) ||
                                            payment.bill_no?.toLowerCase().includes(searchLower) ||
                                            payment.po_no?.toLowerCase().includes(searchLower) ||
                                            payment.vendor?.toLowerCase().includes(searchLower) ||
                                            payment.reference_no?.toLowerCase().includes(searchLower) ||
                                            payment.payment_method?.toLowerCase().includes(searchLower) ||
                                            payment.created_by_name?.toLowerCase().includes(searchLower);
                                        
                                        return searchMatch;
                                    });

                                    return (
                                        <ReusableTable<any>
                                            data={filteredPayments}
                                            columns={[
                                                {
                                                    header: 'TYPE',
                                                    accessor: (payment) => (
                                                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                                                            payment.type === 'Incoming' 
                                                                ? 'bg-gray-100 text-gray-700' 
                                                                : 'bg-gray-100 text-gray-700'
                                                        }`}>
                                                            {payment.type}
                                                        </span>
                                                    ),
                                                    className: 'uppercase text-xs'
                                                },
                                                {
                                                    header: 'REFERENCE',
                                                    accessor: (payment) => (
                                                        payment.type === 'Incoming' ? (
                                                            <span
                                                                onClick={() => navigate(`/invoices/${payment.invoice_id}`)}
                                                                className="text-sm font-medium text-blue-600 hover:text-blue-800 hover:underline cursor-pointer"
                                                            >
                                                                {payment.invoice_no}
                                                            </span>
                                                        ) : (
                                                            <div className="flex flex-col gap-1">
                                                                <span
                                                                    onClick={() => navigate(`/bills/${payment.bill_id}`)}
                                                                    className="text-sm font-medium text-blue-600 hover:text-blue-800 hover:underline cursor-pointer"
                                                                >
                                                                    {payment.bill_no}
                                                                </span>
                                                                <span
                                                                    onClick={() => navigate(`/purchase-orders/${payment.po_id}`)}
                                                                    className="text-xs text-gray-500 hover:text-blue-600 hover:underline cursor-pointer"
                                                                >
                                                                    PO: {payment.po_no}
                                                                </span>
                                                            </div>
                                                        )
                                                    ),
                                                    className: 'uppercase text-xs'
                                                },
                                                {
                                                    header: 'PARTY',
                                                    accessor: (payment) => (
                                                        <span className="text-sm text-gray-900">
                                                            {payment.type === 'Incoming' ? payment.created_by_name : payment.vendor}
                                                        </span>
                                                    ),
                                                    className: 'uppercase text-xs'
                                                },
                                                {
                                                    header: 'PAYMENT DATE',
                                                    accessor: (payment) => new Date(payment.payment_date).toLocaleDateString('en-GB', {
                                                        day: '2-digit',
                                                        month: 'short',
                                                        year: 'numeric'
                                                    }),
                                                    className: 'uppercase text-xs'
                                                },
                                                {
                                                    header: 'AMOUNT',
                                                    accessor: (payment) => (
                                                        <span className="font-semibold text-gray-900">
                                                            {payment.type === 'Incoming' ? '+' : '-'}₹{parseFloat(payment.amount).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                                        </span>
                                                    ),
                                                    className: 'uppercase text-xs'
                                                },
                                                {
                                                    header: 'PAYMENT METHOD',
                                                    accessor: (payment) => (
                                                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                                                            {payment.payment_method || '-'}
                                                        </span>
                                                    ),
                                                    className: 'uppercase text-xs'
                                                },
                                                {
                                                    header: 'REFERENCE NO',
                                                    accessor: (payment) => payment.reference_no || '-',
                                                    className: 'uppercase text-xs'
                                                },
                                                {
                                                    header: 'CREATED',
                                                    accessor: (payment) => (
                                                        <span className="text-xs text-gray-500">
                                                            {new Date(payment.created_at).toLocaleDateString('en-GB', {
                                                                day: '2-digit',
                                                                month: 'short',
                                                                year: 'numeric'
                                                            })}
                                                        </span>
                                                    ),
                                                    className: 'uppercase text-xs'
                                                }
                                            ]}
                                            keyField="id"
                                            emptyMessage="No payments found for this project"
                                        />
                                    );
                                })()}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Add Task Modal */}
            {isAddTaskModalOpen && project && (
                <AddTaskModal
                    isOpen={isAddTaskModalOpen}
                    onClose={() => { setIsAddTaskModalOpen(false); setSelectedTaskForEdit(null); }}
                    onTaskAdded={handleTaskAdded}
                    prefilledProjectId={project.id || parseInt(projectId || '0')}
                    prefilledProjectName={project.project_name || `Project #${projectId}`}
                    editingTask={selectedTaskForEdit}
                    onTaskUpdated={async (updatedApiTask: any) => {
                        if (updatedApiTask && updatedApiTask.id) {
                            const taskId = updatedApiTask.id.toString();
                            setTasks(prev => prev.map(t => t.id === taskId ? {
                                ...t,
                                assignee: updatedApiTask.assigned_to?.username || 'Unassigned',
                                assigneeAvatar: updatedApiTask.assigned_to?.username?.substring(0, 2).toUpperCase() || '○',
                                title: updatedApiTask.title || t.title,
                                status: (updatedApiTask.status || t.status) as Task['status'],
                                activityType: updatedApiTask.activity_type || t.activityType,
                                allocatedHours: updatedApiTask.allocated_hours ? `${updatedApiTask.allocated_hours}h` : t.allocatedHours,
                                consumedHours: updatedApiTask.consumed_hours ? `${updatedApiTask.consumed_hours}h` : t.consumedHours,
                                dueDate: updatedApiTask.due_date ? new Date(updatedApiTask.due_date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }) : t.dueDate,
                                remaining: updatedApiTask.remaining_hours ? `${updatedApiTask.remaining_hours}h` : updatedApiTask.allocated_hours ? `${updatedApiTask.allocated_hours}h` : t.remaining
                            } : t));
                        } else {
                            // fallback to refetch if no data returned
                            try {
                                const response = await axiosInstance.get(`/tasks/${projectId}/tasks/`);
                                if (response.data && Array.isArray(response.data) && response.data.length > 0) {
                                    const projectTasksData = response.data[0];
                                    if (projectTasksData.Tasks && Array.isArray(projectTasksData.Tasks)) {
                                        const mappedTasks: Task[] = projectTasksData.Tasks.map(mapApiTaskToTask);
                                        setTasks(mappedTasks);
                                    }
                                }
                            } catch (error) {
                                console.error('Error refetching tasks after update:', error);
                            }
                        }
                    }}
                />
            )}

            {/* Assign Task Modal */}
            {isAssignTaskModalOpen && selectedTaskForAssignment && (
                <AssignTaskModal
                    isOpen={isAssignTaskModalOpen}
                    onClose={() => {
                        setIsAssignTaskModalOpen(false);
                        setSelectedTaskForAssignment(null);
                    }}
                    onAssignmentSuccess={handleAssignmentSuccess}
                    task={selectedTaskForAssignment}
                />
            )}
        </Layout>
    );
};

export default ProjectDetailsPage;