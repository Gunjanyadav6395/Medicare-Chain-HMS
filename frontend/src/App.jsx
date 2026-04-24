import React, { useEffect, useState } from "react";
import { Route, Routes, useLocation } from "react-router-dom";

import Home from "./pages/Home";
import Doctors from "./pages/Doctors";
import DoctorDetail from "./pages/DoctorDetail";
import Service from "./pages/Service";
import ServiceDetailPage from "./pages/ServiceDetailPage";
import Contact from "./pages/Contact";
import Login from "./pages/Login";
import DHome from "./pages/DHome";
import List from "./doctor/List";
import EditProfile from "./doctor/EditProfile";
import Appointments from "./pages/Appointments";
import { CircleChevronUp } from "lucide-react";
import VerifyPaymentPage from "../VerifyPaymentPage";
import VerifyServicePaymentPage from "../VerifyServicePaymentPage";
import PatientDashboard from "./pages/PatientDashboard";
import MyProfile from "./pages/MyProfile";
import EditPatientProfile from "./pages/EditPatientProfile";
import MyAppointments from "./pages/MyAppointments";
import MyReports from "./pages/MyReports";
import BookAppointment from "./pages/BookAppointment";
import ReportDetails from "./pages/ReportDetails";
import PatientHistory from "./pages/PatientHistory";
import AppointmentDetails from "./pages/AppointmentDetails";
import DoctorPatientHistory from "./pages/DoctorPatientHistory";

const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  }, [pathname]);

  return null;
};

const ScrollButton = () => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => setVisible(window.scrollY > 200);
    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollTop = () => window.scrollTo({ top: 0, behavior: "smooth" });

  return (
    <button
      onClick={scrollTop}
      className={`fixed right-4 bottom-6 z-50 w-11 h-11 rounded-full flex items-center justify-center 
      bg-emerald-600 text-white shadow-lg transition-all duration-300 
      ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"} 
      hover:scale-110 hover:shadow-xl`}
      title="Go to top"
    >
      <CircleChevronUp size={22} />
    </button>
  );
};

const App = () => {
  useEffect(() => {
    document.body.style.overflowX = "hidden";
    document.documentElement.style.overflowX = "hidden";

    return () => {
      document.body.style.overflowX = "auto";
      document.documentElement.style.overflowX = "auto";
    };
  }, []);

  return (
    <>
      <ScrollToTop />

      <div className="overflow-x-hidden bg-white text-gray-900">
        <Routes>
          {/* Public */}
          <Route path="/" element={<Home />} />
          <Route path="/doctors" element={<Doctors />} />
          <Route path="/doctors/:id" element={<DoctorDetail />} />
          <Route path="/services" element={<Service />} />
          <Route path="/services/:id" element={<ServiceDetailPage />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/appointments" element={<Appointments />} />
          <Route path="/login" element={<Login />} />

          {/* Doctor */}
          <Route path="/doctor-admin/login" element={<Login />} />
          <Route path="/doctor-admin/:id" element={<DHome />} />
          <Route path="/doctor-admin/:id/appointments" element={<List />} />
          <Route
            path="/doctor-admin/:id/profile/edit"
            element={<EditProfile />}
          />
          <Route
  path="/doctor/patient-history/:patientId"
  element={<DoctorPatientHistory />}
/>

          {/* Payment verification */}
          <Route
            path="/appointment/success"
            element={<VerifyPaymentPage />}
          />
          <Route
            path="/appointment/cancel"
            element={<VerifyPaymentPage />}
          />
          <Route
            path="/service-appointment/success"
            element={<VerifyServicePaymentPage />}
          />
          <Route
            path="/service-appointment/cancel"
            element={<VerifyServicePaymentPage />}
          />

          {/* Patient */}
          <Route path="/dashboard" element={<PatientDashboard />} />
          <Route path="/my-profile" element={<MyProfile />} />
          <Route path="/edit-profile" element={<EditPatientProfile />} />
          <Route path="/my-appointments" element={<MyAppointments />} />
          <Route path="/my-reports" element={<MyReports />} />
          <Route path="/reports/:id" element={<ReportDetails />} />
          <Route
            path="/book-appointment/:doctorId"
            element={<BookAppointment />}
          />
         <Route path="/patient-history/:patientId" element={<PatientHistory />} />
          <Route path="/appointment-details/:id" element={<AppointmentDetails />} />
        </Routes>
      </div>

      <ScrollButton />
    </>
  );
};

export default App;