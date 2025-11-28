import React, { useState, useEffect, useRef } from 'react';
import { 
  Plus, Search, ArrowLeft, Save, Loader2, Upload, User as UserIcon, 
  ChevronDown, Globe, Briefcase, Building2 
} from 'lucide-react';
import { ReusableTable} from '../components/ReusableTable';
import  type { Column } from '../components/ReusableTable';
import axiosInstance from '../utils/axiosInstance';

// --- Types ---
interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  position: string;
  role: string;
  module: string;
  chargesPerHr: string;
  languages: string[]; // e.g., ['english', 'german']
  avatarUrl?: string;
  status: 'active' | 'inactive';
}

// --- Mock Data ---
const MOCK_USERS: User[] = [
  { id: '1', firstName: 'John', lastName: 'Doe', email: 'john@sria.com', position: 'Senior Dev', role: 'Admin', module: 'Finance', chargesPerHr: '50', languages: ['english'], status: 'active' },
  { id: '2', firstName: 'Sarah', lastName: 'Smith', email: 'sarah@sria.com', position: 'Manager', role: 'User', module: 'Sales', chargesPerHr: '65', languages: ['english', 'german'], status: 'active' },
];

const ManageUsersTab: React.FC = () => {
  const [view, setView] = useState<'list' | 'form'>('list');
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Form State
  const initialFormState: User = {
    id: '',
    firstName: '',
    lastName: '',
    email: '',
    position: '',
    role: '',
    module: '',
    chargesPerHr: '',
    languages: [],
    status: 'active'
  };
  const [formData, setFormData] = useState<User>(initialFormState);
  const [isSaving, setIsSaving] = useState(false);
  
  // File Upload Ref
  const fileInputRef = useRef<HTMLInputElement>(null);

  // --- Fetch Data ---
  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {


    const response = await axiosInstance.get('/accounts/users/'); 
    console.log("Fetched users:", response.data);
    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      setUsers(MOCK_USERS);
      setIsLoading(false);
    }, 600);
  };

  // --- Handlers ---
  const handleEdit = (user: User) => {
    setFormData({ ...user });
    setView('form');
  };

  const handleDelete = (user: User) => {
    if (window.confirm(`Are you sure you want to delete ${user.firstName}?`)) {
      setUsers(prev => prev.filter(u => u.id !== user.id));
    }
  };

  const handleLanguageChange = (lang: string) => {
    setFormData(prev => {
      const langs = prev.languages.includes(lang)
        ? prev.languages.filter(l => l !== lang)
        : [...prev.languages, lang];
      return { ...prev, languages: langs };
    });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    
    // Simulate API Save
    setTimeout(() => {
      if (formData.id) {
        // Update existing
        setUsers(prev => prev.map(u => u.id === formData.id ? formData : u));
      } else {
        // Create new
        const newUser = { ...formData, id: Date.now().toString() };
        setUsers(prev => [...prev, newUser]);
      }
      setIsSaving(false);
      setView('list');
      setFormData(initialFormState);
    }, 1000);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Create a fake local URL for preview
      const url = URL.createObjectURL(file);
      setFormData(prev => ({ ...prev, avatarUrl: url }));
    }
  };

  // --- Table Configuration ---
  const columns: Column<User>[] = [
    { 
      header: 'Name', 
      accessor: (user) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-xs">
            {user.avatarUrl ? (
              <img src={user.avatarUrl} alt="" className="w-full h-full rounded-full object-cover" />
            ) : (
              `${user.firstName[0]}${user.lastName[0]}`
            )}
          </div>
          <span className="font-medium text-gray-900">{user.firstName} {user.lastName}</span>
        </div>
      ) 
    },
    { header: 'Email', accessor: 'email' },
    { header: 'Position', accessor: 'position' },
    { header: 'Role', accessor: 'role' },
    { 
      header: 'Status', 
      accessor: (user) => (
        <span className={`px-2 py-1 text-xs rounded-full ${user.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
          {user.status.charAt(0).toUpperCase() + user.status.slice(1)}
        </span>
      )
    },
  ];

  // --- Render ---
  return (
    <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
      
      {view === 'list' ? (
        <div className="space-y-6">
          {/* Header */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <h2 className="text-2xl font-bold text-gray-800">Manage Users</h2>
            <div className="flex items-center gap-4 w-full md:w-auto">
              <div className="relative flex-grow md:flex-grow-0">
                <input 
                  type="text" 
                  placeholder="Search users..." 
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-full md:w-64"
                />
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
              </div>
              <button 
                onClick={() => { setFormData(initialFormState); setView('form'); }}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg font-semibold shadow-sm transition-all whitespace-nowrap"
              >
                <Plus size={18} /> Create User
              </button>
            </div>
          </div>

          {/* Table */}
          <ReusableTable 
            data={users}
            columns={columns}
            keyField="id"
            isLoading={isLoading}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        </div>
      ) : (
        // --- Form View ---
        <div className="flex flex-col h-full bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          
          {/* Form Header / Breadcrumbs (mimicking the image layout) */}
          <div className="px-8 py-4 border-b border-gray-100 flex items-center justify-between bg-white">
             <div className="flex items-center gap-2 text-sm">
                <span className="font-bold text-gray-900 text-lg">Users and groups</span>
                <span className="text-gray-400 text-lg">›</span>
                <span className="text-gray-500">{formData.id ? 'Edit User' : 'New User'}</span>
             </div>
             <button onClick={() => setView('list')} className="text-gray-400 hover:text-gray-600">
               <ArrowLeft size={20} />
             </button>
          </div>

          <div className="flex flex-col lg:flex-row min-h-[600px]">
            {/* Sidebar (Left Panel) */}
            <div className="w-full lg:w-64 bg-white border-r border-gray-100 p-4 flex flex-col gap-2">
              <button className="flex items-center gap-3 px-4 py-3 bg-gray-50 text-gray-900 font-semibold rounded-lg border-l-4 border-blue-600 shadow-sm">
                <UserIcon size={18} />
                Profile
              </button>
              <div className="ml-11 text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                SRIA INFOTECH
              </div>
              
              <button className="flex items-center gap-3 px-4 py-3 text-gray-500 hover:bg-gray-50 font-medium rounded-lg transition-colors">
                <Building2 size={18} />
                Company data and logo
              </button>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 p-8 bg-white">
              <form onSubmit={handleSave}>
                <h3 className="text-blue-600 font-bold text-lg mb-6">User details</h3>
                
                <div className="flex flex-col lg:flex-row gap-8 items-start">
                  
                  {/* Left Column: Input Fields */}
                  <div className="flex-1 w-full space-y-4 max-w-xl">
                    
                    {/* First Name */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-center">
                      <label className="text-sm font-bold text-gray-700">
                        First Name<span className="text-red-500 ml-0.5">*</span>
                      </label>
                      <div className="sm:col-span-2">
                        <input
                          required
                          type="text"
                          value={formData.firstName}
                          onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-200 rounded-md focus:ring-1 focus:ring-blue-500 outline-none text-sm placeholder-gray-300"
                          placeholder="First Name"
                        />
                      </div>
                    </div>

                    {/* Last Name */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-center">
                      <label className="text-sm font-bold text-gray-700">
                        Last Name<span className="text-red-500 ml-0.5">*</span>
                      </label>
                      <div className="sm:col-span-2">
                        <input
                          required
                          type="text"
                          value={formData.lastName}
                          onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-200 rounded-md focus:ring-1 focus:ring-blue-500 outline-none text-sm placeholder-gray-300"
                          placeholder="Last Name"
                        />
                      </div>
                    </div>

                    {/* Email */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-center">
                      <label className="text-sm font-bold text-gray-700">
                        E-mail<span className="text-red-500 ml-0.5">*</span>
                      </label>
                      <div className="sm:col-span-2">
                        <input
                          required
                          type="email"
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-200 rounded-md focus:ring-1 focus:ring-blue-500 outline-none text-sm placeholder-gray-300"
                          placeholder="E-mail"
                        />
                      </div>
                    </div>

                    {/* Position */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-center">
                      <label className="text-sm font-bold text-gray-700">
                        Position<span className="text-red-500 ml-0.5">*</span>
                      </label>
                      <div className="sm:col-span-2">
                        <input
                          required
                          type="text"
                          value={formData.position}
                          onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-200 rounded-md focus:ring-1 focus:ring-blue-500 outline-none text-sm placeholder-gray-300"
                          placeholder="Position"
                        />
                      </div>
                    </div>

                    {/* Role */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-center">
                      <label className="text-sm font-bold text-gray-700">
                        Role<span className="text-red-500 ml-0.5">*</span>
                      </label>
                      <div className="sm:col-span-2">
                        <select
                          required
                          value={formData.role}
                          onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-200 rounded-md focus:ring-1 focus:ring-blue-500 outline-none text-sm bg-white text-gray-700"
                        >
                          <option value="" disabled>Select Role</option>
                          <option value="Admin">Admin</option>
                          <option value="User">User</option>
                          <option value="Manager">Manager</option>
                        </select>
                      </div>
                    </div>

                    {/* Module */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-center">
                      <label className="text-sm font-bold text-gray-700">Module</label>
                      <div className="sm:col-span-2">
                        <input
                          type="text"
                          value={formData.module}
                          onChange={(e) => setFormData({ ...formData, module: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-200 rounded-md focus:ring-1 focus:ring-blue-500 outline-none text-sm placeholder-gray-300"
                          placeholder="Module"
                        />
                      </div>
                    </div>

                    {/* Charges */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-center">
                      <label className="text-sm font-bold text-gray-700">Charges per hr</label>
                      <div className="sm:col-span-2">
                        <input
                          type="number"
                          value={formData.chargesPerHr}
                          onChange={(e) => setFormData({ ...formData, chargesPerHr: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-200 rounded-md focus:ring-1 focus:ring-blue-500 outline-none text-sm placeholder-gray-300"
                        />
                      </div>
                    </div>

                    {/* Categories Dropdown (Accordion Placeholder) */}
                    <div className="pt-2">
                      <button type="button" className="flex items-center gap-2 text-blue-600 font-bold text-sm hover:text-blue-800 transition-colors">
                        Categories <ChevronDown size={16} />
                      </button>
                    </div>

                    {/* Language Checkboxes */}
                    <div className="pt-4 grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div className="text-sm font-bold text-gray-700">User tags</div>
                      <div className="sm:col-span-2">
                        <div className="text-sm font-bold text-gray-700 mb-2">Language</div>
                        <div className="flex gap-6">
                          {['English', 'German', 'Spanish'].map((lang) => (
                            <label key={lang} className="flex items-center gap-2 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={formData.languages.includes(lang.toLowerCase())}
                                onChange={() => handleLanguageChange(lang.toLowerCase())}
                                className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                              />
                              <span className="text-sm text-gray-600">{lang}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                    </div>

                  </div>

                  {/* Right Column: Image Upload */}
                  <div className="w-full lg:w-64 flex flex-col items-center">
                     <div 
                        onClick={() => fileInputRef.current?.click()}
                        className="w-full aspect-square border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50 hover:border-blue-400 transition-all group"
                     >
                        {formData.avatarUrl ? (
                          <div className="relative w-full h-full p-2">
                            <img src={formData.avatarUrl} alt="Preview" className="w-full h-full object-contain rounded-md" />
                            <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-md">
                              <span className="text-white text-xs font-bold">Change Image</span>
                            </div>
                          </div>
                        ) : (
                          <>
                            <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center text-gray-400 mb-4">
                              <UserIcon size={40} />
                            </div>
                            <p className="text-xs text-center text-gray-500 font-medium px-4">
                              Drag a file or <span className="text-blue-600">browse</span> to upload
                            </p>
                          </>
                        )}
                        <input 
                          type="file" 
                          ref={fileInputRef} 
                          className="hidden" 
                          accept="image/*"
                          onChange={handleImageUpload}
                        />
                     </div>
                  </div>
                </div>

                {/* Footer Save Button */}
                <div className="mt-12 flex justify-center pb-8">
                   <button
                    type="submit"
                    disabled={isSaving}
                    className="px-12 py-2.5 bg-blue-600 text-white font-bold rounded shadow-md hover:bg-blue-700 hover:shadow-lg transition-all disabled:opacity-50"
                   >
                     {isSaving ? (
                       <span className="flex items-center gap-2">
                         <Loader2 className="animate-spin" size={16} /> Saving...
                       </span>
                     ) : 'Save'}
                   </button>
                </div>

              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageUsersTab;