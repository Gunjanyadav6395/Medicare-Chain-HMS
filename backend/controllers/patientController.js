import Patient from "../models/Patient.js";

const generatePatientUniqueId = () => {
  return `MC-PAT-${Date.now().toString().slice(-6)}`;
};

export const getMyProfile = async (req, res) => {
  try {
    // TEMPORARY fixed user id for development
    const clerkUserId = "temp-user-1";

    const patient = await Patient.findOne({ clerkUserId });

    if (!patient) {
      return res.status(404).json({
        success: false,
        message: "Patient profile not found",
      });
    }

    // Generate unique ID for old patient records if missing
    if (!patient.patientUniqueId) {
      patient.patientUniqueId = generatePatientUniqueId();
      await patient.save();
    }

    return res.status(200).json({
      success: true,
      data: {
        patientUniqueId: patient.patientUniqueId || "",
        name: patient.name || "",
        email: patient.email || "",
        phone: patient.phone || "",
        bloodGroup: patient.bloodGroup || "",
      },
    });
  } catch (error) {
    console.error("getMyProfile error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

export const createOrUpdateProfile = async (req, res) => {
  try {
    // TEMPORARY fixed user id for development
    const clerkUserId = "temp-user-1";

    const { name, email, phone, bloodGroup } = req.body;

    let patient = await Patient.findOne({ clerkUserId });

    if (patient) {
      patient.name = name || "";
      patient.email = email || "";
      patient.phone = phone || "";
      patient.bloodGroup = bloodGroup || "";

      // Generate unique ID for old patient records if missing
      if (!patient.patientUniqueId) {
        patient.patientUniqueId = generatePatientUniqueId();
      }

      await patient.save();
    } else {
      patient = await Patient.create({
        clerkUserId,
        patientUniqueId: generatePatientUniqueId(),
        name: name || "",
        email: email || "",
        phone: phone || "",
        bloodGroup: bloodGroup || "",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Profile saved successfully",
      data: {
        patientUniqueId: patient.patientUniqueId || "",
        name: patient.name || "",
        email: patient.email || "",
        phone: patient.phone || "",
        bloodGroup: patient.bloodGroup || "",
      },
    });
  } catch (error) {
    console.error("createOrUpdateProfile error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};