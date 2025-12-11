import { useState, useEffect } from "react";
import type { POC } from "../pages/ClientListPage";
import axiosInstance from "../utils/axiosInstance";
import { parseApiErrors } from "../utils/parseApiErrors";

interface AddPOCModalProps {
    companyId: number;
    companyName: string;
    poc?: POC; // Optional POC for editing
    onSave: (poc: POC) => void;
    onClose: () => void;
}

export function AddPOCModal({ companyId, companyName, poc, onSave, onClose }: AddPOCModalProps) {
    const [formData, setFormData] = useState({
        poc_name: poc?.poc_name || '',
        designation: poc?.designation || '',
        poc_mobile: poc?.poc_mobile || '',
        poc_email: poc?.poc_email || ''
    });
    const [isSaving, setIsSaving] = useState(false);
    const [errors, setErrors] = useState<{ general?: string }>({});

    const isEditing = !!poc;

    // Update form data when poc prop changes
    useEffect(() => {
        if (poc) {
            setFormData({
                poc_name: poc.poc_name,
                designation: poc.designation,
                poc_mobile: poc.poc_mobile,
                poc_email: poc.poc_email
            });
        }
    }, [poc]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        const payload = {
            ...formData,
            company: companyId,
            company_name: companyName
        };

        try {
            let response;
            if (isEditing) {
                // Update existing POC
                response = await axiosInstance.put(`/pocs/${poc.id}/`, payload);
            } else {
                // Create new POC
                response = await axiosInstance.post("/pocs/", payload);
            }

            if (response.status === 200 || response.status === 201) {
                console.log(isEditing ? "POC updated:" : "POC created:", response.data);
            }


            const savedPOC: POC = {
                ...payload,
                id: isEditing ? poc.id : (response.data.id || Math.floor(Math.random() * 1000) + 1)
            };
            onSave(savedPOC);
            onClose();
        } catch (error) {
            const apiErrors = parseApiErrors(error);
            setErrors(apiErrors);
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-background backdrop-blur flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md overflow-hidden animate-fadeIn">
                <div className="bg-gray-100 px-6 py-4 border-b flex justify-between items-center">
                    <h3 className="font-semibold text-gray-800">
                        {isEditing ? 'Edit Point of Contact' : 'Add Point of Contact'}
                    </h3>
                    <button onClick={() => { setErrors({}); onClose(); }} className="text-gray-500 hover:text-gray-700">&times;</button>
                </div>
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    {errors.general && (
                        <div className="p-4 bg-red-50 border border-red-100 text-red-600 text-sm rounded-lg flex items-center">
                            <svg className="w-5 h-5 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0z"></path>
                            </svg>
                            {errors.general}
                        </div>
                    )}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                        <input
                            required
                            type="text"
                            className="w-full border rounded px-3 py-2 focus:ring-1 focus:ring-blue-500 outline-none"
                            value={formData.poc_name}
                            onChange={e => { setFormData({ ...formData, poc_name: e.target.value }); setErrors({}); }}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Designation</label>
                        <input
                            type="text"
                            className="w-full border rounded px-3 py-2 focus:ring-1 focus:ring-blue-500 outline-none"
                            value={formData.designation}
                            onChange={e => { setFormData({ ...formData, designation: e.target.value }); setErrors({}); }}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Mobile Number</label>
                        <input
                            required
                            type="tel"
                            className="w-full border rounded px-3 py-2 focus:ring-1 focus:ring-blue-500 outline-none"
                            value={formData.poc_mobile}
                            onChange={e => { setFormData({ ...formData, poc_mobile: e.target.value }); setErrors({}); }}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                        <input
                            required
                            type="email"
                            className="w-full border rounded px-3 py-2 focus:ring-1 focus:ring-blue-500 outline-none"
                            value={formData.poc_email}
                            onChange={e => { setFormData({ ...formData, poc_email: e.target.value }); setErrors({}); }}
                        />
                    </div>

                    <div className="pt-4 flex justify-end gap-3">
                        <button
                            type="button"
                            onClick={() => { setErrors({}); onClose(); }}
                            className="px-4 py-2 border rounded text-gray-600 hover:bg-gray-50"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isSaving}
                            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
                        >
                            {isSaving ? 'Saving...' : (isEditing ? 'Update POC' : 'Save POC')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
