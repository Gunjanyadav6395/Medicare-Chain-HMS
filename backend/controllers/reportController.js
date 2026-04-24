import fs from "fs";
import Report from "../models/Report.js";
import Appointment from "../models/Appointment.js";
import Patient from "../models/Patient.js";
import Doctor from "../models/Doctor.js";
import cloudinary from "../config/cloudinary.js";
import { getAuth } from "@clerk/express";

console.log("REPORT CONTROLLER LOADED");

/* -------------------------------------------------------------------------- */
/* HELPERS */
/* -------------------------------------------------------------------------- */

function generatePatientUniqueId() {
  return `MC-PAT-${Date.now().toString().slice(-6)}`;
}

function safeTrim(value) {
  if (value === undefined || value === null) return "";
  return String(value).trim();
}

function resolveClerkUserId(req) {
  try {
    const auth = req.auth || {};

    const fromReq =
      auth?.userId ||
      auth?.user_id ||
      auth?.user?.id ||
      req.user?.id ||
      req.user?._id ||
      null;

    if (fromReq) return fromReq;

    try {
      const serverAuth = getAuth ? getAuth(req) : null;
      return serverAuth?.userId || null;
    } catch {
      return null;
    }
  } catch {
    return null;
  }
}

function resolveCreatedBy(req) {
  const clerkId = resolveClerkUserId(req);
  if (clerkId) return clerkId;
  if (req.body?.createdBy) return req.body.createdBy;
  if (req.query?.createdBy) return req.query.createdBy;
  return null;
}

function removeLocalFile(filePath) {
  try {
    if (filePath && fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  } catch (error) {
    console.warn("Failed to remove local file:", error?.message || error);
  }
}

/* -------------------------------------------------------------------------- */
/* GET MY REPORTS */
/* -------------------------------------------------------------------------- */

export const getMyReports = async (req, res) => {
  try {
    console.log("REQ QUERY:", req.query);

    const createdBy =
      req.query.createdBy || resolveClerkUserId(req) || "temp-user-1";

    console.log("GET CONTROLLER HIT -> createdBy:", createdBy);

    const reports = await Report.find({ createdBy }).sort({
      recordDate: -1,
      createdAt: -1,
    });

    console.log("GET CONTROLLER HIT -> reports found:", reports.length);

    return res.status(200).json({
      success: true,
      reports,
      total: reports.length,
    });
  } catch (error) {
    console.error("Get My Reports error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch reports",
    });
  }
};

/* -------------------------------------------------------------------------- */
/* GET REPORTS BY PATIENT ID */
/* -------------------------------------------------------------------------- */

export const getReportsByPatientId = async (req, res) => {
  try {
    const { patientId } = req.params;

    console.log("GET REPORTS BY PATIENT ID HIT -> patientId:", patientId);

    if (!patientId) {
      return res.status(400).json({
        success: false,
        message: "Patient ID is required",
      });
    }

    const reports = await Report.find({ patientId }).sort({
      recordDate: -1,
      createdAt: -1,
    });

    console.log("GET REPORTS BY PATIENT ID -> reports found:", reports.length);

    return res.status(200).json({
      success: true,
      reports,
      total: reports.length,
    });
  } catch (error) {
    console.error("getReportsByPatientId error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch patient reports",
    });
  }
};

/* -------------------------------------------------------------------------- */
/* GET REPORT BY ID */
/* -------------------------------------------------------------------------- */

export const getReportById = async (req, res) => {
  try {
    const { id } = req.params;
    const createdBy =
      req.query.createdBy || resolveClerkUserId(req) || "temp-user-1";

    console.log("GET BY ID CONTROLLER HIT -> id:", id);
    console.log("GET BY ID CONTROLLER HIT -> createdBy:", createdBy);

    const report = await Report.findOne({ _id: id, createdBy });

    if (!report) {
      return res.status(404).json({
        success: false,
        message: "Report not found",
      });
    }

    return res.status(200).json({
      success: true,
      report,
    });
  } catch (error) {
    console.error("Get Report By ID error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch report details",
    });
  }
};

/* -------------------------------------------------------------------------- */
/* UPLOAD REPORT */
/* -------------------------------------------------------------------------- */

export const uploadReport = async (req, res) => {
  try {
    let createdBy = resolveCreatedBy(req);

    if (!createdBy) {
      createdBy = "temp-user-1";
    }

    const {
      title,
      reportType = "General",
      doctorName = "",
      recordDate,
      hospitalName,
      notes,
    } = req.body || {};

    console.log("POST CONTROLLER HIT -> createdBy:", createdBy);
    console.log("POST CONTROLLER HIT -> body:", req.body);
    console.log("POST CONTROLLER HIT -> file:", req.file?.originalname);
    console.log("POST CONTROLLER HIT -> mimetype:", req.file?.mimetype);

    if (!title || !recordDate || !hospitalName) {
      removeLocalFile(req.file?.path);
      return res.status(400).json({
        success: false,
        message: "Title, record date and hospital name are required",
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "File is required",
      });
    }

    const patient = await Patient.findOne({ clerkUserId: createdBy });

    if (!patient) {
      removeLocalFile(req.file?.path);
      return res.status(404).json({
        success: false,
        message: "Patient profile not found. Please complete profile first.",
      });
    }

    if (!patient.patientUniqueId) {
      patient.patientUniqueId = generatePatientUniqueId();
      await patient.save();
    }

    console.log("UPLOAD REPORT PATIENT:", {
      patientId: patient?._id,
      patientUniqueId: patient?.patientUniqueId,
    });

    const uploadResult = await cloudinary.uploader.upload(req.file.path, {
      resource_type: "auto",
      folder: "medicare_reports",
    });

    const report = await Report.create({
      createdBy,
      patientId: patient._id,
      patientUniqueId: patient.patientUniqueId || "",
      title: safeTrim(title),
      reportType: safeTrim(reportType) || "General",
      doctorName: safeTrim(doctorName),
      fileUrl: uploadResult.secure_url,
      filePublicId: uploadResult.public_id,
      fileType: req.file.mimetype,
      originalFileName: req.file.originalname,
      recordDate,
      hospitalName: safeTrim(hospitalName),
      notes: safeTrim(notes),
    });

    console.log("MONGODB SAVE SUCCESS ->", report._id);

    removeLocalFile(req.file?.path);

    return res.status(201).json({
      success: true,
      message: "Report uploaded successfully",
      report,
    });
  } catch (error) {
    console.error("Upload Report error:", error);
    removeLocalFile(req.file?.path);

    return res.status(500).json({
      success: false,
      message: error.message || "Failed to upload report",
    });
  }
};

/* -------------------------------------------------------------------------- */
/* DELETE REPORT */
/* -------------------------------------------------------------------------- */

export const deleteReport = async (req, res) => {
  try {
    const { id } = req.params;
    const createdBy =
      req.query.createdBy || resolveClerkUserId(req) || "temp-user-1";

    console.log("DELETE CONTROLLER HIT -> id:", id);
    console.log("DELETE CONTROLLER HIT -> createdBy:", createdBy);

    const report = await Report.findOne({ _id: id, createdBy });

    if (!report) {
      return res.status(404).json({
        success: false,
        message: "Report not found",
      });
    }

    if (report.filePublicId) {
      await cloudinary.uploader.destroy(report.filePublicId, {
        resource_type: "auto",
      });
    }

    await Report.findByIdAndDelete(id);

    return res.status(200).json({
      success: true,
      message: "Report deleted successfully",
    });
  } catch (error) {
    console.error("Delete Report error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to delete report",
    });
  }
};

/* -------------------------------------------------------------------------- */
/* GENERAL PATIENT HISTORY */
/* -------------------------------------------------------------------------- */

export const getPatientHistory = async (req, res) => {
  try {
    const { patientId } = req.params;

    console.log("GET PATIENT HISTORY HIT -> patientId:", patientId);

    if (!patientId) {
      return res.status(400).json({
        success: false,
        message: "Patient ID is required",
      });
    }

    const reports = await Report.find({ patientId }).sort({
      recordDate: -1,
      createdAt: -1,
    });

    const appointments = await Appointment.find({ patientId }).sort({
      createdAt: -1,
    });

    return res.status(200).json({
      success: true,
      data: {
        patientId,
        reports,
        appointments,
      },
    });
  } catch (error) {
    console.error("getPatientHistory error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch patient history",
    });
  }
};

/* -------------------------------------------------------------------------- */
/* DOCTOR SECURE PATIENT HISTORY ACCESS - SAME HOSPITAL CHAIN ONLY */
/* -------------------------------------------------------------------------- */

export const getPatientHistoryForDoctor = async (req, res) => {
  try {
    const { patientId } = req.params;
    const { doctorId } = req.query;

    console.log("GET PATIENT HISTORY HIT");
    console.log("patientId:", patientId);
    console.log("doctorId:", doctorId);

    if (!doctorId) {
      return res.status(400).json({
        success: false,
        message: "Doctor ID missing",
      });
    }

    // 🔹 STEP 1: Doctor find karo
    const doctor = await Doctor.findById(doctorId);

    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: "Doctor not found",
      });
    }

    const hospitalName = doctor.hospitalName;

    console.log("Doctor hospital:", hospitalName);

    // 🔹 STEP 2: Filter appointments (same hospital only)
    const appointments = await Appointment.find({
      patientId,
      hospitalName,
      status: "Confirmed",
    }).sort({ createdAt: -1 });

    // 🔹 STEP 3: Filter reports (same hospital only)
    const reports = await Report.find({
      patientId,
      hospitalName,
    }).sort({ createdAt: -1 });

    console.log("Filtered appointments:", appointments.length);
    console.log("Filtered reports:", reports.length);

    return res.status(200).json({
      success: true,
      data: {
        appointments,
        reports,
      },
    });
  } catch (error) {
    console.log("ERROR:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

export default {
  getMyReports,
  getReportsByPatientId,
  getReportById,
  uploadReport,
  deleteReport,
  getPatientHistory,
  getPatientHistoryForDoctor,
};