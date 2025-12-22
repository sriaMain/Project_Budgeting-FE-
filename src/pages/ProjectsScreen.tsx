import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout } from '../components/Layout';
import { Button } from '../components/Button';
import { InputField } from '../components/InputField';
import { Search, Filter, Plus, ChevronDown, MoreHorizontal, Wallet, PieChart, TrendingUp } from 'lucide-react';
import { CreateProjectModal } from '../components/CreateProjectModal';
import axiosInstance from '../utils/axiosInstance';

interface Project {
	id: number;
	project_name: string;
	project_type: 'internal' | 'external';
	client: number | null;
	client_name?: string;
	start_date: string;
	end_date: string;
	status: string;
	progress: number;
	income: number;
	forecasted_profit: number;
	budget?: {
		total_budget: string | number;
		currency: string;
	};
}

interface ClientGroup {
	id: string;
	name: string;
	projects: Project[];
}

const KPICard = ({ label, value, subValue, icon: Icon }: { label: string; value: string; subValue?: string; icon: any }) => (
	<div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex items-start justify-between">
		<div>
			<p className="text-sm text-gray-500 mb-1">{label}</p>
			<div className="flex items-baseline gap-2">
				<h3 className="text-xl font-bold text-gray-900">{value}</h3>
				{subValue && <span className="text-sm text-gray-500">{subValue}</span>}
			</div>
		</div>
		<div className="p-2 bg-gray-50 rounded-lg">
			<Icon className="w-5 h-5 text-gray-400" />
		</div>
	</div>
);

const ProgressBar = ({ value }: { value: number }) => (
	<div className="w-full max-w-[140px]">
		<div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
			<div
				className="h-full bg-blue-600 rounded-full transition-all duration-300"
				style={{ width: `${Math.max(0, Math.min(100, value))}%` }}
			/>
		</div>
		<p className="text-xs text-gray-500 mt-1">{value}%</p>
	</div>
);

const StatusBadge = ({ status }: { status: string }) => {
	const styles = {
		'In Progress': 'bg-green-50 text-green-700 border-green-200',
		'Completed': 'bg-blue-50 text-blue-700 border-blue-200',
		'On Hold': 'bg-orange-50 text-orange-700 border-orange-200',
		'Cancelled': 'bg-red-50 text-red-700 border-red-200',
	};

	const defaultStyle = 'bg-gray-50 text-gray-700 border-gray-200';
	const activeStyle = styles[status as keyof typeof styles] || defaultStyle;

	return (
		<span className={`px-3 py-1 rounded-full text-xs font-medium border ${activeStyle}`}>
			{status}
		</span>
	);
};

export default function ProjectsScreen({ userRole, currentPage, onNavigate }: any) {
	const navigate = useNavigate();
	const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
	const [projects, setProjects] = useState<Project[]>([]);
	const [loading, setLoading] = useState(true);
	const [searchQuery, setSearchQuery] = useState('');

	// Mock data for KPIs (replace with real data if available)
	const kpis = [
		{ label: 'Forecasted profit (budget)', value: '5,000 INR', subValue: '50%', icon: TrendingUp },
		{ label: 'Invoiced (budget)', value: '5,000 INR', icon: Wallet },
		{ label: 'Income (actual)', value: '5,000 INR', icon: PieChart },
	];

	useEffect(() => {
		fetchProjects();
	}, []);

	const fetchProjects = async () => {
		try {
			const response = await axiosInstance.get('projects/');
			const data = Array.isArray(response.data) ? response.data : [];

			const mappedData = data.map((p: any) => ({
				id: p.project_no, // Map project_no to id
				project_name: p.project_name,
				project_type: p.project_type,
				client: p.client || null,
				client_name: p.client_details?.name || (p.project_type === 'internal' ? 'Internal' : 'Unknown Client'),
				start_date: p.start_date,
				end_date: p.end_date,
				status: p.status || 'In Progress', // Default if missing
				progress: p.progress || 0, // Default if missing
				income: p.budget?.total_budget ? Number(p.budget.total_budget) : 0, // Use budget as proxy or 0
				forecasted_profit: p.forecasted_profit || 0, // Default if missing
				budget: p.budget
			}));

			setProjects(mappedData);
		} catch (error) {
			console.error('Error fetching projects:', error);
			setProjects([]);
		} finally {
			setLoading(false);
		}
	};

	// Filter projects based on search query
	const filteredProjects = projects.filter(project =>
		project.project_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
		(project.client_name && project.client_name.toLowerCase().includes(searchQuery.toLowerCase()))
	);

	// Group projects
	const groupedProjects = filteredProjects.reduce((acc: ClientGroup[], project) => {
		const groupName = project.project_type === 'internal' ? 'Internal' : (project.client_name || 'Other Clients');
		const groupId = project.project_type === 'internal' ? 'internal' : `client-${project.client}`;

		const existingGroup = acc.find(g => g.name === groupName);

		if (existingGroup) {
			existingGroup.projects.push(project);
		} else {
			acc.push({
				id: groupId,
				name: groupName,
				projects: [project]
			});
		}
		return acc;
	}, []);

	return (
		<Layout userRole={userRole} currentPage="projects" onNavigate={onNavigate}>
			<div className="p-6 max-w-[1600px] mx-auto">
				{/* Header */}
				<div className="flex flex-col gap-6 mb-8">
					<div className="flex items-center justify-between">
						<div className="flex items-center gap-2 text-sm text-gray-500">
							<span>Projects</span>
							<span>/</span>
							<span className="font-medium text-gray-900">My Projects</span>
						</div>
					</div>

					<div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
						<div className="flex items-center gap-3 w-full md:w-auto overflow-x-auto pb-2 md:pb-0">
							<button
								onClick={() => setIsCreateModalOpen(true)}
								className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-medium transition-colors whitespace-nowrap"
							>
								<Plus size={16} />
								New
							</button>
							<div className="h-8 w-[1px] bg-gray-200 mx-2"></div>
							<button className="px-4 py-2 bg-gray-100 text-gray-900 rounded-lg text-sm font-medium whitespace-nowrap">
								My Projects
							</button>
							<button className="px-4 py-2 text-gray-600 hover:bg-gray-50 rounded-lg text-sm font-medium whitespace-nowrap">
								Status: Active Projects
							</button>
							<button className="px-4 py-2 text-gray-600 hover:bg-gray-50 rounded-lg text-sm font-medium flex items-center gap-2 border border-gray-200 whitespace-nowrap">
								<Filter size={16} />
								Filters
							</button>
						</div>

						<div className="relative w-full md:w-80">
							<Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
							<input
								type="text"
								placeholder="Search..."
								value={searchQuery}
								onChange={(e) => setSearchQuery(e.target.value)}
								className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
							/>
						</div>
					</div>
				</div>

				{/* KPIs */}
				<div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
					{kpis.map((kpi, index) => (
						<KPICard key={index} {...kpi} />
					))}
				</div>

				{/* Projects Table */}
				<div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
					<div className="overflow-x-auto">
						<div className="min-w-[1000px]">
							{/* Table Header */}
							<div className="grid grid-cols-12 gap-4 px-6 py-4 border-b border-gray-200 bg-white text-xs font-semibold text-gray-500 uppercase tracking-wider">
								<div className="col-span-4">Project Name | Client</div>
								<div className="col-span-2">Due date</div>
								<div className="col-span-2">Progress</div>
								<div className="col-span-1">Income</div>
								<div className="col-span-2">Forecasted Profit</div>
								<div className="col-span-1">Status</div>
							</div>

							{/* Table Body */}
							<div className="divide-y divide-gray-100">
								{loading ? (
									<div className="p-8 text-center text-gray-500">Loading projects...</div>
								) : groupedProjects.length === 0 ? (
									<div className="p-8 text-center text-gray-500">No projects found</div>
								) : (
									groupedProjects.map((group) => (
										<div key={group.id} className="group">
											{/* Group Header */}
											<div className="px-6 py-3 bg-white flex items-center justify-between border-b border-gray-100">
												<div className="flex items-center gap-3">
													<input type="checkbox" className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
													<span className="text-sm font-medium text-blue-600">{group.name}</span>
												</div>
												<span className="text-xs text-gray-500 font-medium">Total {group.projects.length} Project</span>
											</div>

											{/* Projects */}
											<div className="divide-y divide-gray-50">
												{group.projects.map((project) => (
													<div
														key={project.id}
														onClick={() => navigate(`/projects/${project.id}`)}
														className="grid grid-cols-12 gap-4 px-6 py-4 items-center hover:bg-gray-50 transition-colors bg-white cursor-pointer"
													>
														<div className="col-span-4 flex items-center gap-3 pl-8">
															<input type="checkbox" className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" onClick={(e) => e.stopPropagation()} />
															<span className="text-sm font-medium text-gray-900">
																{project.project_name}
															</span>
														</div>
														<div className="col-span-2 text-sm text-gray-900 font-medium">
															{project.end_date}
														</div>
														<div className="col-span-2">
															<ProgressBar value={project.progress} />
														</div>
														<div className="col-span-1 text-sm text-gray-900 font-medium">
															{project.income ? `${project.income} INR` : 'N/A'}
														</div>
														<div className="col-span-2 text-sm text-gray-900 font-medium">
															{project.forecasted_profit ? `${project.forecasted_profit} INR` : 'N/A'}
														</div>
														<div className="col-span-1">
															<StatusBadge status={project.status} />
														</div>
													</div>
												))}
											</div>
										</div>
									))
								)}
							</div>
						</div>
					</div>
				</div>
			</div>

			<CreateProjectModal
				isOpen={isCreateModalOpen}
				onClose={() => {
					setIsCreateModalOpen(false);
					fetchProjects(); // Refresh list after creation
				}}
			/>
		</Layout>
	);
}
