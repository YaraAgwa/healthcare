const mongoose = require('mongoose');
 

const doctorSchema = new mongoose.Schema({
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true, select: false },
    phoneNumber: { type: String, required: true },
    specialization: { type: String, required: true },
    address: { type: String, required: true },
    verificationCode: { type: String },
    verificationCodeExpires: { type: Date },
    ratings: {
        type: [
            {
                userId: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient' },
                rating: { type: Number, required: true, min: 1, max: 5 },
                comment: { type: String }
            }
        ],
        default: []
    },
    averageRating: { type: String, default: "0.00" },
    availableSlots: [
        {
            date: { type: String, required: true }, // YYYY-MM-DD
            times: [String] // قائمة الأوقات المتاحة في هذا اليوم (مثلاً: ["09:00", "10:00"])
        }
    ],
    
    price: { type: Number },
    consultationFee: { type: Number },
    balance: { type: Number, default: 0 }
}, {
    timestamps: true
});

 
 

module.exports = mongoose.model('Doctor', doctorSchema); 