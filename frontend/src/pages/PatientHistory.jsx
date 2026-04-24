import React, { useEffect, useMemo, useState } from "react";
import { Link, useParams, useLocation } from "react-router-dom";
import Navbar from "../Components/Navbar";
import Footer from "../Components/Footer";

const API_BASE = "http://localhost:4000";

const getDoctorIdFromStorage = () => {
  try {
    const data = localStorage.getItem("doctorData");
    if (!data) return "";

    const parsed = JSON.parse(data);
    return parsed?._id || parsed?.id || "";
  } catch {
    return "";
  }
};

const PatientHistory = () => {
  const { patientId } = useParams();
  const location = useLocation();

  const doctorIdFromQuery = new URLSearchParams(location.search).get("doctorId");
  const doctorId = doctorIdFromQuery || getDoctorIdFromStorage();

  const [reports, setReports] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;

    const fetchPatientHistory = async () => {
      try {
        setLoading(true);
        setError("");

        if (!patientId) {
          throw new Error("Patient ID missing");
        }

        // doctorId missing ho to technical message UI me mat dikhao
        if (!doctorId) {
          if (!mounted) return;
          setReports([]);
          setAppointments([]);
          setError("");
          setLoading(false);
          return;
        }

        const token = localStorage.getItem("doctorToken_v1");

        const res = await fetch(
          `${API_BASE}/api/reports/doctor/patient/${patientId}?doctorId=${doctorId}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            credentials: "include",
          }
        );

        const data = await res.json();

        console.log("FINAL RESPONSE:", data);

        if (!res.ok || !data.success) {
          throw new Error(data.message || "Failed to load history");
        }

        if (!mounted) return;

        setReports(data.data?.reports || []);
        setAppointments(data.data?.appointments || []);
      } catch (err) {
        console.error("ERROR:", err);

        if (!mounted) return;
        setError(err.message || "Unable to load patient history");
        setReports([]);
        setAppointments([]);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchPatientHistory();

    return () => {
      mounted = false;
    };
  }, [patientId, doctorId]);

  const sortedReports = useMemo(() => {
    return [...reports].sort(
      (a, b) =>
        new Date(b.recordDate || b.createdAt) -
        new Date(a.recordDate || a.createdAt)
    );
  }, [reports]);

  const sortedAppointments = useMemo(() => {
    return [...appointments].sort(
      (a, b) =>
        new Date(b.createdAt || b.date) -
        new Date(a.createdAt || a.date)
    );
  }, [appointments]);

  const timelineItems = useMemo(() => {
    const reportsData = sortedReports.map((r) => ({
      type: "report",
      id: r._id,
      title: r.title,
      date: r.recordDate || r.createdAt,
      doctor: r.doctorName,
      hospital: r.hospitalName,
      file: r.fileUrl,
    }));

    const appointmentsData = sortedAppointments.map((a) => ({
      type: "appointment",
      id: a._id,
      title: a.doctorName,
      date: a.createdAt || a.date,
      status: a.status,
      payment: a.payment?.status,
      method: a.payment?.method,
      fees: a.fees,
    }));

    return [...reportsData, ...appointmentsData].sort(
      (a, b) => new Date(b.date) - new Date(a.date)
    );
  }, [sortedReports, sortedAppointments]);

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      <div className="max-w-6xl mx-auto p-6">
        <Link to="/appointments" className="flex gap-2 mb-4">
          ← Back
        </Link>

        <div className="bg-white p-6 rounded-2xl shadow">
          <h1 className="text-3xl font-bold mb-2">Patient History</h1>

          <p className="text-gray-500 mb-4">
            Only confirmed doctor-patient appointments are allowed.
          </p>

          <div className="flex gap-4 mb-6 flex-wrap">
            <span>Patient ID: {patientId}</span>
            <span>{appointments.length} Appointments</span>
            <span>{reports.length} Reports</span>
          </div>

          {loading ? (
            <p>Loading...</p>
          ) : error ? (
            <p className="text-red-500">{error}</p>
          ) : timelineItems.length === 0 ? (
            <p>No history found</p>
          ) : (
            <div className="space-y-4">
              {timelineItems.map((item) => (
                <div key={item.id} className="border p-4 rounded-xl">
                  <h3 className="font-bold">{item.title}</h3>
                  <p>{new Date(item.date).toLocaleString()}</p>

                  {item.type === "report" ? (
                    <>
                      <p>Doctor: {item.doctor || "N/A"}</p>
                      <p>Hospital: {item.hospital || "N/A"}</p>
                      <a
                        href={item.file}
                        target="_blank"
                        rel="noreferrer"
                        className="text-green-600 font-medium hover:underline"
                      >
                        View Report
                      </a>
                    </>
                  ) : (
                    <>
                      <p>Status: {item.status || "N/A"}</p>
                      <p>
                        Payment: {item.method || "N/A"} / {item.payment || "N/A"}
                      </p>
                      <p>Fees: ₹{item.fees || 0}</p>
                    </>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default PatientHistory;