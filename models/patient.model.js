const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const patientSchema = new mongoose.Schema({
    firstName: {
        type: String,
        required: true,
        trim: true
    },
    lastName: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    password: {
        type: String,
        required: true,
        select: false 
    },
    phoneNumber: {
        type: String,
        required: true,
        unique: true
    },
    verificationCode: {
        type: String
    },
    verificationCodeExpires: {
        type: Date
    } 
});

 
 

module.exports = mongoose.model('Patient', patientSchema); 