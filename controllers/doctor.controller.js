const Doctor = require('../models/doctor.model');

// Get all doctors
exports.getAllDoctors = async (req, res) => {
    try {
        const doctors = await Doctor.find();
        res.json({
            status: 'success',
            data: doctors
        });
    } catch (error) {
        res.status(500).json({
            status: 'error',
            message: error.message
        });
    }
};

// Get doctor by ID
exports.getDoctorById = async (req, res) => {
    try {
        const doctor = await Doctor.findById(req.params.id);
        if (!doctor) {
            return res.status(404).json({
                status: 'error',
                message: 'Doctor not found'
            });
        }
        res.json({
            status: 'success',
            data: doctor
        });
    } catch (error) {
        res.status(500).json({
            status: 'error',
            message: error.message
        });
    }
};

// Update doctor
exports.updateDoctor = async (req, res) => {
    try {
        const doctor = await Doctor.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );
        if (!doctor) {
            return res.status(404).json({
                status: 'error',
                message: 'Doctor not found'
            });
        }
        res.json({
            status: 'success',
            data: doctor
        });
    } catch (error) {
        res.status(500).json({
            status: 'error',
            message: error.message
        });
    }
};

// Delete doctor
exports.deleteDoctor = async (req, res) => {
    try {
        const doctor = await Doctor.findByIdAndDelete(req.params.id);
        if (!doctor) {
            return res.status(404).json({
                status: 'error',
                message: 'Doctor not found'
            });
        }
        res.json({
            status: 'success',
            message: 'Doctor deleted successfully'
        });
    } catch (error) {
        res.status(500).json({
            status: 'error',
            message: error.message
        });
    }
};

// Get doctor profile
exports.getProfile = async (req, res) => {
    try {
        const doctor = await Doctor.findById(req.user.id);
        if (!doctor) {
            return res.status(404).json({
                status: 'error',
                message: 'Doctor not found'
            });
        }
        res.json({
            status: 'success',
            data: doctor
        });
    } catch (error) {
        res.status(500).json({
            status: 'error',
            message: error.message
        });
    }
};

// Update doctor profile
exports.updateProfile = async (req, res) => {
    try {
        const doctor = await Doctor.findByIdAndUpdate(
            req.user.id,
            req.body,
            { new: true, runValidators: true }
        );
        if (!doctor) {
            return res.status(404).json({
                status: 'error',
                message: 'Doctor not found'
            });
        }
        res.json({
            status: 'success',
            data: doctor
        });
    } catch (error) {
        res.status(500).json({
            status: 'error',
            message: error.message
        });
    }
}; 