import express from 'express';
import { clerkMiddleware, requireAuth } from '@clerk/express';

import {
  cancelAppointment,
  confirmPayment,
  createAppointment,
  getAppointments,
  getAppointmentsById,
  getAppointmentsByPatient,
  getServiceAppointmentStats,
  updateServiceAppointment
} from '../controllers/serviceAppointmentController.js';

const serviceAppointmentRouter = express.Router();

serviceAppointmentRouter.get('/', getAppointments);
serviceAppointmentRouter.get('/confirm', confirmPayment);
serviceAppointmentRouter.get('/stats/summary', getServiceAppointmentStats);

serviceAppointmentRouter.post('/', clerkMiddleware(), requireAuth(), createAppointment);

serviceAppointmentRouter.get('/me', clerkMiddleware(), requireAuth(), getAppointmentsByPatient);

serviceAppointmentRouter.get('/:id', getAppointmentsById);
serviceAppointmentRouter.put('/:id', updateServiceAppointment);
serviceAppointmentRouter.post('/:id/cancel', cancelAppointment);

export default serviceAppointmentRouter;