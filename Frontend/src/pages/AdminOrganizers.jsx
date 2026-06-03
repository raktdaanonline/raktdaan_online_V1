import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import adminService from "../services/adminService";
// CSS migrated to Tailwind

const AdminOrganizers = () => {
  const [organizers, setOrganizers] = useState([]);
  const [loading, setLoading] = useState(true);

  // ✅ Edit State
  const [editId, setEditId] = useState(null);
  const [editForm, setEditForm] = useState({});

  const navigate = useNavigate();
  const token = localStorage.getItem("admin-token");

  useEffect(() => {
    if (!token) {
      navigate("/admin-login");
      return;
    }
    fetchOrganizers();
    // eslint-disable-next-line
  }, []);

  const fetchOrganizers = async () => {
    try {
      const data = await adminService.getOrganizers();
      setOrganizers(data || []);
    } catch (err) {
      console.error(err);
      if (err.response?.status === 401) navigate("/admin-login");
    } finally {
      setLoading(false);
    }
  };

  // ✅ 1. START EDITING
  const handleEditClick = (org) => {
    setEditId(org._id);
    setEditForm({
      name: org.name,
      phone: org.phone,
      isActive: org.isActive,
    });
  };

  // ✅ 2. HANDLE INPUT CHANGE
  const handleChange = (e) => {
    const value =
      e.target.type === "checkbox" ? e.target.checked : e.target.value;
    setEditForm({ ...editForm, [e.target.name]: value });
  };

  // ✅ 3. SAVE CHANGES (PUT)
  const handleSave = async (id) => {
    try {
      await adminService.updateOrganizer(id, editForm);

      // Update local state without refreshing
      setOrganizers((prev) =>
        prev.map((org) => (org._id === id ? { ...org, ...editForm } : org))
      );

      setEditId(null);
      alert("✅ Updated successfully!");
    } catch (err) {
      alert("Error updating organizer");
      console.error(err);
    }
  };

  // ✅ 4. DELETE ORGANIZER
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure? This action cannot be undone.")) return;

    try {
      await adminService.deleteOrganizer(id);

      setOrganizers((prev) => prev.filter((org) => org._id !== id));
      alert("✅ Deleted successfully!");
    } catch (err) {
      alert("Error deleting organizer");
      console.error(err);
    }
  };

  return (
    <div className="container py-4">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="text-danger">Manage Organizers</h2>
        <button
          className="btn btn-outline-secondary"
          onClick={() => navigate("/admin")}
        >
          &larr; Back to Dashboard
        </button>
      </div>

      {loading ? (
        <p>Loading details...</p>
      ) : (
        <div className="table-responsive shadow-sm rounded">
          <table className="table table-hover table-bordered align-middle mb-0">
            <thead className="table-dark">
              <tr>
                <th style={{ width: "5%" }}>#</th>
                <th style={{ width: "15%" }}>Name</th>
                <th style={{ width: "20%" }}>Contact / Email</th>
                <th style={{ width: "10%" }}>Status</th>
                <th style={{ width: "35%" }}>Assigned Camps Details</th>{" "}
                {/* widened column */}
                <th style={{ width: "15%" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {organizers.length > 0 ? (
                organizers.map((org, index) => (
                  <tr
                    key={org._id}
                    className={!org.isActive ? "table-light text-muted" : ""}
                  >
                    <td>{index + 1}</td>

                    {/* Name Field */}
                    <td>
                      {editId === org._id ? (
                        <input
                          className="form-control form-control-sm"
                          name="name"
                          value={editForm.name}
                          onChange={handleChange}
                        />
                      ) : (
                        <span className="fw-bold">{org.name}</span>
                      )}
                    </td>

                    {/* Contact & Email */}
                    <td>
                      <div className="small text-muted">📧 {org.email}</div>
                      {editId === org._id ? (
                        <input
                          className="form-control form-control-sm mt-1"
                          name="phone"
                          value={editForm.phone}
                          onChange={handleChange}
                          placeholder="Phone"
                        />
                      ) : (
                        <div className="small">📞 {org.phone}</div>
                      )}
                    </td>

                    {/* Status Toggle */}
                    <td>
                      {editId === org._id ? (
                        <select
                          className="form-select form-select-sm"
                          name="isActive"
                          value={editForm.isActive}
                          onChange={(e) =>
                            setEditForm({
                              ...editForm,
                              isActive: e.target.value === "true",
                            })
                          }
                        >
                          <option value="true">Active</option>
                          <option value="false">Inactive</option>
                        </select>
                      ) : org.isActive ? (
                        <span className="badge bg-success">Active</span>
                      ) : (
                        <span className="badge bg-secondary">Inactive</span>
                      )}
                    </td>

                    {/* ✅ UPDATED: Assigned Camps List */}
                    <td>
                      <div className="d-flex justify-content-between align-items-center mb-2">
                        <span className="badge bg-primary">
                          Total: {org.camps?.length || 0}
                        </span>
                      </div>

                      {org.camps && org.camps.length > 0 ? (
                        <ul className="list-group list-group-flush small">
                          {org.camps.map((camp) => (
                            <li
                              key={camp._id}
                              className="list-group-item p-1 bg-transparent border-0"
                            >
                              <span className="fw-semibold text-danger">
                                ● {camp.name}
                              </span>
                              <span className="text-muted ms-1">
                                ({new Date(camp.date).toLocaleDateString()})
                              </span>
                              <div
                                className="text-muted fst-italic"
                                style={{
                                  fontSize: "0.75rem",
                                  paddingLeft: "14px",
                                }}
                              >
                                📍 {camp.location}
                              </div>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <span className="text-muted fst-italic small">
                          No camps assigned yet.
                        </span>
                      )}
                    </td>

                    {/* Actions Buttons */}
                    <td>
                      {editId === org._id ? (
                        <div className="d-flex gap-2">
                          <button
                            className="btn btn-sm btn-success"
                            onClick={() => handleSave(org._id)}
                          >
                            Save
                          </button>
                          <button
                            className="btn btn-sm btn-secondary"
                            onClick={() => setEditId(null)}
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <div className="d-flex gap-2">
                          <button
                            className="btn btn-sm btn-outline-primary"
                            onClick={() => handleEditClick(org)}
                          >
                            Edit
                          </button>
                          <button
                            className="btn btn-sm btn-outline-danger"
                            onClick={() => handleDelete(org._id)}
                          >
                            Delete
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="text-center py-4">
                    No organizers found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};


export default AdminOrganizers;
