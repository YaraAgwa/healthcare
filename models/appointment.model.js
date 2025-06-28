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
    },
    paymentMethod: {
        type: String,
        enum: ['cash', 'visa'],
        required: true
    },
    cardNumber: {
        type: String,
        required: function() { return this.paymentMethod === 'visa'; }
    },
    expiryDate: {
        type: String,
        required: function() { return this.paymentMethod === 'visa'; }
    },
    cvv: {
        type: String,
        required: function() { return this.paymentMethod === 'visa'; }
    },
    cardHolder: {
        type: String,
        required: function() { return this.paymentMethod === 'visa'; }
    }
}, { timestamps: true }
);


module.exports = mongoose.model('Appointment', appointmentSchema); 