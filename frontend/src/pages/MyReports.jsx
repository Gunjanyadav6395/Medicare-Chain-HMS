import React, { useEffect, useMemo, useState } from "react";
import { useAuth, useUser } from "@clerk/clerk-react";
import Navbar from "../Components/Navbar";
import Footer from "../Components/Footer";
import { Link } from "react-router-dom";

const MyReports = () => {
  const API_BASE = "http://localhost:4000";
  const DEV_CREATED_BY = "temp-user-1";
  const { user, isLoaded } = useUser();
  const { getToken } = useAuth();

  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [title, setTitle] = useState("");
  const [reportType, setReportType] = useState("");
  const [doctorName, setDoctorName] = useState("");
  const [recordDate, setRecordDate] = useState("");
  const [hospitalName, setHospitalName] = useState("");
  const [notes, setNotes] = useState("");
  const [file, setFile] = useState(null);

  const [uploading, setUploading] = useState(false);
  const [deletingId, setDeletingId] = useState("");

  const [selectedReport, setSelectedReport] = useState(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  const [typeFilter, setTypeFilter] = useState("All");
  const [dateFilter, setDateFilter] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");
  const [sortOrder, setSortOrder] = useState("Newest");

  const [currentPage, setCurrentPage] = useState(1);
  const reportsPerPage = 5;

  const getFileExtension = (url) => {
    if (!url) return "file";
    const cleanUrl = url.split("?")[0];
    const parts = cleanUrl.split(".");
    return parts[parts.length - 1];
  };

  const getDisplayDate = (report) => {
    return report?.recordDate || report?.createdAt || null;
  };

  const parseJsonSafely = async (res) => {
    const text = await res.text();

    try {
      return JSON.parse(text);
    } catch {
      console.error("RAW RESPONSE:", text);
      throw new Error(text || "Invalid server response");
    }
  };

  const loadReports = async () => {
    if (!isLoaded || !user?.id) {
      setReports([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError("");

      const token = await getToken();

      const res = await fetch(
        `${API_BASE}/api/reports/me?createdBy=${DEV_CREATED_BY}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await parseJsonSafely(res);

      if (!res.ok) {
        throw new Error(data?.message || "Failed to load reports");
      }

      setReports(data?.reports || []);
    } catch (err) {
      console.error("Reports error:", err);
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReports();
  }, [isLoaded, user?.id]);

  const handleUpload = async (e) => {
    e.preventDefault();

    if (!title.trim() || !recordDate || !hospitalName.trim()) {
      alert("Title, Record Date and Hospital Name are required");
      return;
    }

    if (!file) {
      alert("Please select a file");
      return;
    }

    try {
      setUploading(true);
      setError("");

      const token = await getToken();

      const formData = new FormData();
      formData.append("title", title);
      formData.append("reportType", reportType);
      formData.append("doctorName", doctorName);
      formData.append("recordDate", recordDate);
      formData.append("hospitalName", hospitalName);
      formData.append("notes", notes);
      formData.append("file", file);
      formData.append("createdBy", DEV_CREATED_BY);

      const res = await fetch(`${API_BASE}/api/reports`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await parseJsonSafely(res);

      if (!res.ok) {
        throw new Error(data?.message || "Upload failed");
      }

      alert("Report uploaded successfully");

      setTitle("");
      setReportType("");
      setDoctorName("");
      setRecordDate("");
      setHospitalName("");
      setNotes("");
      setFile(null);

      const fileInput = document.getElementById("reportFileInput");
      if (fileInput) fileInput.value = "";

      await loadReports();
      setCurrentPage(1);
    } catch (err) {
      console.error("Upload error:", err);
      alert(err.message || "Failed to upload report");
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (reportId) => {
    const isConfirmed = window.confirm(
      "Are you sure you want to delete this report?"
    );
    if (!isConfirmed) return;

    try {
      setDeletingId(reportId);

      const token = await getToken();

      const res = await fetch(
        `${API_BASE}/api/reports/${reportId}?createdBy=${DEV_CREATED_BY}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await parseJsonSafely(res);

      if (!res.ok) {
        throw new Error(data?.message || "Delete failed");
      }

      alert("Report deleted successfully");

      const updatedReports = reports.filter((item) => item._id !== reportId);
      setReports(updatedReports);

      if (selectedReport?._id === reportId) {
        setSelectedReport(null);
        setIsPreviewOpen(false);
      }
    } catch (err) {
      console.error("Delete error:", err);
      alert(err.message || "Failed to delete report");
    } finally {
      setDeletingId("");
    }
  };

  const openPreview = (report) => {
    setSelectedReport(report);
    setIsPreviewOpen(true);
  };

  const closePreview = () => {
    setSelectedReport(null);
    setIsPreviewOpen(false);
  };

  const isPdfFile = (report) => {
    if (!report) return false;
    if (report.fileType?.includes("pdf")) return true;
    return report.fileUrl?.toLowerCase().includes(".pdf");
  };

  const isImageFile = (report) => {
    if (!report) return false;

    if (report.fileType?.startsWith("image/")) return true;

    const url = report.fileUrl?.toLowerCase() || "";

    return (
      url.includes(".png") ||
      url.includes(".jpg") ||
      url.includes(".jpeg") ||
      url.includes(".webp")
    );
  };

  const uniqueReportTypes = useMemo(
    () => [
      "All",
      ...new Set(
        reports.map((report) => report.reportType?.trim()).filter(Boolean)
      ),
    ],
    [reports]
  );

  const filteredReports = useMemo(() => {
    return reports
      .filter((report) => {
        const matchesType =
          typeFilter === "All" || report.reportType === typeFilter;

        let matchesDate = true;
        const baseDate = getDisplayDate(report);

        if (dateFilter !== "All" && baseDate) {
          const reportDate = new Date(baseDate);
          const today = new Date();

          const diffTime = today - reportDate;
          const diffDays = diffTime / (1000 * 60 * 60 * 24);

          if (dateFilter === "Today") {
            matchesDate = reportDate.toDateString() === today.toDateString();
          } else if (dateFilter === "Last 7 Days") {
            matchesDate = diffDays <= 7;
          } else if (dateFilter === "Last 30 Days") {
            matchesDate = diffDays <= 30;
          }
        }

        const matchesSearch =
          !searchTerm.trim() ||
          report.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          report.hospitalName
            ?.toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          report.doctorName?.toLowerCase().includes(searchTerm.toLowerCase());

        return matchesType && matchesDate && matchesSearch;
      })
      .sort((a, b) => {
        const dateA = new Date(a.recordDate || a.createdAt);
        const dateB = new Date(b.recordDate || b.createdAt);

        return sortOrder === "Newest" ? dateB - dateA : dateA - dateB;
      });
  }, [reports, typeFilter, dateFilter, searchTerm, sortOrder]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredReports.length / reportsPerPage)
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [typeFilter, dateFilter, searchTerm, sortOrder]);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const paginatedReports = filteredReports.slice(
    (currentPage - 1) * reportsPerPage,
    currentPage * reportsPerPage
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-6xl mx-auto px-4 py-4">
        <div className="bg-white rounded-3xl shadow-md border border-gray-100 p-4 md:p-5">
          <div className="flex items-center justify-between gap-3 mb-4">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900">
              My Reports
            </h2>
            <span className="text-lg text-slate-600 font-medium">
              Total: {reports.length}
            </span>
          </div>

          <form
            onSubmit={handleUpload}
            className="bg-slate-50 border border-slate-200 rounded-2xl p-3 md:p-4 mb-4"
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <input
                type="text"
                placeholder="Report Title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full border border-slate-300 px-4 py-2 rounded-xl outline-none focus:border-blue-500"
              />

              <input
                type="text"
                placeholder="Report Type"
                value={reportType}
                onChange={(e) => setReportType(e.target.value)}
                className="w-full border border-slate-300 px-4 py-2 rounded-xl outline-none focus:border-blue-500"
              />

              <input
                type="text"
                placeholder="Doctor Name"
                value={doctorName}
                onChange={(e) => setDoctorName(e.target.value)}
                className="w-full border border-slate-300 px-4 py-2 rounded-xl outline-none focus:border-blue-500"
              />

              <input
                type="date"
                value={recordDate}
                onChange={(e) => setRecordDate(e.target.value)}
                className="w-full border border-slate-300 px-4 py-2 rounded-xl outline-none focus:border-blue-500"
              />

              <input
                type="text"
                placeholder="Hospital Name"
                value={hospitalName}
                onChange={(e) => setHospitalName(e.target.value)}
                className="w-full border border-slate-300 px-4 py-2 rounded-xl outline-none focus:border-blue-500"
              />

              <input
                id="reportFileInput"
                type="file"
                accept=".pdf,image/*"
                onChange={(e) => setFile(e.target.files[0])}
                className="w-full border border-slate-300 px-4 py-2 rounded-xl bg-white"
              />

              <textarea
                placeholder="Notes (optional)"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows="2"
                className="w-full border border-slate-300 px-4 py-2 rounded-xl outline-none focus:border-blue-500 md:col-span-2"
              />

              <button
                type="submit"
                disabled={uploading}
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-2 rounded-xl transition disabled:opacity-60"
              >
                {uploading ? "Uploading..." : "Upload Report"}
              </button>
            </div>
          </form>

          {!loading && !error && reports.length > 0 && (
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3 md:p-4 mb-4">
              <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
                <div className="w-full">
                  <label className="block text-sm font-semibold text-slate-700 mb-1">
                    Search
                  </label>
                  <input
                    type="text"
                    placeholder="Search title, hospital, doctor..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full border border-slate-300 px-4 py-2 rounded-xl outline-none focus:border-blue-500 bg-white"
                  />
                </div>

                <div className="w-full">
                  <label className="block text-sm font-semibold text-slate-700 mb-1">
                    Filter by Type
                  </label>
                  <select
                    value={typeFilter}
                    onChange={(e) => setTypeFilter(e.target.value)}
                    className="w-full border border-slate-300 px-4 py-2 rounded-xl outline-none focus:border-blue-500 bg-white"
                  >
                    {uniqueReportTypes.map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="w-full">
                  <label className="block text-sm font-semibold text-slate-700 mb-1">
                    Filter by Date
                  </label>
                  <select
                    value={dateFilter}
                    onChange={(e) => setDateFilter(e.target.value)}
                    className="w-full border border-slate-300 px-4 py-2 rounded-xl outline-none focus:border-blue-500 bg-white"
                  >
                    <option value="All">All</option>
                    <option value="Today">Today</option>
                    <option value="Last 7 Days">Last 7 Days</option>
                    <option value="Last 30 Days">Last 30 Days</option>
                  </select>
                </div>

                <div className="w-full">
                  <label className="block text-sm font-semibold text-slate-700 mb-1">
                    Sort by Date
                  </label>
                  <select
                    value={sortOrder}
                    onChange={(e) => setSortOrder(e.target.value)}
                    className="w-full border border-slate-300 px-4 py-2 rounded-xl outline-none focus:border-blue-500 bg-white"
                  >
                    <option value="Newest">Newest First</option>
                    <option value="Oldest">Oldest First</option>
                  </select>
                </div>

                <div className="w-full flex items-end">
                  <button
                    type="button"
                    onClick={() => {
                      setSearchTerm("");
                      setTypeFilter("All");
                      setDateFilter("All");
                      setSortOrder("Newest");
                      setCurrentPage(1);
                    }}
                    className="w-full bg-gray-600 hover:bg-gray-700 text-white font-semibold px-6 py-2 rounded-xl transition"
                  >
                    Clear Filters
                  </button>
                </div>
              </div>
            </div>
          )}

          {!loading && !error && reports.length > 0 && (
            <p className="text-sm md:text-base text-slate-600 mb-3">
              Showing{" "}
              <span className="font-semibold">{filteredReports.length}</span> of{" "}
              <span className="font-semibold">{reports.length}</span> reports
            </p>
          )}

          {loading && <p className="text-slate-600 text-lg">Loading reports...</p>}

          {error && <p className="text-red-600 text-lg font-medium">{error}</p>}

          {!loading && !error && reports.length === 0 && (
            <div className="border border-dashed border-slate-300 rounded-2xl p-6 text-center">
              <p className="text-2xl font-semibold text-slate-700">
                No reports uploaded yet.
              </p>
              <p className="text-slate-500 mt-1">
                Your uploaded medical reports will appear here.
              </p>
            </div>
          )}

          {!loading &&
            !error &&
            reports.length > 0 &&
            filteredReports.length === 0 && (
              <div className="border border-dashed border-slate-300 rounded-2xl p-6 text-center">
                <p className="text-2xl font-semibold text-slate-700">
                  No matching reports found.
                </p>
                <p className="text-slate-500 mt-1">
                  Try changing the search, filters, or sort.
                </p>
              </div>
            )}

          {!loading &&
            !error &&
            reports.length > 0 &&
            filteredReports.length > 0 && (
              <>
                <div className="grid gap-3">
                  {paginatedReports.map((report) => (
                    <div
                      key={report._id}
                      className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm hover:shadow-md transition"
                    >
                      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3">
                        <div>
                          <h3 className="text-2xl font-bold text-slate-900">
                            {report.title}
                          </h3>

                          <div className="mt-2 grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-1 text-slate-600">
                            <p>
                              <span className="font-semibold text-slate-800">
                                Type:
                              </span>{" "}
                              {report.reportType || "General"}
                            </p>

                            <p>
                              <span className="font-semibold text-slate-800">
                                Record Date:
                              </span>{" "}
                              {report.recordDate
                                ? new Date(report.recordDate).toLocaleDateString()
                                : "N/A"}
                            </p>

                            <p>
                              <span className="font-semibold text-slate-800">
                                Uploaded:
                              </span>{" "}
                              {report.createdAt
                                ? new Date(report.createdAt).toLocaleDateString()
                                : "-"}
                            </p>

                            <p>
                              <span className="font-semibold text-slate-800">
                                Doctor:
                              </span>{" "}
                              {report.doctorName || "-"}
                            </p>

                            <p>
                              <span className="font-semibold text-slate-800">
                                Hospital:
                              </span>{" "}
                              {report.hospitalName || "N/A"}
                            </p>

                            <p>
                              <span className="font-semibold text-slate-800">
                                Notes:
                              </span>{" "}
                              {report.notes || "-"}
                            </p>
                          </div>
                        </div>

                        <div className="flex gap-2 flex-wrap md:justify-end">
                          <Link
                            to={`/reports/${report._id}`}
                            className="bg-slate-700 hover:bg-slate-800 text-white font-semibold px-4 py-2 rounded-xl transition"
                          >
                            Details
                          </Link>

                          <button
                            type="button"
                            onClick={() => openPreview(report)}
                            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2 rounded-xl transition"
                          >
                            View
                          </button>

                          <a
                            href={report.fileUrl}
                            download={`${
                              report.title?.replace(/\s+/g, "-") || "report"
                            }.${getFileExtension(report.fileUrl)}`}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-4 py-2 rounded-xl transition"
                          >
                            Download
                          </a>

                          <button
                            type="button"
                            onClick={() => handleDelete(report._id)}
                            disabled={deletingId === report._id}
                            className="bg-red-600 hover:bg-red-700 text-white font-semibold px-4 py-2 rounded-xl transition disabled:opacity-60"
                          >
                            {deletingId === report._id ? "Deleting..." : "Delete"}
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {totalPages > 1 && (
                  <div className="mt-4 flex flex-col md:flex-row items-center justify-between gap-3">
                    <p className="text-sm text-slate-600">
                      Page <span className="font-semibold">{currentPage}</span> of{" "}
                      <span className="font-semibold">{totalPages}</span>
                    </p>

                    <div className="flex flex-wrap items-center justify-center gap-2">
                      <button
                        type="button"
                        onClick={() =>
                          setCurrentPage((prev) => Math.max(prev - 1, 1))
                        }
                        disabled={currentPage === 1}
                        className="px-4 py-2 rounded-xl bg-gray-200 hover:bg-gray-300 text-slate-800 font-semibold transition disabled:opacity-50"
                      >
                        Previous
                      </button>

                      {Array.from(
                        { length: totalPages },
                        (_, index) => index + 1
                      ).map((page) => (
                        <button
                          key={page}
                          type="button"
                          onClick={() => setCurrentPage(page)}
                          className={`px-4 py-2 rounded-xl font-semibold transition ${
                            currentPage === page
                              ? "bg-blue-600 text-white"
                              : "bg-gray-200 hover:bg-gray-300 text-slate-800"
                          }`}
                        >
                          {page}
                        </button>
                      ))}

                      <button
                        type="button"
                        onClick={() =>
                          setCurrentPage((prev) =>
                            Math.min(prev + 1, totalPages)
                          )
                        }
                        disabled={currentPage === totalPages}
                        className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold transition disabled:opacity-50"
                      >
                        Next
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
        </div>
      </div>

      {isPreviewOpen && selectedReport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="bg-white w-full max-w-5xl rounded-2xl shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b">
              <h3 className="text-lg font-semibold">
                {selectedReport.title || "Report Preview"}
              </h3>

              <button
                type="button"
                onClick={closePreview}
                className="text-2xl font-bold text-gray-600 hover:text-red-500"
              >
                ×
              </button>
            </div>

            <div className="p-4 h-[80vh] overflow-auto">
              <div className="mb-4 bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-2">
                <p>
                  <span className="font-semibold text-slate-800">Type:</span>{" "}
                  {selectedReport.reportType || "General"}
                </p>
                <p>
                  <span className="font-semibold text-slate-800">Doctor:</span>{" "}
                  {selectedReport.doctorName || "-"}
                </p>
                <p>
                  <span className="font-semibold text-slate-800">Hospital:</span>{" "}
                  {selectedReport.hospitalName || "N/A"}
                </p>
                <p>
                  <span className="font-semibold text-slate-800">
                    Record Date:
                  </span>{" "}
                  {selectedReport.recordDate
                    ? new Date(selectedReport.recordDate).toLocaleDateString()
                    : "N/A"}
                </p>
                <p>
                  <span className="font-semibold text-slate-800">Notes:</span>{" "}
                  {selectedReport.notes || "-"}
                </p>
              </div>

              {isPdfFile(selectedReport) ? (
                <iframe
                  src={`${selectedReport.fileUrl}#toolbar=1&navpanes=0&scrollbar=1`}
                  title="PDF Preview"
                  className="w-full h-full rounded-lg border bg-white"
                />
              ) : isImageFile(selectedReport) ? (
                <img
                  src={selectedReport.fileUrl}
                  alt={selectedReport.title || "Report"}
                  className="max-w-full max-h-[75vh] mx-auto rounded-lg"
                />
              ) : (
                <div className="flex flex-col items-center justify-center h-full">
                  <p className="text-gray-600 mb-4">Preview not available</p>
                  <a
                    href={selectedReport.fileUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition"
                  >
                    Open File
                  </a>
                </div>
              )}

              <div className="mt-4 flex justify-end">
                <a
                  href={selectedReport.fileUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition"
                >
                  Open in New Tab
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
};

export default MyReports;