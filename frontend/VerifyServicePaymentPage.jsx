import axios from "axios";
import React, { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";

const API_BASE = "http://localhost:4000";

const VerifyServicePaymentPage = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    let cancelled = false;

    const verifyServicePayment = async () => {
      const params = new URLSearchParams(location.search || "");
      const sessionId = params.get("session_id");

      // Cancel case
      if (location.pathname === "/service-appointment/cancel") {
        if (!cancelled) {
          navigate("/my-appointments?service_payment=Cancelled", {
            replace: true,
          });
        }
        return;
      }

      // No session id
      if (!sessionId) {
        if (!cancelled) {
          navigate("/my-appointments?service_payment=Failed", {
            replace: true,
          });
        }
        return;
      }

      try {
        const res = await axios.get(
          `${API_BASE}/api/service-appointments/confirm`,
          {
            params: { session_id: sessionId }, // ✅ IMPORTANT FIX
            timeout: 15000,
          }
        );

        if (cancelled) return;

        if (res?.data?.success) {
          navigate("/my-appointments?service_payment=Paid", {
            replace: true,
          });
        } else {
          navigate("/my-appointments?service_payment=Failed", {
            replace: true,
          });
        }
      } catch (error) {
        console.error("Service Payment verification failed:", error);

        if (!cancelled) {
          navigate("/my-appointments?service_payment=Failed", {
            replace: true,
          });
        }
      }
    };

    verifyServicePayment();

    return () => {
      cancelled = true;
    };
  }, [location, navigate]);

  return (
    <div className="min-h-[40vh] flex items-center justify-center text-lg font-medium">
      Verifying service payment...
    </div>
  );
};

export default VerifyServicePaymentPage;