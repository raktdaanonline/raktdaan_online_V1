import React, { useState, useEffect } from "react";
import adminService from "../services/adminService";

export default function HospitalRegistrationRequests() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null); // for View Details Modal
  const [rejectingRequest, setRejectingRequest] = useState(null); // for Rejection Modal
  const [rejectionReason, setRejectionReason] = useState("");
  const [actionLoading, setActionLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [alert, setAlert] = useState(null);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const res = await adminService.getHospitalRequests();
      if (res.success) {
        setRequests(res.requests || []);
      }
    } catch (err) {
      console.error("Failed to load hospital requests:", err);
      showAlert("error", err.response?.data?.message || "Failed to load hospital registration requests.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const showAlert = (type, message) => {
    setAlert({ type, message });
    setTimeout(() => {
      setAlert(null);
    }, 6000);
  };

  const handleApprove = async (hospital) => {
    if (hospital.status === "APPROVED") {
      showAlert("error", "Hospital is already approved.");
      return;
    }

    if (!window.confirm(`Approve hospital "${hospital.hospitalName}" (${hospital.email})? An official approval email with login instructions will be sent automatically.`)) {
      return;
    }

    try {
      setActionLoading(true);
      const res = await adminService.approveHospital(hospital._id);
      if (res.success) {
        showAlert("success", res.message || `Hospital "${hospital.hospitalName}" approved successfully.`);
        if (selectedRequest && selectedRequest._id === hospital._id) {
          setSelectedRequest({ ...selectedRequest, status: "APPROVED" });
        }
        fetchRequests();
      }
    } catch (err) {
      console.error("Error approving hospital:", err);
      showAlert("error", err.response?.data?.message || "Failed to approve hospital registration.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleOpenReject = (hospital) => {
    setRejectingRequest(hospital);
    setRejectionReason("");
  };

  const handleConfirmReject = async (e) => {
    e.preventDefault();
    if (!rejectingRequest) return;

    try {
      setActionLoading(true);
      const res = await adminService.rejectHospital(rejectingRequest._id, rejectionReason.trim());
      if (res.success) {
        showAlert("success", res.message || `Registration for "${rejectingRequest.hospitalName}" was rejected.`);
        setRejectingRequest(null);
        setRejectionReason("");
        if (selectedRequest && selectedRequest._id === rejectingRequest._id) {
          setSelectedRequest({ ...selectedRequest, status: "REJECTED", rejectionReason: rejectionReason.trim() });
        }
        fetchRequests();
      }
    } catch (err) {
      console.error("Error rejecting hospital:", err);
      showAlert("error", err.response?.data?.message || "Failed to reject hospital registration.");
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "PENDING":
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200 flex items-center gap-1.5 w-fit">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
            PENDING APPROVAL
          </span>
        );
      case "APPROVED":
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1.5 w-fit">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
            APPROVED
          </span>
        );
      case "REJECTED":
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200 flex items-center gap-1.5 w-fit">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
            REJECTED
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700">
            {status}
          </span>
        );
    }
  };

  const filteredRequests = requests.filter((req) => {
    const matchesSearch =
      req.hospitalName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      req.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      req.address?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "ALL" || req.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const pendingCount = requests.filter((r) => r.status === "PENDING").length;

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-indigo-200">
              <span className="text-xl">🩺</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-black text-slate-800 tracking-tight">Hospital Registration Requests</h1>
                {pendingCount > 0 && (
                  <span className="px-2 py-0.5 rounded-full bg-amber-500 text-white text-xs font-black animate-pulse">
                    {pendingCount} Pending
                  </span>
                )}
              </div>
              <p className="text-sm text-slate-500 font-medium">
                Review submitted hospital registrations, examine geographical triage coordinates, and authorize portal access
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={fetchRequests}
          className="inline-flex items-center gap-2 px-3.5 py-2 text-sm font-semibold text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition shadow-sm"
        >
          <span>🔄</span> Refresh Requests
        </button>
      </div>

      {/* Floating Alert */}
      {alert && (
        <div
          className={`p-4 rounded-xl border flex items-start justify-between gap-3 shadow-sm transition-all duration-300 ${
            alert.type === "success"
              ? "bg-emerald-50 border-emerald-200 text-emerald-800"
              : "bg-rose-50 border-rose-200 text-rose-800"
          }`}
        >
          <div className="flex items-center gap-2 text-sm font-medium">
            <span>{alert.type === "success" ? "✅" : "⚠️"}</span>
            <span>{alert.message}</span>
          </div>
          <button
            onClick={() => setAlert(null)}
            className="text-slate-400 hover:text-slate-600 text-sm font-bold"
          >
            ✕
          </button>
        </div>
      )}

      {/* Requests Table Card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {/* Table Controls */}
        <div className="p-5 border-b border-slate-200 flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-slate-50/50">
          <div>
            <h2 className="text-base font-bold text-slate-800">Submitted Registration Applications</h2>
            <p className="text-xs text-slate-500">Only APPROVED hospitals are granted access to the Hospital Management Panel</p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Search Box */}
            <div className="relative">
              <span className="absolute left-3 top-2.5 text-slate-400 text-xs">🔍</span>
              <input
                type="text"
                placeholder="Search name, email, or address..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8 pr-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-medium text-slate-700 placeholder-slate-400 focus:outline-none focus:border-indigo-500 w-60"
              />
            </div>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 focus:outline-none focus:border-indigo-500"
            >
              <option value="ALL">All Statuses ({requests.length})</option>
              <option value="PENDING">Pending Approval ({pendingCount})</option>
              <option value="APPROVED">Approved</option>
              <option value="REJECTED">Rejected</option>
            </select>
          </div>
        </div>

        {/* Table Content */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 text-[11px] uppercase tracking-wider text-slate-500 font-bold border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Hospital Name</th>
                <th className="py-3 px-4">Email Address</th>
                <th className="py-3 px-4">Address</th>
                <th className="py-3 px-4">GPS Coordinates</th>
                <th className="py-3 px-4">Registration Date</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {loading ? (
                <tr>
                  <td colSpan="7" className="py-12 text-center text-slate-400">
                    <div className="inline-block w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mb-2"></div>
                    <p className="text-xs font-semibold">Loading registration requests...</p>
                  </td>
                </tr>
              ) : filteredRequests.length === 0 ? (
                <tr>
                  <td colSpan="7" className="py-12 text-center text-slate-400">
                    <span className="text-3xl block mb-2">📋</span>
                    <p className="text-sm font-semibold text-slate-600">No registration requests found</p>
                    <p className="text-xs text-slate-400 mt-1">
                      Hospitals that register using their secure invitation links will appear here for verification.
                    </p>
                  </td>
                </tr>
              ) : (
                filteredRequests.map((req) => {
                  const isPending = req.status === "PENDING";
                  const isApproved = req.status === "APPROVED";

                  return (
                    <tr key={req._id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 px-4 font-bold text-slate-800">
                        <div className="flex items-center gap-2">
                          <span className="text-indigo-600 font-normal">🏥</span>
                          <span>{req.hospitalName}</span>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 font-mono text-xs text-slate-600">
                        {req.email}
                      </td>

                      <td className="py-3.5 px-4 text-xs text-slate-600 max-w-xs truncate" title={req.address}>
                        {req.address}
                      </td>

                      <td className="py-3.5 px-4 text-xs font-mono text-slate-500">
                        {req.location?.latitude && req.location?.longitude ? (
                          <a
                            href={`https://www.google.com/maps?q=${req.location.latitude},${req.location.longitude}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-indigo-600 hover:text-indigo-800 underline decoration-indigo-300"
                            title="Open in Google Maps"
                          >
                            📍 {req.location.latitude.toFixed(4)}, {req.location.longitude.toFixed(4)}
                          </a>
                        ) : (
                          <span className="text-slate-300">N/A</span>
                        )}
                      </td>

                      <td className="py-3.5 px-4 text-xs text-slate-500">
                        {new Date(req.createdAt).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </td>

                      <td className="py-3.5 px-4">
                        {getStatusBadge(req.status)}
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {/* View Details */}
                          <button
                            onClick={() => setSelectedRequest(req)}
                            className="px-2.5 py-1 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg border border-slate-200 transition"
                          >
                            🔍 Details
                          </button>

                          {/* Quick Approve button if pending */}
                          {isPending && (
                            <button
                              onClick={() => handleApprove(req)}
                              disabled={actionLoading}
                              className="px-2.5 py-1 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-lg border border-emerald-200 transition disabled:opacity-40"
                            >
                              ✓ Approve
                            </button>
                          )}

                          {/* Quick Reject button if pending */}
                          {isPending && (
                            <button
                              onClick={() => handleOpenReject(req)}
                              disabled={actionLoading}
                              className="px-2.5 py-1 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-lg border border-rose-200 transition disabled:opacity-40"
                            >
                              ✕ Reject
                            </button>
                          )}

                          {isApproved && (
                            <span className="text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                              Active
                            </span>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* VIEW DETAILS MODAL */}
      {selectedRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-2xl w-full border border-slate-200 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-200 flex items-center justify-center text-lg text-indigo-600">
                  🏥
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-800">{selectedRequest.hospitalName}</h3>
                  <p className="text-xs text-slate-500 font-mono">{selectedRequest.email}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedRequest(null)}
                className="w-8 h-8 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200 flex items-center justify-center text-sm font-bold"
              >
                ✕
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-4 overflow-y-auto">
              {/* Status Banner */}
              <div className="flex items-center justify-between p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Application Status</span>
                <div>{getStatusBadge(selectedRequest.status)}</div>
              </div>

              {/* Rejection Note if Rejected */}
              {selectedRequest.status === "REJECTED" && selectedRequest.rejectionReason && (
                <div className="p-3.5 bg-rose-50 rounded-xl border border-rose-200 text-xs text-rose-800">
                  <span className="font-bold">Rejection Reason:</span> {selectedRequest.rejectionReason}
                </div>
              )}

              {/* Details Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-3.5 bg-slate-50/70 rounded-xl border border-slate-200">
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                    Hospital Name
                  </label>
                  <p className="text-sm font-bold text-slate-800">{selectedRequest.hospitalName}</p>
                </div>

                <div className="p-3.5 bg-slate-50/70 rounded-xl border border-slate-200">
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                    Contact Email
                  </label>
                  <p className="text-sm font-mono text-slate-700">{selectedRequest.email}</p>
                </div>

                <div className="p-3.5 bg-slate-50/70 rounded-xl border border-slate-200 md:col-span-2">
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                    Complete Physical Address
                  </label>
                  <p className="text-sm font-medium text-slate-800 leading-relaxed">{selectedRequest.address}</p>
                </div>

                <div className="p-3.5 bg-slate-50/70 rounded-xl border border-slate-200">
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                    GPS Coordinates
                  </label>
                  <p className="text-sm font-mono font-bold text-indigo-700">
                    Lat: {selectedRequest.location?.latitude} <br />
                    Lng: {selectedRequest.location?.longitude}
                  </p>
                </div>

                <div className="p-3.5 bg-slate-50/70 rounded-xl border border-slate-200">
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                    Registration Date
                  </label>
                  <p className="text-sm text-slate-700">
                    {new Date(selectedRequest.createdAt).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              </div>

              {/* Map Link / Interactive Preview Button */}
              {selectedRequest.location?.latitude && selectedRequest.location?.longitude && (
                <div className="p-4 bg-indigo-50/60 rounded-xl border border-indigo-200 flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-indigo-900">Geographical Location Verified</h4>
                    <p className="text-xs text-indigo-700">Click to view hospital positioning on Google Maps</p>
                  </div>
                  <a
                    href={`https://www.google.com/maps?q=${selectedRequest.location.latitude},${selectedRequest.location.longitude}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold transition shadow-sm"
                  >
                    📍 Open Google Maps
                  </a>
                </div>
              )}
            </div>

            {/* Modal Footer Actions */}
            <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-end gap-3">
              <button
                onClick={() => setSelectedRequest(null)}
                className="px-4 py-2 text-xs font-bold text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-100 transition"
              >
                Close
              </button>

              {selectedRequest.status !== "APPROVED" && (
                <button
                  onClick={() => handleApprove(selectedRequest)}
                  disabled={actionLoading}
                  className="px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-md shadow-emerald-200 transition flex items-center gap-1.5"
                >
                  ✓ Approve Hospital
                </button>
              )}

              {selectedRequest.status !== "REJECTED" && (
                <button
                  onClick={() => handleOpenReject(selectedRequest)}
                  disabled={actionLoading}
                  className="px-4 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-md shadow-rose-200 transition flex items-center gap-1.5"
                >
                  ✕ Reject Hospital
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* REJECTION REASON MODAL */}
      {rejectingRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-md w-full border border-slate-200 shadow-2xl p-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-600 text-lg">
                ⚠️
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-800">Reject Hospital Registration</h3>
                <p className="text-xs text-slate-500 font-medium">{rejectingRequest.hospitalName}</p>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Please enter an optional reason for rejecting this hospital registration. An email notification will be sent informing them of this decision.
            </p>

            <form onSubmit={handleConfirmReject} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-600 block mb-1">
                  Rejection Reason (Optional)
                </label>
                <textarea
                  rows="3"
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="e.g. Incomplete hospital documentation or unverifiable emergency triage coordinates."
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:border-rose-500 focus:bg-white transition"
                ></textarea>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setRejectingRequest(null)}
                  className="px-3.5 py-2 text-xs font-bold text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-100 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-4 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-md shadow-rose-200 transition"
                >
                  {actionLoading ? "Rejecting..." : "Confirm Rejection"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
