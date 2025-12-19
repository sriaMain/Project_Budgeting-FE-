import React from 'react';
import { Layout } from '../components/Layout';
import { Button } from '../components/Button';
import { InputField } from '../components/InputField';

type Project = {
	id: string;
	name: string;
	dueDate?: string;
	progress: number; // 0-100
	income?: string;
	forecastedProfit?: string;
	status?: string;
};

type ClientGroup = {
	id: string;
	clientName: string;
	projects: Project[];
};

const SAMPLE_DATA: ClientGroup[] = [
	{
		id: 'c-internal',
		clientName: 'Internal',
		projects: [
			{ id: 'p-1', name: 'Internal Project(Example)', dueDate: '23-10-2025', progress: 42, income: 'N/A', forecastedProfit: 'N/A', status: 'In Progress' },
		],
	},
	{
		id: 'c-a',
		clientName: 'Client A',
		projects: [
			{ id: 'p-2', name: 'Fixed Price (Example)', dueDate: '23-10-2025', progress: 35, income: 'N/A', forecastedProfit: 'N/A', status: 'In Progress' },
			{ id: 'p-3', name: 'Fixed Price (Example)', dueDate: '23-10-2025', progress: 50, income: 'N/A', forecastedProfit: 'N/A', status: 'In Progress' },
			{ id: 'p-4', name: 'Fixed Price (Example)', dueDate: '23-10-2025', progress: 28, income: 'N/A', forecastedProfit: 'N/A', status: 'In Progress' },
			{ id: 'p-5', name: 'Fixed Price (Example)', dueDate: '23-10-2025', progress: 36, income: 'N/A', forecastedProfit: 'N/A', status: 'In Progress' },
		],
	},
	{
		id: 'c-b',
		clientName: 'Client B',
		projects: [
			{ id: 'p-6', name: 'Fixed Price (Example)', dueDate: '23-10-2025', progress: 32, income: 'N/A', forecastedProfit: 'N/A', status: 'In Progress' },
		],
	},
];

const KPI = ({ label, value, subtitle }: { label: string; value: string; subtitle?: string }) => (
	<div className="bg-white rounded-lg border border-gray-200 p-4 flex flex-col gap-1">
		<div className="text-sm text-gray-500">{label}</div>
		<div className="text-xl font-semibold">{value}</div>
		{subtitle && <div className="text-xs text-gray-400">{subtitle}</div>}
	</div>
);

const ProgressBar = ({ value }: { value: number }) => (
	<div className="w-40 h-3 bg-gray-200 rounded-full overflow-hidden">
		<div className="h-full bg-blue-600" style={{ width: `${Math.max(0, Math.min(100, value))}%` }} />
	</div>
);

export default function ProjectsScreen() {
	return (
		<Layout userRole="admin" currentPage="projects" onNavigate={() => {}}>
			<div className="flex items-center justify-between mb-6">
				<div>
					<div className="text-sm text-gray-500">Projects &gt; My Projects</div>
					<h1 className="text-2xl font-semibold mt-1">My Projects</h1>
				</div>
				<div className="w-64">
					<Button className="w-full max-w-[160px]">+ New</Button>
				</div>
			</div>

			<div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
				<div className="flex items-center gap-3">
					<Button variant="secondary" className="px-4 py-2">My Projects</Button>
					<Button variant="secondary" className="px-4 py-2">Status: Active Projects</Button>
					<Button variant="secondary" className="px-4 py-2">Filters</Button>
				</div>

				<div className="w-full md:w-1/3">
					<InputField placeholder="Search" />
				</div>
			</div>

			<div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
				<KPI label="Forcasted profit(actual)" value="5,000 INR" subtitle="50%" />
				<KPI label="Income(Budget)" value="5,000 INR" />
				<KPI label="Income(actual)" value="5,000 INR" />
			</div>

			<div className="bg-white rounded-lg border border-gray-200">
				<div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
					<div className="text-sm text-gray-600 font-medium">Project Name | Client</div>
					<div className="flex items-center gap-8 text-sm text-gray-600">
						<div>Due date</div>
						<div>Progress</div>
						<div>Income</div>
						<div>Forecasted Profit</div>
						<div>Status</div>
					</div>
				</div>

				<div>
					{SAMPLE_DATA.map((group) => (
						<div key={group.id} className="border-b border-gray-100">
							<div className="px-6 py-4 bg-gray-50 text-sm text-gray-700 font-medium flex items-center justify-between">
								<div className="flex items-center gap-3">
									<input type="checkbox" className="form-checkbox" />
									<span>{group.clientName}</span>
								</div>
								<div className="text-xs text-gray-500">Total {group.projects.length} Project</div>
							</div>

							{group.projects.map((p) => (
								<div key={p.id} className="px-6 py-4 flex items-center gap-6 hover:bg-gray-50">
									<div className="w-6">
										<input type="checkbox" />
									</div>
									<div className="min-w-[260px]">
										<a className="text-blue-600 hover:underline">{p.name}</a>
									</div>

									<div className="w-40 text-sm text-gray-600">{p.dueDate}</div>

									<div className="w-48">
										<ProgressBar value={p.progress} />
									</div>

									<div className="w-32 text-sm text-gray-600">{p.income}</div>

									<div className="w-40 text-sm text-gray-600">{p.forecastedProfit}</div>

									<div className="ml-auto">
										<span className="inline-block bg-green-100 text-green-800 text-sm px-3 py-1 rounded-full">{p.status}</span>
									</div>
								</div>
							))}
						</div>
					))}
				</div>
			</div>
		</Layout>
	);
}
