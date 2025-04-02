const express = require('express');
const router = express.Router();
const patientController = require('../controllers/patient.controller');
const { authenticateToken, isPatient } = require('../middleware/auth');

// All routes are prefixed with /api/patients
 

// Patient management routes
router.get('/patients',patientController.getAllPatients);
router.get('/patients/:id',  patientController.getPatientById);
router.put('/patients/:id',  patientController.updatePatient);
router.delete('/patients/:id', patientController.deletePatient);

// Patient profile routes
router.get('/profile/:id',    patientController.getProfile);
router.put('/profile/:id',  patientController.updateProfile);

module.exports = router;
