const express = require('express');
const router = express.Router();
const doctorController = require('../controllers/doctor.controller');  

 
router.get('/doctors', doctorController.getAllDoctors);
router.post('/doctors/rate', doctorController.addRating);
router.get('/doctors/rate/:id', doctorController.getDoctorRating);
router.get('/doctors/:id', doctorController.getDoctorById);
router.put('/doctors/:id', doctorController.updateDoctor);
router.delete('/doctors/:id', doctorController.deleteDoctor);
router.get('/profile/:id', doctorController.getProfile);
router.put('/profile/:id', doctorController.updateProfile);
router.put('/:id/available-slots', doctorController.setAvailableSlots);





module.exports = router;
