import React, { useEffect, useState } from "react";
import Navbar from "../Components/Navbar";
import Footer from "../Components/Footer";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@clerk/clerk-react";

const EditPatientProfile = () => {
  const navigate = useNavigate();
  const { getToken, isLoaded, isSignedIn } = useAuth();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    bloodGroup: "",
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const API_BASE = "http://localhost:4000";

  useEffect(() => {
    const loadProfile = async () => {
      try {
        if (!isLoaded || !isSignedIn) return;

        const token = await getToken();
        console.log("EDIT GET TOKEN:", token);

        console.log("GET URL:", "http://localhost:4000/api/patient/me");
       const res = await fetch("http://localhost:4000/api/patient/me", {
  method: "GET",
  headers: {
    Authorization: `Bearer ${token}`,
  },
});

        const text = await res.text();
        console.log("RAW EDIT GET RESPONSE:", text);
        console.log("EDIT GET STATUS:", res.status);

        let data;
        try {
          data = JSON.parse(text);
        } catch {
          return;
        }

        if (res.ok && data.data) {
          setFormData({
            name: data.data.name || "",
            email: data.data.email || "",
            phone: data.data.phone || "",
            bloodGroup: data.data.bloodGroup || "",
          });
        }
      } catch (err) {
        console.error("Load profile error:", err);
      }
    };

    loadProfile();
  }, [getToken, isLoaded, isSignedIn]);

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (!isLoaded) return;
      if (!isSignedIn) {
        setMessage("User not signed in");
        return;
      }

      setLoading(true);
      setMessage("");

      const token = await getToken();
      console.log("POST TOKEN:", token);
      console.log("FORM DATA:", formData);

      console.log("POST URL:", "http://localhost:4000/api/patient/me");
      const res = await fetch("http://localhost:4000/api/patient/me", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  },
  body: JSON.stringify(formData),
});
      const text = await res.text();
      console.log("RAW POST RESPONSE:", text);
      console.log("POST STATUS:", res.status);

      let data;
      try {
        data = JSON.parse(text);
      } catch {
        throw new Error(text || "Invalid server response");
      }

      if (!res.ok) {
        setMessage(data.message || "Failed to save profile");
        setLoading(false);
        return;
      }

      setMessage("Profile saved successfully");
      setLoading(false);

      setTimeout(() => {
        navigate("/my-profile");
      }, 1000);
    } catch (err) {
      console.error("Save profile error:", err);
      setMessage(err.message || "Something went wrong");
      setLoading(false);
    }
  };

  return (
    <div>
      <Navbar />

      <div className="max-w-xl mx-auto p-6 mt-8 bg-white rounded-2xl shadow">
        <h2 className="text-2xl font-bold mb-6">Edit Profile</h2>

        {message && <p className="mb-4 text-sm text-blue-600">{message}</p>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            name="name"
            placeholder="Name"
            value={formData.name}
            onChange={handleChange}
            className="w-full border rounded-lg p-3"
          />

          <input
            type="email"
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
            className="w-full border rounded-lg p-3"
          />

          <input
            type="text"
            name="phone"
            placeholder="Phone"
            value={formData.phone}
            onChange={handleChange}
            className="w-full border rounded-lg p-3"
          />

          <input
            type="text"
            name="bloodGroup"
            placeholder="Blood Group"
            value={formData.bloodGroup}
            onChange={handleChange}
            className="w-full border rounded-lg p-3"
          />

          <button
            type="submit"
            disabled={loading}
            className="bg-emerald-600 text-white px-5 py-3 rounded-lg"
          >
            {loading ? "Saving..." : "Save"}
          </button>
        </form>
      </div>

      <Footer />
    </div>
  );
};

export default EditPatientProfile;