import React, { useEffect, useState } from "react";
import { useAuth } from "@clerk/clerk-react";
import { useNavigate, useParams } from "react-router-dom";
import Navbar from "../Components/Navbar";
import Footer from "../Components/Footer";

const BookAppointment = () => {
  const { doctorId } = useParams();
  const navigate = useNavigate();
  const { getToken, isLoaded, isSignedIn } = useAuth();

  const API_BASE = "http://localhost:4000";

  const [doctor, setDoctor] = useState(null);
  const [loadingDoctor, setLoadingDoctor] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");

  const [formData, setFormData] = useState({
    patientName: "",
    mobile: "",
    age: "",
    gender: "",
    date: "",
    time: "",
    fee: "",
    notes: "",
    email: "",
    paymentMethod: "Cash",
  });

  useEffect(() => {
    loadDoctor();
  }, [doctorId]);

  const loadDoctor = async () => {
    try {
      setLoadingDoctor(true);
      setMessage("");

      const res = await fetch(`${API_BASE}/api/doctors/${doctorId}`);
      const data = await res.json().catch(() => null);

      if (!res.ok) {
        setMessage(data?.message || "Failed to load doctor");
        setLoadingDoctor(false);
        return;
      }

      const doctorData = data?.data || data?.doctor || data;
      setDoctor(doctorData);

      setFormData((prev) => ({
        ...prev,
        fee: doctorData?.fees || doctorData?.fee || 0,
      }));

      setLoadingDoctor(false);
    } catch (err) {
      console.error("Load doctor error:", err);
      setMessage("Something went wrong while loading doctor");
      setLoadingDoctor(false);
    }
  };

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isLoaded || !isSignedIn) {
      setMessage("Please login first");
      return;
    }

    if (formData.paymentMethod === "Online" && !formData.email.trim()) {
      setMessage("Email is required for online payment");
      return;
    }

    try {
      setSubmitting(true);
      setMessage("");

      const token = await getToken();

      const payload = {
        doctorId,
        patientName: formData.patientName,
        mobile: formData.mobile,
        age: formData.age,
        gender: formData.gender,
        date: formData.date,
        time: formData.time,
        fee: formData.fee,
        notes: formData.notes,
        email: formData.email,
        paymentMethod: formData.paymentMethod,
      };

      const res = await fetch(`${API_BASE}/api/appointments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: token ? `Bearer ${token}` : "",
        },
        body: JSON.stringify(payload),
      });

      const text = await res.text();

      let data;
      try {
        data = JSON.parse(text);
      } catch {
        throw new Error(text || "Invalid server response");
      }

      if (!res.ok) {
        setMessage(data?.message || "Failed to book appointment");
        setSubmitting(false);
        return;
      }

      if (data?.checkoutUrl) {
        setSubmitting(false);
        window.location.href = data.checkoutUrl;
        return;
      }

      setSubmitting(false);
      navigate("/my-appointments");
    } catch (err) {
      console.error("Book appointment error:", err);
      setMessage(err.message || "Something went wrong");
      setSubmitting(false);
    }
  };

  return (
    <div>
      <Navbar />

      <div className="max-w-3xl mx-auto p-6 mt-8 bg-white rounded-2xl shadow">
        <h2 className="text-3xl font-bold mb-6">Book Appointment</h2>

        {loadingDoctor ? (
          <p>Loading doctor...</p>
        ) : !doctor ? (
          <p className="text-red-600">{message || "Doctor not found"}</p>
        ) : (
          <>
            <div className="mb-6 p-4 border rounded-xl">
              <p>
                <b>Doctor:</b> {doctor.name || "-"}
              </p>
              <p>
                <b>Specialization:</b>{" "}
                {doctor.specialization || doctor.speciality || "-"}
              </p>
              <p>
                <b>Fee:</b> ₹{doctor.fees || doctor.fee || 0}
              </p>
            </div>

            {message && <p className="mb-4 text-sm text-blue-600">{message}</p>}

            <form onSubmit={handleSubmit} className="grid gap-4">
              <input
                type="text"
                name="patientName"
                placeholder="Patient Name"
                value={formData.patientName}
                onChange={handleChange}
                className="border rounded-lg p-3"
                required
              />

              <input
                type="email"
                name="email"
                placeholder="Email"
                value={formData.email}
                onChange={handleChange}
                className="border rounded-lg p-3"
              />

              <input
                type="text"
                name="mobile"
                placeholder="Mobile Number"
                value={formData.mobile}
                onChange={handleChange}
                className="border rounded-lg p-3"
                required
              />

              <input
                type="number"
                name="age"
                placeholder="Age"
                value={formData.age}
                onChange={handleChange}
                className="border rounded-lg p-3"
              />

              <select
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                className="border rounded-lg p-3"
              >
                <option value="">Select Gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>

              <input
                type="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
                className="border rounded-lg p-3"
                required
              />

              <input
                type="time"
                name="time"
                value={formData.time}
                onChange={handleChange}
                className="border rounded-lg p-3"
                required
              />

              <input
                type="number"
                name="fee"
                placeholder="Fee"
                value={formData.fee}
                readOnly
                className="border rounded-lg p-3 bg-gray-100"
                required
              />

              <select
                name="paymentMethod"
                value={formData.paymentMethod}
                onChange={handleChange}
                className="border rounded-lg p-3"
              >
                <option value="Cash">Cash</option>
                <option value="Online">Online</option>
              </select>

              <textarea
                name="notes"
                placeholder="Notes"
                value={formData.notes}
                onChange={handleChange}
                className="border rounded-lg p-3"
                rows="4"
              />

              <button
                type="submit"
                disabled={submitting}
                className="bg-emerald-600 text-white px-5 py-3 rounded-lg"
              >
                {submitting ? "Booking..." : "Confirm Booking"}
              </button>
            </form>
          </>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default BookAppointment;