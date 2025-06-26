const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/payment.controller');
const mongoose = require('mongoose');

// Create a new payment
router.post('/pay', paymentController.createPayment);
// Get all payments for a patient
router.get('/patient/:patientId', paymentController.getPatientPayments);
// Get all payments for a doctor
router.get('/doctor/:doctorId', paymentController.getDoctorPayments);

module.exports = router; 