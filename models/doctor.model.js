const mongoose = require('mongoose');
 

const doctorSchema = new mongoose.Schema({
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true,select: false  },
    phoneNumber: { type: String, required: true },
    specialization: { type: String, required: true },
    address: { type: String, required: true },
    verificationCode: { type: String },
    verificationCodeExpires: {type: Date}
     
}, {
    timestamps: true
});
 
 

module.exports = mongoose.model('Doctor', doctorSchema); 