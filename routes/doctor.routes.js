const express = require('express');
const router = express.Router();
const doctorController = require('../controllers/doctor.controller');

 
router.get('/doctors', doctorController.getAllDoctors);
router.get('/doctors/:id', doctorController.getDoctorById);
router.put('/doctors/:id', doctorController.updateDoctor);
router.delete('/doctors/:id', doctorController.deleteDoctor);
router.get('/profile', doctorController.getProfile);
router.put('/profile', doctorController.updateProfile);

module.exports = router; 