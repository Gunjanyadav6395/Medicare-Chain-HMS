import mongoose from "mongoose";

const reportSchema = new mongoose.Schema(
  {
    createdBy: {
      type: String,
      required: true,
      index: true,
    },
    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Patient",
      default: null,
    },
     patientUniqueId: {
      type: String,
      default: "",
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    reportType: {
      type: String,
      default: "General",
      trim: true,
    },
    doctorName: {
      type: String,
      default: "",
      trim: true,
    },
    fileUrl: {
      type: String,
      required: true,
      trim: true,
    },
    filePublicId: {
      type: String,
      default: "",
      trim: true,
    },
    fileType: {
      type: String,
      default: "",
      trim: true,
    },
    originalFileName: {
      type: String,
      default: "",
      trim: true,
    },
    recordDate: {
      type: Date,
    },
    hospitalName: {
      type: String,
      trim: true,
    },
    notes: {
      type: String,
      default: "",
      trim: true,
    },
    hospitalName: {
  type: String,
  required: true,
  trim: true,
},
  },
  { timestamps: true }
);

const Report = mongoose.models.Report || mongoose.model("Report", reportSchema);

export default Report;