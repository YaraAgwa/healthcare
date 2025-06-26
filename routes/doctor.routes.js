const express = require('express');
const router = express.Router();
const doctorController = require('../controllers/doctor.controller');  

 
router.get('/', doctorController.getAllDoctors);
router.post('/rate', doctorController.addRating);
router.get('/rate/:id', doctorController.getDoctorRating);
router.get('/:id', doctorController.getDoctorById);
router.put('/:id', doctorController.updateDoctor);
router.delete('/:id', doctorController.deleteDoctor);
router.get('/profile/:id', doctorController.getProfile);
router.put('/profile/:id', doctorController.updateProfile);
router.put('/:id/available-slots', doctorController.setAvailableSlots);


module.exports = router;
