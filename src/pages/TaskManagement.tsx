import React, { useState } from 'react';
import { Plus, Search, Filter, Calendar, ChevronLeft, ChevronRight, ArrowLeft } from 'lucide-react';
import { Layout } from '../components/Layout';

// Type Definitions
interface Task {
  id: string;
  status: 'In Progress' | 'Pending' | 'Completed' | 'Needs Attention';
  name: string;
  description: string;
  allocatedTime: string;
  remaining: string;
  startDate: string;
  dueDate: string;
  project: string;
}

interface TaskGroup {
  project: string;
  tasks: Task[];
}

// Timesheet Type Definitions
interface TimesheetEmployee {
  id: string;
  name: string;
  email: string;
  totalHours: number;
  status: 'Submitted' | 'Draft' | 'Not Started';
  lastUpdated: string;
}

interface TimesheetTask {
  id: string;
  taskName: string;
  projectName: string;
  hours: {
    mon: number;
    tue: number;
    wed: number;
    thu: number;
    fri: number;
    sat: number;
    sun: number;
  };
}

interface EmployeeTimesheet {
  employee: TimesheetEmployee;
  tasks: TimesheetTask[];
  weekRange: string;
}

// Props for TaskManagement component
interface TaskManagementProps {
  userRole: "admin" | "user";
  currentPage: string;
  onNavigate: (page: string) => void;
}

// Status Badge Component
const StatusBadge: React.FC<{ status: Task['status'] }> = ({ status }) => {
  const statusStyles = {
    'In Progress': 'bg-emerald-600 text-white',
    'Pending': 'bg-gray-600 text-white',
    'Completed': 'bg-blue-600 text-white',
    'Needs Attention': 'bg-red-600 text-white',
  };

  return (
    <span
      className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${statusStyles[status] || statusStyles['Pending']
        }`}
    >
      {status}
    </span>
  );
};

// Play Icon Component
const PlayIcon: React.FC = () => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polygon points="5 3 19 12 5 21 5 3"></polygon>
  </svg>
);

// Task Row Component
const TaskRow: React.FC<{ task: Task }> = ({ task }) => {
  const isOverdue = task.remaining.toLowerCase().includes('overdue');

  return (
    <tr className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
      <td className="px-6 py-4 whitespace-nowrap">
        <StatusBadge status={task.status} />
      </td>
      <td className="px-6 py-4">
        <div className="flex flex-col">
          <p className="text-sm font-medium text-gray-900">{task.name}</p>
          <p className="text-xs text-gray-500 mt-0.5">{task.description}</p>
        </div>
      </td>
      <td className="px-6 py-4 text-sm text-gray-700 whitespace-nowrap text-center">
        {task.allocatedTime}
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <span
          className={`text-sm font-semibold ${isOverdue ? 'text-red-600' : 'text-green-600'
            }`}
        >
          {task.remaining}
        </span>
      </td>
      <td className="px-4 py-4 whitespace-nowrap text-center">
        <button className="text-gray-400 hover:text-blue-600 transition-colors">
          <PlayIcon />
        </button>
      </td>
      <td className="px-6 py-4 text-sm text-gray-700 whitespace-nowrap text-center">
        {task.startDate}
      </td>
      <td className="px-6 py-4 text-sm font-medium text-red-600 whitespace-nowrap text-center">
        {task.dueDate}
      </td>
    </tr>
  );
};

// Project Group Row Component (renders project name and its tasks)
const ProjectGroupRows: React.FC<{ group: TaskGroup }> = ({ group }) => {
  return (
    <>
      {/* Project Name Row */}
      <tr className="bg-white border-b border-gray-200 border-t-4 border-t-blue-800">
        <td colSpan={7} className="px-6 py-3">
          <span className="text-base font-bold text-gray-900">{group.project}</span>
        </td>
      </tr>
      {/* Task Rows for this project */}
      {group.tasks.map((task) => (
        <TaskRow key={task.id} task={task} />
      ))}
    </>
  );
};

// Main TaskManagement Component
export const TaskManagement: React.FC<TaskManagementProps> = ({ userRole, currentPage, onNavigate }) => {
  const [activeTab, setActiveTab] = useState<'list' | 'board' | 'timesheet'>('list');

  // Timesheet state management
  const [timesheetView, setTimesheetView] = useState<'summary' | 'detail'>('summary');
  const [selectedEmployee, setSelectedEmployee] = useState<TimesheetEmployee | null>(null);
  const [employeeSearch, setEmployeeSearch] = useState<string>('');

  // Sample Data
  const taskGroups: TaskGroup[] = [
    {
      project: 'Unspecified',
      tasks: [
        {
          id: '1',
          status: 'In Progress',
          name: 'Review client briefs',
          description: 'Define Scope and Acceptance Criteria',
          allocatedTime: '8h',
          remaining: '6h 18m',
          startDate: '30-10',
          dueDate: '10-11',
          project: 'Unspecified',
        },
        {
          id: '2',
          status: 'Pending',
          name: 'Conduct team holiday schedule',
          description: 'Ensure coverage for critical tasks',
          allocatedTime: '2h 30m',
          remaining: '2h 30m',
          startDate: '09-12',
          dueDate: '16-12',
          project: 'Unspecified',
        },
        {
          id: '3',
          status: 'Completed',
          name: 'Prepare slide deck for client meeting',
          description: 'Define Scope and Acceptance Criteria',
          allocatedTime: '1h',
          remaining: '0m',
          startDate: '09-12',
          dueDate: '19-12',
          project: 'Unspecified',
        },
      ],
    },
    {
      project: 'Coaching workshop (example)',
      tasks: [
        {
          id: '4',
          status: 'Pending',
          name: 'Confirm agenda with client',
          description: 'Send kickoff email with revised timelines',
          allocatedTime: '4h',
          remaining: 'Overdue',
          startDate: '20-10',
          dueDate: '18d',
          project: 'Coaching workshop',
        },
        {
          id: '5',
          status: 'Needs Attention',
          name: 'Approve materials',
          description: 'Review finalized deck for any design fixes',
          allocatedTime: '3h',
          remaining: '1h 20m',
          startDate: '24-10',
          dueDate: '14d',
          project: 'Coaching workshop',
        },
        {
          id: '6',
          status: 'Pending',
          name: 'Create presentation',
          description: 'Draft slides for the investor pitch meeting',
          allocatedTime: '1h',
          remaining: '6h',
          startDate: '21-10',
          dueDate: '10-10',
          project: 'Coaching workshop',
        },
      ],
    },
    {
      project: 'Detailed Project (IT Consulting)',
      tasks: [
        {
          id: '7',
          status: 'In Progress',
          name: 'Review client Needs',
          description: 'Define Scope and Acceptance Criteria',
          allocatedTime: '12h',
          remaining: '6h 18m',
          startDate: '25-11',
          dueDate: '21-11',
          project: 'IT Consulting',
        },
        {
          id: '8',
          status: 'Pending',
          name: 'Review team holiday schedule',
          description: 'Ensure coverage for critical tasks',
          allocatedTime: '40m',
          remaining: '40m',
          startDate: '25-11',
          dueDate: '30-11',
          project: 'IT Consulting',
        },
      ],
    },
  ];

  // Stat Cards Data
  const stats = [
    { title: 'Total active projects', value: 10 },
    { title: 'Overdue Tasks', value: 11 },
    { title: 'Unassigned Tasks', value: 5 },
  ];

  // Timesheet Static Data
  const timesheetEmployees: TimesheetEmployee[] = [
    {
      id: '1',
      name: 'John Deo',
      email: 'j-ohn-deo',
      totalHours: 40.00,
      status: 'Submitted',
      lastUpdated: 'Nov 7, 9:05 AM',
    },
    {
      id: '2',
      name: 'John Deo',
      email: 'j-ohn-deo',
      totalHours: 40.00,
      status: 'Draft',
      lastUpdated: 'Nov 7, 9:05 AM',
    },
    {
      id: '3',
      name: 'John Deo',
      email: 'j-ohn-deo',
      totalHours: 40.00,
      status: 'Not Started',
      lastUpdated: 'Nov 7, 9:05 AM',
    },
  ];

  const employeeTimesheetData: EmployeeTimesheet = {
    employee: timesheetEmployees[0],
    weekRange: 'November 3 - November 9, 2025 (Week 45)',
    tasks: [
      {
        id: '1',
        taskName: 'Calendar Events',
        projectName: 'General',
        hours: { mon: 0, tue: 0, wed: 0, thu: 0, fri: 0, sat: 0, sun: 0 },
      },
      {
        id: '2',
        taskName: 'Internal Meetings',
        projectName: 'General',
        hours: { mon: 0, tue: 0, wed: 0, thu: 0, fri: 0, sat: 0, sun: 0 },
      },
      {
        id: '3',
        taskName: 'Systems Architect',
        projectName: 'Detailed Project (IT Consulting)',
        hours: { mon: 0, tue: 0, wed: 0, thu: 0, fri: 0, sat: 0, sun: 0 },
      },
      {
        id: '4',
        taskName: 'Implementation and Monitoring',
        projectName: 'Detailed Project (IT Consulting)',
        hours: { mon: 0, tue: 0, wed: 0, thu: 0, fri: 0, sat: 0, sun: 0 },
      },
      {
        id: '5',
        taskName: 'Cybersecurity Support - period 4',
        projectName: 'Manager Project (example)',
        hours: { mon: 0, tue: 0, wed: 0, thu: 0, fri: 0, sat: 0, sun: 0 },
      },
      {
        id: '6',
        taskName: 'IT Infrastructure',
        projectName: 'Time and Material Project (example)',
        hours: { mon: 0, tue: 0, wed: 0, thu: 0, fri: 0, sat: 0, sun: 0 },
      },
    ],
  };

  // Calculate totals for detail view
  const calculateTaskTotal = (hours: TimesheetTask['hours']) => {
    return Object.values(hours).reduce((sum, val) => sum + val, 0);
  };

  const calculateDayTotal = (tasks: TimesheetTask[], day: keyof TimesheetTask['hours']) => {
    return tasks.reduce((sum, task) => sum + task.hours[day], 0);
  };

  const calculateGrandTotal = (tasks: TimesheetTask[]) => {
    return tasks.reduce((sum, task) => sum + calculateTaskTotal(task.hours), 0);
  };

  // Filter employees based on search
  const filteredEmployees = timesheetEmployees.filter(emp =>
    emp.name.toLowerCase().includes(employeeSearch.toLowerCase()) ||
    emp.email.toLowerCase().includes(employeeSearch.toLowerCase())
  );

  return (
    <Layout userRole={userRole} currentPage={currentPage} onNavigate={onNavigate}>
      <div className="min-h-screen bg-gray-50 p-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Task Management</h1>
        </div>

        {/* Stats Cards - Hide when viewing employee timesheet detail */}
        {!(activeTab === 'timesheet' && timesheetView === 'detail') && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            {stats.map((stat, index) => (
              <div
                key={index}
                className="bg-white rounded-lg border border-gray-200 p-5"
              >
                <p className="text-xs text-gray-600 mb-1">{stat.title}</p>
                <p
                  className={`text-3xl font-bold ${stat.title === 'Overdue Tasks' ? 'text-red-600' : 'text-gray-900'
                    }`}
                >
                  {stat.value}
                </p>
              </div>
            ))}
          </div>
        )}

        {/* Tabs and Actions Container - Hide when viewing employee timesheet detail */}
        {!(activeTab === 'timesheet' && timesheetView === 'detail') && (
          <div className="bg-white rounded-lg border border-gray-200 mb-6">
            {/* Tabs */}
            <div className="flex gap-6 px-6 pt-4 border-b border-gray-200">
              {(['list', 'board', 'timesheet'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`pb-3 px-1 font-semibold text-sm transition-colors relative ${activeTab === tab
                    ? 'text-gray-900 border-b-2 border-gray-900'
                    : 'text-gray-500 hover:text-gray-700'
                    }`}
                >
                  {tab === 'list' ? 'Task List' : tab === 'board' ? 'Task Board' : 'Timesheet'}
                </button>
              ))}
            </div>

            {/* Action Bar - Empty for Timesheet */}
            {activeTab !== 'timesheet' && (
              <div className="flex items-center justify-between gap-4 px-6 py-4">
                {/* Standard Action Bar for Task List and Board */}
                {/* Only show New button on Task List */}
                <div className="flex items-center justify-start gap-2">
                  {activeTab === 'list' && (
                    <button className="flex items-center gap-2 bg-blue-600 text-white px-4 py-1 rounded-md text-sm font-medium hover:bg-blue-700 transition-colors">
                      <Plus size={16} />
                      New
                    </button>
                  )}

                  <button className="flex items-center gap-2 border border-gray-300 text-gray-700 px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-50 hover:border-gray-400 transition-colors">
                    <Search size={16} />
                    View All Tasks
                  </button>

                  <button className="flex items-center gap-2 border border-gray-300 text-gray-700 px-2 py-2 rounded-md text-sm font-medium hover:bg-gray-50 hover:border-gray-400 transition-colors">
                    <Filter size={16} />
                    Filter By Assignees
                  </button>

                  <button className="border border-gray-300 text-gray-700 px-2 py-2 rounded-md text-sm font-medium hover:bg-gray-50 hover:border-gray-400 transition-colors">
                    Group By Project
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Task Groups - List View */}
        {activeTab === 'list' && (
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <table className="w-full">
              <thead>
                {/* Column Headers - Only Once */}
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Task/Description
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Allocated Time
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Remaining
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    {/* Empty header for play button column */}
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Start Date
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Due Date
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {/* All Projects and Their Tasks */}
                {taskGroups.map((group) => (
                  <ProjectGroupRows key={group.project} group={group} />
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Board View */}
        {activeTab === 'board' && (
          <div className="overflow-x-auto pb-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Planned Column */}
              <div className="flex flex-col">
                <div className="bg-purple-600 text-white p-4 rounded-t-lg">
                  <h3 className="text-lg font-bold">Planned</h3>
                  <p className="text-sm opacity-90">
                    {taskGroups.reduce((acc, group) =>
                      acc + group.tasks.filter(t => t.status === 'Pending').length, 0)} tasks · {
                      taskGroups.flatMap(g => g.tasks.filter(t => t.status === 'Pending'))
                        .reduce((acc, t) => acc + t.allocatedTime, '')
                    }
                  </p>
                </div>
                <div className="bg-gray-50 p-3 space-y-3 min-h-[400px] rounded-b-lg border border-gray-200">
                  {taskGroups.flatMap(group =>
                    group.tasks
                      .filter(task => task.status === 'Pending')
                      .map(task => (
                        <div key={task.id} className="bg-white rounded-lg p-3 shadow-sm border-l-4 border-purple-600">
                          <h4 className="text-sm font-medium text-gray-900 mb-2">{task.name}</h4>
                          <div className="flex justify-between items-center text-xs">
                            <span className="text-gray-600">Project: {task.project}</span>
                            <span className={task.remaining.toLowerCase().includes('overdue') ? 'text-red-600 font-semibold' : 'text-gray-500'}>
                              {task.dueDate}
                            </span>
                          </div>
                        </div>
                      ))
                  )}
                </div>
              </div>

              {/* Needs Attention Column */}
              <div className="flex flex-col">
                <div className="bg-red-600 text-white p-4 rounded-t-lg">
                  <h3 className="text-lg font-bold">Needs attention</h3>
                  <p className="text-sm opacity-90">
                    {taskGroups.reduce((acc, group) =>
                      acc + group.tasks.filter(t => t.status === 'Needs Attention').length, 0)} task · {
                      taskGroups.flatMap(g => g.tasks.filter(t => t.status === 'Needs Attention'))
                        .reduce((acc, t) => acc + t.allocatedTime, '')
                    }
                  </p>
                </div>
                <div className="bg-gray-50 p-3 space-y-3 min-h-[400px] rounded-b-lg border border-gray-200">
                  {taskGroups.flatMap(group =>
                    group.tasks
                      .filter(task => task.status === 'Needs Attention')
                      .map(task => (
                        <div key={task.id} className="bg-white rounded-lg p-3 shadow-sm border-l-4 border-red-600">
                          <h4 className="text-sm font-medium text-gray-900 mb-2">{task.name}</h4>
                          <div className="flex justify-between items-center text-xs">
                            <span className="text-gray-600">Project: {task.project}</span>
                            <span className={task.remaining.toLowerCase().includes('overdue') ? 'text-red-600 font-semibold' : 'text-gray-500'}>
                              {task.dueDate}
                            </span>
                          </div>
                        </div>
                      ))
                  )}
                </div>
              </div>

              {/* In Progress Column */}
              <div className="flex flex-col">
                <div className="bg-green-600 text-white p-4 rounded-t-lg">
                  <h3 className="text-lg font-bold">In progress</h3>
                  <p className="text-sm opacity-90">
                    {taskGroups.reduce((acc, group) =>
                      acc + group.tasks.filter(t => t.status === 'In Progress').length, 0)} tasks · {
                      taskGroups.flatMap(g => g.tasks.filter(t => t.status === 'In Progress'))
                        .reduce((acc, t) => acc + t.allocatedTime, '')
                    }
                  </p>
                </div>
                <div className="bg-gray-50 p-3 space-y-3 min-h-[400px] rounded-b-lg border border-gray-200">
                  {taskGroups.flatMap(group =>
                    group.tasks
                      .filter(task => task.status === 'In Progress')
                      .map(task => (
                        <div key={task.id} className="bg-white rounded-lg p-3 shadow-sm border-l-4 border-green-600">
                          <h4 className="text-sm font-medium text-gray-900 mb-2">{task.name}</h4>
                          <div className="flex justify-between items-center text-xs">
                            <span className="text-gray-600">Project: {task.project}</span>
                            <span className="text-gray-500">{task.dueDate}</span>
                          </div>
                        </div>
                      ))
                  )}
                </div>
              </div>

              {/* Completed Column */}
              <div className="flex flex-col">
                <div className="bg-blue-600 text-white p-4 rounded-t-lg">
                  <h3 className="text-lg font-bold">Completed</h3>
                  <p className="text-sm opacity-90">
                    {taskGroups.reduce((acc, group) =>
                      acc + group.tasks.filter(t => t.status === 'Completed').length, 0)} task · {
                      taskGroups.flatMap(g => g.tasks.filter(t => t.status === 'Completed'))
                        .reduce((acc, t) => acc + t.allocatedTime, '')
                    }
                  </p>
                </div>
                <div className="bg-gray-50 p-3 space-y-3 min-h-[400px] rounded-b-lg border border-gray-200">
                  {taskGroups.flatMap(group =>
                    group.tasks
                      .filter(task => task.status === 'Completed')
                      .map(task => (
                        <div key={task.id} className="bg-white rounded-lg p-3 shadow-sm border-l-4 border-blue-600">
                          <h4 className="text-sm font-medium text-gray-900 mb-2">{task.name}</h4>
                          <div className="flex justify-between items-center text-xs">
                            <span className="text-gray-600">Project: {task.project}</span>
                            <span className="text-gray-500">{task.dueDate}</span>
                          </div>
                        </div>
                      ))
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Timesheet View */}
        {activeTab === 'timesheet' && (
          <>
            {timesheetView === 'summary' ? (
              /* SUMMARY VIEW - Timesheet Summary */
              <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                {/* Header Section */}
                <div className="p-6 border-b border-gray-200">
                  {/* Row 1: Title and Calendar Navigation */}
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-2xl font-bold text-gray-900">Timesheet Summary</h2>

                    {/* Calendar Navigation - Right Side */}
                    <div className="flex items-center gap-2">
                      <button className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                        <ChevronLeft size={18} className="text-gray-600" />
                      </button>
                      <button className="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                        <Calendar size={16} className="text-gray-600" />
                        <span className="text-sm font-medium text-gray-700">Current Week</span>
                      </button>
                      <button className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                        <ChevronRight size={18} className="text-gray-600" />
                      </button>
                    </div>
                  </div>

                  {/* Row 2: Date Range and Search */}
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-gray-600">November 3 - November 9, 2025 (Week 45)</p>

                    {/* Search Field - Right Side */}
                    <div className="relative w-56">
                      <Search
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                        size={16}
                      />
                      <input
                        type="text"
                        placeholder="Search Employee.."
                        value={employeeSearch}
                        onChange={(e) => setEmployeeSearch(e.target.value)}
                        className="w-full pl-9 pr-3 py-1.5 text-xs border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                </div>

                {/* Employee Table - Desktop */}
                <div className="hidden md:block overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-gray-50 border-b border-gray-200">
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                          Employee
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                          Total Hours
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                          Last Updated
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-100">
                      {filteredEmployees.map((employee) => (
                        <tr
                          key={employee.id}
                          onClick={() => {
                            setSelectedEmployee(employee);
                            setTimesheetView('detail');
                          }}
                          className="hover:bg-blue-50 cursor-pointer transition-colors"
                        >
                          <td className="px-6 py-4">
                            <div>
                              <p className="text-sm font-medium text-gray-900">{employee.name}</p>
                              <p className="text-xs text-gray-500">{employee.email}</p>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-700">
                            {employee.totalHours.toFixed(2)}
                          </td>
                          <td className="px-6 py-4">
                            <span
                              className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${employee.status === 'Submitted'
                                ? 'bg-green-100 text-green-800'
                                : employee.status === 'Draft'
                                  ? 'bg-yellow-100 text-yellow-800'
                                  : 'bg-gray-100 text-gray-700'
                                }`}
                            >
                              <span
                                className={`w-2 h-2 rounded-full mr-2 ${employee.status === 'Submitted'
                                  ? 'bg-green-600'
                                  : employee.status === 'Draft'
                                    ? 'bg-yellow-600'
                                    : 'bg-gray-500'
                                  }`}
                              />
                              {employee.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-600">
                            {employee.lastUpdated}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Employee Cards - Mobile */}
                <div className="md:hidden p-4 space-y-4">
                  {filteredEmployees.map((employee) => (
                    <div
                      key={employee.id}
                      onClick={() => {
                        setSelectedEmployee(employee);
                        setTimesheetView('detail');
                      }}
                      className="bg-white border border-gray-200 rounded-lg p-4 hover:border-blue-500 cursor-pointer transition-all shadow-sm"
                    >
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h3 className="font-semibold text-gray-900">{employee.name}</h3>
                          <p className="text-sm text-gray-500">{employee.email}</p>
                        </div>
                        <span
                          className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${employee.status === 'Submitted'
                            ? 'bg-green-100 text-green-800'
                            : employee.status === 'Draft'
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-gray-100 text-gray-700'
                            }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full mr-1.5 ${employee.status === 'Submitted'
                              ? 'bg-green-600'
                              : employee.status === 'Draft'
                                ? 'bg-yellow-600'
                                : 'bg-gray-500'
                              }`}
                          />
                          {employee.status}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <p className="text-xs text-gray-500 mb-1">Total Hours</p>
                          <p className="text-sm font-medium text-gray-900">{employee.totalHours.toFixed(2)}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 mb-1">Last Updated</p>
                          <p className="text-sm font-medium text-gray-900">{employee.lastUpdated}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              /* DETAIL VIEW - Employee Timesheet */
              <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                {/* Back Button */}
                <div className="p-6 border-b border-gray-200">
                  <button
                    onClick={() => {
                      setTimesheetView('summary');
                      setSelectedEmployee(null);
                    }}
                    className="flex items-center gap-2 px-4 py-2 text-blue-600 border-2 border-blue-600 rounded-lg hover:bg-blue-50 transition-colors font-medium"
                  >
                    <ArrowLeft size={20} />
                    Back to Summary
                  </button>
                </div>

                {/* Employee Header */}
                <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                  <h2 className="text-xl font-bold text-gray-900">{selectedEmployee?.name}'s Timesheet</h2>
                </div>

                {/* Timesheet Grid - Scrollable on smaller screens */}
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse min-w-[800px]">
                    <thead>
                      <tr className="bg-gray-50 border-b border-gray-200">
                        <th className="sticky left-0 bg-gray-50 px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase border-r border-gray-200">
                          Task
                        </th>
                        <th className="px-3 py-3 text-center text-xs font-semibold text-gray-700 uppercase border-r border-gray-200">
                          MON<br />3
                        </th>
                        <th className="px-3 py-3 text-center text-xs font-semibold text-gray-700 uppercase border-r border-gray-200">
                          TUE<br />4
                        </th>
                        <th className="px-3 py-3 text-center text-xs font-semibold text-gray-700 uppercase border-r border-gray-200">
                          WED<br />5
                        </th>
                        <th className="px-3 py-3 text-center text-xs font-semibold text-gray-700 uppercase border-r border-gray-200">
                          THU<br />6
                        </th>
                        <th className="px-3 py-3 text-center text-xs font-semibold text-gray-700 uppercase border-r border-gray-200">
                          FRI<br />7
                        </th>
                        <th className="px-3 py-3 text-center text-xs font-semibold text-gray-700 uppercase border-r border-gray-200">
                          SAT<br />8
                        </th>
                        <th className="px-3 py-3 text-center text-xs font-semibold text-gray-700 uppercase border-r border-gray-200">
                          SUN<br />9
                        </th>
                        <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700 uppercase bg-gray-100">
                          TOTAL
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-100">
                      {employeeTimesheetData.tasks.map((task) => (
                        <tr key={task.id} className="hover:bg-gray-50">
                          <td className="sticky left-0 bg-white px-4 py-3 border-r border-gray-200">
                            <div>
                              <p className="text-sm font-medium text-gray-900">{task.taskName}</p>
                              <p className="text-xs text-gray-500">{task.projectName}</p>
                            </div>
                          </td>
                          <td className="px-3 py-3 text-center text-sm text-gray-700 border-r border-gray-100">
                            {task.hours.mon > 0 ? task.hours.mon.toFixed(2) : ''}
                          </td>
                          <td className="px-3 py-3 text-center text-sm text-gray-700 border-r border-gray-100">
                            {task.hours.tue > 0 ? task.hours.tue.toFixed(2) : ''}
                          </td>
                          <td className="px-3 py-3 text-center text-sm text-gray-700 border-r border-gray-100">
                            {task.hours.wed > 0 ? task.hours.wed.toFixed(2) : ''}
                          </td>
                          <td className="px-3 py-3 text-center text-sm text-gray-700 border-r border-gray-100">
                            {task.hours.thu > 0 ? task.hours.thu.toFixed(2) : ''}
                          </td>
                          <td className="px-3 py-3 text-center text-sm text-gray-700 border-r border-gray-100">
                            {task.hours.fri > 0 ? task.hours.fri.toFixed(2) : ''}
                          </td>
                          <td className="px-3 py-3 text-center text-sm text-gray-700 border-r border-gray-100">
                            {task.hours.sat > 0 ? task.hours.sat.toFixed(2) : ''}
                          </td>
                          <td className="px-3 py-3 text-center text-sm text-gray-700 border-r border-gray-100">
                            {task.hours.sun > 0 ? task.hours.sun.toFixed(2) : ''}
                          </td>
                          <td className="px-4 py-3 text-center text-sm font-semibold text-gray-900 bg-gray-50">
                            {calculateTaskTotal(task.hours).toFixed(2)}
                          </td>
                        </tr>
                      ))}
                      {/* Total Row */}
                      <tr className="bg-gray-100 font-semibold border-t-2 border-gray-300">
                        <td className="sticky left-0 bg-gray-100 px-4 py-3 text-sm text-gray-900 border-r border-gray-300">
                          Total
                        </td>
                        <td className="px-3 py-3 text-center text-sm text-gray-900 border-r border-gray-200">
                          {calculateDayTotal(employeeTimesheetData.tasks, 'mon').toFixed(2)}
                        </td>
                        <td className="px-3 py-3 text-center text-sm text-gray-900 border-r border-gray-200">
                          {calculateDayTotal(employeeTimesheetData.tasks, 'tue').toFixed(2)}
                        </td>
                        <td className="px-3 py-3 text-center text-sm text-gray-900 border-r border-gray-200">
                          {calculateDayTotal(employeeTimesheetData.tasks, 'wed').toFixed(2)}
                        </td>
                        <td className="px-3 py-3 text-center text-sm text-gray-900 border-r border-gray-200">
                          {calculateDayTotal(employeeTimesheetData.tasks, 'thu').toFixed(2)}
                        </td>
                        <td className="px-3 py-3 text-center text-sm text-gray-900 border-r border-gray-200">
                          {calculateDayTotal(employeeTimesheetData.tasks, 'fri').toFixed(2)}
                        </td>
                        <td className="px-3 py-3 text-center text-sm text-gray-900 border-r border-gray-200">
                          {calculateDayTotal(employeeTimesheetData.tasks, 'sat').toFixed(2)}
                        </td>
                        <td className="px-3 py-3 text-center text-sm text-gray-900 border-r border-gray-200">
                          {calculateDayTotal(employeeTimesheetData.tasks, 'sun').toFixed(2)}
                        </td>
                        <td className="px-4 py-3 text-center text-sm font-bold text-gray-900 bg-gray-200">
                          {calculateGrandTotal(employeeTimesheetData.tasks).toFixed(2)}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </Layout>
  );
};

export default TaskManagement;
