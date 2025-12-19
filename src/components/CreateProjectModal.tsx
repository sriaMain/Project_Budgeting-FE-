/**
 * Create Project Modal Component
 * Modal with tabbed interface for creating projects from quotes
 */

import React, { useState } from 'react';
import { X, User, Calendar, Currency } from 'lucide-react';
import { InputField } from './InputField';
import axiosInstance from '../utils/axiosInstance';

interface CreateProjectModalProps {
    isOpen: boolean;
    onClose: () => void;
    quoteName?: string;
    quoteId?: number;
    clientId?: number;
    clientName?: string;
    projectManagerName?: string;
}

type TabType = 'project' | 'budget';

export const CreateProjectModal: React.FC<CreateProjectModalProps> = ({
    isOpen,
    onClose,
    quoteName = '',
    quoteId,
    clientId,
    clientName,
    projectManagerName = '',
}) => {
    const [activeTab, setActiveTab] = useState<TabType>('project');
    const [setQuoteConfirmed, setSetQuoteConfirmed] = useState(false);
    const [projectType, setProjectType] = useState<'internal' | 'external'>('internal');
    const [budgetMethod, setBudgetMethod] = useState<'quoted' | 'manual'>('quoted');

    // Form state
    const [projectName, setProjectName] = useState(quoteName ?? '');
    const [membersOnly, setMembersOnly] = useState(false);
    const [currency, setCurrency] = useState<string>('INR');
    const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
    const [dueDate, setDueDate] = useState(new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]);
    const [totalHours, setTotalHours] = useState('');
    const [totalBudget, setTotalBudget] = useState('');
    const [billsExpenses, setBillsExpenses] = useState('');

    React.useEffect(() => {
        if (isOpen) {
            if (quoteName) setProjectName(quoteName);
        }
    }, [isOpen, quoteName]);

    if (!isOpen) return null;
    const handleCreateProject = async () => {
        const budgetPayload = budgetMethod === 'quoted'
            ? { use_quoted_amounts: true }
            : {
                use_quoted_amounts: false,
                total_hours: Number(totalHours) || 0,
                total_budget: Number(totalBudget) || 0,
                bills_and_expenses: Number(billsExpenses) || 0,
                currency: currency,
            };

        const payload = {
            project_name: projectName,
            project_type: projectType,
            client: clientId,
            start_date: startDate,
            end_date: dueDate,
            created_from_quotation: typeof quoteId === 'number' ? quoteId : undefined,
            budget: budgetPayload,
        };

        try {
            const response = await axiosInstance.post('projects/', payload);
            console.log('Project created:', response.data);
            onClose();
        } catch (error) {
            console.error('Error creating project:', error);
        }
    };

    const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
        if (e.target === e.currentTarget) {
            onClose();
        }
    };

    return (
        <>
            {/* Backdrop */}
            <div
                className="fixed inset-0 br-10 bg-opacity-50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                onClick={handleBackdropClick}
            >
                {/* Modal */}
                <div
                    className="bg-white rounded-lg shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto"
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Header */}
                    <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between z-10">
                        <h2 className="text-xl font-bold text-gray-900">Create Project</h2>
                        <div className="flex items-center gap-4">
                            {/* Set quote as Confirmed Toggle */}
                            <div className="flex items-center gap-2">
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={setQuoteConfirmed}
                                        onChange={(e) => setSetQuoteConfirmed(e.target.checked)}
                                        className="sr-only peer"
                                    />
                                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-500"></div>
                                </label>
                                <span className="text-sm font-medium text-gray-700">
                                    Set quote as Confirmed
                                </span>
                            </div>
                            <button
                                onClick={onClose}
                                className="p-1 hover:bg-gray-100 rounded transition-colors"
                                aria-label="Close modal"
                            >
                                <X size={24} className="text-gray-600" />
                            </button>
                        </div>
                    </div>

                    {/* Tabs */}
                    <div className="border-b border-gray-200 px-6">
                        <div className="flex gap-1">
                            <button
                                onClick={() => setActiveTab('project')}
                                className={`px-6 py-3 font-semibold text-sm transition-colors relative ${activeTab === 'project'
                                    ? 'text-gray-900 bg-gray-100'
                                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                                    }`}
                            >
                                Project Settings
                                {activeTab === 'project' && (
                                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600"></div>
                                )}
                            </button>
                            <button
                                onClick={() => setActiveTab('budget')}
                                className={`px-6 py-3 font-semibold text-sm transition-colors relative ${activeTab === 'budget'
                                    ? 'text-gray-900 bg-gray-100'
                                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                                    }`}
                            >
                                Budget Settings
                                {activeTab === 'budget' && (
                                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600"></div>
                                )}
                            </button>
                        </div>
                    </div>

                    {/* Tab Content */}
                    <div className="p-6">
                        {activeTab === 'project' ? (
                            /* Project Settings Tab */
                            <div className="space-y-6">
                                {/* Project Name */}
                                <div className="grid grid-cols-2 gap-6">
                                    <InputField
                                        label="Project name"
                                        value={projectName}
                                        onChange={(e) => setProjectName(e.target.value)}
                                        placeholder="Enter project name"
                                    />
                                    <InputField
                                        label="Project no"
                                        value=""
                                        disabled
                                        placeholder="Auto-generated"
                                    />
                                </div>

                                {/* Project Manager - Read Only */}
                                <div>
                                    <label className="block text-base font-medium text-gray-900 mb-2">
                                        Project Manager
                                    </label>
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                                                <User size={16} className="text-gray-600" />
                                            </div>
                                            <span className="text-gray-900 font-medium">
                                                {projectManagerName || 'Not specified'}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <label className="relative inline-flex items-center cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    checked={membersOnly}
                                                    onChange={(e) => setMembersOnly(e.target.checked)}
                                                    className="sr-only peer"
                                                />
                                                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                                            </label>
                                            <span className="text-sm text-gray-700">Members only</span>
                                            <button className="p-1 hover:bg-gray-100 rounded" title="Info">
                                                <svg
                                                    className="w-4 h-4 text-gray-400"
                                                    fill="currentColor"
                                                    viewBox="0 0 20 20"
                                                >
                                                    <path
                                                        fillRule="evenodd"
                                                        d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                                                        clipRule="evenodd"
                                                    />
                                                </svg>
                                            </button>
                                        </div>
                                    </div>
                                    <p className="text-sm text-gray-500 mt-2">
                                        You can add members to the project later from the project view
                                    </p>
                                </div>

                                {/* Project Type */}
                                <div>
                                    <label className="block text-base font-medium text-gray-900 mb-3">
                                        Project type
                                    </label>
                                    <div className="flex gap-3">
                                        <button
                                            onClick={() => setProjectType('internal')}
                                            className={`flex-1 py-2.5 px-4 rounded-lg font-medium transition-colors ${projectType === 'internal'
                                                ? 'bg-gray-200 text-gray-900'
                                                : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                                                }`}
                                        >
                                            Internal
                                        </button>
                                        <button
                                            onClick={() => setProjectType('external')}
                                            className={`flex-1 py-2.5 px-4 rounded-lg font-medium transition-colors ${projectType === 'external'
                                                ? 'bg-gray-200 text-gray-900'
                                                : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                                                }`}
                                        >
                                            External
                                        </button>
                                    </div>
                                </div>

                                {/* Project Setup */}
                                <div>
                                    <label className="block text-base font-medium text-gray-900 mb-3">
                                        Project Setup
                                    </label>
                                    <div className="space-y-4">
                                        {/* Client - Read Only */}
                                        <div>
                                            <label className="block text-sm text-gray-600 mb-1">Client</label>
                                            <div className="w-full px-4 py-2.5 bg-gray-50 border border-gray-300 rounded-lg text-gray-900">
                                                <span className="font-medium">{clientName || 'Not specified'}</span>
                                            </div>
                                        </div>

                                        {/* Dates */}
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm text-gray-600 mb-1">Start Date</label>
                                                <InputField
                                                    type="text"
                                                    value={startDate}
                                                    onChange={(e) => setStartDate(e.target.value)}
                                                    placeholder="YYYY-MM-DD"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm text-gray-600 mb-1">Due Date</label>
                                                <InputField
                                                    type="text"
                                                    value={dueDate}
                                                    onChange={(e) => setDueDate(e.target.value)}
                                                    placeholder="YYYY-MM-DD"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            /* Budget Settings Tab */
                            <div className="space-y-6">
                                {/* Budget Method Toggle */}
                                <div className="flex gap-3">
                                    <button
                                        onClick={() => setBudgetMethod('quoted')}
                                        className={`flex-1 py-2.5 px-4 rounded-lg font-medium transition-colors ${budgetMethod === 'quoted'
                                            ? 'bg-gray-200 text-gray-900'
                                            : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                                            }`}
                                    >
                                        Use quoted amounts
                                    </button>
                                    <button
                                        onClick={() => setBudgetMethod('manual')}
                                        className={`flex-1 py-2.5 px-4 rounded-lg font-medium transition-colors ${budgetMethod === 'manual'
                                            ? 'bg-gray-200 text-gray-900'
                                            : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                                            }`}
                                    >
                                        Set manually
                                    </button>
                                </div>

                                <p className="text-sm text-gray-500">
                                    You can add members to the project later from the project view
                                </p>

                                {/* Budget Fields - Show different fields based on budget method */}
                                {/* Budget Fields */}
                                <div className={`grid gap-4 ${budgetMethod === "manual" ? "grid-cols-1 md:grid-cols-2" : "grid-cols-1 md:grid-cols-3"}`}>

                                    <InputField
                                        label="Total hours"
                                        value={totalHours}
                                        onChange={(e) => setTotalHours(e.target.value)}
                                        placeholder="0"
                                    />

                                    <InputField
                                        label="Total budget INR"
                                        value={totalBudget}
                                        onChange={(e) => setTotalBudget(e.target.value)}
                                        placeholder="0"
                                    />

                                    {/* Hide Bills & Expenses only in manual mode */}
                                    {budgetMethod === "quoted" && (
                                        <InputField
                                            label="Bills & Expenses"
                                            value={billsExpenses}
                                            onChange={(e) => setBillsExpenses(e.target.value)}
                                            placeholder="0"
                                        />
                                    )}
                                </div>



                                {/* Price List */}
                                <div>
                                    <label className="block text-sm text-gray-600 mb-1">Price list</label>
                                    <div className="relative">
                                        <select
                                            value={currency}
                                            onChange={(e) => setCurrency(e.target.value)}
                                            className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-600 appearance-none"
                                        >
                                            <option value="INR">INR</option>
                                            <option value="USD">USD</option>
                                            <option value="EUR">EUR</option>
                                        </select>
                                        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                                            <svg
                                                className="w-5 h-5 text-gray-400"
                                                fill="none"
                                                stroke="currentColor"
                                                viewBox="0 0 24 24"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth={2}
                                                    d="M19 9l-7 7-7-7"
                                                />
                                            </svg>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    <div className="sticky bottom-0 bg-white border-t border-gray-200 px-6 py-4 flex justify-center">
                        <button
                            onClick={handleCreateProject}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-2.5 rounded-lg font-semibold transition-colors shadow-md hover:shadow-lg"
                        >
                            Create Project
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
};
