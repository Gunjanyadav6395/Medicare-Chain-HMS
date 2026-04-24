import React, { useEffect, useMemo, useRef, useState } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import {
  FileText,
  CalendarDays,
  ArrowLeft,
  ShieldCheck,
  UserRound,
  Stethoscope,
  Hospital,
  IndianRupee,
  ClipboardList,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Wallet,
} from "lucide-react";
import Navbar from "../Components/Navbar";
import Footer from "../Components/Footer";

const API_BASE = "http://localhost:4000";

const DoctorPatientHistory = () => {
  const { patientId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const [history, setHistory] = useState([]);
  const [patientUniqueId, setPatientUniqueId] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const hasFetchedRef = useRef(false);

  const queryParams = new URLSearchParams(location.search);
  const doctorId = queryParams.get("doctorId") || "";

  useEffect(() => {
    let isMounted = true;

    const fetchPatientHistory = async () => {
      try {
        if (!patientId || !doctorId) {
          if (isMounted) {
            setError("Patient ID or Doctor ID missing");
            setLoading(false);
          }
          return;
        }

        if (hasFetchedRef.current) return;
        hasFetchedRef.current = true;

        setLoading(true);
        setError("");

        const res = await fetch(
          `${API_BASE}/api/reports/doctor/patient/${patientId}?doctorId=${doctorId}`
        );

        const data = await res.json();

        if (!res.ok || !data?.success) {
          throw new Error(data?.message || "Failed to fetch patient history");
        }

        if (!isMounted) return;

        setHistory(Array.isArray(data?.data?.history) ? data.data.history : []);
        setPatientUniqueId(data?.data?.patientUniqueId || "");
      } catch (err) {
        console.error("Doctor patient history error:", err);

        if (!isMounted) return;
        setError(err.message || "Something went wrong");
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchPatientHistory();

    return () => {
      isMounted = false;
    };
  }, [patientId, doctorId]);

  const formatDate = (value) => {
    if (!value) return "N/A";

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;

    return date.toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const formatDateTime = (date, time) => {
    const safeDate = date ? formatDate(date) : "";
    const safeTime = time || "";

    if (!safeDate && !safeTime) return "N/A";
    if (safeDate && safeTime) return `${safeDate} • ${safeTime}`;
    return safeDate || safeTime || "N/A";
  };

  const getItemDate = (item) => {
    const raw =
      item?.recordDate ||
      item?.appointmentDate ||
      item?.createdAt ||
      null;

    if (!raw) return 0;

    const parsed = new Date(raw).getTime();
    return Number.isNaN(parsed) ? 0 : parsed;
  };

  const sortedHistory = useMemo(() => {
    return [...history].sort((a, b) => getItemDate(b) - getItemDate(a));
  }, [history]);

  const appointmentCount = useMemo(
    () => sortedHistory.filter((item) => item.itemType === "appointment").length,
    [sortedHistory]
  );

  const reportCount = useMemo(
    () => sortedHistory.filter((item) => item.itemType === "report").length,
    [sortedHistory]
  );

  const getStatusBadgeClass = (status) => {
    const value = String(status || "").toLowerCase();

    if (value === "confirmed" || value === "completed") {
      return "bg-green-100 text-green-700";
    }
    if (value === "canceled" || value === "cancelled") {
      return "bg-red-100 text-red-700";
    }
    if (value === "pending") {
      return "bg-yellow-100 text-yellow-700";
    }
    if (value === "rescheduled") {
      return "bg-blue-100 text-blue-700";
    }

    return "bg-slate-100 text-slate-700";
  };

  const getPaymentBadgeClass = (status) => {
    const value = String(status || "").toLowerCase();

    if (value === "paid") return "bg-green-100 text-green-700";
    if (value === "pending") return "bg-yellow-100 text-yellow-700";
    if (value === "failed" || value === "refunded") {
      return "bg-red-100 text-red-700";
    }

    return "bg-slate-100 text-slate-700";
  };

  const getStatusIcon = (status) => {
    const value = String(status || "").toLowerCase();

    if (value === "confirmed" || value === "completed") {
      return <CheckCircle2 size={15} />;
    }
    if (value === "canceled" || value === "cancelled") {
      return <XCircle size={15} />;
    }
    return <AlertCircle size={15} />;
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-6 mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">
            <div>
              <div className="flex items-center gap-2 text-emerald-600 font-semibold mb-3">
                <ShieldCheck className="w-5 h-5" />
                <span>Secure Doctor Access</span>
              </div>

              <h1 className="text-4xl font-bold text-slate-900">
                Patient History
              </h1>

              <p className="text-slate-600 mt-3 text-lg">
                Only confirmed doctor-patient appointments are allowed to access this history.
              </p>

              <div className="mt-5 flex flex-wrap gap-3">
                <div className="inline-flex items-center gap-2 bg-slate-100 text-slate-700 px-4 py-2 rounded-2xl text-sm font-medium">
                  <UserRound className="w-4 h-4" />
                  Patient ID: {patientUniqueId || "N/A"}
                </div>

                <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 px-4 py-2 rounded-2xl text-sm font-medium">
                  <ClipboardList className="w-4 h-4" />
                  {appointmentCount} Appointments
                </div>

                <div className="inline-flex items-center gap-2 bg-purple-50 text-purple-700 px-4 py-2 rounded-2xl text-sm font-medium">
                  <FileText className="w-4 h-4" />
                  {reportCount} Reports
                </div>
              </div>
            </div>

            <button
              onClick={() => navigate(-1)}
              className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-slate-800 text-white hover:bg-slate-900 transition font-medium"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </button>
          </div>
        </div>

        {loading && (
          <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-8 text-center text-slate-500">
            Loading patient history...
          </div>
        )}

        {!loading && error && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-3xl p-6">
            {error}
          </div>
        )}

        {!loading && !error && sortedHistory.length === 0 && (
          <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-8 text-center text-slate-500">
            No history found for this patient.
          </div>
        )}

        {!loading && !error && sortedHistory.length > 0 && (
          <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-6 md:p-8">
            <div className="flex items-center gap-3 mb-8">
              <CalendarDays className="w-6 h-6 text-slate-700" />
              <h2 className="text-2xl font-bold text-slate-900">
                Medical Timeline
              </h2>
            </div>

            <div className="relative">
              <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-slate-200"></div>

              <div className="space-y-6">
                {sortedHistory.map((item) => {
                  const isReport = item.itemType === "report";

                  return (
                    <div
                      key={`${item.itemType}-${item._id}`}
                      className="relative pl-12"
                    >
                      <div
                        className={`absolute left-1 top-3 w-6 h-6 rounded-full border-4 border-white shadow ${
                          isReport ? "bg-purple-600" : "bg-blue-600"
                        }`}
                      ></div>

                      <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6 shadow-sm">
                        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4 mb-4">
                          <div>
                            <div className="flex items-center gap-2 flex-wrap mb-3">
                              <span
                                className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold ${
                                  isReport
                                    ? "bg-purple-100 text-purple-700"
                                    : "bg-blue-100 text-blue-700"
                                }`}
                              >
                                {isReport ? (
                                  <FileText className="w-4 h-4" />
                                ) : (
                                  <CalendarDays className="w-4 h-4" />
                                )}
                                {isReport ? "Report" : "Appointment"}
                              </span>

                              {!isReport ? (
                                <>
                                  <span
                                    className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold ${getStatusBadgeClass(
                                      item.status
                                    )}`}
                                  >
                                    {getStatusIcon(item.status)}
                                    {item.status || "N/A"}
                                  </span>

                                  <span
                                    className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold ${getPaymentBadgeClass(
                                      item.paymentStatus
                                    )}`}
                                  >
                                    <Wallet size={15} />
                                    {item.paymentStatus || "N/A"}
                                  </span>
                                </>
                              ) : null}
                            </div>

                            <h3 className="text-xl font-bold text-slate-900">
                              {isReport
                                ? item.title || "Medical Report"
                                : item.doctorName || "Appointment"}
                            </h3>

                            <p className="text-slate-600 mt-1">
                              {isReport
                                ? item.reportType || "General"
                                : item.speciality || "Consultation"}
                            </p>
                          </div>

                          <div className="text-sm font-medium text-slate-500">
                            {formatDate(
                              item.recordDate ||
                                item.appointmentDate ||
                                item.createdAt
                            )}
                          </div>
                        </div>

                        {isReport ? (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <div>
                              <p className="text-sm text-slate-500">Title</p>
                              <p className="font-semibold text-slate-900 mt-1">
                                {item.title || "Medical Report"}
                              </p>
                            </div>

                            <div>
                              <p className="text-sm text-slate-500">Report Type</p>
                              <p className="font-semibold text-slate-900 mt-1">
                                {item.reportType || "General"}
                              </p>
                            </div>

                            <div>
                              <p className="text-sm text-slate-500">Doctor Name</p>
                              <p className="font-semibold text-slate-900 mt-1 inline-flex items-center gap-2">
                                <Stethoscope className="w-4 h-4 text-emerald-600" />
                                {item.doctorName || "N/A"}
                              </p>
                            </div>

                            <div>
                              <p className="text-sm text-slate-500">Hospital Name</p>
                              <p className="font-semibold text-slate-900 mt-1 inline-flex items-center gap-2">
                                <Hospital className="w-4 h-4 text-emerald-600" />
                                {item.hospitalName || "N/A"}
                              </p>
                            </div>

                            <div>
                              <p className="text-sm text-slate-500">Record Date</p>
                              <p className="font-semibold text-slate-900 mt-1">
                                {formatDate(item.recordDate)}
                              </p>
                            </div>

                            <div>
                              <p className="text-sm text-slate-500">Report File</p>
                              {item.fileUrl ? (
                                <a
                                  href={item.fileUrl}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="inline-flex items-center gap-2 text-blue-600 font-semibold hover:underline mt-1"
                                >
                                  <FileText className="w-4 h-4" />
                                  View Report
                                </a>
                              ) : (
                                <p className="font-semibold text-slate-900 mt-1">
                                  N/A
                                </p>
                              )}
                            </div>
                          </div>
                        ) : (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <div>
                              <p className="text-sm text-slate-500">Doctor Name</p>
                              <p className="font-semibold text-slate-900 mt-1 inline-flex items-center gap-2">
                                <Stethoscope className="w-4 h-4 text-emerald-600" />
                                {item.doctorName || "N/A"}
                              </p>
                            </div>

                            <div>
                              <p className="text-sm text-slate-500">Speciality</p>
                              <p className="font-semibold text-slate-900 mt-1">
                                {item.speciality || "N/A"}
                              </p>
                            </div>

                            <div>
                              <p className="text-sm text-slate-500">
                                Appointment Schedule
                              </p>
                              <p className="font-semibold text-slate-900 mt-1">
                                {formatDateTime(
                                  item.appointmentDate,
                                  item.appointmentTime
                                )}
                              </p>
                            </div>

                            <div>
                              <p className="text-sm text-slate-500">Status</p>
                              <p className="font-semibold text-slate-900 mt-1">
                                {item.status || "N/A"}
                              </p>
                            </div>

                            <div>
                              <p className="text-sm text-slate-500">Fees</p>
                              <p className="font-semibold text-slate-900 mt-1 inline-flex items-center gap-1">
                                <IndianRupee className="w-4 h-4 text-emerald-600" />
                                {item.fees || 0}
                              </p>
                            </div>

                            <div>
                              <p className="text-sm text-slate-500">Rescheduled To</p>
                              <p className="font-semibold text-slate-900 mt-1">
                                {item.rescheduledTo?.date || "N/A"} •{" "}
                                {item.rescheduledTo?.time || "N/A"}
                              </p>
                            </div>

                            <div className="md:col-span-2">
                              <Link
                                to={`/appointment-details/${item._id}`}
                                className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2 font-semibold text-white transition hover:bg-emerald-700"
                              >
                                <FileText className="h-4 w-4" />
                                View Appointment Details
                              </Link>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default DoctorPatientHistory;