import express from "express";
import {
  getAppointments,
  getAppointmentsByPatient,
  getAppointmentsByPatientId,
  createAppointment,
  confirmPayment,
  updateAppointment,
  cancelAppointment,
  getStats,
  getAppointmentsByDoctor,
  getRegisteredUserCount,
} from "../controllers/appointmentController.js";

const appointmentRouter = express.Router();

/* -------------------------------------------------------------------------- */
/*                                  TEST ROUTE                                */
/* -------------------------------------------------------------------------- */

appointmentRouter.get("/test", (req, res) => {
  return res.status(200).json({
    success: true,
    message: "Appointment route working",
  });
});

/* -------------------------------------------------------------------------- */
/*                               SPECIAL ROUTES                               */
/* -------------------------------------------------------------------------- */

// Logged-in patient appointments
appointmentRouter.get("/me", getAppointmentsByPatient);

// Payment confirmation
appointmentRouter.get("/confirm", confirmPayment);

// Dashboard stats
appointmentRouter.get("/stats", getStats);

// Clerk registered users count
appointmentRouter.get("/registered-users", getRegisteredUserCount);

// Doctor appointments
appointmentRouter.get("/doctor/:doctorId", getAppointmentsByDoctor);

// Patient-specific appointments by patientId
appointmentRouter.get("/patient/:patientId", getAppointmentsByPatientId);

/* -------------------------------------------------------------------------- */
/*                              GENERAL ROUTES                                */
/* -------------------------------------------------------------------------- */

// Get all appointments
appointmentRouter.get("/", getAppointments);

// Create appointment
appointmentRouter.post("/", createAppointment);

// Update appointment
appointmentRouter.put("/:id", updateAppointment);

// Cancel appointment
appointmentRouter.post("/:id/cancel", cancelAppointment);

export default appointmentRouter;