const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
    appointmentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Appointment',
        required: true
    },
    patientId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Patient',
        required: true
    },
    amount: {
        type: Number,
        required: true
    },
    status: {
        type: String,
        enum: ['pending', 'paid', 'failed'],
        default: 'pending'
    },
    method: {
        type: String,
        enum: ['cash', 'visa', 'wallet'],
        default: 'cash'
    },
    transactionId: {
        type: String
    },
    cardNumber: {
        type: String
    },
    cardHolder: {
        type: String
    }
}, { timestamps: true });

module.exports = mongoose.model('Payment', paymentSchema); 