import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "../Components/Navbar";
import Footer from "../Components/Footer";
import { useAuth } from "@clerk/clerk-react";

const MyProfile = () => {
  const { getToken, isLoaded, isSignedIn } = useAuth();

  const [profile, setProfile] = useState({
    name: "",
    email: "",
    phone: "",
    bloodGroup: "",
    patientUniqueId: "",
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadProfile = async () => {
      try {
        if (!isLoaded) return;

        if (!isSignedIn) {
          setError("User not signed in");
          setLoading(false);
          return;
        }

        setLoading(true);
        setError("");

        const token = await getToken();

        const res = await fetch("http://localhost:4000/api/patient/me", {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const text = await res.text();

        let data;
        try {
          data = JSON.parse(text);
        } catch {
          throw new Error(text || "Invalid server response");
        }

        console.log("MY PROFILE FULL RESPONSE:", data);
        console.log("MY PROFILE DATA OBJECT:", data?.data);

        if (!res.ok) {
          setError(data.message || "Failed to load profile");
          setLoading(false);
          return;
        }

        const newProfile = {
          name: data?.data?.name || "",
          email: data?.data?.email || "",
          phone: data?.data?.phone || "",
          bloodGroup: data?.data?.bloodGroup || "",
          patientUniqueId: data?.data?.patientUniqueId || "",
        };

        console.log("SETTING PROFILE:", newProfile);

        setProfile(newProfile);
        setLoading(false);
      } catch (err) {
        console.error("Profile fetch error:", err);
        setError(err.message || "Something went wrong");
        setLoading(false);
      }
    };

    loadProfile();
  }, [getToken, isLoaded, isSignedIn]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#f8fffb] to-[#eefaf4]">
      <Navbar />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="bg-white rounded-[28px] shadow-lg border border-emerald-100 overflow-hidden">
          {/* Top Header Section */}
          <div className="bg-gradient-to-r from-emerald-600 to-green-500 px-6 md:px-10 py-8 text-white">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
              <div>
                <p className="text-sm md:text-base text-emerald-50 mb-2">
                  Patient Dashboard
                </p>
                <h2 className="text-3xl md:text-4xl font-bold">My Profile</h2>
                <p className="mt-2 text-sm md:text-base text-emerald-50">
                  View and manage your personal healthcare details
                </p>
              </div>

              <div className="flex items-center gap-4">
                <div className="w-20 h-20 rounded-full bg-white/20 border-4 border-white/30 flex items-center justify-center text-3xl font-bold uppercase shadow-md">
                  {profile?.name ? profile.name.charAt(0) : "P"}
                </div>
              </div>
            </div>
          </div>

          {/* Content Section */}
          <div className="p-6 md:p-10">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-16">
                <div className="w-12 h-12 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin"></div>
                <p className="mt-4 text-gray-600 font-medium">
                  Loading profile...
                </p>
              </div>
            ) : error ? (
              <div className="max-w-lg mx-auto text-center bg-red-50 border border-red-200 rounded-2xl p-8">
                <div className="text-red-600 text-4xl mb-3">⚠</div>
                <h3 className="text-xl font-semibold text-red-700 mb-2">
                  Unable to Load Profile
                </h3>
                <p className="text-red-600 mb-6">{error}</p>

                <Link to="/edit-profile">
                  <button className="bg-emerald-600 hover:bg-emerald-700 transition text-white px-6 py-3 rounded-xl font-semibold shadow-md">
                    Create Profile
                  </button>
                </Link>
              </div>
            ) : (
              <>
                {/* Patient ID Card */}
                <div className="mb-8 bg-emerald-50 border border-emerald-100 rounded-2xl p-5 md:p-6">
                  <p className="text-sm text-emerald-700 font-medium mb-1">
                    Unique Patient ID
                  </p>
                  <h3 className="text-2xl md:text-3xl font-bold text-emerald-800 tracking-wide">
                    {profile?.patientUniqueId || "-"}
                  </h3>
                </div>

                {/* Profile Info Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="bg-gray-50 rounded-2xl p-5 border border-gray-100">
                    <p className="text-sm text-gray-500 mb-1">Full Name</p>
                    <h4 className="text-lg font-semibold text-gray-800">
                      {profile?.name || "-"}
                    </h4>
                  </div>

                  <div className="bg-gray-50 rounded-2xl p-5 border border-gray-100">
                    <p className="text-sm text-gray-500 mb-1">Email Address</p>
                    <h4 className="text-lg font-semibold text-gray-800 break-all">
                      {profile?.email || "-"}
                    </h4>
                  </div>

                  <div className="bg-gray-50 rounded-2xl p-5 border border-gray-100">
                    <p className="text-sm text-gray-500 mb-1">Phone Number</p>
                    <h4 className="text-lg font-semibold text-gray-800">
                      {profile?.phone || "-"}
                    </h4>
                  </div>

                  <div className="bg-gray-50 rounded-2xl p-5 border border-gray-100">
                    <p className="text-sm text-gray-500 mb-1">Blood Group</p>
                    <h4 className="text-lg font-semibold text-gray-800">
                      {profile?.bloodGroup || "-"}
                    </h4>
                  </div>
                </div>

                {/* Action Button */}
                <div className="mt-8 flex flex-col sm:flex-row gap-4">
                  <Link to="/edit-profile">
                    <button className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700 transition text-white px-8 py-3 rounded-xl font-semibold shadow-md hover:shadow-lg">
                      Edit Profile
                    </button>
                  </Link>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default MyProfile;