import express from "express";
import multer from "multer";

import {
  uploadReport,
  getMyReports,
  getReportsByPatientId,
  getReportById,
  deleteReport,
  getPatientHistory,
  getPatientHistoryForDoctor,
} from "../controllers/reportController.js";

console.log("REPORT ROUTER LOADED");

const reportRouter = express.Router();
const upload = multer({ dest: "/tmp" });

/* =========================
   🔍 DEBUG MIDDLEWARE
========================= */
reportRouter.use((req, res, next) => {
  console.log(`REPORT ROUTE HIT -> ${req.method} ${req.originalUrl}`);
  next();
});

/* =========================
   📌 ROUTES (ORDER FIXED)
========================= */

// 1️⃣ Logged-in user's reports
reportRouter.get("/me", getMyReports);

// 2️⃣ Doctor secure patient history (VERY IMPORTANT ABOVE /:id)
reportRouter.get(
  "/doctor/patient/:patientId",
  getPatientHistoryForDoctor
);

// 3️⃣ General patient history (optional but useful)
reportRouter.get("/history/:patientId", getPatientHistory);

// 4️⃣ Reports by patientId
reportRouter.get("/patient/:patientId", getReportsByPatientId);

// 5️⃣ Get single report by id (ALWAYS LAST)
reportRouter.get("/:id", getReportById);

// 6️⃣ Upload report
reportRouter.post("/", upload.single("file"), uploadReport);

// 7️⃣ Delete report
reportRouter.delete("/:id", deleteReport);

export default reportRouter;