import React, { useState, useEffect } from "react";
import toast from "react-hot-toast";
import {
  Building2,
  MapPin,
  Plus,
  Search,
  Edit2,
  Trash2,
  Power,
  Upload,
  Image as ImageIcon,
  Check,
  X,
  RefreshCw,
  Eye,
  ArrowUpDown,
} from "lucide-react";
import adminService from "../services/adminService";

export default function CityManagementAdmin() {
  const [cities, setCities] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all"); // "all" | "active" | "inactive"

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [editingCity, setEditingCity] = useState(null); // null = Add mode, object = Edit mode
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [imageUploading, setImageUploading] = useState(false);

  // Form Fields
  const [formData, setFormData] = useState({
    name: "",
    state: "",
    imageUrl: "",
    displayOrder: 99,
    isActive: true,
  });

  useEffect(() => {
    fetchCities();
  }, []);

  const fetchCities = async () => {
    setLoading(true);
    try {
      const res = await adminService.getAllCitiesAdmin();
      if (res.success) {
        setCities(res.data || []);
      } else {
        toast.error("Failed to load cities");
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Error fetching cities");
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAddModal = () => {
    setEditingCity(null);
    setFormData({
      name: "",
      state: "",
      imageUrl: "",
      displayOrder: (cities.length + 1) * 5 || 10,
      isActive: true,
    });
    setShowModal(true);
  };

  const handleOpenEditModal = (city) => {
    setEditingCity(city);
    setFormData({
      name: city.name || "",
      state: city.state || "",
      imageUrl: city.imageUrl || "",
      displayOrder: city.displayOrder !== undefined ? city.displayOrder : 99,
      isActive: city.isActive !== undefined ? city.isActive : true,
    });
    setShowModal(true);
  };

  const handleImageFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please upload a valid image file (JPG, PNG, WEBP).");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image file size should not exceed 5MB.");
      return;
    }

    const uploadData = new FormData();
    uploadData.append("file", file);

    setImageUploading(true);
    try {
      const res = await adminService.uploadCityImage(uploadData);
      if (res.success && res.fileUrl) {
        setFormData((prev) => ({ ...prev, imageUrl: res.fileUrl }));
        toast.success("City cover image uploaded!");
      } else {
        toast.error("Failed to upload image");
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Error uploading image");
    } finally {
      setImageUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      toast.error("Please enter a city name.");
      return;
    }

    setFormSubmitting(true);
    try {
      if (editingCity) {
        // Update
        const res = await adminService.updateCity(editingCity._id, formData);
        if (res.success) {
          toast.success(res.message || "City updated successfully!");
          setShowModal(false);
          fetchCities();
        } else {
          toast.error(res.message || "Failed to update city");
        }
      } else {
        // Create
        const res = await adminService.createCity(formData);
        if (res.success) {
          toast.success(res.message || "City added successfully!");
          setShowModal(false);
          fetchCities();
        } else {
          toast.error(res.message || "Failed to create city");
        }
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Error saving city");
    } finally {
      setFormSubmitting(false);
    }
  };

  const handleToggleStatus = async (city) => {
    try {
      const res = await adminService.toggleCityStatus(city._id);
      if (res.success) {
        toast.success(res.message);
        setCities((prev) =>
          prev.map((c) => (c._id === city._id ? { ...c, isActive: !c.isActive } : c))
        );
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Error toggling status");
    }
  };

  const handleDeleteCity = async (city) => {
    if (!window.confirm(`Are you sure you want to delete "${city.name}"?`)) return;

    try {
      const res = await adminService.deleteCity(city._id);
      if (res.success) {
        toast.success(res.message || "City deleted successfully");
        setCities((prev) => prev.filter((c) => c._id !== city._id));
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Error deleting city");
    }
  };

  const handleClearAllCities = async () => {
    if (!window.confirm("Are you sure you want to delete ALL cities from the list? You can add your own custom cities anytime.")) {
      return;
    }

    try {
      const res = await adminService.clearAllCities();
      if (res.success) {
        toast.success(res.message || "All cities deleted successfully");
        setCities([]);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Error clearing cities");
    }
  };

  // Filtered Cities
  const filteredCities = cities.filter((city) => {
    const matchesQuery =
      (city.name || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (city.state || "").toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesQuery) return false;
    if (statusFilter === "active") return city.isActive;
    if (statusFilter === "inactive") return !city.isActive;
    return true;
  });

  const activeCount = cities.filter((c) => c.isActive).length;

  return (
    <div className="bg-[#0f172a] p-6 rounded-xl border border-zinc-800 text-white min-h-[550px] shadow-2xl">
      {/* Header and Controls */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-6 gap-4 border-b border-zinc-800 pb-5">
        <div>
          <h2 className="text-2xl font-black flex items-center gap-2.5 text-white">
            <Building2 className="w-6 h-6 text-red-500" />
            City Management
          </h2>
          <p className="text-zinc-400 text-xs mt-1">
            Manage cities, cover images, and display ordering for blood bank discovery & registration
          </p>
        </div>

        <div className="flex flex-wrap gap-3 w-full lg:w-auto items-center">
          {cities.length > 0 && (
            <button
              onClick={handleClearAllCities}
              className="flex items-center gap-1.5 px-3 py-2 bg-red-950/40 hover:bg-red-900/60 text-red-400 border border-red-800/60 rounded-lg text-xs font-bold transition-colors cursor-pointer"
              title="Delete all cities"
            >
              <Trash2 className="w-3.5 h-3.5" /> Clear All
            </button>
          )}

          <button
            onClick={handleOpenAddModal}
            className="flex items-center gap-2 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white px-4 py-2.5 rounded-lg font-bold text-sm transition-all shadow-lg shadow-red-600/20 cursor-pointer"
          >
            <Plus className="w-4 h-4" /> Add City
          </button>

          <button
            onClick={fetchCities}
            title="Refresh List"
            className="p-2.5 bg-[#1e293b] hover:bg-[#334155] border border-zinc-700 rounded-lg text-zinc-300 hover:text-white transition-colors cursor-pointer"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>

      {/* Filter and Counter Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div className="flex items-center gap-2">
          <span className="text-sm font-bold text-zinc-200">
            Active Cities ({activeCount} of {cities.length})
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
          {/* Status Tabs */}
          <div className="flex bg-[#1e293b] p-1 rounded-lg border border-zinc-700 text-xs font-semibold">
            {["all", "active", "inactive"].map((tab) => (
              <button
                key={tab}
                onClick={() => setStatusFilter(tab)}
                className={`px-3 py-1 rounded capitalize transition-all cursor-pointer ${
                  statusFilter === tab
                    ? "bg-red-600 text-white shadow-sm"
                    : "text-zinc-400 hover:text-white"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Search Bar */}
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-zinc-500" />
            <input
              type="text"
              placeholder="Search city or state..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-1.5 bg-[#1e293b] border border-zinc-700 rounded-lg focus:outline-none focus:border-red-500 text-xs text-white placeholder-zinc-500"
            />
          </div>
        </div>
      </div>

      {/* Cities Table */}
      {loading ? (
        <div className="text-center py-16 text-zinc-500 text-sm">
          <div className="w-8 h-8 border-2 border-red-500/20 border-t-red-500 rounded-full animate-spin mx-auto mb-3"></div>
          Loading cities...
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-zinc-800 bg-[#0b1120]">
          <table className="w-full text-left border-collapse whitespace-nowrap">
            <thead>
              <tr className="border-b border-zinc-800 bg-[#131b2e] text-zinc-400 text-[11px] uppercase tracking-wider">
                <th className="py-3 px-4 font-bold">City Image</th>
                <th className="py-3 px-4 font-bold">City Name</th>
                <th className="py-3 px-4 font-bold">State</th>
                <th className="py-3 px-4 font-bold">Display Order</th>
                <th className="py-3 px-4 font-bold">Status</th>
                <th className="py-3 px-4 font-bold text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredCities.map((city) => (
                <tr
                  key={city._id}
                  className="border-b border-zinc-850 hover:bg-[#1e293b]/40 transition-colors"
                >
                  {/* City Image */}
                  <td className="py-3 px-4">
                    {city.imageUrl ? (
                      <img
                        src={city.imageUrl}
                        alt={city.name}
                        className="w-12 h-9 rounded object-cover border border-zinc-700 shadow-sm"
                        onError={(e) => {
                          e.target.style.display = "none";
                        }}
                      />
                    ) : (
                      <div className="w-12 h-9 rounded bg-zinc-800/80 border border-zinc-700 flex items-center justify-center text-zinc-500">
                        <ImageIcon className="w-4 h-4" />
                      </div>
                    )}
                  </td>

                  {/* City Name */}
                  <td className="py-3 px-4">
                    <span className="font-bold text-zinc-100 text-sm flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-red-500" />
                      {city.name}
                    </span>
                  </td>

                  {/* State */}
                  <td className="py-3 px-4">
                    <span className="text-xs text-zinc-300">
                      {city.state || <span className="text-zinc-600">—</span>}
                    </span>
                  </td>

                  {/* Display Order */}
                  <td className="py-3 px-4">
                    <span className="text-xs font-mono font-bold text-zinc-400 bg-zinc-800/60 px-2 py-0.5 rounded border border-zinc-750">
                      #{city.displayOrder}
                    </span>
                  </td>

                  {/* Status */}
                  <td className="py-3 px-4">
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-0.5 text-[11px] font-bold rounded-full border uppercase tracking-wider ${
                        city.isActive
                          ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                          : "bg-zinc-800 text-zinc-400 border-zinc-700"
                      }`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          city.isActive ? "bg-emerald-400" : "bg-zinc-500"
                        }`}
                      ></span>
                      {city.isActive ? "Active" : "Inactive"}
                    </span>
                  </td>

                  {/* Actions */}
                  <td className="py-3 px-4 text-right">
                    <div className="inline-flex items-center gap-1.5">
                      {/* Toggle Status */}
                      <button
                        onClick={() => handleToggleStatus(city)}
                        title={city.isActive ? "Deactivate City" : "Activate City"}
                        className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
                          city.isActive
                            ? "bg-emerald-600/10 hover:bg-emerald-600/20 text-emerald-400 border-emerald-500/30"
                            : "bg-zinc-800 hover:bg-zinc-700 text-zinc-400 border-zinc-700"
                        }`}
                      >
                        <Power className="w-3.5 h-3.5" />
                      </button>

                      {/* Edit */}
                      <button
                        onClick={() => handleOpenEditModal(city)}
                        title="Edit City"
                        className="p-1.5 bg-blue-600/10 hover:bg-blue-600/20 text-blue-400 hover:text-blue-300 rounded-lg border border-blue-500/30 transition-colors cursor-pointer"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>

                      {/* Delete */}
                      <button
                        onClick={() => handleDeleteCity(city)}
                        title="Delete City"
                        className="p-1.5 bg-red-600/10 hover:bg-red-600/20 text-red-400 hover:text-red-300 rounded-lg border border-red-500/30 transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {filteredCities.length === 0 && (
                <tr>
                  <td colSpan="6" className="text-center py-12 text-zinc-500 text-xs italic">
                    No cities found matching the criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Add / Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-[#111827] rounded-xl border border-zinc-800 shadow-2xl w-full max-w-lg p-6 relative animate-fadeIn">
            {/* Modal Close */}
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-4 right-4 text-zinc-500 hover:text-white text-lg font-bold transition-colors cursor-pointer p-1"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Modal Title */}
            <h3 className="text-lg font-bold text-white mb-5 flex items-center gap-2">
              <Building2 className="w-5 h-5 text-red-500" />
              {editingCity ? "Edit City" : "Add New City"}
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4 text-sm">
              {/* City Name */}
              <div>
                <label className="block text-xs font-bold text-zinc-300 uppercase mb-1.5">
                  City Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Pune, Mumbai, Bangalore"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2.5 bg-[#1f2937] border border-zinc-700 rounded-lg focus:outline-none focus:border-red-500 text-white placeholder-zinc-500 text-sm"
                />
              </div>

              {/* State */}
              <div>
                <label className="block text-xs font-bold text-zinc-300 uppercase mb-1.5">
                  State
                </label>
                <input
                  type="text"
                  placeholder="e.g. Maharashtra, Karnataka"
                  value={formData.state}
                  onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                  className="w-full px-3 py-2.5 bg-[#1f2937] border border-zinc-700 rounded-lg focus:outline-none focus:border-red-500 text-white placeholder-zinc-500 text-sm"
                />
              </div>

              {/* Cover Image Upload / URL */}
              <div>
                <label className="block text-xs font-bold text-zinc-300 uppercase mb-1.5">
                  City Cover Image
                </label>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <label className="flex-1 flex items-center justify-center gap-2 px-3 py-2.5 bg-[#1f2937] hover:bg-[#374151] border border-dashed border-zinc-600 hover:border-zinc-400 rounded-lg text-xs text-zinc-300 cursor-pointer transition-colors">
                      <Upload className="w-4 h-4 text-zinc-400" />
                      <span>{imageUploading ? "Uploading..." : "Choose Image File"}</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageFileChange}
                        disabled={imageUploading}
                        className="hidden"
                      />
                    </label>
                  </div>

                  {formData.imageUrl && (
                    <div className="flex items-center gap-3 p-2 bg-zinc-900 rounded-lg border border-zinc-800">
                      <img
                        src={formData.imageUrl}
                        alt="Preview"
                        className="w-12 h-10 object-cover rounded border border-zinc-700"
                      />
                      <span className="text-xs text-zinc-400 truncate flex-1 font-mono">
                        {formData.imageUrl}
                      </span>
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, imageUrl: "" })}
                        className="text-red-400 hover:text-red-300 p-1 text-xs"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Display Order & Active Checkbox */}
              <div className="grid grid-cols-2 gap-4 items-center pt-1">
                <div>
                  <label className="block text-xs font-bold text-zinc-300 uppercase mb-1.5">
                    Display Order (lower = first)
                  </label>
                  <input
                    type="number"
                    value={formData.displayOrder}
                    onChange={(e) => setFormData({ ...formData, displayOrder: e.target.value })}
                    className="w-full px-3 py-2 bg-[#1f2937] border border-zinc-700 rounded-lg focus:outline-none focus:border-red-500 text-white text-sm"
                  />
                </div>

                <div className="pt-4">
                  <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-zinc-300 select-none">
                    <input
                      type="checkbox"
                      checked={formData.isActive}
                      onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                      className="w-4 h-4 text-red-600 bg-zinc-800 border-zinc-600 rounded focus:ring-red-500 focus:ring-offset-0 cursor-pointer"
                    />
                    <span>Active (visible in app)</span>
                  </label>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 border-t border-zinc-800 flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-lg text-xs font-bold transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={formSubmitting || imageUploading}
                  className="flex items-center gap-1.5 px-5 py-2 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg text-xs transition-colors shadow-lg shadow-red-600/20 disabled:opacity-50 cursor-pointer"
                >
                  {formSubmitting
                    ? "Saving..."
                    : editingCity
                    ? "Update City"
                    : "Create City"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
