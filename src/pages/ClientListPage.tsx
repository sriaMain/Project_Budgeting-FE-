import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Plus, 
  Building2, 
  Phone, 
  MapPin, 
  Paperclip,
  Briefcase
} from 'lucide-react';

/**
 * ==================================================================
 * SECTION: Types & Interfaces
 * ==================================================================
 */

export interface CompanyTag {
  id: number;
  name: string;
}

export interface Client {
  id: number;
  company_name: string;
  mobile_number: string;
  email: string;
  gstin?: string;
  street_address?: string;
  city?: string;
  postal_code?: string;
  municipality?: string;
  state?: string;
  country?: string;
  tags: CompanyTag[];
  created_at?: string;
  updated_at?: string;
}

export interface POC {
  id: number;
  company: number;
  company_name: string;
  poc_name: string;
  designation: string;
  poc_mobile: string;
  poc_email: string;
}

/**
 * ==================================================================
 * SECTION: ClientListPage Component
 * ==================================================================
 */

interface ClientListProps {
  clients: Client[];
  onAddClient: () => void;
  onSelectClient: (id: number) => void;
}

export function ClientListPage({ clients, onAddClient, onSelectClient }: ClientListProps) {
  return (
    <div className="space-y-6 animate-fade-in-down">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h2 className="text-3xl font-bold text-gray-900">Contacts</h2>
        
        <div className="flex items-center gap-4 w-full md:w-auto">
          <div className="relative flex-grow md:flex-grow-0">
            <input 
              type="text" 
              placeholder="Search contacts..." 
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-full md:w-64"
            />
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
          </div>
          <button 
            onClick={onAddClient}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-md font-semibold transition-colors whitespace-nowrap shadow-md hover:shadow-lg"
          >
            <Plus size={20} /> Add Client
          </button>
        </div>
      </div>

      {/* Table Section */}
      <div className="bg-gray-50 rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-100/80 text-gray-900 font-bold border-b border-gray-300">
                <th className="py-4 px-6 w-24">ID</th>
                <th className="py-4 px-6">Company Name</th>
                <th className="py-4 px-6">Address</th>
                <th className="py-4 px-6">Email</th>
                <th className="py-4 px-6">Phone</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {clients.length > 0 ? (
                clients.map(client => (
                  <tr 
                    key={client.id} 
                    className="hover:bg-gray-50 transition-colors group cursor-pointer"
                    onClick={() => onSelectClient(client.id)}
                  >
                    <td className="py-4 px-6 font-medium text-gray-500">#{client.id}</td>
                    <td className="py-4 px-6 align-top">
                      <div>
                        <p className="font-bold text-gray-900">{client.company_name}</p>
                        <p className="text-sm text-gray-500 mt-0.5">{client.tags?.length > 0 ? client.tags.map(t => t.name).join(', ') : 'No tags'}</p>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-sm text-gray-600">
                      {[client.street_address, client.city, client.state].filter(Boolean).join(', ') || 'N/A'}
                    </td>
                    <td className="py-4 px-6 text-sm text-gray-600">{client.email}</td>
                    <td className="py-4 px-6 text-sm text-gray-600">{client.mobile_number}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-gray-500">
                    No clients found. Click "Add Client" to create one.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
