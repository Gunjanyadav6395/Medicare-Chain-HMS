import React, { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useAuth, useUser } from "@clerk/clerk-react";
import Navbar from "../Components/Navbar";
import Footer from "../Components/Footer";

const ReportDetails = () => {
  const API_BASE = "http://localhost:4000";
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isLoaded } = useUser();
  const { getToken } = useAuth();

  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deleting, setDeleting] = useState(false);

  const isPdfFile = (item) => {
    if (!item) return false;
    if (item.fileType?.includes("pdf")) return true;
    return item.fileUrl?.toLowerCase().endsWith(".pdf");
  };

  const isImageFile = (item) => {
    if (!item) return false;
    if (item.fileType?.startsWith("image/")) return true;

    const url = item.fileUrl?.toLowerCase() || "";
    return (
      url.endsWith(".png") ||
      url.endsWith(".jpg") ||
      url.endsWith(".jpeg") ||
      url.endsWith(".webp")
    );
  };

  const getFileExtension = (url) => {
    try {
      const cleanUrl = url.split("?")[0].split("#")[0];
      const parts = cleanUrl.split(".");
      return parts[parts.length - 1] || "pdf";
    } catch {
      return "pdf";
    }
  };

  const loadReport = async () => {
    if (!isLoaded || !user?.id || !id) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError("");

      const token = await getToken();

      const res = await fetch(
        `${API_BASE}/api/reports/${id}?createdBy=${user.id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.message || "Failed to load report details");
      }

      setReport(data.report || null);
    } catch (err) {
      console.error("Report details error:", err);
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReport();
  }, [id, isLoaded, user?.id]);

  const handleDelete = async () => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this report?"
    );
    if (!confirmed) return;

    try {
      setDeleting(true);

      const token = await getToken();

      const res = await fetch(
        `${API_BASE}/api/reports/${id}?createdBy=${user.id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.message || "Delete failed");
      }

      alert("Report deleted successfully");
      navigate("/my-reports");
    } catch (err) {
      console.error("Delete report error:", err);
      alert(err.message || "Failed to delete report");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="mb-6">
          <Link
            to="/my-reports"
            className="inline-flex items-center text-blue-600 hover:text-blue-700 font-semibold"
          >
            ← Back to My Reports
          </Link>
        </div>

        {loading && (
          <div className="bg-white rounded-3xl shadow-md border border-gray-100 p-8">
            <p className="text-slate-600 text-lg">Loading report details...</p>
          </div>
        )}

        {error && (
          <div className="bg-white rounded-3xl shadow-md border border-gray-100 p-8">
            <p className="text-red-600 text-lg font-medium">{error}</p>
          </div>
        )}

        {!loading && !error && !report && (
          <div className="bg-white rounded-3xl shadow-md border border-gray-100 p-8">
            <p className="text-slate-700 text-lg font-medium">
              Report not found.
            </p>
          </div>
        )}

        {!loading && !error && report && (
          <div className="bg-white rounded-3xl shadow-md border border-gray-100 p-6 md:p-8">
            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6 mb-8">
              <div>
                <h1 className="text-3xl md:text-4xl font-bold text-slate-900">
                  {report.title}
                </h1>

                <div className="mt-4 space-y-3 text-slate-700 text-lg">
                  <p>
                    <span className="font-semibold text-slate-900">Type:</span>{" "}
                    {report.reportType || "General"}
                  </p>

                  <p>
                    <span className="font-semibold text-slate-900">Doctor:</span>{" "}
                    {report.doctorName || "-"}
                  </p>

                  <p>
                    <span className="font-semibold text-slate-900">
                      Uploaded:
                    </span>{" "}
                    {report.createdAt
                      ? new Date(report.createdAt).toLocaleDateString()
                      : "-"}
                  </p>

                  <p>
                    <span className="font-semibold text-slate-900">
                      File Type:
                    </span>{" "}
                    {report.fileType || getFileExtension(report.fileUrl).toUpperCase()}
                  </p>
                </div>
              </div>

              <div className="flex gap-3 flex-wrap">
                <a
                  href={report.fileUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-5 py-3 rounded-xl transition"
                >
                  Open in New Tab
                </a>

                <a
                  href={report.fileUrl}
                  download={`${
                    report.title?.replace(/\s+/g, "-") || "report"
                  }.${getFileExtension(report.fileUrl)}`}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-5 py-3 rounded-xl transition"
                >
                  Download
                </a>

                <button
                  type="button"
                  onClick={handleDelete}
                  disabled={deleting}
                  className="bg-red-600 hover:bg-red-700 text-white font-semibold px-5 py-3 rounded-xl transition disabled:opacity-60"
                >
                  {deleting ? "Deleting..." : "Delete"}
                </button>
              </div>
            </div>

            <div className="border border-slate-200 rounded-2xl p-4 bg-slate-50">
              <h2 className="text-2xl font-bold text-slate-900 mb-4">
                Preview
              </h2>

              <div className="h-[80vh] overflow-auto bg-white rounded-xl border">
                {isPdfFile(report) ? (
                  <iframe
                    src={`${report.fileUrl}#toolbar=1&navpanes=0&scrollbar=1`}
                    title="Report Preview"
                    className="w-full h-full rounded-xl"
                  />
                ) : isImageFile(report) ? (
                  <div className="p-4">
                    <img
                      src={report.fileUrl}
                      alt={report.title || "Report"}
                      className="max-w-full max-h-[75vh] mx-auto rounded-lg"
                    />
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full p-8">
                    <p className="text-gray-600 mb-4">
                      Preview not available for this file type.
                    </p>
                    <a
                      href={report.fileUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition"
                    >
                      Open File
                    </a>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default ReportDetails;