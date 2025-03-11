const Patient = require('../models/patient.model');

// Get patient profile
exports.getProfile = async (req, res) => {
    try {
        const patient = await Patient.findById(req.user.id);
        if (!patient) {
            return res.status(404).json({
                status: 'error',
                message: 'Patient not found'
            });
        }
        res.json({
            status: 'success',
            data: patient
        });
    } catch (error) {
        res.status(500).json({
            status: 'error',
            message: error.message
        });
    }
};

// Update patient profile
exports.updateProfile = async (req, res) => {
    try {
        const patient = await Patient.findByIdAndUpdate(
            req.user.id,
            req.body,
            { new: true, runValidators: true }
        );
        if (!patient) {
            return res.status(404).json({
                status: 'error',
                message: 'Patient not found'
            });
        }
        res.json({
            status: 'success',
            data: patient
        });
    } catch (error) {
        res.status(500).json({
            status: 'error',
            message: error.message
        });
    }
};

 