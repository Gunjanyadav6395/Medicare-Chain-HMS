import express from "express";
import {
  getMyProfile,
  createOrUpdateProfile,
} from "../controllers/patientController.js";

const patientRouter = express.Router();

patientRouter.get("/test", (req, res) => {
  res.json({
    success: true,
    message: "Patient route working",
  });
});

patientRouter.get("/me", getMyProfile);
patientRouter.post("/me", createOrUpdateProfile);

export default patientRouter;