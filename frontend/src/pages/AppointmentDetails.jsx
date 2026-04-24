import React, { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  ArrowLeft,
  CalendarDays,
  Clock3,
  UserRound,
  Stethoscope,
  CreditCard,
  BadgeCheck,
  Phone,
  IndianRupee,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Wallet,
  RefreshCcw,
} from "lucide-react";

const API_BASE = "http://localhost:4000";
const DEV_CREATED_BY = "temp-user-1";

const AppointmentDetails = () => {
  const { id } = useParams();

  const [appointment, setAppointment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState("");

  const [showRescheduleForm, setShowRescheduleForm] = useState(false);
  const [newDate, setNewDate] = useState("");
  const [newTime, setNewTime] = useState("");

  const fetchAppointment = async () => {
    try {
      setLoading(true);
      setError("");

      const res = await fetch(
        `${API_BASE}/api/appointments?limit=100&createdBy=${DEV_CREATED_BY}`
      );

      const text = await res.text();

      let data;
      try {
        data = JSON.parse(text);
      } catch {
        throw new Error(text || "Invalid server response");
      }

      if (!res.ok) {
        throw new Error(data?.message || "Failed to load appointment");
      }

      const items = Array.isArray(data?.appointments) ? data.appointments : [];
      const found = items.find((item) => item._id === id);

      if (!found) {
        throw new Error("Appointment not found");
      }

      setAppointment(found);
    } catch (err) {
      console.error("Appointment details error:", err);
      setError(err.message || "Failed to fetch appointment details");
      setAppointment(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!id) {
      setLoading(false);
      setError("Appointment ID is missing");
      return;
    }

    fetchAppointment();
  }, [id]);

  const getStatusBadgeClass = (status) => {
    if (status === "Confirmed" || status === "Completed") {
      return "bg-green-100 text-green-700";
    }
    if (status === "Canceled") {
      return "bg-red-100 text-red-700";
    }
    if (status === "Pending") {
      return "bg-yellow-100 text-yellow-700";
    }
    if (status === "Rescheduled") {
      return "bg-blue-100 text-blue-700";
    }
    return "bg-slate-100 text-slate-700";
  };

  const getPaymentBadgeClass = (status) => {
    if (status === "Paid") {
      return "bg-green-100 text-green-700";
    }
    if (status === "Failed" || status === "Refunded") {
      return "bg-red-100 text-red-700";
    }
    if (status === "Pending") {
      return "bg-yellow-100 text-yellow-700";
    }
    return "bg-slate-100 text-slate-700";
  };

  const getStatusIcon = (status) => {
    if (status === "Confirmed" || status === "Completed") {
      return <CheckCircle2 size={16} />;
    }
    if (status === "Canceled") {
      return <XCircle size={16} />;
    }
    return <AlertCircle size={16} />;
  };

  const formatDate = (value) => {
    if (!value) return "-";
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return value;
    return d.toLocaleDateString();
  };

  const formatDateTime = (value) => {
    if (!value) return "-";
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return value;
    return d.toLocaleString();
  };

  const doctorImage = useMemo(() => {
    if (appointment?.doctorImage?.url) return appointment.doctorImage.url;
    return "/placeholder-doctor.jpg";
  }, [appointment]);

  const isCanceled = appointment?.status === "Canceled";
  const isCompleted = appointment?.status === "Completed";
  const isTerminal = isCanceled || isCompleted;

  const handleCancelAppointment = async () => {
    if (!appointment?._id || actionLoading || isCanceled) return;

    const ok = window.confirm("Are you sure you want to cancel this appointment?");
    if (!ok) return;

    try {
      setActionLoading(true);

      const res = await fetch(
        `${API_BASE}/api/appointments/${appointment._id}/cancel`,
        {
          method: "POST",
        }
      );

      const text = await res.text();

      let data;
      try {
        data = JSON.parse(text);
      } catch {
        throw new Error(text || "Invalid cancel response");
      }

      if (!res.ok) {
        throw new Error(data?.message || "Failed to cancel appointment");
      }

      await fetchAppointment();
      window.alert("Appointment canceled successfully");
    } catch (err) {
      console.error("Cancel appointment error:", err);
      window.alert(err.message || "Failed to cancel appointment");
    } finally {
      setActionLoading(false);
    }
  };

  const handleRescheduleAppointment = async () => {
    if (!appointment?._id || actionLoading) return;

    if (!newDate || !newTime) {
      window.alert("Please select new date and time");
      return;
    }

    try {
      setActionLoading(true);

      const res = await fetch(`${API_BASE}/api/appointments/${appointment._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          date: newDate,
          time: newTime,
        }),
      });

      const text = await res.text();

      let data;
      try {
        data = JSON.parse(text);
      } catch {
        throw new Error(text || "Invalid reschedule response");
      }

      if (!res.ok) {
        throw new Error(data?.message || "Failed to reschedule appointment");
      }

      await fetchAppointment();
      setShowRescheduleForm(false);
      setNewDate("");
      setNewTime("");
      window.alert("Appointment rescheduled successfully");
    } catch (err) {
      console.error("Reschedule appointment error:", err);
      window.alert(err.message || "Failed to reschedule appointment");
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 px-4 py-8">
        <div className="max-w-5xl mx-auto">
          <p className="text-center text-slate-600">
            Loading appointment details...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-50 px-4 py-8">
        <div className="max-w-5xl mx-auto">
          <Link
            to="/appointments"
            className="inline-flex items-center gap-2 text-slate-700 hover:text-slate-900 font-medium mb-6"
          >
            <ArrowLeft size={18} />
            Back to Appointments
          </Link>

          <div className="border border-red-200 bg-red-50 text-red-700 rounded-2xl p-5 text-center">
            {error}
          </div>
        </div>
      </div>
    );
  }

  if (!appointment) {
    return (
      <div className="min-h-screen bg-slate-50 px-4 py-8">
        <div className="max-w-5xl mx-auto">
          <p className="text-center text-slate-600">Appointment not found.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-8">
      <div className="max-w-5xl mx-auto">
        <div className="mb-6">
          <Link
            to="/appointments"
            className="inline-flex items-center gap-2 text-slate-700 hover:text-slate-900 font-medium"
          >
            <ArrowLeft size={18} />
            Back to Appointments
          </Link>
        </div>

        <div className="bg-white border border-slate-200 rounded-3xl shadow-sm p-6 md:p-8">
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-8">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-slate-900">
                Appointment Details
              </h1>
              <p className="text-slate-600 mt-2">
                Complete information about this appointment.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <span
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold ${getStatusBadgeClass(
                  appointment.status
                )}`}
              >
                {getStatusIcon(appointment.status)}
                {appointment.status || "-"}
              </span>

              <span
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold ${getPaymentBadgeClass(
                  appointment.payment?.status
                )}`}
              >
                <Wallet size={16} />
                {appointment.payment?.method || "-"} /{" "}
                {appointment.payment?.status || "-"}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5">
              <h2 className="text-xl font-bold text-slate-900 mb-4">
                Doctor Information
              </h2>

              <div className="space-y-4 text-slate-700">
                <div className="pt-1">
                  <img
                    src={doctorImage}
                    alt={appointment.doctorName || "Doctor"}
                    className="w-28 h-28 object-cover rounded-2xl border"
                  />
                </div>

                <div className="flex items-start gap-2">
                  <Stethoscope size={18} className="mt-1" />
                  <div>
                    <span className="font-semibold">Doctor:</span>{" "}
                    {appointment.doctorName || "-"}
                  </div>
                </div>

                <div className="flex items-start gap-2">
                  <BadgeCheck size={18} className="mt-1" />
                  <div>
                    <span className="font-semibold">Specialization:</span>{" "}
                    {appointment.speciality || "-"}
                  </div>
                </div>

                <div className="flex items-start gap-2">
                  <IndianRupee size={18} className="mt-1" />
                  <div>
                    <span className="font-semibold">Fees:</span> ₹
                    {appointment.fees ?? 0}
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5">
              <h2 className="text-xl font-bold text-slate-900 mb-4">
                Patient Information
              </h2>

              <div className="space-y-3 text-slate-700">
                <div className="flex items-start gap-2">
                  <UserRound size={18} className="mt-1" />
                  <div>
                    <span className="font-semibold">Patient Name:</span>{" "}
                    {appointment.patientName || "-"}
                  </div>
                </div>

                <div className="flex items-start gap-2">
                  <Phone size={18} className="mt-1" />
                  <div>
                    <span className="font-semibold">Mobile:</span>{" "}
                    {appointment.mobile || "-"}
                  </div>
                </div>

                <div className="flex items-start gap-2">
                  <UserRound size={18} className="mt-1" />
                  <div>
                    <span className="font-semibold">Age:</span>{" "}
                    {appointment.age ?? "-"}
                  </div>
                </div>

                <div className="flex items-start gap-2">
                  <UserRound size={18} className="mt-1" />
                  <div>
                    <span className="font-semibold">Gender:</span>{" "}
                    {appointment.gender || "-"}
                  </div>
                </div>

                <div className="flex items-start gap-2 break-all">
                  <BadgeCheck size={18} className="mt-1" />
                  <div>
                    <span className="font-semibold">Patient ID:</span>{" "}
                    {appointment.patientId?._id || appointment.patientId || "-"}
                  </div>
                </div>

                <div className="flex items-start gap-2">
                  <BadgeCheck size={18} className="mt-1" />
                  <div>
                    <span className="font-semibold">Patient Unique ID:</span>{" "}
                    {appointment.patientId?.patientUniqueId || "-"}
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5">
              <h2 className="text-xl font-bold text-slate-900 mb-4">
                Appointment Information
              </h2>

              <div className="space-y-3 text-slate-700">
                <div className="flex items-start gap-2">
                  <CalendarDays size={18} className="mt-1" />
                  <div>
                    <span className="font-semibold">Appointment Date:</span>{" "}
                    {appointment.date || "-"}
                  </div>
                </div>

                <div className="flex items-start gap-2">
                  <Clock3 size={18} className="mt-1" />
                  <div>
                    <span className="font-semibold">Appointment Time:</span>{" "}
                    {appointment.time || "-"}
                  </div>
                </div>

                <div className="flex items-start gap-2">
                  <CalendarDays size={18} className="mt-1" />
                  <div>
                    <span className="font-semibold">Booked On:</span>{" "}
                    {formatDateTime(appointment.createdAt)}
                  </div>
                </div>

                <div className="flex items-start gap-2">
                  <CalendarDays size={18} className="mt-1" />
                  <div>
                    <span className="font-semibold">Updated On:</span>{" "}
                    {formatDateTime(appointment.updatedAt)}
                  </div>
                </div>

                {(appointment.rescheduledTo?.date ||
                  appointment.rescheduledTo?.time) && (
                  <div className="flex items-start gap-2">
                    <RefreshCcw size={18} className="mt-1" />
                    <div>
                      <span className="font-semibold">Rescheduled To:</span>{" "}
                      {appointment.rescheduledTo?.date || "-"} /{" "}
                      {appointment.rescheduledTo?.time || "-"}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5">
              <h2 className="text-xl font-bold text-slate-900 mb-4">
                Payment Information
              </h2>

              <div className="space-y-3 text-slate-700">
                <div className="flex items-start gap-2">
                  <CreditCard size={18} className="mt-1" />
                  <div>
                    <span className="font-semibold">Method:</span>{" "}
                    {appointment.payment?.method || "-"}
                  </div>
                </div>

                <div className="flex items-start gap-2">
                  <BadgeCheck size={18} className="mt-1" />
                  <div>
                    <span className="font-semibold">Payment Status:</span>{" "}
                    {appointment.payment?.status || "-"}
                  </div>
                </div>

                <div className="flex items-start gap-2">
                  <IndianRupee size={18} className="mt-1" />
                  <div>
                    <span className="font-semibold">Amount:</span> ₹
                    {appointment.payment?.amount ?? 0}
                  </div>
                </div>

                <div className="flex items-start gap-2 break-all">
                  <BadgeCheck size={18} className="mt-1" />
                  <div>
                    <span className="font-semibold">Provider ID:</span>{" "}
                    {appointment.payment?.providerId || "-"}
                  </div>
                </div>

                <div className="flex items-start gap-2 break-all">
                  <BadgeCheck size={18} className="mt-1" />
                  <div>
                    <span className="font-semibold">Session ID:</span>{" "}
                    {appointment.sessionId || "-"}
                  </div>
                </div>

                <div className="flex items-start gap-2">
                  <CalendarDays size={18} className="mt-1" />
                  <div>
                    <span className="font-semibold">Paid At:</span>{" "}
                    {appointment.paidAt
                      ? formatDateTime(appointment.paidAt)
                      : "-"}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 bg-slate-50 border border-slate-200 rounded-2xl p-5">
            <h2 className="text-xl font-bold text-slate-900 mb-3">
              Quick Summary
            </h2>

            <div className="text-slate-700 leading-7">
              Appointment with{" "}
              <span className="font-semibold">
                {appointment.doctorName || "-"}
              </span>{" "}
              for{" "}
              <span className="font-semibold">
                {appointment.patientName || "-"}
              </span>{" "}
              is currently{" "}
              <span className="font-semibold">
                {appointment.status || "-"}
              </span>
              . Payment is{" "}
              <span className="font-semibold">
                {appointment.payment?.status || "-"}
              </span>{" "}
              via{" "}
              <span className="font-semibold">
                {appointment.payment?.method || "-"}
              </span>
              .
            </div>
          </div>

          {showRescheduleForm && !isTerminal && (
            <div className="mt-6 bg-slate-50 border border-slate-200 rounded-2xl p-5">
              <h3 className="text-lg font-bold text-slate-900 mb-4">
                Reschedule Appointment
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    New Date
                  </label>
                  <input
                    type="date"
                    value={newDate}
                    onChange={(e) => setNewDate(e.target.value)}
                    className="w-full border border-slate-300 rounded-xl px-4 py-3 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    New Time
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 4:00 PM"
                    value={newTime}
                    onChange={(e) => setNewTime(e.target.value)}
                    className="w-full border border-slate-300 rounded-xl px-4 py-3 outline-none"
                  />
                </div>
              </div>

              <div className="mt-4 flex gap-3">
                <button
                  type="button"
                  onClick={handleRescheduleAppointment}
                  disabled={actionLoading}
                  className="bg-amber-500 hover:bg-amber-600 text-white px-5 py-3 rounded-xl font-semibold"
                >
                  {actionLoading ? "Updating..." : "Confirm Reschedule"}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setShowRescheduleForm(false);
                    setNewDate("");
                    setNewTime("");
                  }}
                  className="bg-slate-200 hover:bg-slate-300 text-slate-800 px-5 py-3 rounded-xl font-semibold"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          <div className="mt-8 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => setShowRescheduleForm((prev) => !prev)}
              disabled={actionLoading || isTerminal}
              className={`px-5 py-3 rounded-xl font-semibold transition ${
                actionLoading || isTerminal
                  ? "bg-slate-200 text-slate-500 cursor-not-allowed"
                  : "bg-amber-500 hover:bg-amber-600 text-white"
              }`}
            >
              Reschedule Appointment
            </button>

            <button
              type="button"
              onClick={handleCancelAppointment}
              disabled={actionLoading || isCanceled}
              className={`px-5 py-3 rounded-xl font-semibold transition ${
                actionLoading || isCanceled
                  ? "bg-slate-200 text-slate-500 cursor-not-allowed"
                  : "bg-red-600 hover:bg-red-700 text-white"
              }`}
            >
              {actionLoading ? "Processing..." : "Cancel Appointment"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AppointmentDetails;