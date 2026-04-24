import Appointment from "../models/Appointment.js";
import Doctor from "../models/Doctor.js";
import Patient from "../models/Patient.js";
import dotenv from "dotenv";
import Stripe from "stripe";
import { getAuth } from "@clerk/express";
import { clerkClient } from "@clerk/clerk-sdk-node";

dotenv.config();

const STRIPE_KEY = process.env.STRIPE_SECRET_KEY;
const FRONTEND_URL = process.env.FRONTEND_URL;
const MAJOR_ADMIN_ID = process.env.MAJOR_ADMIN_ID || null;

const stripe = STRIPE_KEY
  ? new Stripe(STRIPE_KEY, { apiVersion: "2022-11-15" })
  : null;

/* -------------------------------------------------------------------------- */
/* HELPERS */
/* -------------------------------------------------------------------------- */

const safeNumber = (value) => {
  const num = Number(value);
  return Number.isFinite(num) ? num : null;
};

const safeTrim = (value) => {
  if (value === undefined || value === null) return "";
  return String(value).trim();
};

const parsePositiveInt = (value, fallback) => {
  const parsed = parseInt(value, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
};

const buildFrontendBase = (req) => {
  if (FRONTEND_URL) return FRONTEND_URL.replace(/\/$/, "");

  const origin = req.get("origin") || req.get("referer");
  if (origin) return origin.replace(/\/$/, "");

  const host = req.get("host");
  if (host) return `${req.protocol || "http"}://${host}`.replace(/\/$/, "");

  return null;
};

function resolveClerkUserId(req) {
  try {
    const auth = req.auth || {};

    const userId =
      auth?.userId ||
      auth?.user_id ||
      auth?.user?.id ||
      req.user?.id ||
      req.user?._id ||
      null;

    if (userId) return userId;

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

function resolvePatientId(req) {
  return (
    req.query?.createdBy ||
    req.body?.createdBy ||
    resolveClerkUserId(req) ||
    "temp-user-1"
  );
}

const buildSearchFilter = (search) => {
  if (!search) return null;

  const regex = new RegExp(search, "i");
  return {
    $or: [{ patientName: regex }, { mobile: regex }, { notes: regex }],
  };
};

const isTerminalStatus = (status) => {
  return status === "Completed" || status === "Canceled";
};

const buildDoctorImage = (doctor, fallbackUrl = "", fallbackPublicId = "") => {
  const url =
    safeTrim(doctor?.imageUrl) ||
    safeTrim(doctor?.image) ||
    safeTrim(doctor?.avatarUrl) ||
    safeTrim(doctor?.profileImage?.url) ||
    safeTrim(fallbackUrl);

  const publicId =
    safeTrim(doctor?.imagePublicId) ||
    safeTrim(doctor?.profileImage?.publicId) ||
    safeTrim(fallbackPublicId);

  return {
    url,
    publicId,
  };
};

/* -------------------------------------------------------------------------- */
/* GET ALL APPOINTMENTS */
/* -------------------------------------------------------------------------- */

export const getAppointments = async (req, res) => {
  try {
    const {
      doctorId,
      mobile,
      status,
      search = "",
      limit: limitRaw = 50,
      page: pageRaw = 1,
      patientClerkId,
      createdBy,
      hospitalName,
    } = req.query;

    const limit = Math.min(200, parsePositiveInt(limitRaw, 50));
    const page = parsePositiveInt(pageRaw, 1);
    const skip = (page - 1) * limit;

    const filter = {};

    if (doctorId) filter.doctorId = doctorId;
    if (mobile) filter.mobile = mobile;
    if (status) filter.status = status;
    if (patientClerkId) filter.createdBy = patientClerkId;
    if (createdBy) filter.createdBy = createdBy;
    if (hospitalName) filter.hospitalName = hospitalName;

    const searchFilter = buildSearchFilter(search);
    if (searchFilter) Object.assign(filter, searchFilter);

    const appointments = await Appointment.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate(
        "doctorId",
        "name specialization speciality owner imageUrl image hospitalName"
      )
      .populate("patientId", "name email phone patientUniqueId")
      .lean();

    const total = await Appointment.countDocuments(filter);

    return res.status(200).json({
      success: true,
      appointments,
      meta: {
        page,
        limit,
        total,
        count: appointments.length,
      },
    });
  } catch (error) {
    console.error("getAppointments error:", error);
    return res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

/* -------------------------------------------------------------------------- */
/* GET APPOINTMENTS BY LOGGED PATIENT */
/* -------------------------------------------------------------------------- */

export const getAppointmentsByPatient = async (req, res) => {
  try {
    const createdBy = resolvePatientId(req);

    if (!createdBy) {
      return res.status(401).json({
        success: false,
        message: "User not identified",
        appointments: [],
      });
    }

    const appointments = await Appointment.find({ createdBy })
      .sort({ createdAt: -1 })
      .populate(
        "doctorId",
        "name specialization speciality imageUrl image hospitalName"
      )
      .populate("patientId", "name email phone patientUniqueId")
      .lean();

    console.log("GET /api/appointments/me -> createdBy:", createdBy);
    console.log(
      "GET /api/appointments/me -> appointments found:",
      appointments.length
    );

    return res.status(200).json({
      success: true,
      appointments,
    });
  } catch (error) {
    console.error("getAppointmentsByPatient error:", error);
    return res.status(500).json({
      success: false,
      message: "Server Error",
      appointments: [],
    });
  }
};

/* -------------------------------------------------------------------------- */
/* GET APPOINTMENTS BY DOCTOR */
/* -------------------------------------------------------------------------- */

export const getAppointmentsByDoctor = async (req, res) => {
  try {
    const { doctorId } = req.params;

    if (!doctorId) {
      return res.status(400).json({
        success: false,
        message: "Doctor ID is required.",
      });
    }

    const {
      mobile,
      status,
      search = "",
      limit: limitRaw = 50,
      page: pageRaw = 1,
      hospitalName,
    } = req.query;

    const limit = Math.min(200, parsePositiveInt(limitRaw, 50));
    const page = parsePositiveInt(pageRaw, 1);
    const skip = (page - 1) * limit;

    const filter = { doctorId };

    if (mobile) filter.mobile = mobile;
    if (status) filter.status = status;
    if (hospitalName) filter.hospitalName = hospitalName;

    const searchFilter = buildSearchFilter(search);
    if (searchFilter) Object.assign(filter, searchFilter);

    const appointments = await Appointment.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate(
        "doctorId",
        "name specialization speciality owner imageUrl image hospitalName"
      )
      .populate("patientId", "name email phone patientUniqueId")
      .lean();

    const total = await Appointment.countDocuments(filter);

    return res.status(200).json({
      success: true,
      appointments,
      meta: {
        page,
        limit,
        total,
        count: appointments.length,
      },
    });
  } catch (error) {
    console.error("getAppointmentsByDoctor error:", error);
    return res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

/* -------------------------------------------------------------------------- */
/* GET APPOINTMENTS BY PATIENT ID */
/* -------------------------------------------------------------------------- */

export const getAppointmentsByPatientId = async (req, res) => {
  try {
    const { patientId } = req.params;

    if (!patientId) {
      return res.status(400).json({
        success: false,
        message: "Patient ID is required",
      });
    }

    const appointments = await Appointment.find({ patientId })
      .sort({ createdAt: -1 })
      .populate(
        "doctorId",
        "name specialization speciality imageUrl image hospitalName"
      )
      .lean();

    return res.status(200).json({
      success: true,
      appointments,
      total: appointments.length,
    });
  } catch (error) {
    console.error("getAppointmentsByPatientId error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch patient appointments",
    });
  }
};

/* -------------------------------------------------------------------------- */
/* CREATE APPOINTMENT */
/* -------------------------------------------------------------------------- */

export const createAppointment = async (req, res) => {
  try {
    const {
      doctorId,
      patientName,
      mobile,
      age = "",
      gender = "",
      date,
      time,
      fee,
      fees,
      notes = "",
      email = "",
      paymentMethod,
      owner: ownerFromBody = null,
      doctorName: doctorNameFromBody = "",
      speciality: specialityFromBody = "",
      doctorImageUrl: doctorImageUrlFromBody = "",
      doctorImagePublicId: doctorImagePublicIdFromBody = "",
    } = req.body || {};

    const clerkUserId = resolvePatientId(req);

    if (!clerkUserId) {
      return res.status(401).json({
        success: false,
        message: "User not identified",
      });
    }

    if (!doctorId || !patientName || !mobile || !date || !time) {
      return res.status(400).json({
        success: false,
        message: "All fields are required.",
      });
    }

    const numericFee = safeNumber(fee ?? fees ?? 0);

    if (numericFee === null || numericFee < 0) {
      return res.status(400).json({
        success: false,
        message: "Fee must be a valid number",
      });
    }

    const patient = await Patient.findOne({ clerkUserId });

    if (!patient) {
      return res.status(404).json({
        success: false,
        message: "Patient profile not found",
      });
    }

    const existingAppointment = await Appointment.findOne({
      doctorId,
      createdBy: clerkUserId,
      date: safeTrim(date),
      time: safeTrim(time),
      status: { $ne: "Canceled" },
    }).lean();

    if (existingAppointment) {
      return res.status(400).json({
        success: false,
        message:
          "You already have an appointment booked with this doctor at the selected slot.",
      });
    }

    let doctor = null;

    try {
      doctor = await Doctor.findById(doctorId).lean();
    } catch (error) {
      console.warn("Doctor lookup failed:", error?.message || error);
    }

    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: "Doctor not found.",
      });
    }

    const resolvedHospitalName = safeTrim(doctor?.hospitalName);

    if (!resolvedHospitalName) {
      return res.status(400).json({
        success: false,
        message:
          "Doctor hospital name is missing. Please update doctor profile.",
      });
    }

    const resolvedOwner =
      ownerFromBody || doctor.owner || MAJOR_ADMIN_ID || String(doctorId);

    const resolvedDoctorName =
      safeTrim(doctor?.name) || safeTrim(doctorNameFromBody);

    const resolvedSpeciality =
      safeTrim(doctor?.specialization) ||
      safeTrim(doctor?.speciality) ||
      safeTrim(specialityFromBody);

    const resolvedDoctorImage = buildDoctorImage(
      doctor,
      doctorImageUrlFromBody,
      doctorImagePublicIdFromBody
    );

    const normalizedPaymentMethod =
      paymentMethod === "Cash" ? "Cash" : "Online";

    const appointmentBase = {
      doctorId: String(doctor?._id || doctorId),
      doctorName: resolvedDoctorName,
      speciality: resolvedSpeciality,
      doctorImage: resolvedDoctorImage,
      hospitalName: resolvedHospitalName,

      patientId: patient._id,
      patientUniqueId: patient.patientUniqueId || "",

      patientName: safeTrim(patientName),
      mobile: safeTrim(mobile),
      age: age !== "" ? Number(age) : undefined,
      gender: safeTrim(gender),

      date: safeTrim(date),
      time: safeTrim(time),

      fees: numericFee,
      status: "Pending",

      payment: {
        method: normalizedPaymentMethod,
        status: "Pending",
        amount: numericFee,
      },

      notes: safeTrim(notes),
      createdBy: clerkUserId,
      owner: resolvedOwner,
      sessionId: null,
    };

    // FREE APPOINTMENT
    if (numericFee === 0) {
      const appointment = await Appointment.create({
        ...appointmentBase,
        status: "Confirmed",
        payment: {
          method: normalizedPaymentMethod,
          status: "Paid",
          amount: 0,
        },
        paidAt: new Date(),
      });

      return res.status(201).json({
        success: true,
        appointment,
        checkoutUrl: null,
      });
    }

    // CASH APPOINTMENT
    if (paymentMethod === "Cash") {
      const appointment = await Appointment.create({
        ...appointmentBase,
        status: "Confirmed",
        payment: {
          method: "Cash",
          status: "Pending",
          amount: numericFee,
        },
      });

      return res.status(201).json({
        success: true,
        appointment,
        checkoutUrl: null,
      });
    }

    // ONLINE PAYMENT
    if (!stripe) {
      return res.status(500).json({
        success: false,
        message: "Stripe not configured on server",
      });
    }

    const frontendBase = buildFrontendBase(req);

    if (!frontendBase) {
      return res.status(500).json({
        success: false,
        message:
          "Frontend URL could not be determined. Set FRONTEND_URL or send Origin header.",
      });
    }

    const successUrl = `${frontendBase}/appointment/success?session_id={CHECKOUT_SESSION_ID}`;
    const cancelUrl = `${frontendBase}/appointment/cancel`;

    let session;

    try {
      session = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        mode: "payment",
        customer_email: safeTrim(email) || undefined,
        line_items: [
          {
            price_data: {
              currency: "inr",
              product_data: {
                name: `Appointment - ${safeTrim(patientName).slice(0, 40)}`,
              },
              unit_amount: Math.round(numericFee * 100),
            },
            quantity: 1,
          },
        ],
        success_url: successUrl,
        cancel_url: cancelUrl,
        metadata: {
          doctorId: String(doctorId),
          doctorName: resolvedDoctorName || "",
          speciality: resolvedSpeciality || "",
          hospitalName: resolvedHospitalName || "",
          patientName: safeTrim(patientName),
          mobile: safeTrim(mobile),
          clerkUserId: clerkUserId || "",
          patientId: String(patient?._id || ""),
          patientUniqueId: safeTrim(patient?.patientUniqueId || ""),
        },
      });
    } catch (stripeError) {
      console.error("Stripe create session error:", stripeError);

      const message =
        stripeError?.raw?.message ||
        stripeError?.message ||
        "Payment provider error";

      return res.status(502).json({
        success: false,
        message: `Payment provider error: ${message}`,
      });
    }

    try {
      const appointment = await Appointment.create({
        ...appointmentBase,
        sessionId: session.id,
        payment: {
          ...appointmentBase.payment,
          providerId: session.payment_intent || session.paymentIntent || null,
        },
        status: "Pending",
      });

      return res.status(201).json({
        success: true,
        appointment,
        checkoutUrl: session.url || null,
      });
    } catch (dbError) {
      console.error("DB error saving appointment after stripe session:", dbError);
      return res.status(500).json({
        success: false,
        message: "Failed to create appointment record",
      });
    }
  } catch (error) {
    console.error("createAppointment unexpected error:", error);
    return res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

/* -------------------------------------------------------------------------- */
/* CONFIRM ONLINE PAYMENT */
/* -------------------------------------------------------------------------- */

export const confirmPayment = async (req, res) => {
  try {
    const { session_id } = req.query;

    if (!session_id) {
      return res.status(400).json({
        success: false,
        message: "Session Id is required.",
      });
    }

    if (!stripe) {
      return res.status(500).json({
        success: false,
        message: "Stripe is not setup",
      });
    }

    let session;

    try {
      session = await stripe.checkout.sessions.retrieve(session_id);
    } catch (error) {
      console.error("Stripe retrieve session error:", error);
      return res.status(404).json({
        success: false,
        message: "Stripe session not found.",
      });
    }

    if (!session) {
      return res.status(404).json({
        success: false,
        message: "Invalid session",
      });
    }

    if (session.payment_status !== "paid") {
      return res.status(400).json({
        success: false,
        message: "Payment not completed.",
      });
    }

    let appointment = await Appointment.findOneAndUpdate(
      { sessionId: session_id },
      {
        "payment.status": "Paid",
        "payment.providerId": session.payment_intent || null,
        status: "Confirmed",
        paidAt: new Date(),
      },
      { new: true }
    );

    // fallback 1: use metadata
    if (!appointment) {
      const metadata = session.metadata || {};

      if (metadata.doctorId && metadata.mobile && metadata.patientName) {
        appointment = await Appointment.findOneAndUpdate(
          {
            doctorId: metadata.doctorId,
            mobile: metadata.mobile,
            patientName: metadata.patientName,
            fees: Math.round((session.amount_total || 0) / 100) || undefined,
          },
          {
            "payment.status": "Paid",
            "payment.providerId": session.payment_intent || null,
            status: "Confirmed",
            paidAt: new Date(),
            sessionId: session_id,
          },
          { new: true }
        );
      }
    }

    // fallback 2: recent amount-based match
    if (!appointment) {
      const amount = Math.round((session.amount_total || 0) / 100);
      const fifteenMinutesAgo = new Date(Date.now() - 1000 * 60 * 15);

      appointment = await Appointment.findOneAndUpdate(
        {
          fees: amount,
          createdAt: { $gte: fifteenMinutesAgo },
        },
        {
          "payment.status": "Paid",
          "payment.providerId": session.payment_intent || null,
          status: "Confirmed",
          paidAt: new Date(),
          sessionId: session_id,
        },
        { new: true }
      );
    }

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: "Appointment not found for this payment session",
      });
    }

    return res.status(200).json({
      success: true,
      appointment,
    });
  } catch (error) {
    console.error("confirmPayment error:", error);
    return res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

/* -------------------------------------------------------------------------- */
/* UPDATE APPOINTMENT */
/* -------------------------------------------------------------------------- */

export const updateAppointment = async (req, res) => {
  try {
    const { id } = req.params;
    const body = req.body || {};

    const appointment = await Appointment.findById(id);

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: "Appointment not found.",
      });
    }

    if (
      isTerminalStatus(appointment.status) &&
      body.status &&
      body.status !== appointment.status
    ) {
      return res.status(400).json({
        success: false,
        message: "Cannot change status of a completed/canceled appointment",
      });
    }

    const updateData = {};

    if (body.status) {
      updateData.status = body.status;
    }

    if (body.notes !== undefined) {
      updateData.notes = body.notes;
    }

    if (body.date && body.time) {
      if (isTerminalStatus(appointment.status)) {
        return res.status(400).json({
          success: false,
          message: "Cannot reschedule completed/canceled appointment",
        });
      }

      updateData.date = safeTrim(body.date);
      updateData.time = safeTrim(body.time);
      updateData.status = "Rescheduled";
      updateData.rescheduledTo = {
        date: safeTrim(body.date),
        time: safeTrim(body.time),
      };
    }

    const updatedAppointment = await Appointment.findByIdAndUpdate(
      id,
      updateData,
      {
        new: true,
        runValidators: true,
      }
    )
      .populate({
        path: "doctorId",
        select: "name imageUrl specialization speciality hospitalName",
      })
      .populate({
        path: "patientId",
        select: "name email phone patientUniqueId",
      })
      .lean();

    return res.status(200).json({
      success: true,
      appointment: updatedAppointment,
    });
  } catch (error) {
    console.error("updateAppointment error:", error);
    return res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

/* -------------------------------------------------------------------------- */
/* CANCEL APPOINTMENT */
/* -------------------------------------------------------------------------- */

export const cancelAppointment = async (req, res) => {
  try {
    const { id } = req.params;

    const appointment = await Appointment.findById(id);

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: "Appointment not found",
      });
    }

    if (appointment.status === "Completed") {
      return res.status(400).json({
        success: false,
        message: "Completed appointment cannot be canceled",
      });
    }

    appointment.status = "Canceled";
    await appointment.save();

    return res.status(200).json({
      success: true,
      appointment,
    });
  } catch (error) {
    console.error("cancelAppointment error:", error);
    return res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

/* -------------------------------------------------------------------------- */
/* GET STATS */
/* -------------------------------------------------------------------------- */

export const getStats = async (req, res) => {
  try {
    const total = await Appointment.countDocuments();

    const paidAggregation = await Appointment.aggregate([
      { $match: { "payment.status": "Paid" } },
      {
        $group: {
          _id: null,
          total: { $sum: "$fees" },
        },
      },
    ]);

    const revenue = paidAggregation[0]?.total || 0;

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const recentLast7Days = await Appointment.countDocuments({
      createdAt: { $gte: sevenDaysAgo },
    });

    return res.status(200).json({
      success: true,
      stats: {
        total,
        revenue,
        recentLast7Days,
      },
    });
  } catch (error) {
    console.error("getStats error:", error);
    return res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

/* -------------------------------------------------------------------------- */
/* GET REGISTERED CLERK USER COUNT */
/* -------------------------------------------------------------------------- */

export const getRegisteredUserCount = async (req, res) => {
  try {
    const totalUsers = await clerkClient.users.getCount();

    return res.status(200).json({
      success: true,
      totalUsers,
    });
  } catch (error) {
    console.error("getRegisteredUserCount error:", error);
    return res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

/* -------------------------------------------------------------------------- */
/* EXPORTS */
/* -------------------------------------------------------------------------- */

export default {
  getAppointments,
  getAppointmentsByPatient,
  createAppointment,
  confirmPayment,
  updateAppointment,
  cancelAppointment,
  getStats,
  getAppointmentsByDoctor,
  getRegisteredUserCount,
  getAppointmentsByPatientId,
};