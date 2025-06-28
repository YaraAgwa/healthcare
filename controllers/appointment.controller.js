const Appointment = require('../models/appointment.model');
const Doctor = require('../models/doctor.model');
const Notification = require('../models/notification.model');
const mongoose = require('mongoose');
const notificationService = require('../services/notification.service');

// Book an appointment
exports.bookAppointment = async (req, res) => {
    try {
        console.log('=== DEBUG INFO ===');
        console.log('Headers:', req.headers);
        console.log('Body:', req.body);
        console.log('Body type:', typeof req.body);
        console.log('Body keys:', Object.keys(req.body));
        console.log('==================');
        
        const { doctorId, patientId, date, time } = req.body;
        console.log('BODY:', req.body);
        // Check if doctor has this slot available
        const doctor = await Doctor.findById(doctorId);
        if (!doctor) return res.status(404).json({ status: 'error', message: 'Doctor not found' });
        if (!doctor.availableSlots || !doctor.availableSlots.some(slot => slot.date === date && slot.times.includes(time))) {
            return res.status(400).json({ status: 'error', message: 'This slot is not available for booking' });
        }
        // Prevent double booking
        const exists = await Appointment.findOne({ doctorId, date, time, status: 'booked' });
        if (exists) return res.status(400).json({ status: 'error', message: 'This slot is already booked' });
        // Book
        const appointment = new Appointment({
            doctorId: new mongoose.Types.ObjectId(doctorId),
            patientId: new mongoose.Types.ObjectId(patientId),
            date,
            time
        });
        await appointment.save();
        // Create notifications
        await notificationService.createNotification(patientId, 'Patient', 'A new appointment has been booked');
        await notificationService.createNotification(doctorId, 'Doctor', 'A new appointment has been booked');
        res.json({ status: 'success', message: 'Appointment booked'});
    } catch (error) {
        res.status(500).json({ status: 'error', message: error.message });
    }
};

// Get all appointments for a patient
exports.getPatientAppointments = async (req, res) => {
    try {
        const { patientId } = req.params;
        // عرض الحقول الضرورية فقط
        const appointments = await Appointment.find({ patientId })
            .select('doctorId date time status');
        res.json({ status: 'success', data: appointments });
    } catch (error) {
        res.status(500).json({ status: 'error', message: error.message });
    }
};

// Get all appointments for a doctor
exports.getDoctorAppointments = async (req, res) => {
    try {
        const { doctorId } = req.params;
        const appointments = await Appointment.find({ doctorId })
            .select('patientId date time status');
        res.json({ status: 'success', data: appointments });
    } catch (error) {
        res.status(500).json({ status: 'error', message: error.message });
    }
};

// Cancel an appointment
exports.cancelAppointment = async (req, res) => {
    try {
        const { id } = req.params; // id = appointmentId
        const appointment = await Appointment.findByIdAndUpdate(
            id,
            { status: 'cancelled' },
            { new: true }
        );
        if (!appointment) {
            return res.status(404).json({ status: 'error', message: 'Appointment not found' });
        }
        // Create notifications
        await Notification.create({
            userId: new mongoose.Types.ObjectId(appointment.doctorId),
            userType: 'Doctor',
            message: `An appointment on ${appointment.date} at ${appointment.time} has been cancelled`
        });
        await Notification.create({
            userId: new mongoose.Types.ObjectId(appointment.patientId),
            userType: 'Patient',
            message: `Your appointment with the doctor on ${appointment.date} at ${appointment.time} has been cancelled`
        });
        res.json({ status: 'success', message: 'Appointment cancelled'});
    } catch (error) {
        res.status(500).json({ status: 'error', message: error.message });
    }
};

exports.getNotifications = async (req, res) => {
    try {
        const { userId } = req.params;
        const notifications = await Notification.find({ userId })
            .sort({ createdAt: -1 })
            .select('message');
        res.json({ status: 'success', data: notifications });
    } catch (error) {
        res.status(500).json({ status: 'error', message: error.message });
    }
}; 
