const Patient = require('../models/patient.model');

 
// Get all patients (Admin only)
exports.getAllPatients = async (req, res) => {
    try {
        const patients = await Patient.find();
        res.json({ status: 'success', data: patients });
    } catch (error) {
        res.status(500).json({ status: 'error', message: error.message });
    }
};

// Get patient by ID
exports.getPatientById = async (req, res) => {
    try {
        const patient = await Patient.findById(req.params.id);
        if (!patient) {
            return res.status(404).json({ status: 'error', message: 'Patient not found' });
        }
        res.json({ status: 'success', data: patient });
    } catch (error) {
        res.status(500).json({ status: 'error', message: error.message });
    }
};


// Update patient
exports.updatePatient = async (req, res) => {
    try {
        const patient = await Patient.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });

        if (!patient) {
            return res.status(404).json({ status: "error", message: "Patient not found" });
        }

        res.json({ status: "success", data: patient });

    } catch (error) {
        res.status(500).json({ status: "error", message: error.message });
    }
};

// Delete patient
exports.deletePatient = async (req, res) => {
    try {
        const patient = await Patient.findByIdAndDelete(req.params.id);
        if (!patient) {
            return res.status(404).json({ status: "error", message: "Patient not found" });
        }
        res.json({ status: "success", message: "Patient account deleted successfully" });
    } catch (error) {
        res.status(500).json({ status: "error", message: error.message });
    }
};

 

// Get profile (Authenticated patient)
exports.getProfile = async (req, res) => {
    try {
        const patient = await Patient.findById(req.params.id);
        if (!patient) {
            return res.status(404).json({ status: 'error', message: 'Patient not found' });
        }
        res.json({ status: 'success', data: patient });
    } catch (error) {
        res.status(500).json({ status: 'error', message: error.message });
    }
};


// Update profile (Authenticated patient)
exports.updateProfile = async (req, res) => {
    try {
        const patient = await Patient.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
        if (!patient) {
            return res.status(404).json({ status: 'error', message: 'Patient not found' });
        }
        res.json({ status: 'success', data: patient });
    } catch (error) {
        res.status(500).json({ status: 'error', message: error.message });
    }
};

