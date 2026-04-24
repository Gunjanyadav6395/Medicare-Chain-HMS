import React, { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Users,
  CheckCircle,
  XCircle,
  BadgeIndianRupee,
  FileText,
  Phone,
} from "lucide-react";
import { dashboardStyles } from "../assets/dummyStyles";

const API_BASE = "http://localhost:4000";

/* ================= HELPERS ================= */

const parseDateTime = (date, time) => {
  if (!date || !time) return new Date(0);

  const rawTime = String(time).trim();

  if (/am|pm/i.test(rawTime)) {
    const match = rawTime.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
    if (!match) return new Date(`${date}T00:00:00`);

    let hh = Number(match[1]);
    const mm = match[2];
    const ampm = match[3].toUpperCase();

    if (ampm === "AM" && hh === 12) hh = 0;
    if (ampm === "PM" && hh !== 12) hh += 12;

    return new Date(`${date}T${String(hh).padStart(2, "0")}:${mm}:00`);
  }

  return new Date(`${date}T${rawTime}:00`);
};

const formatDate = (date) => {
  if (!date) return "";
  const d = new Date(`${date}T00:00:00`);
  if (Number.isNaN(d.getTime())) return date;

  return d.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

const formatTime = (time) => {
  if (!time) return "";

  const rawTime = String(time).trim();

  if (/am|pm/i.test(rawTime)) {
    return rawTime.toUpperCase();
  }

  const parts = rawTime.split(":");
  if (parts.length < 2) return rawTime;

  let hh = Number(parts[0]);
  const mm = parts[1];
  const ampm = hh >= 12 ? "PM" : "AM";
  hh = hh % 12 || 12;

  return `${hh}:${mm} ${ampm}`;
};

const mapStatus = (status) => {
  const value = String(status || "").trim().toLowerCase();

  if (value === "confirmed") return "confirmed";
  if (value === "completed" || value === "complete") return "complete";
  if (value === "canceled" || value === "cancelled") return "cancelled";
  if (value === "rescheduled") return "rescheduled";

  return "pending";
};

const getDoctorIdFromStorage = () => {
  try {
    const possibleKeys = [
      "doctorData",
      "doctor",
      "doctorInfo",
      "loggedDoctor",
    ];

    for (const key of possibleKeys) {
      const raw = localStorage.getItem(key);
      if (!raw) continue;

      const parsed = JSON.parse(raw);

      if (parsed?._id) return String(parsed._id);
      if (parsed?.id) return String(parsed.id);
      if (parsed?.doctor?._id) return String(parsed.doctor._id);
      if (parsed?.doctor?.id) return String(parsed.doctor.id);
    }
  } catch (error) {
    console.warn("Failed to read doctor data from localStorage:", error);
  }

  return "";
};

/* ================= NORMALIZER ================= */

function normalizeAppointment(appointment) {
  if (!appointment) return null;

  let patientId = "";

  if (appointment.patientId) {
    if (
      typeof appointment.patientId === "object" &&
      appointment.patientId !== null
    ) {
      patientId = appointment.patientId._id
        ? String(appointment.patientId._id)
        : "";
    } else {
      patientId = String(appointment.patientId);
    }
  }

  const patientUniqueId =
    (typeof appointment.patientId === "object" &&
      appointment.patientId?.patientUniqueId) ||
    appointment.patientUniqueId ||
    "";

  return {
    id: appointment._id || appointment.id || "",
    patient: appointment.patientName || appointment.name || "Unknown",
    age: appointment.age || "",
    gender: appointment.gender || "",
    doctorName: appointment.doctorId?.name || appointment.doctorName || "Doctor",
    speciality:
      appointment.doctorId?.specialization ||
      appointment.doctorId?.speciality ||
      appointment.speciality ||
      "",
    mobile: appointment.mobile || appointment.phone || "",
    date: appointment.date || "",
    time: appointment.time || "",
    fee: Number(appointment.fees || appointment.fee || 0),
    status: mapStatus(appointment.status),
    patientId,
    patientUniqueId,
  };
}

/* ================= MAIN COMPONENT ================= */

export default function DashboardPage() {
  const params = useParams();
  const navigate = useNavigate();

  const doctorIdFromRoute = params?.id ? String(params.id) : "";
  const doctorId = doctorIdFromRoute || getDoctorIdFromStorage();

  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      setError("");

      if (!doctorId) {
        setError("Doctor ID missing in route or localStorage");
        setAppointments([]);
        return;
      }

      const res = await fetch(`${API_BASE}/api/appointments/doctor/${doctorId}`);
      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(data?.message || "Failed to fetch doctor appointments");
      }

      const normalized = Array.isArray(data?.appointments)
        ? data.appointments.map(normalizeAppointment).filter(Boolean)
        : [];

      setAppointments(normalized);
    } catch (err) {
      console.error("Dashboard fetch error:", err);
      setError(err.message || "Something went wrong");
      setAppointments([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, [doctorId]);

  const sortedAppointments = useMemo(() => {
    return [...appointments].sort(
      (a, b) => parseDateTime(b.date, b.time) - parseDateTime(a.date, a.time)
    );
  }, [appointments]);

  const total = appointments.length;
  const completed = appointments.filter((a) => a.status === "complete").length;
  const cancelled = appointments.filter((a) => a.status === "cancelled").length;
  const earnings = appointments
    .filter((a) => a.status === "complete" || a.status === "confirmed")
    .reduce((sum, a) => sum + a.fee, 0);

  const handleViewHistory = (appointment) => {
    if (!appointment?.patientId) {
      alert("Patient ID missing");
      return;
    }

    if (!doctorId) {
      alert("Doctor ID missing");
      return;
    }

    if (appointment.status !== "confirmed") {
      alert("Only confirmed appointments can open patient history");
      return;
    }

    navigate(`/patient-history/${appointment.patientId}?doctorId=${doctorId}`);
  };

  return (
    <div className={dashboardStyles.pageContainer}>
      <div className={dashboardStyles.contentWrapper}>
        <h1 className={dashboardStyles.headerTitle}>Doctor Dashboard</h1>

        {error ? (
          <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-red-700">
            {error}
          </div>
        ) : null}

        {!doctorId ? (
          <div className="mb-4 rounded-xl border border-yellow-200 bg-yellow-50 px-4 py-3 text-yellow-800">
            Doctor ID not found. Open this dashboard from doctor login flow.
          </div>
        ) : null}

        <div className={dashboardStyles.statsGrid}>
          <StatCard title="Total" value={total} icon={<Users />} />
          <StatCard
            title="Earnings"
            value={`₹${earnings}`}
            icon={<BadgeIndianRupee />}
          />
          <StatCard
            title="Completed"
            value={completed}
            icon={<CheckCircle />}
          />
          <StatCard
            title="Cancelled"
            value={cancelled}
            icon={<XCircle />}
          />
        </div>

        <div className={dashboardStyles.cardsGrid}>
          {loading ? (
            <p>Loading...</p>
          ) : sortedAppointments.length === 0 ? (
            <p>No appointments found</p>
          ) : (
            sortedAppointments.map((appointment) => {
              const canViewHistory =
                appointment.status === "confirmed" &&
                Boolean(appointment.patientId) &&
                Boolean(doctorId);

              return (
                <div
                  key={appointment.id}
                  className={dashboardStyles.appointmentCard}
                >
                  <h3>{appointment.patient}</h3>

                  <p>
                    {appointment.age} yrs · {appointment.gender}
                  </p>

                  <p>{appointment.speciality}</p>

                  <p>
                    {formatDate(appointment.date)} • {formatTime(appointment.time)}
                  </p>

                  <p>₹{appointment.fee}</p>

                  <div className="flex items-center gap-2">
                    <Phone size={16} />
                    <span>{appointment.mobile || "No mobile"}</span>
                  </div>

                  <p className="mt-2 text-xs text-gray-500">
                    PID: {appointment.patientId || "MISSING"}
                  </p>

                  <p className="text-xs text-gray-500">
                    Unique ID: {appointment.patientUniqueId || "N/A"}
                  </p>

                  <p className="text-xs capitalize mt-1 text-gray-500">
                    Status: {appointment.status}
                  </p>

                  <button
                    onClick={() => handleViewHistory(appointment)}
                    disabled={!canViewHistory}
                    className={`mt-3 w-full rounded px-3 py-2 flex items-center justify-center gap-2 ${
                      canViewHistory
                        ? "bg-blue-600 text-white hover:bg-blue-700"
                        : "bg-gray-300 text-gray-500 cursor-not-allowed"
                    }`}
                  >
                    <FileText size={16} />
                    View Patient History
                  </button>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}

/* ================= STAT CARD ================= */

function StatCard({ title, value, icon }) {
  return (
    <div className={dashboardStyles.statCard}>
      <div className="flex items-center justify-between">
        <div>
          <p>{title}</p>
          <h3>{value}</h3>
        </div>
        {icon}
      </div>
    </div>
  );
}