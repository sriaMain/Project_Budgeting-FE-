import React, { useState, useEffect } from "react";
import { Plus, Search, ArrowLeft, Save, Loader2 } from "lucide-react";
import { ReusableTable} from "../components/ReusableTable";
import type { Column } from "../components/ReusableTable";
import AddProductGroupModal from "./AddProductGroupModal";
import axiosInstance from "../utils/axiosInstance";
import { Toast } from "./Toast";
import { parseApiErrors } from "../utils/parseApiErrors";

// --- Types ---
interface ProductGroup {
  id: number; // Based on your JSON: "id": 1
  product_group: string;
}

interface ModuleItem {
  id: string;
  description: string;
  product_service_name: string;
  product_group: string; // API returns string: "Services"
  product_group_id?: number; // Derived: We find this ID by matching the string
}

// --- Modules Tab Component ---
const ModulesTab: React.FC = () => {
  const [view, setView] = useState<"list" | "form">("list");
  const [isLoading, setIsLoading] = useState(false);
  const [modules, setModules] = useState<ModuleItem[]>([]);

  // Form State
  const [formData, setFormData] = useState({
    id: "",
    product_service_name: "",
    description: "",
    product_group: "", // Stores the ID selected from dropdown as a string
  });

  // Dropdown Data
  const [productGroups, setProductGroups] = useState<ProductGroup[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [isNavigating, setIsNavigating] = useState(false);
  const [errors, setErrors] = useState<{ general?: string }>({});

  // Initial Fetch
  useEffect(() => {
    fetchData();
  }, []);

  // Clear errors when switching to list view
  useEffect(() => {
    if (view === 'list') {
      setErrors({});
    }
  }, [view]);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      // Fetch both simultaneously to ensure we have groups for mapping
      const [groupsRes, modulesRes] = await Promise.all([
        axiosInstance.get("/product-groups"),
        axiosInstance.get("/product-services/"),
      ]);

      const groups: ProductGroup[] = groupsRes.data;
      const rawModules: ModuleItem[] = modulesRes.data;

      console.log("Product Groups fetched:", groups);
      console.log("Modules fetched (raw):", rawModules);

      setProductGroups(groups);

      // Map modules to include the derived ID
      const modulesWithIds = rawModules.map((mod) => {
        // Find the group object that matches the module's string name
        const matchingGroup = groups.find(
          (g) => g.product_group === mod.product_group
        );
        return {
          ...mod,
          product_group_id: matchingGroup ? matchingGroup.id : undefined,
        };
      });

      setModules(modulesWithIds);
    } catch (error) {
      console.error("Failed to fetch data", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.product_service_name || !formData.product_group) return;

    setIsSaving(true);
    try {
      // Build payload with product_group as the group ID (Integer)
      const payload = {
        id: formData.id,
        product_service_name: formData.product_service_name,
        description: formData.description,
        product_group: parseInt(formData.product_group, 10), // Send ID
      };

      // API Call
      if (formData.id) {
        await axiosInstance.put(`/product-services/${formData.id}/`, payload);
      } else {
        await axiosInstance.post("/product-services/", payload);
      }

      await new Promise((r) => setTimeout(r, 1000)); // Delay for UX

      await fetchData(); // Refresh list and re-map
      
      // Show toast and navigate back after delay
      setIsNavigating(true);
      setToastMessage(formData.id ? "Module updated successfully!" : "Module created successfully!");
      setShowToast(true);
      setTimeout(() => {
        setView("list");
        setFormData({
          id: "",
          product_service_name: "",
          description: "",
          product_group: "",
        });
        setErrors({});
        setIsNavigating(false);
      }, 1800);
    } catch (error) {
      const apiErrors = parseApiErrors(error);
      setErrors(apiErrors);
    } finally {
      setIsSaving(false);
    }
  };

  const columns: Column<ModuleItem>[] = [
    {
      header: "Module Name",
      accessor: "product_service_name",
      className: "font-medium text-gray-900",
    },
    {
      header: "Product Group",
      accessor: "product_group", // Display the string directly
    },
    { header: "Description", accessor: "description" },
  ];

  return (
    <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
      {/* --- Add Product Group Modal --- */}
      <AddProductGroupModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={(newGroup) => {
          // Add new group to list and auto-select it
          // Note: ensure newGroup has the correct shape if coming from modal
          // Assuming modal returns { id: string, name: string } or similar
          // We convert it to our ProductGroup type
          const mappedGroup: ProductGroup = {
            id: Number(newGroup.id),
            product_group: newGroup.product_group,
          };

          setProductGroups((prev) => [...prev, mappedGroup]);
          setFormData((prev) => ({
            ...prev,
            product_group: String(mappedGroup.id),
          }));
        }}
      />

      {view === "list" ? (
        <div className="space-y-6">
          {/* Header & Actions */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <h2 className="text-2xl font-bold text-gray-800">Modules</h2>
            <div className="flex items-center gap-4 w-full md:w-auto">
              <div className="relative flex-grow md:flex-grow-0">
                <input
                  type="text"
                  placeholder="Search modules..."
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-full md:w-64"
                />
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
              </div>
              <button
                onClick={() => {
                  setFormData({
                    id: "",
                    product_service_name: "",
                    description: "",
                    product_group: "",
                  });
                  setView("form");
                }}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg font-semibold shadow-sm transition-all whitespace-nowrap"
              >
                <Plus size={18} /> Add Module
              </button>
            </div>
          </div>

          {/* Reusable Table Implementation */}
          <ReusableTable
            data={modules}
            columns={columns}
            keyField="id"
            isLoading={isLoading}
            onEdit={(item: ModuleItem) => {
              // Logic: We need the ID for the dropdown.
              // We derived product_group_id during fetch.
              const groupIdForForm = item.product_group_id
                ? String(item.product_group_id)
                : "";

              if (!groupIdForForm) {
                console.warn(
                  "Could not find matching Product Group ID for:",
                  item.product_group
                );
              }

              setFormData({
                id: item.id,
                product_service_name: item.product_service_name,
                description: item.description,
                product_group: groupIdForForm,
              });
              setView("form");
            }}
          />
        </div>
      ) : (
        /* --- Form View --- */
        <div className="max-w-4xl mx-auto relative">
          {/* Blur overlay when navigating */}
          {isNavigating && (
            <div className="absolute inset-0 bg-white/40 backdrop-blur-[2px] z-10 pointer-events-auto rounded-xl" />
          )}
          
          {/* Breadcrumb / Back */}
          <div className="mb-6 flex items-center gap-2 text-sm">
            <button
              onClick={() => setView("list")}
              className="text-gray-500 hover:text-gray-900 flex items-center gap-1 transition-colors"
            >
              <ArrowLeft size={16} /> Back to Modules
            </button>
            <span className="text-gray-300">/</span>
            <span className="font-semibold text-gray-800">
              {formData.id ? "Edit Module" : "Add New Module"}
            </span>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
            <h3 className="text-xl font-bold text-gray-900 mb-8">
              Module Details
            </h3>

            {errors.general && (
              <div className="mt-4 p-4 bg-red-50 border border-red-100 text-red-600 text-sm rounded-lg flex items-center">
                <svg className="w-5 h-5 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0z"></path>
                </svg>
                {errors.general}
              </div>
            )}

            <form onSubmit={handleSave} className="space-y-6">
              {/* Product/Module Name */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">
                  <span className="text-red-500 mr-1">*</span>
                  Product/Module name
                </label>
                <input
                  type="text"
                  required
                  value={formData.product_service_name}
                  onChange={(e) => {
                    setFormData({
                      ...formData,
                      product_service_name: e.target.value,
                    });
                    setErrors({});
                  }}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all placeholder-gray-400"
                  placeholder="Enter module name"
                />
              </div>

              {/* Description */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">
                  Description
                </label>
                <textarea
                  rows={4}
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all placeholder-gray-400 resize-none"
                  placeholder="Enter brief description"
                />
              </div>

              {/* Product Group Dropdown with + Button */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">
                  <span className="text-red-500 mr-1">*</span>
                  Product Group :
                </label>
                <div className="flex gap-2">
                  <div className="relative flex-grow">
                    <select
                      required
                      value={formData.product_group}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          product_group: e.target.value,
                        })
                      }
                      className={`w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none appearance-none bg-white transition-all cursor-pointer ${
                        !formData.product_group && "text-gray-500"
                      }`}
                    >
                      <option value="" disabled>
                        Choose Product Group
                      </option>
                      {productGroups.map((group) => (
                        <option
                          key={group.id}
                          value={group.id}
                          className="text-gray-900"
                        >
                          {group.product_group}
                        </option>
                      ))}
                    </select>
                    {/* Custom Arrow Icon */}
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-gray-500">
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M19 9l-7 7-7-7"
                        ></path>
                      </svg>
                    </div>
                  </div>

                  {/* Plus Button */}
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(true)}
                    className="flex-shrink-0 w-11 h-11 flex items-center justify-center bg-blue-50 text-blue-600 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors"
                    title="Add New Product Group"
                  >
                    <Plus size={20} />
                  </button>
                </div>
              </div>

              {/* Footer / Save Button */}
              <div className="pt-8 flex justify-center">
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-10 py-2.5 bg-blue-600 text-white text-lg font-semibold rounded-lg hover:bg-blue-700 shadow-lg hover:shadow-xl transform active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSaving ? (
                    <span className="flex items-center gap-2">
                      <Loader2 className="animate-spin" size={20} /> Saving...
                    </span>
                  ) : (
                    "Save"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      
      {/* Toast Notification */}
      {showToast && (
        <Toast
          message={toastMessage}
          type="success"
          onClose={() => setShowToast(false)}
        />
      )}
    </div>
  );
};

export default ModulesTab;