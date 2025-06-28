const Payment = require('../models/payment.model');
const mongoose = require('mongoose');
const notificationService = require('../services/notification.service');

// Create a new payment (fake)
exports.createPayment = async (req, res) => {
    try {
        const { appointmentId, patientId, amount, method, cardNumber, cardHolder } = req.body;
        const payment = new Payment({ 
            appointmentId: new mongoose.Types.ObjectId(appointmentId), 
            patientId: new mongoose.Types.ObjectId(patientId), 
            amount, 
            method, 
            status: 'paid',
            cardNumber,
            cardHolder
        });
        await payment.save();
        // إرسال إشعار للمريض
        await notificationService.createNotification(patientId, 'Patient', 'A new payment has been recorded');
        // إذا كان الدفع مرتبط بموعد، أرسل إشعار للطبيب
        if (appointmentId) {
            const Appointment = require('../models/appointment.model');
            const appointment = await Appointment.findById(appointmentId);
            if (appointment && appointment.doctorId) {
                // Check if amount matches doctor's consultation fee
                const Doctor = require('../models/doctor.model');
                const doctor = await Doctor.findById(appointment.doctorId);
                if (!doctor) {
                    return res.status(404).json({ status: 'error', message: 'Doctor not found' });
                }
                if (typeof doctor.price === 'number' && amount !== doctor.price) {
                    return res.status(400).json({ status: 'error', message: 'You must pay the exact price.' });
                }
                await notificationService.createNotification(appointment.doctorId, 'Doctor', 'A payment has been recorded for your appointment');
                // Update doctor's balance
                await Doctor.findByIdAndUpdate(
                    appointment.doctorId,
                    { $inc: { balance: amount } }
                );
            }
        }
        res.json({ status: 'success', message: 'Payment recorded' });
    } catch (error) {
        res.status(500).json({ status: 'error', message: error.message });
    }
};

// Get all payments for a patient
exports.getPatientPayments = async (req, res) => {
    try {
        const { patientId } = req.params;
        // عرض الحقول الضرورية فقط (بدون createdAt/updatedAt)
        const payments = await Payment.find({ patientId })
            .select('amount method status appointmentId');
        res.json({ status: 'success', data: payments });
    } catch (error) {
        res.status(500).json({ status: 'error', message: error.message });
    }
};

// Get all payments for a doctor (optional)
exports.getDoctorPayments = async (req, res) => {
    try {
        const { doctorId } = req.params;
        const payments = await Payment.find()
            .populate({
                path: 'appointmentId',
                match: { doctorId },
                select: 'date time'
            })
            .select('amount method status appointmentId');
        // Filter out payments where appointmentId is null (not for this doctor)
        const filtered = payments.filter(p => p.appointmentId);
        res.json({ status: 'success', data: filtered });
    } catch (error) {
        res.status(500).json({ status: 'error', message: error.message });
    }
}; 