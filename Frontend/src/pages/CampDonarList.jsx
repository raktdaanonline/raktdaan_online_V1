import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import campService from "../services/campService";
import donorService from "../services/donorService";

const CampDonorList = () => {
  const location = useLocation();
  const query = new URLSearchParams(location.search);
  const campIdFromUrl = query.get("campId"); // Get campId from URL

  const [camps, setCamps] = useState([]);
  const [formData, setFormData] = useState({
    name: "",
    age: "",
    weight: "",
    bloodGroup: "",
    email: "",
    phone: "",
    address: "",
    camp: "",
  });

  const [campLocked, setCampLocked] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Fetch camps from backend
  useEffect(() => {
    const fetchCamps = async () => {
      try {
        const data = await campService.getCamps();
        const campList = data || [];
        setCamps(campList);

        // If URL has campId, lock the camp
        if (campIdFromUrl) {
          const selectedCamp = campList.find((c) => c._id === campIdFromUrl);
          if (selectedCamp) {
            setFormData((prev) => ({ ...prev, camp: selectedCamp._id }));
            setCampLocked(true);
          } else {
            // campId present but not found in list — keep camp unlocked but set value to campId (optional)
            setFormData((prev) => ({ ...prev, camp: campIdFromUrl }));
            setCampLocked(true);
          }
        }
      } catch (err) {
        console.error("Error fetching camps:", err);
        setCamps([]);
        alert("कॅम्प्स आणताना त्रुटी आली. कृपया नंतर पुन्हा प्रयत्न करा.");
      }
    };
    fetchCamps();
  }, [campIdFromUrl]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const validateForm = () => {
    // basic checks
    if (!formData.name.trim()) {
      alert("कृपया नाव भरा.");
      return false;
    }
    const age = parseInt(formData.age, 10);
    if (Number.isNaN(age) || age < 18) {
      alert("वय किमान 18 वर्षे असावे.");
      return false;
    }
    const weight = parseInt(formData.weight, 10);
    if (Number.isNaN(weight) || weight < 50) {
      alert("वजन किमान 50 kg असावे.");
      return false;
    }
    if (!formData.bloodGroup) {
      alert("कृपया रक्तगट निवडा.");
      return false;
    }
    if (!formData.phone || formData.phone.trim().length < 6) {
      alert("कृपया वैध फोन नंबर द्या.");
      return false;
    }
    if (!formData.camp) {
      alert("कृपया कॅम्प निवडा.");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setSubmitting(true);
    try {
      // send to backend
      await donorService.registerDonor(formData);

      alert("Donor registered successfully!");

      // Reset form — keep camp if locked
      setFormData({
        name: "",
        age: "",
        weight: "",
        bloodGroup: "",
        email: "",
        phone: "",
        address: "",
        camp: campLocked ? formData.camp : "",
      });
    } catch (err) {
      console.error("Error registering donor:", err);
      const msg = err?.response?.data?.message || "Error registering donor. कृपया नंतर पुन्हा प्रयत्न करा.";
      alert(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="container py-4">
      <h3 className="text-danger mb-3">
        Donor Registration {campIdFromUrl && `for selected Camp`}
      </h3>

      <form onSubmit={handleSubmit} className="border p-3 rounded bg-light">
        <input
          className="form-control mb-2"
          name="name"
          placeholder="Full Name"
          value={formData.name}
          onChange={handleChange}
          required
        />

        <input
          className="form-control mb-2"
          name="age"
          type="number"
          placeholder="Age"
          value={formData.age}
          onChange={handleChange}
          required
        />

        <input
          className="form-control mb-2"
          name="weight"
          type="number"
          placeholder="Weight (kg)"
          value={formData.weight}
          onChange={handleChange}
          required
        />

        <select
          className="form-select mb-2"
          name="bloodGroup"
          value={formData.bloodGroup}
          onChange={handleChange}
          required
        >
          <option value="">Select Blood Group</option>
          {["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-", "Don't Know"].map((bg) => (
            <option key={bg} value={bg}>
              {bg}
            </option>
          ))}
        </select>

        <input
          className="form-control mb-2"
          name="email"
          type="email"
          placeholder="Email"
          value={formData.email}
          onChange={handleChange}
        />

        <input
          className="form-control mb-2"
          name="phone"
          placeholder="Phone Number"
          value={formData.phone}
          onChange={handleChange}
          required
        />

        <textarea
          className="form-control mb-2"
          name="address"
          placeholder="Address"
          value={formData.address}
          onChange={handleChange}
          rows="3"
          required
        />

        {/* Camp select */}
        <select
          className="form-select mb-2"
          name="camp"
          value={formData.camp}
          onChange={handleChange}
          required
          disabled={campLocked}
        >
          <option value="">Select Camp</option>
          {camps.map((c) => (
            <option key={c._id} value={c._id}>
              {c.name}
            </option>
          ))}
        </select>

        <button type="submit" className="btn btn-danger" disabled={submitting}>
          {submitting ? "Registering..." : "Register"}
        </button>
      </form>
    </div>
  );
};

export default CampDonorList;
