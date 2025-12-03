import { useState } from "react";
import type { Client, POC } from "../pages/ClientListPage";
import { AddPOCModal } from "../components/AddPOCModal";
import { MapPin, Phone, Building2, Paperclip, Briefcase } from "lucide-react";


interface ClientDetailsProps {
  client: Client;
  pocs: POC[];
  onAddPOC: (poc: POC) => void;
  onBack: () => void;
}

export function ClientDetailsPage({ client, pocs, onAddPOC, onBack }: ClientDetailsProps) {
  const [isPOCModalOpen, setIsPOCModalOpen] = useState(false);

  return (
    <div className="space-y-6 animate-fade-in-down">
      {/* Breadcrumb / Back */}
      <div className="mb-6 flex items-center gap-2 text-sm">
        <button
          onClick={onBack}
          className="text-blue-600 hover:text-blue-800 font-semibold transition-colors"
        >
          Contacts
        </button>
        <span className="text-gray-400">/</span>
        <span className="text-gray-700 font-medium">{client.company_name}</span>
      </div>

      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h2 className="text-3xl font-bold text-gray-900">{client.company_name}</h2>
        <button className="px-6 py-2.5 text-blue-600 font-semibold border border-blue-600 rounded-lg hover:bg-blue-50 transition-colors">
          Modify
        </button>
      </div>

      {/* Info Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Location Card */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 space-y-4">
          <h3 className="font-bold text-gray-900 text-sm">Location & Contact</h3>
          <div className="space-y-3 text-sm">
            <div className="flex items-start gap-3">
              <MapPin className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-gray-600">{client.city}, {client.state}</p>
                <p className="text-xs text-gray-500 mt-1">{client.street_address}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Phone className="w-5 h-5 text-gray-400 flex-shrink-0" />
              <p className="text-gray-600">{client.mobile_number}</p>
            </div>
            <div className="flex items-center gap-3">
              <Building2 className="w-5 h-5 text-gray-400 flex-shrink-0" />
              <p className="text-blue-600 hover:underline cursor-pointer text-xs">{client.email}</p>
            </div>
          </div>
        </div>

        {/* Company Info Card */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 space-y-3">
          <h3 className="font-bold text-gray-900 text-sm">Company Info</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between border-b pb-2">
              <span className="text-gray-600">Industry:</span>
              <span className="font-medium text-gray-900">{client.tags[0]?.name || 'N/A'}</span>
            </div>
            <div className="flex justify-between border-b pb-2">
              <span className="text-gray-600">GSTIN:</span>
              <span className="font-medium text-gray-900">{client.gstin || 'N/A'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Status:</span>
              <span className="font-medium text-green-600">Active</span>
            </div>
          </div>
        </div>

        {/* People (POCs) Card */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden flex flex-col">
          <div className="p-4 border-b bg-gray-50 flex justify-between items-center">
            <h3 className="font-bold text-gray-900 text-sm">Points of Contact</h3>
            <button 
              onClick={() => setIsPOCModalOpen(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white text-xs px-3 py-1 rounded-md font-semibold transition-colors"
            >
              Add POC
            </button>
          </div>
          <div className="p-4 space-y-3 flex-1 overflow-y-auto max-h-56">
            {pocs.length === 0 ? (
                <p className="text-xs text-gray-400 italic text-center py-4">No contacts yet.</p>
            ) : (
                pocs.map((poc, idx) => (
                <div key={idx} className="flex items-start gap-3 pb-3 border-b last:border-b-0">
                    <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-bold flex-shrink-0">
                    {poc.poc_name.substring(0, 1).toUpperCase()}
                    </div>
                    <div className="text-xs">
                    <p className="font-semibold text-gray-900">{poc.poc_name}</p>
                    <p className="text-gray-600">{poc.designation}</p>
                    <p className="text-gray-500 mt-0.5">{poc.poc_mobile}</p>
                    </div>
                </div>
                ))
            )}
          </div>
        </div>
      </div>

      {/* Quotes Section */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-4 border-b bg-gray-50 flex justify-between items-center">
          <h3 className="font-bold text-gray-900 text-sm">Quotes</h3>
          <button className="bg-blue-600 hover:bg-blue-700 text-white text-xs px-3 py-1 rounded-md font-semibold transition-colors">
            Add Quote
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="text-gray-900 font-bold bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="py-3 px-4">Issue Date</th>
                <th className="py-3 px-4">Author</th>
                <th className="py-3 px-4">Number</th>
                <th className="py-3 px-4">Quote | Project</th>
                <th className="py-3 px-4 text-right">Amount (INR)</th>
                <th className="py-3 px-4 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              <tr className="hover:bg-gray-50">
                <td className="py-3 px-4 text-gray-600">23-10-2025</td>
                <td className="py-3 px-4 text-gray-600">SG</td>
                <td className="py-3 px-4 text-gray-600">25</td>
                <td className="py-3 px-4 flex items-center gap-2 text-gray-600">
                  <Briefcase className="w-4 h-4" /> Client A Quote
                </td>
                <td className="py-3 px-4 text-right text-gray-900 font-medium">5,000</td>
                <td className="py-3 px-4 text-center">
                  <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-semibold">In Progress</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <div className="p-4 bg-gray-50 border-t border-gray-200 flex justify-end gap-8 text-sm font-semibold text-gray-900">
          <span>Successful Quotes: 10,000</span>
          <span>Total: 10,000</span>
        </div>
      </div>

      {/* Files Section */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-4 border-b bg-gray-50 flex justify-between items-center">
          <h3 className="font-bold text-gray-900 text-sm">Files</h3>
          <button className="bg-blue-600 hover:bg-blue-700 text-white text-xs px-3 py-1 rounded-md font-semibold transition-colors flex items-center gap-1">
            <Paperclip className="w-4 h-4" /> Add File
          </button>
        </div>
        <div className="p-8 text-center text-gray-400 text-sm">
          No files uploaded yet.
        </div>
      </div>

      {/* POC Modal */}
      {isPOCModalOpen && (
        <AddPOCModal 
            companyId={client.id}
            companyName={client.company_name}
            onSave={onAddPOC}
            onClose={() => setIsPOCModalOpen(false)} 
        />
      )}
    </div>
  );
}


