const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema({
    doctorId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Doctor',
        required: true
    },
    patientId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Patient',
        required: true
    },
    date: {
        type: String, // YYYY-MM-DD
        required: true
    },
    time: {
        type: String, // HH:mm
        required: true
    },
    status: {
        type: String,
        enum: ['booked', 'cancelled'],
        default: 'booked'
    }
}, { timestamps: true }
);


module.exports = mongoose.model('Appointment', appointmentSchema); 