import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import organizerService from "../services/organizerService";
import { QRCodeCanvas } from "qrcode.react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const OrganizerDashboard = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem("organizer-token");

  const [organizer, setOrganizer] = useState(null);

  const [myCamps, setMyCamps] = useState([]);
  const [selectedCampId, setSelectedCampId] = useState("");
  const [donors, setDonors] = useState([]);

  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showQR, setShowQR] = useState(false);

  // Edit states
  const [editDonorId, setEditDonorId] = useState(null);
  const [editForm, setEditForm] = useState({});

  // Bulk selection + per-row updating
  const [selectedIds, setSelectedIds] = useState(() => new Set());
  const [updatingIds, setUpdatingIds] = useState(() => new Set());

  // ✅ Toasts (replace all alert())
  const [toasts, setToasts] = useState([]);

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const notify = ({
    type = "info",
    title = "Notice",
    message = "",
    duration = 2500,
  }) => {
    const id =
      (window.crypto?.randomUUID && window.crypto.randomUUID()) ||
      `${Date.now()}-${Math.random()}`;

    setToasts((prev) => [...prev, { id, type, title, message }]);

    if (duration !== null) {
      setTimeout(() => removeToast(id), duration);
    }
  };

  useEffect(() => {
    if (!token) {
      navigate("/organizer-login");
      return;
    }
    fetchProfile();
    fetchCamps();
    // eslint-disable-next-line
  }, []);

  const fetchProfile = async () => {
    try {
      const data = await organizerService.getProfile();
      setOrganizer(data);
    } catch (err) {
      console.error("Failed to fetch profile", err);
      notify({
        type: "danger",
        title: "Error",
        message: "Failed to load organizer profile.",
      });
    }
  };

  const fetchCamps = async () => {
    try {
      const data = await organizerService.getMyCamps();
      const campsList = data || [];
      setMyCamps(campsList);

      if (campsList.length > 0) {
        setSelectedCampId(campsList[0]._id);
      } else {
        setLoading(false);
      }
    } catch (err) {
      console.error(err);
      if (err.response?.status === 401) logout();
      notify({
        type: "danger",
        title: "Error",
        message: "Failed to load camps.",
      });
    }
  };

  useEffect(() => {
    if (!selectedCampId) return;
    fetchDonors(selectedCampId);
    // eslint-disable-next-line
  }, [selectedCampId]);

  const fetchDonors = async (campId) => {
    setLoading(true);
    try {
      const data = await organizerService.getMyDonors(campId);
      setDonors(data || []);
      setSelectedIds(new Set()); // reset selection on camp change
    } catch (err) {
      console.error(err);
      notify({
        type: "danger",
        title: "Error",
        message: "Failed to load donors.",
      });
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem("organizer-token");
    notify({
      type: "info",
      title: "Logged out",
      message: "You have been logged out.",
    });
    navigate("/organizer-login");
  };

  const currentCamp = myCamps.find((c) => c._id === selectedCampId) || null;

  const registrationLink = currentCamp
    ? `${window.location.origin}/register?campId=${currentCamp._id}`
    : "";

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(registrationLink);
      notify({
        type: "success",
        title: "Copied",
        message: "Registration link copied to clipboard ✅",
      });
    } catch {
      notify({
        type: "danger",
        title: "Failed",
        message: "Copy failed. Please try again.",
      });
    }
  };

  // helper: build safe payload for PUT
  const buildDonorPayload = (base, updates = {}) => {
    const merged = { ...base, ...updates };
    return {
      name: merged.name,
      bloodGroup: merged.bloodGroup,
      age: merged.age,
      weight: merged.weight,
      email: merged.email,
      phone: merged.phone,
      address: merged.address,
      dob: merged.dob,
      remark: merged.remark || "Pending",
    };
  };

  // quick remark update
  const updateRemark = async (id, remark, { silent = false } = {}) => {
    const base = donors.find((d) => d._id === id);
    if (!base) return;

    setUpdatingIds((prev) => new Set(prev).add(id));
    try {
      const payload = buildDonorPayload(base, { remark });
      await organizerService.updateCampDonor(id, payload);

      setDonors((prev) =>
        prev.map((d) => (d._id === id ? { ...d, remark } : d))
      );

      if (!silent) {
        notify({
          type: "success",
          title: "Updated",
          message: "Status updated ✅",
        });
      }
    } catch (err) {
      console.error(err);
      if (!silent) {
        notify({
          type: "danger",
          title: "Failed",
          message: "Status update failed ❌",
        });
      }
    } finally {
      setUpdatingIds((prev) => {
        const n = new Set(prev);
        n.delete(id);
        return n;
      });
    }
  };

  // ---- EDIT HANDLERS ----
  const startEdit = (d) => {
    setEditDonorId(d._id);
    setEditForm({
      name: d.name,
      bloodGroup: d.bloodGroup,
      age: d.age,
      weight: d.weight,
      email: d.email,
      phone: d.phone,
      address: d.address,
      dob: d.dob ? String(d.dob).split("T")[0] : "",
      remark: d.remark || "Pending",
    });
  };

  const cancelEdit = () => {
    setEditDonorId(null);
    setEditForm({});
  };

  const handleEditChange = (e) => {
    setEditForm({ ...editForm, [e.target.name]: e.target.value });
  };

  const saveEdit = async (id) => {
    const base = donors.find((d) => d._id === id);
    if (!base) return;

    try {
      const payload = buildDonorPayload(base, editForm);
      await organizerService.updateCampDonor(id, payload);

      setDonors((prev) =>
        prev.map((d) => (d._id === id ? { ...d, ...editForm } : d))
      );
      setEditDonorId(null);

      notify({
        type: "success",
        title: "Saved",
        message: "Donor updated successfully ✅",
      });
    } catch (err) {
      console.error(err);
      notify({
        type: "danger",
        title: "Failed",
        message: "Update failed ❌",
      });
    }
  };

  const deleteDonor = async (id) => {
    if (!window.confirm("Delete this donor?")) return;
    try {
      await organizerService.deleteCampDonor(id);
      setDonors((prev) => prev.filter((d) => d._id !== id));

      setSelectedIds((prev) => {
        const n = new Set(prev);
        n.delete(id);
        return n;
      });

      notify({
        type: "success",
        title: "Deleted",
        message: "Donor deleted successfully.",
      });
    } catch (err) {
      console.error(err);
      notify({
        type: "danger",
        title: "Failed",
        message: "Failed to delete donor.",
      });
    }
  };

  // ---- PDF GENERATION ----
  const downloadPDF = () => {
    if (!currentCamp) return;

    try {
      const doc = new jsPDF("l");
      doc.text(`Donor Report: ${currentCamp.name}`, 14, 15);

      const rows = donors.map((d, i) => [
        i + 1,
        d.name,
        d.bloodGroup,
        d.age,
        `${d.weight || ""} kg`,
        d.phone,
        d.address,
        d.remark || "Pending",
      ]);

      autoTable(doc, {
        head: [
          ["#", "Name", "Blood", "Age", "Weight", "Phone", "Address", "Status"],
        ],
        body: rows,
        startY: 25,
      });

      doc.save(`Report_${currentCamp.name}.pdf`);

      notify({
        type: "success",
        title: "Downloaded",
        message: "PDF report downloaded ✅",
      });
    } catch (err) {
      console.error(err);
      notify({
        type: "danger",
        title: "Failed",
        message: "Failed to generate PDF.",
      });
    }
  };

  const filteredDonors = donors.filter((d) => {
    const nm = (d.name || "").toLowerCase();
    const ph = String(d.phone || "");
    const s = search.toLowerCase();
    return nm.includes(s) || ph.includes(search);
  });

  // Bulk selection helpers
  const isAllSelected =
    filteredDonors.length > 0 &&
    filteredDonors.every((d) => selectedIds.has(d._id));

  const toggleSelectAll = () => {
    setSelectedIds((prev) => {
      const n = new Set(prev);
      if (isAllSelected) return new Set();
      filteredDonors.forEach((d) => n.add(d._id));
      return n;
    });
  };

  const toggleSelectOne = (id) => {
    setSelectedIds((prev) => {
      const n = new Set(prev);
      n.has(id) ? n.delete(id) : n.add(id);
      return n;
    });
  };

  const markSelectedDone = async () => {
    const ids = Array.from(selectedIds);

    if (ids.length === 0) {
      return notify({
        type: "warning",
        title: "Select",
        message: "Please select donors first.",
      });
    }

    if (!window.confirm(`Mark ${ids.length} donor(s) as Donated?`)) return;

    try {
      await Promise.all(
        ids.map((id) => updateRemark(id, "Donated", { silent: true }))
      );

      notify({
        type: "success",
        title: "Done",
        message: "Selected donors marked as Donated ✅",
      });

      setSelectedIds(new Set());
    } catch {
      notify({
        type: "danger",
        title: "Failed",
        message: "Some updates failed ❌",
      });
    }
  };

  return (
    <div className="container-fluid py-3 py-md-4 bg-light min-vh-100">
      {/* ✅ Toast Container */}
      <div
        className="toast-container position-fixed top-0 end-0 p-3"
        style={{ zIndex: 2000 }}
      >
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`toast show border-0 shadow mb-2 text-bg-${t.type}`}
            role="alert"
            aria-live="assertive"
            aria-atomic="true"
          >
            <div className="toast-header">
              <strong className="me-auto">{t.title}</strong>
              <button
                type="button"
                className="btn-close"
                onClick={() => removeToast(t.id)}
              />
            </div>
            <div className="toast-body">{t.message}</div>
          </div>
        ))}
      </div>

      {/* small responsive helpers */}
      <style>{`
        @media (min-width: 768px){
          .border-md-start{ border-left: 1px solid var(--bs-border-color) !important; }
          .w-md-auto{ width: auto !important; }
        }
      `}</style>

      {/* Header */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-2 mb-3 mb-md-4 px-2 px-md-3">
        <h2 className="text-danger fw-bold m-0">Organizer Dashboard</h2>
        <button className="btn btn-dark w-100 w-md-auto" onClick={logout}>
          Logout
        </button>
      </div>

      {/* INFO CARDS */}
      <div className="row g-3 g-md-4 px-2 px-md-3 mb-3 mb-md-4">
        {/* Organizer Profile */}
        <div className="col-12 col-md-4">
          <div className="card shadow-sm h-100 border-0">
            <div className="card-header bg-white border-bottom-0 pt-3">
              <h5 className="text-secondary mb-0">My Profile</h5>
            </div>
            <div className="card-body">
              {organizer ? (
                <div>
                  <h4 className="card-title text-primary mb-1 text-break">
                    {organizer.name}
                  </h4>
                  <p className="text-muted mb-3 small text-break">
                    Organizer ID: {organizer._id}
                  </p>

                  <div className="d-flex flex-column gap-2">
                    <div className="d-flex align-items-center text-break">
                      <span className="me-2">📧</span>
                      <span className="text-break">{organizer.email}</span>
                    </div>
                    <div className="d-flex align-items-center">
                      <span className="me-2">📞</span>
                      <span>{organizer.phone}</span>
                    </div>
                    <div className="mt-2">
                      <span
                        className={`badge ${
                          organizer.isActive ? "bg-success" : "bg-secondary"
                        }`}
                      >
                        {organizer.isActive ? "Active Account" : "Inactive"}
                      </span>
                    </div>
                  </div>
                </div>
              ) : (
                <p className="mb-0">Loading profile...</p>
              )}
            </div>
          </div>
        </div>

        {/* Camp Details */}
        <div className="col-12 col-md-8">
          <div className="card shadow-sm h-100 border-0">
            <div className="card-header bg-danger text-white d-flex flex-column flex-sm-row gap-2 justify-content-between align-items-sm-center">
              <h5 className="mb-0">Selected Camp Details</h5>
              {myCamps.length > 0 && (
                <select
                  className="form-select form-select-sm text-dark w-100 w-md-auto"
                  value={selectedCampId}
                  onChange={(e) => setSelectedCampId(e.target.value)}
                >
                  {myCamps.map((camp) => (
                    <option key={camp._id} value={camp._id}>
                      {camp.name}
                    </option>
                  ))}
                </select>
              )}
            </div>

            <div className="card-body">
              {currentCamp ? (
                <div className="row g-3">
                  <div className="col-12 col-md-6">
                    <h3 className="card-title mb-2 mb-md-3 text-break">
                      {currentCamp.name}
                    </h3>
                    <p className="mb-1">
                      <strong>📅 Date:</strong>{" "}
                      {new Date(currentCamp.date).toLocaleDateString()}
                    </p>
                    <p className="mb-1 text-break">
                      <strong>📍 Location:</strong> {currentCamp.location}
                    </p>
                    <p className="mb-1 text-break">
                      <strong>🏥 Hospital:</strong> {currentCamp.hospitalName}
                    </p>
                  </div>

                  <div className="col-12 col-md-6 border-md-start">
                    <p className="mb-1 text-break">
                      <strong>👤 PRO Name:</strong> {currentCamp.proName}
                    </p>
                    <p className="mb-1">
                      <strong>📞 Contact:</strong>{" "}
                      {currentCamp.organizerContact}
                    </p>

                    <hr />

                    <div className="d-flex gap-2 flex-wrap">
                      <button
                        className="btn btn-sm btn-outline-primary"
                        onClick={copyLink}
                      >
                        Copy Link
                      </button>
                      <button
                        className="btn btn-sm btn-outline-success"
                        onClick={downloadPDF}
                      >
                        PDF Report
                      </button>
                      <button
                        className="btn btn-sm btn-outline-dark"
                        onClick={() => setShowQR(!showQR)}
                      >
                        {showQR ? "Hide QR" : "Show QR"}
                      </button>
                    </div>

                    {showQR && (
                      <div className="mt-2 p-2 border bg-light d-inline-block rounded">
                        <QRCodeCanvas value={registrationLink} size={90} />
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="text-center py-4 text-muted">
                  {myCamps.length === 0
                    ? "No camps assigned to you yet."
                    : "Select a camp to view details."}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Donors List */}
      <div className="px-2 px-md-3">
        <div className="card shadow-sm border-0">
          <div className="card-header bg-white py-3 d-flex flex-column flex-md-row gap-2 justify-content-between align-items-md-center">
            <div className="d-flex flex-wrap gap-2 align-items-center">
              <h4 className="mb-0">
                Donors List{" "}
                <span className="badge bg-secondary ms-2">{donors.length}</span>
              </h4>

              <button
                className="btn btn-sm btn-success"
                onClick={markSelectedDone}
                disabled={selectedIds.size === 0}
                title="Mark selected donors as Donated"
              >
                Mark Done ({selectedIds.size})
              </button>
            </div>

            <input
              className="form-control w-100 w-md-auto"
              style={{ maxWidth: 320 }}
              placeholder="Search donor name / phone..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="card-body p-0">
            <div className="table-responsive">
              <table className="table table-hover table-striped mb-0 align-middle">
                <thead className="table-light">
                  <tr>
                    <th style={{ width: 44 }}>
                      <input
                        type="checkbox"
                        checked={isAllSelected}
                        onChange={toggleSelectAll}
                        title="Select all"
                      />
                    </th>
                    <th>#</th>
                    <th>Name</th>

                    <th className="d-none d-lg-table-cell">Age</th>
                    <th className="d-none d-lg-table-cell">Weight</th>

                    <th>Blood</th>
                    <th>Phone</th>

                    <th className="d-none d-md-table-cell">Address</th>

                    <th>Status</th>
                    <th style={{ minWidth: 120 }}>Action</th>
                  </tr>
                </thead>

                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan="10" className="text-center py-4 text-muted">
                        Loading donors...
                      </td>
                    </tr>
                  ) : filteredDonors.length > 0 ? (
                    filteredDonors.map((d, i) => (
                      <tr key={d._id}>
                        <td>
                          <input
                            type="checkbox"
                            checked={selectedIds.has(d._id)}
                            onChange={() => toggleSelectOne(d._id)}
                          />
                        </td>
                        <td>{i + 1}</td>

                        <td style={{ minWidth: 160 }}>
                          {editDonorId === d._id ? (
                            <input
                              className="form-control form-control-sm"
                              name="name"
                              value={editForm.name}
                              onChange={handleEditChange}
                            />
                          ) : (
                            <span className="fw-medium text-break">
                              {d.name}
                            </span>
                          )}
                        </td>

                        <td className="d-none d-lg-table-cell">
                          {editDonorId === d._id ? (
                            <input
                              className="form-control form-control-sm"
                              type="number"
                              name="age"
                              value={editForm.age}
                              onChange={handleEditChange}
                              style={{ width: 70 }}
                            />
                          ) : (
                            d.age
                          )}
                        </td>

                        <td className="d-none d-lg-table-cell">
                          {editDonorId === d._id ? (
                            <input
                              className="form-control form-control-sm"
                              type="number"
                              name="weight"
                              value={editForm.weight}
                              onChange={handleEditChange}
                              style={{ width: 80 }}
                            />
                          ) : (
                            `${d.weight || ""} kg`
                          )}
                        </td>

                        <td>
                          {editDonorId === d._id ? (
                            <select
                              className="form-select form-select-sm"
                              name="bloodGroup"
                              value={editForm.bloodGroup}
                              onChange={handleEditChange}
                            >
                              {[
                                "A+",
                                "A-",
                                "B+",
                                "B-",
                                "AB+",
                                "AB-",
                                "O+",
                                "O-",
                                "Unknown",
                              ].map((bg) => (
                                <option key={bg} value={bg}>
                                  {bg}
                                </option>
                              ))}
                            </select>
                          ) : (
                            <span className="badge bg-danger">
                              {d.bloodGroup}
                            </span>
                          )}
                        </td>

                        <td style={{ whiteSpace: "nowrap" }}>
                          {editDonorId === d._id ? (
                            <input
                              className="form-control form-control-sm"
                              name="phone"
                              value={editForm.phone}
                              onChange={handleEditChange}
                            />
                          ) : (
                            d.phone
                          )}
                        </td>

                        <td
                          className="d-none d-md-table-cell"
                          style={{ maxWidth: 220 }}
                        >
                          {editDonorId === d._id ? (
                            <input
                              className="form-control form-control-sm"
                              name="address"
                              value={editForm.address}
                              onChange={handleEditChange}
                            />
                          ) : (
                            <span
                              className="text-truncate d-inline-block"
                              style={{ maxWidth: 220 }}
                            >
                              {d.address}
                            </span>
                          )}
                        </td>

                        <td style={{ minWidth: 220 }}>
                          <div className="d-flex gap-2 align-items-center flex-wrap">
                            <select
                              className="form-select form-select-sm"
                              style={{ width: 140 }}
                              value={d.remark || "Pending"}
                              onChange={(e) =>
                                updateRemark(d._id, e.target.value)
                              }
                              disabled={updatingIds.has(d._id)}
                              title="Change status"
                            >
                              <option value="Pending">Pending</option>
                              <option value="Donated">Donated (Done)</option>
                              <option value="Rejected">Rejected</option>
                            </select>

                            <button
                              className="btn btn-sm btn-success"
                              onClick={() => updateRemark(d._id, "Donated")}
                              disabled={
                                updatingIds.has(d._id) ||
                                (d.remark || "Pending") === "Donated"
                              }
                              title="One click Done"
                            >
                              Done
                            </button>

                            <span
                              className={`badge ${
                                (d.remark || "Pending") === "Donated"
                                  ? "bg-success"
                                  : (d.remark || "Pending") === "Rejected"
                                  ? "bg-secondary"
                                  : "bg-warning text-dark"
                              }`}
                            >
                              {d.remark || "Pending"}
                            </span>
                          </div>
                        </td>

                        <td>
                          {editDonorId === d._id ? (
                            <div className="btn-group">
                              <button
                                className="btn btn-sm btn-success"
                                onClick={() => saveEdit(d._id)}
                              >
                                ✓
                              </button>
                              <button
                                className="btn btn-sm btn-secondary"
                                onClick={cancelEdit}
                              >
                                ✕
                              </button>
                            </div>
                          ) : (
                            <div className="btn-group">
                              <button
                                className="btn btn-sm btn-outline-primary"
                                onClick={() => startEdit(d)}
                                title="Edit"
                              >
                                ✎
                              </button>
                              <button
                                className="btn btn-sm btn-outline-danger"
                                onClick={() => deleteDonor(d._id)}
                                title="Delete"
                              >
                                🗑
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="10" className="text-center py-4 text-muted">
                        No donors found matching your search.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrganizerDashboard;
