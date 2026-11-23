import React, { useState, useEffect } from "react";
import adminService from "../services/adminService";

export default function InviteHospital() {
  const [hospitalName, setHospitalName] = useState("");
  const [email, setEmail] = useState("");
  const [invitations, setInvitations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [actionLoadingId, setActionLoadingId] = useState(null);
  const [copiedId, setCopiedId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [alert, setAlert] = useState(null); // { type: 'success' | 'error', message: '' }

  const fetchInvitations = async () => {
    try {
      setLoading(true);
      const res = await adminService.getHospitalInvitations();
      if (res.success) {
        setInvitations(res.invitations || []);
      }
    } catch (err) {
      console.error("Failed to load invitations:", err);
      showAlert("error", err.response?.data?.message || "Failed to load invitations list.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvitations();
  }, []);

  const showAlert = (type, message) => {
    setAlert({ type, message });
    setTimeout(() => {
      setAlert(null);
    }, 6000);
  };

  const handleSendInvite = async (e) => {
    e.preventDefault();
    if (!hospitalName.trim() || !email.trim()) {
      showAlert("error", "Please provide both Hospital Name and Hospital Email Address.");
      return;
    }

    try {
      setSubmitting(true);
      const res = await adminService.inviteHospital({
        hospitalName: hospitalName.trim(),
        email: email.trim(),
      });

      if (res.success) {
        showAlert(
          "success",
          res.message || `Invitation successfully sent to ${email.trim()}! A secure registration link is active for 48 hours.`
        );
        setHospitalName("");
        setEmail("");
        fetchInvitations();
      } else {
        showAlert("error", res.message || "Failed to send invitation.");
      }
    } catch (err) {
      console.error("Error sending invite:", err);
      showAlert("error", err.response?.data?.message || "Failed to send invitation. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleCopyLink = async (invitation) => {
    try {
      setActionLoadingId(invitation._id);
      let link = invitation.registrationUrl;

      if (!link) {
        const res = await adminService.getHospitalInvitationLink(invitation._id);
        if (res.success && res.registrationUrl) {
          link = res.registrationUrl;
          setInvitations((prev) =>
            prev.map((item) =>
              item._id === invitation._id ? { ...item, registrationUrl: link } : item
            )
          );
        }
      }

      if (!link) {
        showAlert("error", "Could not retrieve the invitation link.");
        return;
      }

      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(link);
      } else {
        const textArea = document.createElement("textarea");
        textArea.value = link;
        textArea.style.position = "fixed";
        textArea.style.left = "-999999px";
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand("copy");
        document.body.removeChild(textArea);
      }

      setCopiedId(invitation._id);
      showAlert("success", `📋 Registration link copied to clipboard for ${invitation.hospitalName}!`);
      setTimeout(() => {
        setCopiedId(null);
      }, 3000);
    } catch (err) {
      console.error("Failed to copy link:", err);
      showAlert("error", "Failed to copy link to clipboard.");
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleResend = async (invitation) => {
    if (invitation.invitationStatus === "REGISTERED") {
      showAlert("error", "This hospital is already registered.");
      return;
    }

    if (!window.confirm(`Resend a fresh 48-hour invitation email to ${invitation.hospitalName} (${invitation.email})?`)) {
      return;
    }

    try {
      setActionLoadingId(invitation._id);
      const res = await adminService.resendHospitalInvitation(invitation._id);
      if (res.success) {
        showAlert("success", res.message || `Fresh invitation successfully dispatched to ${invitation.email}.`);
        fetchInvitations();
      }
    } catch (err) {
      console.error("Error resending invite:", err);
      showAlert("error", err.response?.data?.message || "Failed to resend invitation.");
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleCancel = async (invitation) => {
    if (invitation.invitationStatus === "REGISTERED") {
      showAlert("error", "Cannot cancel an invitation that is already registered.");
      return;
    }

    if (!window.confirm(`Are you sure you want to cancel the invitation for ${invitation.hospitalName}? The registration link will become immediately invalid.`)) {
      return;
    }

    try {
      setActionLoadingId(invitation._id);
      const res = await adminService.cancelHospitalInvitation(invitation._id);
      if (res.success) {
        showAlert("success", `Invitation for ${invitation.hospitalName} was cancelled.`);
        fetchInvitations();
      }
    } catch (err) {
      console.error("Error cancelling invite:", err);
      showAlert("error", err.response?.data?.message || "Failed to cancel invitation.");
    } finally {
      setActionLoadingId(null);
    }
  };

  // Status badge styling helper
  const getStatusBadge = (status) => {
    switch (status) {
      case "INVITED":
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200 flex items-center gap-1.5 w-fit">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse"></span>
            INVITED
          </span>
        );
      case "REGISTERED":
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1.5 w-fit">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
            REGISTERED
          </span>
        );
      case "EXPIRED":
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200 flex items-center gap-1.5 w-fit">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
            EXPIRED
          </span>
        );
      case "CANCELLED":
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200 flex items-center gap-1.5 w-fit">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
            CANCELLED
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

  // Filtered invitations list
  const filteredInvitations = invitations.filter((inv) => {
    const matchesSearch =
      inv.hospitalName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inv.email?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "ALL" || inv.invitationStatus === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-rose-500 to-rose-600 flex items-center justify-center text-white shadow-md shadow-rose-200">
              <span className="text-xl">🏥</span>
            </div>
            <div>
              <h1 className="text-2xl font-black text-slate-800 tracking-tight">Invite Hospital</h1>
              <p className="text-sm text-slate-500 font-medium">
                Issue secure, time-limited onboarding invitations to accredited hospital trauma desks
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={fetchInvitations}
          className="inline-flex items-center gap-2 px-3.5 py-2 text-sm font-semibold text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition shadow-sm"
        >
          <span>🔄</span> Refresh List
        </button>
      </div>

      {/* Floating Alert Message */}
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

      {/* Invitation Form Card */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
        <div className="flex items-center gap-2 pb-4 mb-4 border-b border-slate-100">
          <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span>
          <h2 className="text-base font-bold text-slate-800">Send New Hospital Invitation</h2>
          <span className="text-xs text-slate-400 font-medium ml-auto">Valid for 48 Hours upon generation</span>
        </div>

        <form onSubmit={handleSendInvite} className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
          <div className="md:col-span-5 space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-600">
              Hospital Name <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-3 text-slate-400">🏥</span>
              <input
                type="text"
                placeholder="e.g. Ruby Hall Clinic / AIIMS Trauma Center"
                value={hospitalName}
                onChange={(e) => setHospitalName(e.target.value)}
                required
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:border-rose-500 focus:bg-white transition"
              />
            </div>
          </div>

          <div className="md:col-span-5 space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-600">
              Hospital Email Address <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-3 text-slate-400">✉️</span>
              <input
                type="email"
                placeholder="e.g. emergency@hospital.org"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:border-rose-500 focus:bg-white transition"
              />
            </div>
          </div>

          <div className="md:col-span-2">
            <button
              type="submit"
              disabled={submitting}
              className="w-full py-2.5 px-4 bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-700 hover:to-rose-800 text-white font-bold text-sm rounded-xl shadow-md shadow-rose-200 disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center justify-center gap-2"
            >
              {submitting ? (
                <>
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                  <span>Sending...</span>
                </>
              ) : (
                <>
                  <span>📨</span>
                  <span>Send Invitation</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Invitation Management Table Section */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {/* Table Controls Header */}
        <div className="p-5 border-b border-slate-200 flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-slate-50/50">
          <div>
            <h2 className="text-base font-bold text-slate-800">Hospital Invitations Directory</h2>
            <p className="text-xs text-slate-500">Track sent invitations, validity windows, and registration progress</p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Search Box */}
            <div className="relative">
              <span className="absolute left-3 top-2.5 text-slate-400 text-xs">🔍</span>
              <input
                type="text"
                placeholder="Search hospital or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8 pr-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-medium text-slate-700 placeholder-slate-400 focus:outline-none focus:border-rose-500 w-52"
              />
            </div>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 focus:outline-none focus:border-rose-500"
            >
              <option value="ALL">All Statuses ({invitations.length})</option>
              <option value="INVITED">INVITED</option>
              <option value="REGISTERED">REGISTERED</option>
              <option value="EXPIRED">EXPIRED</option>
              <option value="CANCELLED">CANCELLED</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 text-[11px] uppercase tracking-wider text-slate-500 font-bold border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Hospital Name</th>
                <th className="py-3 px-4">Email Address</th>
                <th className="py-3 px-4">Invitation Date</th>
                <th className="py-3 px-4">Expires At</th>
                <th className="py-3 px-4">Invitation Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {loading ? (
                <tr>
                  <td colSpan="6" className="py-12 text-center text-slate-400">
                    <div className="inline-block w-6 h-6 border-2 border-rose-500 border-t-transparent rounded-full animate-spin mb-2"></div>
                    <p className="text-xs font-semibold">Loading hospital invitations...</p>
                  </td>
                </tr>
              ) : filteredInvitations.length === 0 ? (
                <tr>
                  <td colSpan="6" className="py-12 text-center text-slate-400">
                    <span className="text-3xl block mb-2">📭</span>
                    <p className="text-sm font-semibold text-slate-600">No invitations found</p>
                    <p className="text-xs text-slate-400 mt-1">
                      {searchTerm || statusFilter !== "ALL"
                        ? "Try clearing your filters or search keywords."
                        : "Use the form above to invite your first hospital partner."}
                    </p>
                  </td>
                </tr>
              ) : (
                filteredInvitations.map((inv) => {
                  const isActionLoading = actionLoadingId === inv._id;
                  const isRegistered = inv.invitationStatus === "REGISTERED";
                  const isCancelled = inv.invitationStatus === "CANCELLED";

                  return (
                    <tr key={inv._id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 px-4 font-bold text-slate-800">
                        <div className="flex items-center gap-2">
                          <span className="text-rose-500 font-normal">🏥</span>
                          <span>{inv.hospitalName}</span>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 font-mono text-xs text-slate-600">
                        {inv.email}
                      </td>

                      <td className="py-3.5 px-4 text-xs text-slate-500">
                        {new Date(inv.invitedAt || inv.createdAt).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </td>

                      <td className="py-3.5 px-4 text-xs text-slate-500">
                        {inv.invitationExpiresAt ? (
                          new Date(inv.invitationExpiresAt).toLocaleDateString("en-IN", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })
                        ) : (
                          <span className="text-slate-300">-</span>
                        )}
                      </td>

                      <td className="py-3.5 px-4">
                        {getStatusBadge(inv.invitationStatus)}
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {/* Copy Link Action */}
                          {!isRegistered && !isCancelled && (
                            <button
                              onClick={() => handleCopyLink(inv)}
                              disabled={isActionLoading}
                              title="Copy registration link to clipboard"
                              className={`px-2.5 py-1 text-xs font-semibold rounded-lg border transition flex items-center gap-1 shadow-xs ${
                                copiedId === inv._id
                                  ? "bg-emerald-600 text-white border-emerald-600"
                                  : "text-blue-700 bg-blue-50 hover:bg-blue-100 border-blue-200"
                              }`}
                            >
                              {copiedId === inv._id ? (
                                <>
                                  <span>✓</span>
                                  <span>Copied!</span>
                                </>
                              ) : (
                                <>
                                  <span>📋</span>
                                  <span>Copy Link</span>
                                </>
                              )}
                            </button>
                          )}

                          {/* Resend Action */}
                          {!isRegistered && (
                            <button
                              onClick={() => handleResend(inv)}
                              disabled={isActionLoading}
                              title="Resend invitation email with fresh 48-hour token"
                              className="px-2.5 py-1 text-xs font-semibold text-rose-600 bg-rose-50 hover:bg-rose-100 rounded-lg border border-rose-200 transition disabled:opacity-40"
                            >
                              {isActionLoading && copiedId !== inv._id ? "..." : "🔄 Resend"}
                            </button>
                          )}

                          {/* Cancel Action */}
                          {!isRegistered && !isCancelled && (
                            <button
                              onClick={() => handleCancel(inv)}
                              disabled={isActionLoading}
                              title="Cancel invitation and invalidate token"
                              className="px-2.5 py-1 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg border border-slate-200 transition disabled:opacity-40"
                            >
                              ✕ Cancel
                            </button>
                          )}

                          {isRegistered && (
                            <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                              ✓ Completed
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
    </div>
  );
}
