import React, { useState } from "react";
import { loginPageStyles, toastStyles } from "../assets/dummyStyles";
import logo from "../assets/logo.png";
import { Toaster } from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { ArrowLeft, Shield, Stethoscope, User } from "lucide-react";
import { useClerk } from "@clerk/clerk-react";

const STORAGE_KEY = "doctorToken_v1";

const LoginPage = () => {
  const API_BASE = "http://localhost:4000";
  const navigate = useNavigate();
  const clerk = useClerk();

  const [activeTab, setActiveTab] = useState("patient");
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [busy, setBusy] = useState(false);

  const handleChange = (e) => {
    setFormData((s) => ({
      ...s,
      [e.target.name]: e.target.value,
    }));
  };

  const handlePatientLogin = async () => {
    try {
      await clerk.openSignIn({
        afterSignInUrl: "/dashboard",
        afterSignUpUrl: "/dashboard",
      });
    } catch (err) {
      console.error("Patient login open error:", err);
      toast.error("Unable to open patient login", {
        style: toastStyles.errorToast,
      });
    }
  };

  const handleDoctorLogin = async (e) => {
    e.preventDefault();

    if (!formData.email || !formData.password) {
      toast.error("All fields are required.", {
        style: toastStyles.errorToast,
      });
      return;
    }

    setBusy(true);

    try {
      const res = await fetch(`${API_BASE}/api/doctors/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const json = await res.json().catch(() => null);

      if (!res.ok) {
        toast.error(json?.message || "Doctor login failed", {
          style: toastStyles.errorToast,
        });
        setBusy(false);
        return;
      }

      const token = json?.token || json?.data?.token;

      if (!token) {
        toast.error("Authentication token missing", {
          style: toastStyles.errorToast,
        });
        setBusy(false);
        return;
      }

      const doctorId =
        json?.data?._id || json?.doctor?._id || json?.data?.doctor?._id;

      if (!doctorId) {
        toast.error("Doctor ID missing from server response", {
          style: toastStyles.errorToast,
        });
        setBusy(false);
        return;
      }

      localStorage.setItem(STORAGE_KEY, token);
      window.dispatchEvent(
        new StorageEvent("storage", {
          key: STORAGE_KEY,
          newValue: token,
        })
      );

      toast.success("Doctor login successful — redirecting...", {
        style: toastStyles.successToast,
      });

      setTimeout(() => {
        navigate(`/doctor-admin/${doctorId}`);
      }, 700);
    } catch (err) {
      console.error("Doctor login error:", err);
      toast.error("Network error during doctor login", {
        style: toastStyles.errorToast,
      });
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className={loginPageStyles.mainContainer}>
      <Toaster position="top-right" reverseOrder={false} />

      <button
        onClick={() => navigate("/")}
        className={loginPageStyles.backButton}
      >
        <ArrowLeft className={loginPageStyles.backButtonIcon} />
        Back to Home
      </button>

      <div className={loginPageStyles.loginCard}>
        <div className={loginPageStyles.logoContainer}>
          <img src={logo} alt="logo" className={loginPageStyles.logo} />
        </div>

        <h2 className={loginPageStyles.title}>Welcome to MediCare</h2>
        <p className={loginPageStyles.subtitle}>
          Sign in to access records, appointments, and healthcare tools
        </p>

        <div className="flex gap-3 mb-6">
          <button
            type="button"
            onClick={() => setActiveTab("patient")}
            className={`flex-1 rounded-xl px-4 py-3 font-medium border transition ${
              activeTab === "patient"
                ? "bg-green-600 text-white border-green-600"
                : "bg-white text-gray-700 border-gray-300 hover:border-green-500"
            }`}
          >
            <span className="inline-flex items-center gap-2">
              <User className="w-4 h-4" />
              Patient Login
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("doctor")}
            className={`flex-1 rounded-xl px-4 py-3 font-medium border transition ${
              activeTab === "doctor"
                ? "bg-green-600 text-white border-green-600"
                : "bg-white text-gray-700 border-gray-300 hover:border-green-500"
            }`}
          >
            <span className="inline-flex items-center gap-2">
              <Stethoscope className="w-4 h-4" />
              Doctor Login
            </span>
          </button>
        </div>

        {activeTab === "patient" ? (
          <div className="space-y-4">
            <div className="rounded-2xl border border-green-100 bg-green-50 p-4 text-left">
              <h3 className="text-lg font-semibold text-slate-800 mb-2">
                Patient Access
              </h3>
              <p className="text-sm text-slate-600">
                Login to access your dashboard, medical reports, appointments,
                and health history.
              </p>
            </div>

            <button
              type="button"
              onClick={handlePatientLogin}
              className={loginPageStyles.submitButton}
            >
              Continue as Patient
            </button>
          </div>
        ) : (
          <form onSubmit={handleDoctorLogin} className={loginPageStyles.form}>
            <div className="rounded-2xl border border-blue-100 bg-blue-50 p-4 text-left mb-2">
              <h3 className="text-lg font-semibold text-slate-800 mb-2">
                Doctor Portal
              </h3>
              <p className="text-sm text-slate-600">
                Sign in to manage patients, schedules, and medical records.
              </p>
            </div>

            <input
              type="email"
              name="email"
              placeholder="Doctor Email Address"
              value={formData.email}
              onChange={handleChange}
              className={loginPageStyles.input}
              required
            />

            <input
              type="password"
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              className={loginPageStyles.input}
              required
            />

            <button
              type="submit"
              disabled={busy}
              className={loginPageStyles.submitButton}
            >
              {busy ? "Signing in..." : "Login as Doctor"}
            </button>
          </form>
        )}

        <div className="mt-6 rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
          <div className="flex items-start gap-2">
            <Shield className="w-4 h-4 mt-0.5 text-slate-500" />
            <p>
              Admin access is managed separately through the admin panel and is
              not shown on the public homepage.
            </p>
          </div>
        </div>

        <div className="mt-4 text-center">
          <button
            type="button"
            onClick={() => {
              window.location.href = "http://localhost:5174";
            }}
            className="text-sm text-gray-500 hover:text-green-600 transition"
          >
            Admin access
          </button>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;