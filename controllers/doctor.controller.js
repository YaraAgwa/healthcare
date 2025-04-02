const Doctor = require('../models/doctor.model');

// Get all doctors with filtering
exports.getAllDoctors = async (req, res) => {
    try {
        const { name, specialty } = req.query;
        let query = {};

        if (name) {
            query.name = { $regex: name, $options: "i" };
        }
        if (specialty) {
            query.specialty = { $regex: specialty, $options: "i" };
        }

        const doctors = await Doctor.find(query);
        res.json({ status: "success", data: doctors });

    } catch (error) {
        res.status(500).json({ status: "error", message: error.message });
    }
};

// Get doctor by ID
exports.getDoctorById = async (req, res) => {
    try {
        const doctor = await Doctor.findById(req.params.id);
        if (!doctor) {
            return res.status(404).json({ status: "error", message: "Doctor not found" });
        }
        res.json({ status: "success", data: doctor });
    } catch (error) {
        res.status(500).json({ status: "error", message: error.message });
    }
};

// Update doctor (only the doctor themselves)
exports.updateDoctor = async (req, res) => {
    try {
        const doctor = await Doctor.findByIdAndUpdate(
            req.params.id,  
            req.body,
            { new: true, runValidators: true }
        );

        if (!doctor) {
            return res.status(404).json({ status: "error", message: "Doctor not found" });
        }

        res.json({ status: "success", data: doctor });

    } catch (error) {
        res.status(500).json({ status: "error", message: error.message });
    }
};


// Delete doctor  
exports.deleteDoctor = async (req, res) => {
    try {
        const doctor = await Doctor.findByIdAndDelete(req.params.id);
        if (!doctor) {
            return res.status(404).json({ status: "error", message: "Doctor not found" });
        }
        res.json({ status: "success", message: "Doctor account deleted successfully" });
    } catch (error) {
        res.status(500).json({ status: "error", message: error.message });
    }
};


// Get doctor's own profile
exports.getProfile = async (req, res) => {
    try {
        const doctor = await Doctor.findById(req.params.id);   
        if (!doctor) {
            return res.status(404).json({ status: "error", message: "Doctor not found" });
        }
        res.json({ status: "success", data: doctor });
    } catch (error) {
        res.status(500).json({ status: "error", message: error.message });
    }
};

// Update doctor's own profile
exports.updateProfile = async (req, res) => {
    try {
        const doctor = await Doctor.findByIdAndUpdate(
            req.params.id,  
            req.body,
            { new: true, runValidators: true }
        );

        if (!doctor) {
            return res.status(404).json({ status: "error", message: "Doctor not found" });
        }

        res.json({ status: "success", data: doctor });

    } catch (error) {
        res.status(500).json({ status: "error", message: error.message });
    }
};


// Add rating and update average rating
exports.addRating = async (req, res) => {
    try {
       
        const { doctorId, rating, comment, userId } = req.body;

        const doctor = await Doctor.findById(doctorId);
        if (!doctor) {
            return res.status(404).json({ status: 'error', message: 'Doctor not found' });
        }

      
        doctor.ratings.push({ userId, rating, comment });
        
     
        const totalRatings = doctor.ratings.length;
        const averageRating = doctor.ratings.reduce((acc, r) => acc + r.rating, 0) / totalRatings;
        doctor.averageRating = averageRating.toFixed(2);
        
        await doctor.save();

        res.json({ status: 'success', message: 'Rating added successfully', data: doctor });
    } catch (error) {
        res.status(500).json({ status: 'error', message: error.message });
    }
};

// Get doctor's ratings
exports.getDoctorRating = async (req, res) => {
    try {
        const doctor = await Doctor.findById(req.params.id).select('ratings averageRating');
        if (!doctor) {
            return res.status(404).json({ status: "error", message: "Doctor not found" });
        }
        res.json({ status: "success", data: doctor });
    } catch (error) {
        res.status(500).json({ status: "error", message: error.message });
    }
};
