const express = require('express');
const router = express.Router();
const appointmentController = require('../controllers/appointment.controller');

// Book an appointment
router.post('/book', appointmentController.bookAppointment);
// Get all appointments for a patient
router.get('/patient/:patientId', appointmentController.getPatientAppointments);
// Get all appointments for a doctor
router.get('/doctor/:doctorId', appointmentController.getDoctorAppointments);

router.put('/cancel/:id', appointmentController.cancelAppointment);

module.exports = router; 