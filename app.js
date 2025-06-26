const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

 
global.verificationCodes = {};

 
mongoose.connect('mongodb+srv://mag:123123mag@cluster0.oxneo.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0')
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.error('MongoDB connection error:', err));

 
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

 

const authRoutes = require('./routes/auth.routes');
app.use('/api/auth', authRoutes);
app.use('/api/doctors', require('./routes/doctor.routes'));
app.use('/api/patients', require('./routes/patient.routes'));
const appointmentRoutes = require('./routes/appointment.routes');
app.use('/api/appointments', appointmentRoutes);
const notificationRoutes = require('./routes/notification.routes');
app.use('/api/notifications', notificationRoutes);
const paymentRoutes = require('./routes/payment.routes');
app.use('/api/payments', paymentRoutes);
const messageRoutes = require('./routes/message.routes');
app.use('/api/messages', messageRoutes);
app.use('/uploads', express.static('uploads'));

 
app.get('/', (req, res) => {
    res.json({ message: 'API is working' });
});

 
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    message: "Server error",
    error: err.message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
});

 
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});