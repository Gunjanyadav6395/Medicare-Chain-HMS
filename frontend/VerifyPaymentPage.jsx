import axios from "axios";
import React, { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";

const API_BASE = "http://localhost:4000";

const VerifyPaymentPage = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    let cancelled = false;

    const verifyPayment = async () => {
      const params = new URLSearchParams(location.search || "");
      const sessionId = params.get("session_id");

      if (location.pathname === "/appointment/cancel") {
        if (!cancelled) {
          navigate("/my-appointments", { replace: true });
        }
        return;
      }

      if (!sessionId) {
        if (!cancelled) {
          navigate("/my-appointments", { replace: true });
        }
        return;
      }

      try {
        const res = await axios.get(`${API_BASE}/api/appointments/confirm`, {
          params: { session_id: sessionId },
          timeout: 15000,
        });

        if (cancelled) return;

        if (res?.data?.success) {
          navigate("/my-appointments", { replace: true });
        } else {
          navigate("/my-appointments", { replace: true });
        }
      } catch (error) {
        console.error("Payment verification failed:", error);
        if (!cancelled) {
          navigate("/my-appointments", { replace: true });
        }
      }
    };

    verifyPayment();

    return () => {
      cancelled = true;
    };
  }, [location.pathname, location.search, navigate]);

  return (
    <div className="min-h-[40vh] flex items-center justify-center text-lg font-medium">
      Verifying payment...
    </div>
  );
};

export default VerifyPaymentPage;