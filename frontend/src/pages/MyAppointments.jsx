console.log("MYAPPOINTMENTS PAGE LOADED");

import React, { useEffect, useState } from "react";
import { useAuth, useUser } from "@clerk/clerk-react";
import { History } from "lucide-react";

const MyAppointments = () => {
  const API_BASE = "http://localhost:4000";
  const { user, isLoaded } = useUser();
  const { getToken } = useAuth();

  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [cancelingId, setCancelingId] = useState("");
  const [showHistory, setShowHistory] = useState(false);

  useEffect(() => {
    let mounted = true;

    const loadAppointments = async () => {
      if (!isLoaded) return;

      if (!user?.id) {
        if (mounted) {
          setAppointments([]);
          setLoading(false);
        }
        return;
      }

      setLoading(true);
      setError("");

      try {
        const token = await getToken();

        const res = await fetch(`${API_BASE}/api/appointments/me`, {
          method: "GET",
          headers: token
            ? {
                Authorization: `Bearer ${token}`,
              }
            : {},
        });

        const data = await res.json().catch(() => null);

        if (!res.ok) {
          throw new Error(data?.message || "Failed to load appointments");
        }

        console.log("MY APPOINTMENTS API RESPONSE:", data);

        if (mounted) {
          setAppointments(
            Array.isArray(data?.appointments) ? data.appointments : []
          );
        }
      } catch (err) {
        console.log("Appointments error:", err);

        if (mounted) {
          setError(err.message || "Something went wrong");
          setAppointments([]);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    loadAppointments();

    return () => {
      mounted = false;
    };
  }, [isLoaded, user?.id, getToken]);

  const handleCancelAppointment = async (appointmentId) => {
    const confirmCancel = window.confirm(
      "Are you sure you want to cancel this appointment?"
    );

    if (!confirmCancel) return;

    try {
      setCancelingId(appointmentId);

      const token = await getToken();

      const res = await fetch(
        `${API_BASE}/api/appointments/${appointmentId}/cancel`,
        {
          method: "POST",
          headers: token
            ? {
                Authorization: `Bearer ${token}`,
              }
            : {},
        }
      );

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        throw new Error(data?.message || "Failed to cancel appointment");
      }

      setAppointments((prev) =>
        prev.map((item) =>
          item._id === appointmentId
            ? { ...item, status: "Canceled" }
            : item
        )
      );
    } catch (err) {
      console.log("Cancel error:", err);
      alert(err.message || "Something went wrong while canceling");
    } finally {
      setCancelingId("");
    }
  };

  const activeAppointments = appointments.filter(
    (item) => String(item.status || "").toLowerCase() !== "canceled"
  );

  const canceledAppointments = appointments.filter(
    (item) => String(item.status || "").toLowerCase() === "canceled"
  );

  const listToRender = showHistory
    ? canceledAppointments
    : activeAppointments;

  return (
    <div
      style={{
        padding: "40px",
        background: "#f9fafb",
        minHeight: "100vh",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "20px",
          gap: "12px",
          flexWrap: "wrap",
        }}
      >
        <h2
          style={{
            fontSize: "28px",
            fontWeight: "700",
            margin: 0,
            color: "#0f172a",
          }}
        >
          {showHistory ? "Cancel History" : "My Appointments"}
        </h2>

      <button
  onClick={() => setShowHistory((prev) => !prev)}
  style={{
    display: "flex",
    alignItems: "center",
    gap: "8px",
    padding: "10px 16px",
    borderRadius: "10px",
    border: "none",
    background: showHistory ? "#111827" : "#2563eb",
    color: "#fff",
    cursor: "pointer",
    fontWeight: "600",
  }}
>
  <History size={18} />
  {showHistory ? "Back to Appointments" : "View History"}
</button>
      </div>

      {loading && <p>Loading...</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}

      {!loading && listToRender.length === 0 && !error && (
        <p>{showHistory ? "No cancel history found" : "No appointments found"}</p>
      )}

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
          gap: "20px",
        }}
      >
        {listToRender.map((item) => {
          const isCanceled =
            String(item.status || "").toLowerCase() === "canceled";
          const isCanceling = cancelingId === item._id;

          const doctorImage =
            item.doctorImage?.url ||
            item.doctorId?.imageUrl ||
            "https://via.placeholder.com/60";

          const paymentLabel =
            item.payment?.method === "Cash"
              ? "Pay at Hospital"
              : item.payment?.status || "-";

          return (
            <div
              key={item._id}
              style={{
                background: "#fff",
                borderRadius: "16px",
                padding: "20px",
                boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                transition: "0.3s",
                opacity: showHistory ? 0.92 : 1,
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "15px",
                }}
              >
                <img
                  src={doctorImage}
                  alt="doctor"
                  style={{
                    width: "60px",
                    height: "60px",
                    borderRadius: "50%",
                    objectFit: "cover",
                  }}
                />

                <div>
                  <h3
                    style={{
                      margin: 0,
                      fontSize: "20px",
                      color: "#0f172a",
                    }}
                  >
                    {item.doctorName || item.doctorId?.name || "-"}
                  </h3>
                  <p
                    style={{
                      margin: "4px 0 0",
                      color: "#6b7280",
                      fontSize: "16px",
                    }}
                  >
                    {item.speciality || item.doctorId?.specialization || "-"}
                  </p>
                </div>
              </div>

              <div
                style={{
                  marginTop: "15px",
                  lineHeight: "1.7",
                  color: "#111827",
                }}
              >
                <p style={{ margin: "6px 0" }}>
                  <b>Patient:</b> {item.patientName || "-"}
                </p>
                <p style={{ margin: "6px 0" }}>
                  <b>Mobile:</b> {item.mobile || "-"}
                </p>
                <p style={{ margin: "6px 0" }}>
                  <b>Date:</b> {item.date || "-"}
                </p>
                <p style={{ margin: "6px 0" }}>
                  <b>Time:</b> {item.time || "-"}
                </p>
                <p style={{ margin: "6px 0" }}>
                  <b>Fees:</b> ₹{item.fees ?? item.fee ?? 0}
                </p>
              </div>

              <div
                style={{
                  marginTop: "12px",
                  display: "flex",
                  gap: "10px",
                  flexWrap: "wrap",
                }}
              >
                <span
                  style={{
                    padding: "6px 12px",
                    borderRadius: "20px",
                    fontSize: "12px",
                    fontWeight: "600",
                    background: isCanceled ? "#fee2e2" : "#dcfce7",
                    color: isCanceled ? "#b91c1c" : "#166534",
                  }}
                >
                  {item.status || "-"}
                </span>

                <span
                  style={{
                    padding: "6px 12px",
                    borderRadius: "20px",
                    fontSize: "12px",
                    fontWeight: "600",
                    background:
                      item.payment?.status === "Paid"
                        ? "#dcfce7"
                        : "#fef3c7",
                    color:
                      item.payment?.status === "Paid"
                        ? "#166534"
                        : "#92400e",
                  }}
                >
                  {paymentLabel}
                </span>
              </div>

              {!showHistory && !isCanceled && (
                <button
                  onClick={() => handleCancelAppointment(item._id)}
                  disabled={isCanceling}
                  style={{
                    marginTop: "16px",
                    width: "100%",
                    padding: "12px",
                    background: isCanceling ? "#9ca3af" : "#ef4444",
                    color: "#fff",
                    border: "none",
                    borderRadius: "10px",
                    cursor: isCanceling ? "not-allowed" : "pointer",
                    fontWeight: "600",
                    fontSize: "16px",
                  }}
                >
                  {isCanceling ? "Canceling..." : "Cancel Appointment"}
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default MyAppointments;