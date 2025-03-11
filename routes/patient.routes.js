const express = require('express');
const router = express.Router();
const patientController = require('../controllers/patient.controller');
const { authenticateToken, isPatient } = require('../middleware/auth');

// All routes are prefixed with /api/patients
router.get('/profile', authenticateToken, isPatient, patientController.getProfile);
router.put('/profile', authenticateToken, isPatient, patientController.updateProfile);
module.exports = router; 