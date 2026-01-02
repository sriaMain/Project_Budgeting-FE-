import React, { useState, useEffect } from 'react';
import {
  Plus, Search, Filter, Play, Pause, Square,
  ChevronLeft, ChevronRight, Calendar, ArrowLeft
} from 'lucide-react';
import { Layout } from '../components/Layout';
import axiosInstance from '../utils/axiosInstance';
import { toast } from 'react-hot-toast';
import { AddTaskModal } from '../components/AddTaskModal';
import { useTaskTimer } from '../hooks/useTaskTimer';
import { useAppSelector } from '../hooks/useAppSelector';

// Type Definitions
interface Task {
  id: number;
  title: string;
  status: string;
  allocated_hours: string;
  consumed_hours: number;
  remaining_hours: number;
  assigned_to: {
    id: number;
    username: string;
  } | null;
  project: number | null;
  project_name: string | null;
  start_date: string | null;
  due_date: string | null;
  created_by: string | null;
  modified_by: string | null;
}

interface TaskGroup {
  project: string;
  tasks: Task[];
}

// Timesheet Types
interface TimesheetRecord {
  id: string;
  employeeName: string;
  employeeHandle: string;
  totalHours: string;
  status: 'Submitted' | 'Draft' | 'Not Started';
  lastUpdated: string;
}

interface TimesheetEntry {
  task: string;
  type: string;
  project?: string;
  mon: string;
  tue: string;
  wed: string;
  thu: string;
  fri: string;
  sat: string;
  sun: string;
  total: string;
}

// Props for TaskManagement component
interface TaskManagementProps {
  userRole: "admin" | "user";
  currentPage: string;
  onNavigate: (page: string) => void;
}

// Status Badge Component
const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
  const statusStyles: Record<string, string> = {
    'in_progress': 'bg-emerald-600 text-white',
    'planned': 'bg-gray-600 text-white',
    'completed': 'bg-blue-600 text-white',
    'needs_attention': 'bg-red-600 text-white',
  };

  const statusLabels: Record<string, string> = {
    'in_progress': 'In Progress',
    'planned': 'Planned',
    'completed': 'Completed',
    'needs_attention': 'Needs attention',
  };

  return (
    <span
      className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${statusStyles[status] || statusStyles['planned']
        }`}
    >
      {statusLabels[status] || status}
    </span>
  );
};

// Timesheet Status Dot Component
const TimesheetStatusBadge: React.FC<{ status: TimesheetRecord['status'] }> = ({ status }) => {
  const styles = {
    'Submitted': 'bg-green-500',
    'Draft': 'bg-orange-500',
    'Not Started': 'bg-gray-400'
  };

  return (
    <div className="flex items-center gap-2">
      <div className={`w-2 h-2 rounded-full ${styles[status]}`} />
      <span className="text-sm font-medium text-gray-700">{status}</span>
    </div>
  );
};

// Main TaskManagement Component
export const TaskManagement: React.FC<TaskManagementProps> = ({ userRole, currentPage, onNavigate }) => {
  const currentUsername = useAppSelector((state) => state.auth.username);
  const [activeTab, setActiveTab] = React.useState<'list' | 'board' | 'timesheet'>('list');
  const [tasks, setTasks] = React.useState<Task[]>([]);
  const [isLoadingTasks, setIsLoadingTasks] = React.useState(false);
  const [isAddTaskModalOpen, setIsAddTaskModalOpen] = useState(false);
  const [selectedTaskForEdit, setSelectedTaskForEdit] = useState<Task | null>(null);

  // Timesheet Navigation State
  const [timesheetStep, setTimesheetStep] = useState<'summary' | 'detail'>('summary');
  const [selectedEmployeeName, setSelectedEmployeeName] = useState<string>('John Doe');
  const [timesheetSearch, setTimesheetSearch] = useState('');
  const [timesheetDate, setTimesheetDate] = useState(new Date());

  // Helper for week range display
  const getWeekRange = (date: Date) => {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Monday start
    const start = new Date(d.setDate(diff));
    const end = new Date(d.setDate(start.getDate() + 6));

    const options: Intl.DateTimeFormatOptions = { month: 'long', day: 'numeric' };
    const year = start.getFullYear();

    // Get ISO week number
    const startOfYear = new Date(year, 0, 1);
    const pastDaysOfYear = (start.getTime() - startOfYear.getTime()) / 86400000;
    const weekNum = Math.ceil((pastDaysOfYear + startOfYear.getDay() + 1) / 7);

    return `${start.toLocaleDateString('en-US', options)} - ${end.toLocaleDateString('en-US', options)}, ${year} (Week ${weekNum})`;
  };

  const shiftWeek = (direction: number) => {
    const newDate = new Date(timesheetDate);
    newDate.setDate(newDate.getDate() + (direction * 7));
    setTimesheetDate(newDate);
  };

  // Timer hook
  const { startTimer, pauseTimer, stopTimer, isTaskRunning, formatTime, getElapsedTime, fetchTimerState } = useTaskTimer();

  // Board view state - API data
  const [groupedTasks, setGroupedTasks] = React.useState<any>({
    planned: { count: 0, tasks: [] },
    in_progress: { count: 0, tasks: [] },
    completed: { count: 0, tasks: [] },
    needs_attention: { count: 0, tasks: [] }
  });
  const [isLoadingBoard, setIsLoadingBoard] = React.useState(false);
  // Fetch tasks for list view
  React.useEffect(() => {
    if (activeTab === 'list') {
      fetchTasks();
    } else if (activeTab === 'board') {
      fetchGroupedTasks();
    }
  }, [activeTab]);

  const fetchTasks = async () => {
    setIsLoadingTasks(true);
    try {
      const response = await axiosInstance.get('tasks/');
      if (response.status === 200 && response.data) {
        setTasks(response.data);
      }
    } catch (error) {
      console.error('Failed to fetch tasks:', error);
      toast.error('Failed to load tasks');
    } finally {
      setIsLoadingTasks(false);
    }
  };

  const fetchGroupedTasks = async () => {
    setIsLoadingBoard(true);
    try {
      const response = await axiosInstance.get('tasks/grouped-by-status/');
      if (response.status === 200 && response.data) {
        setGroupedTasks(response.data);
      }
    } catch (error) {
      console.error('Failed to fetch grouped tasks:', error);
      toast.error('Failed to load board tasks');
    } finally {
      setIsLoadingBoard(false);
    }
  };

  const handleUpdateTask = async (taskId: number, updates: any) => {
    try {
      const response = await axiosInstance.patch(`tasks/${taskId}/`, updates);
      if (response.status === 200 || response.status === 204) {
        toast.success('Task updated');
        const updatedTask = response.data;
        setTasks(prev => prev.map(t => t.id === taskId ? { ...t, ...updatedTask } : t));
        if (activeTab === 'board') fetchGroupedTasks();
      }
    } catch (error) {
      console.error('Failed to update task:', error);
      toast.error('Failed to update task');
    }
  };

  // Group tasks by project
  const groupTasksByProject = (): TaskGroup[] => {
    const grouped: Record<string, Task[]> = {};

    tasks.forEach(task => {
      const projectName = task.project_name || 'Unspecified';
      if (!grouped[projectName]) {
        grouped[projectName] = [];
      }
      grouped[projectName].push(task);
    });

    return Object.entries(grouped).map(([project, tasks]) => ({
      project,
      tasks
    }));
  };

  const taskGroups = groupTasksByProject();

  // Stat Cards Data
  const stats = [
    { title: 'Total active projects', value: 10 },
    { title: 'Overdue Tasks', value: 11 },
    { title: 'Unassigned Tasks', value: 5 },
  ];

  // Timesheet Mock Data
  const timesheetSummaryData: TimesheetRecord[] = [
    { id: '1', employeeName: 'John Doe', employeeHandle: 'j-doe-1234', totalHours: '40.00', status: 'Submitted', lastUpdated: 'Nov 3, 9:35 AM' },
    { id: '2', employeeName: 'John Doe', employeeHandle: 'j-doe-1234', totalHours: '40.00', status: 'Draft', lastUpdated: 'Nov 3, 9:35 AM' },
    { id: '3', employeeName: 'John Doe', employeeHandle: 'j-doe-1234', totalHours: '40.00', status: 'Not Started', lastUpdated: 'Nov 3, 9:35 AM' },
  ];

  const employeeDetailData: TimesheetEntry[] = [
    { task: 'Calendar Events', type: 'General', mon: '', tue: '', wed: '', thu: '', fri: '', sat: '', sun: '', total: '2.00' },
    { task: 'Internal Meetings', type: 'General', mon: '', tue: '', wed: '', thu: '', fri: '', sat: '', sun: '', total: '3.00' },
    { task: 'Systems Architect', type: 'Detailed Project (IT Consulting)', mon: '', tue: '', wed: '', thu: '', fri: '', sat: '', sun: '', total: '40.00' },
    { task: 'Implementation and Monitoring', type: 'Detailed Project (IT Consulting)', mon: '', tue: '', wed: '', thu: '', fri: '', sat: '', sun: '', total: '2.00' },
    { task: 'Cybersecurity Support - period 4', type: 'Retainer Project (Internal)', mon: '', tue: '', wed: '', thu: '', fri: '', sat: '', sun: '', total: '3.00' },
    { task: 'IT Infrastructure', type: 'Time and Material Project (External)', mon: '', tue: '', wed: '', thu: '', fri: '', sat: '', sun: '', total: '2.00' },
  ];

  const filteredTimesheets = timesheetSummaryData.filter(record =>
    record.employeeName.toLowerCase().includes(timesheetSearch.toLowerCase()) ||
    record.employeeHandle.toLowerCase().includes(timesheetSearch.toLowerCase())
  );

  const handleTaskAdded = () => {
    fetchTasks();
    setIsAddTaskModalOpen(false);
    setSelectedTaskForEdit(null);
  };

  const handleTaskUpdated = (updatedTask: any) => {
    if (updatedTask && updatedTask.id) {
      setTasks(prev => prev.map(t => t.id === updatedTask.id ? { ...t, ...updatedTask } : t));
    } else {
      fetchTasks();
    }
    if (activeTab === 'board') fetchGroupedTasks();
    setIsAddTaskModalOpen(false);
    setSelectedTaskForEdit(null);
  };

  const handleTaskClick = (task: Task) => {
    setSelectedTaskForEdit(task);
    setIsAddTaskModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsAddTaskModalOpen(false);
    setSelectedTaskForEdit(null);
  };

  const handleTimerToggle = async (taskId: number, e: React.MouseEvent) => {
    e.stopPropagation();
    const taskIdStr = taskId.toString();
    const isRunning = isTaskRunning(taskIdStr);

    try {
      if (isRunning) {
        await pauseTimer(taskIdStr);
        toast.success('Timer paused');
      } else {
        await startTimer(taskIdStr);
        toast.success('Timer started');
      }
      fetchTasks();
    } catch (error) {
      console.error('Timer action failed:', error);
      toast.error('Timer action failed');
    }
  };

  return (
    <Layout userRole={userRole} currentPage={currentPage} onNavigate={onNavigate}>
      <div className="min-h-screen bg-gray-50 p-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Task Management</h1>
        </div>

        {/* Stats Cards */}
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

        {/* Tabs and Actions Container */}
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

          {/* Action Bar */}
          {activeTab !== 'timesheet' && (
            <div className="flex items-center justify-between gap-4 px-6 py-4">
              <div className="flex items-center justify-start gap-2">
                {activeTab === 'list' && (
                  <button
                    onClick={() => setIsAddTaskModalOpen(true)}
                    className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 transition-colors"
                  >
                    <Plus size={16} />
                    New
                  </button>
                )}

                <button className="flex items-center gap-2 border border-gray-300 text-gray-700 px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-50 hover:border-gray-400 transition-colors">
                  <Search size={16} />
                  View All Tasks
                </button>

                <button className="flex items-center gap-2 border border-gray-300 text-gray-700 px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-50 hover:border-gray-400 transition-colors">
                  <Filter size={16} />
                  Filter By Assignees
                </button>

                <button className="border border-gray-300 text-gray-700 px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-50 hover:border-gray-400 transition-colors">
                  Group By Project
                </button>
              </div>
            </div>
          )}
        </div>

        {/* List View */}
        {activeTab === 'list' && (
          <div className="bg-white rounded-lg border border-gray-200 overflow-x-auto">
            {isLoadingTasks ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              </div>
            ) : (
              <table className="w-full">
                <thead>
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
                    <th className="px-6 py-3 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Consumed Hours
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Remaining
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Actions
                    </th>

                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-100">
                  {taskGroups.map((group) => (
                    <React.Fragment key={group.project}>
                      {/* Project Name Row */}
                      <tr className="bg-white border-b border-gray-200 border-t-4 border-t-blue-800">
                        <td colSpan={6} className="px-6 py-3">
                          <span className="text-base font-bold text-gray-900">{group.project}</span>
                        </td>
                      </tr>
                      {/* Task Rows for this project */}
                      {group.tasks.map((task) => (
                        <tr
                          key={task.id}
                          onClick={() => handleTaskClick(task)}
                          className="hover:bg-gray-50 transition-colors cursor-pointer group"
                        >
                          <td className="px-6 py-4">
                            <StatusBadge status={task.status} />
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex flex-col">
                              <span className="text-sm font-medium text-gray-900">{task.title}</span>
                              {task.assigned_to && (
                                <span className="text-xs text-gray-500 mt-1">
                                  Assigned to: {task.assigned_to.username}
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4 text-center">
                            <input
                              type="text"
                              defaultValue={parseFloat(task.allocated_hours || '0').toFixed(2)}
                              onClick={(e) => e.stopPropagation()}
                              onBlur={(e) => {
                                const val = parseFloat(e.target.value);
                                if (!isNaN(val) && val.toFixed(2) !== parseFloat(task.allocated_hours || '0').toFixed(2)) {
                                  handleUpdateTask(task.id, { allocated_hours: val });
                                }
                              }}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                  (e.target as any).blur();
                                }
                              }}
                              className="w-16 text-sm text-center border-b border-transparent hover:border-gray-300 focus:border-blue-500 bg-transparent outline-none transition-all"
                            />
                            <span className="text-sm text-gray-500 ml-0.5">h</span>
                          </td>
                          <td className="px-6 py-4 text-center">
                            <span className="text-sm text-gray-900">{(task.consumed_hours || 0).toFixed(2)}h</span>
                          </td>
                          <td className="px-6 py-4 text-center">
                            <span className={`text-sm font-medium ${(task.remaining_hours || 0) < 0 ? 'text-red-600' : 'text-green-600'}`}>
                              {(task.remaining_hours || 0).toFixed(2)}h
                            </span>
                          </td>
                          <td className="px-4 py-4">
                            <div className="flex items-center justify-center gap-2">
                              {/* Control Buttons Group - Only visible for non-admin users assigned to this task */}
                              {userRole !== 'admin' && task.assigned_to?.username === currentUsername && (
                                <div className="flex items-center bg-gray-100 rounded-lg p-1 border border-gray-200">
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      if (!isTaskRunning(task.id.toString())) startTimer(task.id.toString()).then(fetchTasks);
                                    }}
                                    className={`p-1.5 rounded-md transition-all ${isTaskRunning(task.id.toString())
                                      ? 'text-gray-300 cursor-not-allowed'
                                      : 'text-green-600 hover:bg-white hover:shadow-sm'
                                      }`}
                                    disabled={isTaskRunning(task.id.toString())}
                                    title="Play"
                                  >
                                    <Play size={14} fill={!isTaskRunning(task.id.toString()) ? "currentColor" : "none"} />
                                  </button>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      if (isTaskRunning(task.id.toString())) pauseTimer(task.id.toString()).then(fetchTasks);
                                    }}
                                    className={`p-1.5 rounded-md transition-all ${!isTaskRunning(task.id.toString())
                                      ? 'text-gray-300 cursor-not-allowed'
                                      : 'text-orange-600 hover:bg-white hover:shadow-sm'
                                      }`}
                                    disabled={!isTaskRunning(task.id.toString())}
                                    title="Pause"
                                  >
                                    <Pause size={14} fill={isTaskRunning(task.id.toString()) ? "currentColor" : "none"} />
                                  </button>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      if (isTaskRunning(task.id.toString())) stopTimer(task.id.toString()).then(fetchTasks);
                                    }}
                                    className={`p-1.5 rounded-md transition-all ${!isTaskRunning(task.id.toString())
                                      ? 'text-gray-300 cursor-not-allowed'
                                      : 'text-red-600 hover:bg-white hover:shadow-sm'
                                      }`}
                                    disabled={!isTaskRunning(task.id.toString())}
                                    title="Stop"
                                  >
                                    <Square size={14} fill={isTaskRunning(task.id.toString()) ? "currentColor" : "none"} />
                                  </button>
                                </div>
                              )}

                              {/* Timer Field (Static looking but dynamic) */}
                              <div className={`px-2 py-1.5 rounded-lg border text-xs font-mono min-w-[70px] text-center transition-all ${isTaskRunning(task.id.toString())
                                ? 'bg-green-50 border-green-200 text-green-700 font-bold'
                                : 'bg-gray-50 border-gray-200 text-gray-500'
                                }`}>
                                {isTaskRunning(task.id.toString())
                                  ? formatTime(getElapsedTime(task.id.toString()))
                                  : "00:00:00"}
                              </div>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {/* Board View */}
        {activeTab === 'board' && (
          <div className="overflow-x-auto pb-6">
            {isLoadingBoard ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Planned Column */}
                <div className="flex flex-col">
                  <div className="bg-purple-600 text-white p-4 rounded-t-lg">
                    <h3 className="text-lg font-bold">Planned</h3>
                    <p className="text-sm opacity-90">{groupedTasks.planned.count} tasks</p>
                  </div>
                  <div className="bg-gray-50 p-3 space-y-3 max-h-[600px] overflow-y-auto rounded-b-lg border border-gray-200">
                    {groupedTasks.planned.tasks.map((task: any) => (
                      <div key={task.id} className="bg-white rounded-lg p-3 shadow-sm border-l-4 border-purple-600">
                        <h4 className="text-sm font-medium text-gray-900 mb-2">{task.title}</h4>
                        <div className="space-y-1 text-xs text-gray-600">
                          <div className="flex justify-between">
                            <span>Allocated:</span>
                            <span className="font-semibold">{task.allocated_hours}h</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Consumed:</span>
                            <span className="font-semibold text-orange-600">{task.consumed_hours}h</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Remaining:</span>
                            <span className="font-semibold text-green-600">{task.remaining_hours}h</span>
                          </div>
                          {task.assigned_to && (
                            <div className="flex items-center gap-2 mt-2 pt-2 border-t border-gray-200">
                              <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center">
                                <span className="text-xs font-semibold text-blue-700">
                                  {task.assigned_to.username.substring(0, 2).toUpperCase()}
                                </span>
                              </div>
                              <span className="text-xs text-gray-700">{task.assigned_to.username}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* In Progress Column */}
                <div className="flex flex-col">
                  <div className="bg-green-600 text-white p-4 rounded-t-lg">
                    <h3 className="text-lg font-bold">In Progress</h3>
                    <p className="text-sm opacity-90">{groupedTasks.in_progress.count} tasks</p>
                  </div>
                  <div className="bg-gray-50 p-3 space-y-3 max-h-[600px] overflow-y-auto rounded-b-lg border border-gray-200">
                    {groupedTasks.in_progress.tasks.map((task: any) => (
                      <div key={task.id} className="bg-white rounded-lg p-3 shadow-sm border-l-4 border-green-600">
                        <h4 className="text-sm font-medium text-gray-900 mb-2">{task.title}</h4>
                        <div className="space-y-1 text-xs text-gray-600">
                          <div className="flex justify-between">
                            <span>Allocated:</span>
                            <span className="font-semibold">{task.allocated_hours}h</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Consumed:</span>
                            <span className="font-semibold text-orange-600">{task.consumed_hours}h</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Remaining:</span>
                            <span className="font-semibold text-green-600">{task.remaining_hours}h</span>
                          </div>
                          {task.assigned_to && (
                            <div className="flex items-center gap-2 mt-2 pt-2 border-t border-gray-200">
                              <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center">
                                <span className="text-xs font-semibold text-blue-700">
                                  {task.assigned_to.username.substring(0, 2).toUpperCase()}
                                </span>
                              </div>
                              <span className="text-xs text-gray-700">{task.assigned_to.username}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Completed Column */}
                <div className="flex flex-col">
                  <div className="bg-blue-600 text-white p-4 rounded-t-lg">
                    <h3 className="text-lg font-bold">Completed</h3>
                    <p className="text-sm opacity-90">{groupedTasks.completed.count} tasks</p>
                  </div>
                  <div className="bg-gray-50 p-3 space-y-3 max-h-[600px] overflow-y-auto rounded-b-lg border border-gray-200">
                    {groupedTasks.completed.tasks.map((task: any) => (
                      <div key={task.id} className="bg-white rounded-lg p-3 shadow-sm border-l-4 border-blue-600">
                        <h4 className="text-sm font-medium text-gray-900 mb-2">{task.title}</h4>
                        <div className="space-y-1 text-xs text-gray-600">
                          <div className="flex justify-between">
                            <span>Allocated:</span>
                            <span className="font-semibold">{task.allocated_hours}h</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Consumed:</span>
                            <span className="font-semibold text-orange-600">{task.consumed_hours}h</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Remaining:</span>
                            <span className="font-semibold text-green-600">{task.remaining_hours}h</span>
                          </div>
                          {task.assigned_to && (
                            <div className="flex items-center gap-2 mt-2 pt-2 border-t border-gray-200">
                              <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center">
                                <span className="text-xs font-semibold text-blue-700">
                                  {task.assigned_to.username.substring(0, 2).toUpperCase()}
                                </span>
                              </div>
                              <span className="text-xs text-gray-700">{task.assigned_to.username}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Needs Attention Column */}
                <div className="flex flex-col">
                  <div className="bg-red-600 text-white p-4 rounded-t-lg">
                    <h3 className="text-lg font-bold">Needs Attention</h3>
                    <p className="text-sm opacity-90">{groupedTasks.needs_attention.count} tasks</p>
                  </div>
                  <div className="bg-gray-50 p-3 space-y-3 max-h-[600px] overflow-y-auto rounded-b-lg border border-gray-200">
                    {groupedTasks.needs_attention.tasks.map((task: any) => (
                      <div key={task.id} className="bg-white rounded-lg p-3 shadow-sm border-l-4 border-red-600">
                        <h4 className="text-sm font-medium text-gray-900 mb-2">{task.title}</h4>
                        <div className="space-y-1 text-xs text-gray-600">
                          <div className="flex justify-between">
                            <span>Allocated:</span>
                            <span className="font-semibold">{task.allocated_hours}h</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Consumed:</span>
                            <span className="font-semibold text-orange-600">{task.consumed_hours}h</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Remaining:</span>
                            <span className="font-semibold text-green-600">{task.remaining_hours}h</span>
                          </div>
                          {task.assigned_to && (
                            <div className="flex items-center gap-2 mt-2 pt-2 border-t border-gray-200">
                              <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center">
                                <span className="text-xs font-semibold text-blue-700">
                                  {task.assigned_to.username.substring(0, 2).toUpperCase()}
                                </span>
                              </div>
                              <span className="text-xs text-gray-700">{task.assigned_to.username}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Timesheet View */}
        {activeTab === 'timesheet' && timesheetStep === 'summary' && (
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden animate-in fade-in duration-500">
            {/* Timesheet Summary Header */}
            <div className="p-6 border-b border-gray-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white">
              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-1">Timesheet Summary</h2>
                <p className="text-sm font-medium text-gray-600">{getWeekRange(timesheetDate)}</p>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex items-center bg-gray-50 border border-gray-200 rounded-lg p-1">
                  <button
                    onClick={() => shiftWeek(-1)}
                    className="p-1.5 hover:bg-white hover:shadow-sm rounded-md transition-all text-gray-500"
                  >
                    <ChevronLeft size={18} />
                  </button>
                  <div className="px-3 flex items-center gap-2 text-sm font-semibold text-gray-700 min-w-[140px] justify-center">
                    <Calendar size={16} />
                    <span>{timesheetDate.toDateString() === new Date().toDateString() ? 'Current Week' : 'Selected Week'}</span>
                  </div>
                  <button
                    onClick={() => shiftWeek(1)}
                    className="p-1.5 hover:bg-white hover:shadow-sm rounded-md transition-all text-gray-500"
                  >
                    <ChevronRight size={18} />
                  </button>
                </div>
              </div>
            </div>

            {/* Action/Search Bar */}
            <div className="px-6 py-4 flex justify-end bg-white">
              <div className="relative w-full md:w-80">
                <input
                  type="text"
                  placeholder="Search Employee.."
                  value={timesheetSearch}
                  onChange={(e) => setTimesheetSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-600 focus:bg-white outline-none transition-all text-sm"
                />
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              </div>
            </div>

            {/* Summary Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-gray-50/50 border-y border-gray-100">
                  <tr>
                    <th className="px-8 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Employee</th>
                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-center">Total Hours</th>
                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-8 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Last Updated</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredTimesheets.map((record) => (
                    <tr
                      key={record.id}
                      onClick={() => {
                        setSelectedEmployeeName(record.employeeName);
                        setTimesheetStep('detail');
                      }}
                      className="hover:bg-gray-50/80 cursor-pointer transition-colors group"
                    >
                      <td className="px-8 py-5">
                        <div className="flex flex-col">
                          <span className="text-sm font-bold text-gray-900 group-hover:text-blue-600 transition-colors">{record.employeeName}</span>
                          <span className="text-xs text-gray-400 font-medium">{record.employeeHandle}</span>
                        </div>
                      </td>
                      <td className="px-6 py-5 text-center">
                        <span className="text-sm font-bold text-gray-900">{record.totalHours}</span>
                      </td>
                      <td className="px-6 py-5">
                        <TimesheetStatusBadge status={record.status} />
                      </td>
                      <td className="px-8 py-5 text-right">
                        <span className="text-sm font-medium text-gray-500">{record.lastUpdated}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Detailed Timesheet View */}
        {activeTab === 'timesheet' && timesheetStep === 'detail' && (
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-8 animate-in slide-in-from-right-4 duration-500">
            <div className="mb-8 flex justify-between items-center">
              <button
                onClick={() => setTimesheetStep('summary')}
                className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg text-sm font-bold text-gray-700 hover:bg-gray-50 hover:shadow-sm transition-all"
              >
                <ArrowLeft size={16} />
                Back to Summary
              </button>

              <div className="flex items-center bg-gray-50 border border-gray-200 rounded-lg p-1">
                <button
                  onClick={() => shiftWeek(-1)}
                  className="p-1.5 hover:bg-white hover:shadow-sm rounded-md transition-all text-gray-500"
                >
                  <ChevronLeft size={18} />
                </button>
                <div className="px-3 flex items-center gap-2 text-sm font-semibold text-gray-700 min-w-[140px] justify-center text-center">
                  <Calendar size={16} />
                  <div className="flex flex-col">
                    <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">{getWeekRange(timesheetDate).split(',')[0]}</span>
                    <span className="leading-none">{timesheetDate.toDateString() === new Date().toDateString() ? 'Current Week' : 'Selected Week'}</span>
                  </div>
                </div>
                <button
                  onClick={() => shiftWeek(1)}
                  className="p-1.5 hover:bg-white hover:shadow-sm rounded-md transition-all text-gray-500"
                >
                  <ChevronRight size={18} />
                </button>
              </div>
            </div>

            <h2 className="text-2xl font-bold text-gray-900 mb-8">{selectedEmployeeName}'s Timesheet</h2>

            {/* Timesheet Grid */}
            <div className="border border-gray-200 rounded-xl overflow-hidden shadow-sm">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50/80 border-b border-gray-200">
                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase w-1/3">Task</th>
                    {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, i) => {
                      const d = new Date(timesheetDate);
                      const dayNum = d.getDay();
                      const diff = d.getDate() - dayNum + (dayNum === 0 ? -6 : 1) + i;
                      const dateObj = new Date(d.setDate(diff));
                      return (
                        <th key={day} className="px-2 py-4 text-xs font-bold text-gray-500 uppercase text-center w-[8%]">
                          <div className="flex flex-col items-center">
                            <span>{day}</span>
                            <span className="text-[10px] opacity-60 font-medium mt-0.5">{dateObj.getDate()}</span>
                          </div>
                        </th>
                      );
                    })}
                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase text-right w-24">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {employeeDetailData.map((entry, idx) => (
                    <tr key={idx} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-6 py-5">
                        <div className="flex flex-col">
                          <span className="text-sm font-bold text-gray-900">{entry.task}</span>
                          <span className="text-[11px] text-gray-500 font-medium mt-1">{entry.type}</span>
                        </div>
                      </td>
                      {['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'].map((day) => (
                        <td key={day} className="px-2 py-4">
                          <input
                            type="text"
                            defaultValue=""
                            placeholder=""
                            className="w-full h-10 border border-gray-200 rounded-lg text-center text-sm font-semibold focus:ring-2 focus:ring-blue-600 outline-none transition-all hover:border-gray-300"
                          />
                        </td>
                      ))}
                      <td className="px-6 py-5 text-right">
                        <span className="text-sm font-bold text-gray-900">{entry.total}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-gray-50/50 border-t border-gray-200">
                  <tr className="font-bold">
                    <td className="px-6 py-5 text-sm">Total</td>
                    {['2.00', '2.00', '2.00', '2.00', '2.00', '2.00', '2.00'].map((total, i) => (
                      <td key={i} className="px-2 py-5 text-center text-sm text-gray-900">{total}</td>
                    ))}
                    <td className="px-6 py-5 text-right text-sm text-gray-900">44.01</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Add Task Modal */}
      {
        isAddTaskModalOpen && (
          <AddTaskModal
            isOpen={isAddTaskModalOpen}
            onClose={handleCloseModal}
            onTaskAdded={handleTaskAdded}
            editingTask={selectedTaskForEdit}
            onTaskUpdated={handleTaskUpdated}
          />
        )
      }
    </Layout >
  );
};

export default TaskManagement;
